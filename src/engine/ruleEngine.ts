/**
 * Rule engine — Phase 1 implementation.
 *
 * Evaluates one or more systemic therapies against interaction rules loaded
 * from interaction_rules.json and returns a structured ToxicityAlert.
 *
 * Architecture:
 *   matcher         → finds candidate rules per agent
 *   completeness    → validates required inputs are present
 *   precedence      → resolves controlling rule per agent
 *   aggregator      → combines per-agent results
 *   evidence        → resolves evidence IDs to status records
 *   diagnostics     → assembles developer diagnostics
 *
 * Clinical content comes exclusively from JSON; no agent names or rule
 * details are hard-coded in this file.
 */

import {
  getAgents,
  getInteractionRules,
  getToxicityDomains,
} from '@/data/loaders'
import type { RuleEngineInput, Agent, InteractionRule } from '@/data/types'
import {
  type EngineOutput,
  type PerAgentResult,
  type RuleConflict,
  type EvidenceStatus,
} from './types'
import { matchRulesForAgent, conditionsMatch } from './matcher'
import { resolveByPrecedence } from './precedence'
import { checkAgentInputCompleteness } from './completeness'
import { deduplicateIds, resolveEvidence } from './evidence'
import { aggregateResults } from './aggregator'
import { buildDiagnostics } from './diagnostics'
import { lookupInFlatDatabase } from './flatLookup'

// ─── Evidence catalogue (loaded once) ────────────────────────────────────────

/**
 * Lazily-built set of known evidence IDs.
 * We import the evidence_links.json directly to avoid coupling the loader
 * layer with an evidence-links accessor not present in Step 2.
 */
// Static import of evidence links JSON (copied to src/data/raw/ from project root)
import rawEvidenceLinks from '@/data/raw/evidence_links.json'

let _evidenceKnownIds: Set<string> | null = null
function buildKnownEvidenceIds(): Set<string> {
  if (_evidenceKnownIds) return _evidenceKnownIds
  _evidenceKnownIds = new Set(
    (rawEvidenceLinks as Array<{ evidence_id: string; status: string }>)
      .filter((e) => e.status === 'active')
      .map((e) => e.evidence_id),
  )
  return _evidenceKnownIds
}

// ─── Fallback builder ─────────────────────────────────────────────────────────

const FALLBACK_REASON =
  'Direct evidence for this drug–RT scenario is insufficient. ' +
  'Specialist review and documented multidisciplinary reasoning are recommended.'

function buildFallbackPerAgentResult(agent: Agent): PerAgentResult {
  return {
    agentId: agent.agent_id,
    canonicalName: agent.canonical_name,
    alertLevel: 'Uncertain / evidence limited',
    matchedRules: [],
    controllingRule: null,
    toxicityDomains: agent.toxicity_domain_ids ?? [],
    evidenceLinkIds: [
      ...(agent.primary_evidence_ids ?? []),
      ...(agent.supporting_evidence_ids ?? []),
    ],
    evidenceLevel: agent.evidence_level ?? 'Not assessed',
    uncertainty: agent.uncertainty ?? 'Not assessed',
    primaryRiskDriver: 'Uncertainty-driven',
    secondaryRiskDrivers: agent.risk_drivers ?? [],
    rationaleText: FALLBACK_REASON,
    fractionationWarning: null,
    siteRecommendation: null,
    fallbackUsed: true,
    fallbackReason: FALLBACK_REASON,
    agentUnrecognised: false,
  }
}

function buildUnrecognisedPerAgentResult(agentId: string): PerAgentResult {
  return {
    agentId,
    canonicalName: agentId,
    alertLevel: 'Uncertain / evidence limited',
    matchedRules: [],
    controllingRule: null,
    toxicityDomains: [],
    evidenceLinkIds: [],
    evidenceLevel: null,
    uncertainty: null,
    primaryRiskDriver: 'Uncertainty-driven',
    secondaryRiskDrivers: [],
    rationaleText: 'Agent not recognised in catalogue — cannot evaluate.',
    fractionationWarning: null,
    siteRecommendation: null,
    fallbackUsed: true,
    fallbackReason: 'Agent ID not found in catalogue.',
    agentUnrecognised: true,
  }
}

// ─── Candidate-rule finder (for completeness check) ──────────────────────────

/**
 * Rules that match agent+site+timing but ignore fractionation.
 * Used to determine whether fractionation is required.
 */
