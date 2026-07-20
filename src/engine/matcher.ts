/**
 * Rule matcher — determines which rules apply to a given agent in context.
 *
 * All functions are pure and receive data as arguments; no module-level state.
 * Clinical content is sourced exclusively from the JSON data passed in.
 */

import type { Agent, InteractionRule } from '@/data/types'
import {
  type MatchedRule,
  type RuleSpecificity,
  ALERT_SEVERITY,
  type AlertLevel,
} from './types'

const SITE_ID_EQUIVALENTS: Record<string, string[]> = {
  RTS101: ['RTS101', 'RTS001', 'RTS002', 'RTS016', 'RTS017'],
  RTS102: ['RTS102', 'RTS018', 'RTS019'],
  RTS103: ['RTS103', 'RTS003'],
  RTS104: ['RTS104', 'RTS004'],
  RTS105: ['RTS105', 'RTS005'],
  RTS106: ['RTS106', 'RTS006', 'RTS007', 'RTS008', 'RTS009'],
  RTS107: ['RTS107', 'RTS010', 'RTS011'],
  RTS108: ['RTS108', 'RTS012'],
  RTS109: ['RTS109', 'RTS013', 'RTS014', 'RTS015'],
  RTS110: ['RTS110', 'RTS020', 'RTS021'],
  RTS111: ['RTS111', 'RTS022', 'RTS023', 'RTS024'],
  RTS112: ['RTS112', 'RTS025', 'RTS026', 'RTS027'],
  RTS113: ['RTS113', 'RTS028'],
  RTS114: ['RTS114', 'RTS029'],
  RTS001: ['RTS001', 'RTS101'],
  RTS002: ['RTS002', 'RTS101'],
  RTS003: ['RTS003', 'RTS103'],
  RTS004: ['RTS004', 'RTS104'],
  RTS005: ['RTS005', 'RTS105'],
  RTS006: ['RTS006', 'RTS106'],
  RTS007: ['RTS007', 'RTS106'],
  RTS008: ['RTS008', 'RTS106'],
  RTS009: ['RTS009', 'RTS106'],
  RTS010: ['RTS010', 'RTS107'],
  RTS011: ['RTS011', 'RTS107'],
  RTS012: ['RTS012', 'RTS108'],
  RTS013: ['RTS013', 'RTS109'],
  RTS014: ['RTS014', 'RTS109'],
  RTS015: ['RTS015', 'RTS109'],
  RTS016: ['RTS016', 'RTS101'],
  RTS017: ['RTS017', 'RTS101'],
  RTS018: ['RTS018', 'RTS102'],
  RTS019: ['RTS019', 'RTS102'],
  RTS020: ['RTS020', 'RTS110'],
  RTS021: ['RTS021', 'RTS110'],
  RTS022: ['RTS022', 'RTS111'],
  RTS023: ['RTS023', 'RTS111'],
  RTS024: ['RTS024', 'RTS111'],
  RTS025: ['RTS025', 'RTS112'],
  RTS026: ['RTS026', 'RTS112'],
  RTS027: ['RTS027', 'RTS112'],
  RTS028: ['RTS028', 'RTS113'],
  RTS029: ['RTS029', 'RTS114'],
}

function expandEquivalentSiteIds(siteIds: string[]): Set<string> {
  const expanded = new Set<string>()
  for (const siteId of siteIds) {
    expanded.add(siteId)
    for (const equivalent of SITE_ID_EQUIVALENTS[siteId] ?? []) {
      expanded.add(equivalent)
    }
  }
  return expanded
}

// ─── Condition matching ───────────────────────────────────────────────────────

/**
 * Returns true when the non-agent conditions of a rule are satisfied.
 *
 * @param rule           The candidate rule.
 * @param siteId         Selected RT site ID (null = not yet selected).
 * @param timingId       Selected timing ID (null = not yet selected).
 * @param fractionationId Selected fractionation ID (null = not yet selected).
 *
 * A null array value in rule conditions means "any" (no constraint).
 * A null input means the condition cannot be evaluated — treated as no match.
 */
export function conditionsMatch(
  rule: InteractionRule,
  siteId: string | null,
  timingId: string | null,
  fractionationId: string | null,
): boolean {
  // Timing is always required
  if (!timingId) return false
  if (!rule.conditions.timing_ids.includes(timingId)) return false

  // Site: null rule list = any site; null input = no match
  if (rule.conditions.rt_site_ids !== null) {
    if (!siteId) return false
    const selectedSiteIds = expandEquivalentSiteIds([siteId])
    const ruleSiteIds = expandEquivalentSiteIds(rule.conditions.rt_site_ids)
    const siteMatches = [...selectedSiteIds].some((candidate) => ruleSiteIds.has(candidate))
    if (!siteMatches) return false
  }

  // Fractionation: null rule list = any fractionation; null input = no match
  if (rule.conditions.fractionation_ids !== null) {
    if (!fractionationId) return false
    if (!rule.conditions.fractionation_ids.includes(fractionationId)) return false
  }

  return true
}