function candidateRulesIgnoringFractionation(
  agent: Agent,
  siteId: string | null,
  timingId: string | null,
  rules: InteractionRule[],
): InteractionRule[] {
  return rules.filter((rule) => {
    if (rule.status !== 'active') return false
    const { agent_class_ids } = rule.conditions
    const parentClassIds = agent.parent_class_ids ?? []

    // Agent match check
    const isGeneral = agent_class_ids.length === 0
    const agentMatches =
      isGeneral ||
      agent_class_ids.includes(agent.agent_id) ||
      parentClassIds.some((cls) => agent_class_ids.includes(cls))
    if (!agentMatches) return false

    // General rules need the flag set
    if (isGeneral && !rule.applies_to_any_low_concern && !rule.applies_to_no_direct_evidence) {
      return false
    }

    // Check timing and site but use a placeholder fractionation to pass
    // the null check — fractionation conditions are evaluated later
    const fracPlaceholder =
      rule.conditions.fractionation_ids !== null
        ? rule.conditions.fractionation_ids[0]
        : null

    return conditionsMatch(rule, siteId, timingId, fracPlaceholder)
  })
}

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * Evaluate clinical interaction rules against the current form state.
 *
 * Returns either a complete ToxicityAlert or an IncompleteInputState
 * when required inputs are missing.
 *
 * Unrecognised agent IDs (not in the catalogue) are excluded from
 * rule evaluation and flagged in diagnostics.
 */
export function evaluateRules(input: RuleEngineInput): EngineOutput {
  const agents = getAgents().filter((a) => a.status === 'active')
  const rules = getInteractionRules()
  const domains = getToxicityDomains()
  const knownEvidenceIds = buildKnownEvidenceIds()

  const domainLabelMap = new Map(domains.map((d) => [d.domain_id, d.label]))
  const agentMap = new Map(agents.map((a) => [a.agent_id, a]))

  const siteId = input.rtSite?.siteId ?? null
  const { fractionationId, timingInterval } = input
  // TM006 (Unknown/uncertain) is evaluated as TM001 (Concurrent) — worst-case assumption.
  // The original timingId is preserved in the input for UI purposes (e.g. warning banner).
  const timingId = input.timingId === 'TM006' ? 'TM001' : input.timingId

  // ── Validate basic evaluability ──
  if (
    input.selectedTherapies.length === 0 ||
    siteId === null ||
    timingId === null
  ) {
    // Not enough to evaluate — return a minimal incomplete state
    return {
      incomplete: true,
      missingFields: [],
      partialPerAgentResults: [],
    }
  }

  // ── Identify unrecognised agents ──
  const unrecognisedIds: string[] = []
  const recognisedAgents: Agent[] = []

  for (const therapy of input.selectedTherapies) {
    const agent = agentMap.get(therapy.agentId)
    if (!agent) {
      unrecognisedIds.push(therapy.agentId)
    } else {
      recognisedAgents.push(agent)
    }
  }

  // ── Completeness check across all recognised agents ──
  const allMissingFields = recognisedAgents.flatMap((agent) => {
    const candidates = candidateRulesIgnoringFractionation(
      agent,
      siteId,
      timingId,
      rules,
    )
    return checkAgentInputCompleteness(
      agent,
      timingId,
      fractionationId,
      timingInterval,
      candidates,
    )
  })

  // Deduplicate missing fields by field name
  const uniqueMissingFields = allMissingFields.filter(
    (f, i, arr) => arr.findIndex((x) => x.field === f.field) === i,
  )

  // ── Build partial per-agent results for diagnostics ──
  const partialResults: PerAgentResult[] = [
    ...recognisedAgents.map((agent) =>
      buildPartialPerAgentResult(agent, siteId, timingId, fractionationId, rules),
    ),
    ...unrecognisedIds.map(buildUnrecognisedPerAgentResult),
  ]

  if (uniqueMissingFields.length > 0) {
    return {
      incomplete: true,
      missingFields: uniqueMissingFields,
      partialPerAgentResults: partialResults,
    }
  }

  // ── Full evaluation ──
  const allConflicts: RuleConflict[] = []
  const perAgentResults: PerAgentResult[] = []
  let totalMatched = 0

  for (const agent of recognisedAgents) {
    // ── Try v22 flat database first (specific agent+site+frac+timing) ──────────
    const flatResult = lookupInFlatDatabase(
      agent.agent_id,
      agent.canonical_name,
      siteId,
      fractionationId,
      timingId,
    )

    if (flatResult) {
      // Flat DB matched — use it directly, skip class-based rule engine
      perAgentResults.push(flatResult)
      continue
    }

    // ── Fall back to class-based rule engine ──────────────────────────────────
    const matched = matchRulesForAgent(agent, siteId, timingId, fractionationId, rules)
    totalMatched += matched.length

    const precedenceResult = resolveByPrecedence(agent.agent_id, matched)
    allConflicts.push(...precedenceResult.conflicts)

    let agentResult: PerAgentResult
    if (matched.length === 0) {
      // Pure fallback — no rule matched
      agentResult = buildFallbackPerAgentResult(agent)
    } else {
      const ctrl = precedenceResult.controllingRule!
      agentResult = {
        agentId: agent.agent_id,
        canonicalName: agent.canonical_name,
        alertLevel: precedenceResult.alertLevel,
        matchedRules: matched,
        controllingRule: ctrl,
        toxicityDomains: precedenceResult.toxicityDomains,
        evidenceLinkIds: precedenceResult.evidenceLinkIds,
        evidenceLevel: ctrl.evidenceLevel,
        uncertainty: ctrl.uncertainty,
        primaryRiskDriver: ctrl.primaryRiskDriver,
        secondaryRiskDrivers: precedenceResult.secondaryRiskDrivers,
        rationaleText: ctrl.rationaleText,
        fractionationWarning: null,
        siteRecommendation: null,
        fallbackUsed: false,
        fallbackReason: null,
        agentUnrecognised: false,
      }
    }
    perAgentResults.push(agentResult)
  }

  // Add unrecognised agents as fallback results
  for (const id of unrecognisedIds) {
    perAgentResults.push(buildUnrecognisedPerAgentResult(id))
  }

  // ── Evidence resolution ──
  const allEvidenceIds = deduplicateIds(
    perAgentResults.map((r) => r.evidenceLinkIds),
  )
  const evidenceStatuses: EvidenceStatus[] = resolveEvidence(
    allEvidenceIds,
    knownEvidenceIds,
  )

  // ── Agent→parent-class map for combination detection ──
  const agentParentClassMap = new Map(
    recognisedAgents.map((a) => [a.agent_id, a.parent_class_ids ?? []]),
  )

  // ── Diagnostics ──
  const diagnostics = buildDiagnostics({
    agentCount: input.selectedTherapies.length,
    totalRulesInspected: rules.length,
    totalRulesMatched: totalMatched,
    conflicts: allConflicts,
    unrecognisedAgentIds: unrecognisedIds,
    evidenceStatuses,
  })

  // ── Aggregate ──
  const alert = aggregateResults(
    perAgentResults,
    rules,
    agentParentClassMap,
    evidenceStatuses,
    domainLabelMap,
    diagnostics,
  )

  return { incomplete: false, ...alert }
}