// ─── Specificity ──────────────────────────────────────────────────────────────

/**
 * Determine how a rule matched an agent and return the specificity tier.
 *
 * @param ruleAgentClassIds  rule.conditions.agent_class_ids
 * @param agentId            The agent's own ID
 * @param parentClassIds     The agent's parent class IDs
 */
export function getRuleSpecificity(
  ruleAgentClassIds: string[],
  agentId: string,
  parentClassIds: string[],
): RuleSpecificity {
  if (ruleAgentClassIds.length === 0) return 'general'
  if (ruleAgentClassIds.includes(agentId)) return 'specific-agent'
  if (parentClassIds.some((cls) => ruleAgentClassIds.includes(cls))) return 'class-level'
  return 'general'
}

/**
 * Returns the class IDs that caused the match (for diagnostics).
 */
function getMatchedClassIds(
  ruleAgentClassIds: string[],
  parentClassIds: string[],
): string[] {
  return parentClassIds.filter((cls) => ruleAgentClassIds.includes(cls))
}

// ─── Per-agent rule matching ──────────────────────────────────────────────────

/**
 * Find all rules that apply to an agent given the current clinical context.
 *
 * Rules are matched if:
 *  1. The rule's agent_class_ids is empty (general rule), OR
 *     contains the agent's agent_id (specific-agent), OR
 *     contains one of the agent's parent_class_ids (class-level).
 *  2. All non-agent conditions match (site, timing, fractionation).
 *
 * Only active rules are considered.
 *
 * @param agent             Agent record from catalogue.
 * @param siteId            Selected RT site ID.
 * @param timingId          Selected timing ID.
 * @param fractionationId   Selected fractionation ID.
 * @param rules             All active interaction rules.
 * @returns Array of MatchedRule, sorted best-specificity first.
 */
export function matchRulesForAgent(
  agent: Agent,
  siteId: string | null,
  timingId: string | null,
  fractionationId: string | null,
  rules: InteractionRule[],
): MatchedRule[] {
  const parentClassIds: string[] = (agent as Agent & { parent_class_ids?: string[] }).parent_class_ids ?? []

  const matched: MatchedRule[] = []

  for (const rule of rules) {
    if (rule.status !== 'active') continue

    const { agent_class_ids } = rule.conditions

    // ── Agent match ──
    const isGeneral = agent_class_ids.length === 0
    const matchesAgentDirectly = agent_class_ids.includes(agent.agent_id)
    const matchesViaClass = parentClassIds.some((cls) => agent_class_ids.includes(cls))

    if (!isGeneral && !matchesAgentDirectly && !matchesViaClass) continue

    // ── General rules only apply when specifically flagged ──
    if (isGeneral && !rule.applies_to_any_low_concern && !rule.applies_to_no_direct_evidence) {
      continue
    }

    // ── Non-agent conditions ──
    if (!conditionsMatch(rule, siteId, timingId, fractionationId)) continue

    // ── Build MatchedRule record ──
    const specificity = isGeneral
      ? 'general'
      : matchesAgentDirectly
        ? 'specific-agent'
        : 'class-level'

    matched.push({
      ruleId: rule.rule_id,
      alertLevel: rule.output_alert_level as AlertLevel,
      specificity: specificity as RuleSpecificity,
      toxicityDomains: rule.output_toxicity_domains,
      evidenceLinkIds: rule.evidence_link_ids,
      supportingEvidenceIds: rule.supporting_evidence_ids,
      evidenceLevel: rule.evidence_level,
      uncertainty: rule.uncertainty,
      primaryRiskDriver: rule.primary_risk_driver,
      secondaryRiskDrivers: rule.secondary_risk_drivers,
      rationaleText: rule.rationale_text,
      matchedByAgentId: matchesAgentDirectly,
      matchedByClassIds: isGeneral ? [] : getMatchedClassIds(agent_class_ids, parentClassIds),
    })
  }

  // Sort: specific-agent first, then class-level, then general; within tier highest alert first
  return matched.sort((a, b) => {
    const specDiff =
      (a.specificity === 'specific-agent' ? 2 : a.specificity === 'class-level' ? 1 : 0) -
      (b.specificity === 'specific-agent' ? 2 : b.specificity === 'class-level' ? 1 : 0)
    if (specDiff !== 0) return -specDiff
    return ALERT_SEVERITY[b.alertLevel] - ALERT_SEVERITY[a.alertLevel]
  })
}