// ─── Partial result builder (for completeness check phase) ───────────────────

function buildPartialPerAgentResult(
  agent: Agent,
  siteId: string | null,
  timingId: string | null,
  fractionationId: string | null,
  rules: InteractionRule[],
): PerAgentResult {
  const matched = matchRulesForAgent(agent, siteId, timingId, fractionationId, rules)
  const precedenceResult = resolveByPrecedence(agent.agent_id, matched)
  if (matched.length === 0) return buildFallbackPerAgentResult(agent)
  const ctrl = precedenceResult.controllingRule!
  return {
    agentId: agent.agent_id,
    canonicalName: agent.canonical_name,
    alertLevel: precedenceResult.alertLevel,
    matchedRules: matched,
    controllingRule: ctrl,
    toxicityDomains: precedenceResult.toxicityDomains,
    evidenceLinkIds: precedenceResult.evidenceLinkIds,
    evidenceLevel: ctrl.evidenceLevel,
    uncertainty: ctrl.uncertainty,
    primaryRiskDriver: ctrl.primaryRiskDriver,
    secondaryRiskDrivers: precedenceResult.secondaryRiskDrivers,
    rationaleText: ctrl.rationaleText,
    fractionationWarning: null,
    siteRecommendation: null,
    fallbackUsed: false,
    fallbackReason: null,
    agentUnrecognised: false,
  }
}

// ─── Evaluability helper ──────────────────────────────────────────────────────

/**
 * Returns true when sufficient input is present to warrant rule evaluation.
 */
export function isEvaluable(input: RuleEngineInput): boolean {
  return (
    input.selectedTherapies.length > 0 &&
    input.rtSite !== null &&
    input.timingId !== null
  )
}
