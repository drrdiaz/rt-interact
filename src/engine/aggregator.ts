/**
 * Multi-agent aggregator.
 *
 * Combines per-agent results into a single ToxicityAlert.
 *
 * Rules:
 *  - Overall alert level = highest across all agents.
 *  - Toxicity domains = union (deduplicated).
 *  - Evidence IDs = deduplicated union.
 *  - Per-agent results are preserved in full.
 *  - Downgrading because another agent is low-concern is forbidden.
 *  - The combination warning is shown unless a dedicated combination rule applies.
 *  - A dedicated combination rule is defined as a single rule whose
 *    agent_class_ids list resolves to two or more of the selected agents.
 */

import type { InteractionRule } from '@/data/types'
import {
  type PerAgentResult,
  type ToxicityAlert,
  type EngineDiagnostics,
  type EvidenceStatus,
  type CombinationEffectsStatus,
  type AlertLevel,
  ALERT_SEVERITY,
} from './types'
import { deduplicateIds } from './evidence'

const MULTI_AGENT_WARNING =
  'Multiple agents — combination-specific effects not individually modelled'

/**
 * Return the PerAgentResult with the highest alert level.
 * On ties, the first one in the array wins (preserves input order).
 */
function dominantResult(results: PerAgentResult[]): PerAgentResult {
  return results.reduce((best, r) =>
    ALERT_SEVERITY[r.alertLevel] > ALERT_SEVERITY[best.alertLevel] ? r : best,
  )
}

/**
 * Check whether any active interaction rule is a dedicated combination rule
 * for the current set of selected agent IDs.
 *
 * A rule is considered a combination rule when its agent_class_ids contains
 * entries that resolve to at least two distinct selected agents (either
 * directly by agent_id or via parent_class_ids).
 */
export function hasDedicatedCombinationRule(
  selectedAgentIds: string[],
  agentParentClassMap: Map<string, string[]>,
  rules: InteractionRule[],
): boolean {
  for (const rule of rules) {
    if (rule.status !== 'active') continue
    const { agent_class_ids } = rule.conditions
    if (agent_class_ids.length < 2) continue

    // Count how many selected agents this rule covers
    const coveredAgents = selectedAgentIds.filter((agentId) => {
      const parentClasses = agentParentClassMap.get(agentId) ?? []
      return (
        agent_class_ids.includes(agentId) ||
        parentClasses.some((cls) => agent_class_ids.includes(cls))
      )
    })

    if (coveredAgents.length >= 2) return true
  }
  return false
}

/**
 * Aggregate per-agent results into a single ToxicityAlert.
 *
 * @param perAgentResults   Evaluated results for each selected agent.
 * @param allRules          Active rules (used for combination-rule check).
 * @param agentParentClassMap  Map from agent_id → parent_class_ids.
 * @param evidenceStatuses  Resolved evidence statuses for all referenced IDs.
 * @param domainLabelMap    Map from domain_id → human label.
 * @param diagnostics       Diagnostics assembled by the caller.
 */
export function aggregateResults(
  perAgentResults: PerAgentResult[],
  allRules: InteractionRule[],
  agentParentClassMap: Map<string, string[]>,
  evidenceStatuses: EvidenceStatus[],
  domainLabelMap: Map<string, string>,
  diagnostics: EngineDiagnostics,
): ToxicityAlert {
  const dominant = dominantResult(perAgentResults)

  // Union all toxicity domains
  const toxicityDomainIds = deduplicateIds(
    perAgentResults.map((r) => r.toxicityDomains),
  )
  const toxicityDomainLabels = toxicityDomainIds.map(
    (id) => domainLabelMap.get(id) ?? id,
  )

  // Deduplicate all evidence IDs
  const evidenceLinkIds = deduplicateIds(
    perAgentResults.map((r) => r.evidenceLinkIds),
  )
  const supportingEvidenceIds = deduplicateIds(
    perAgentResults.map((r) => [
      ...(r.controllingRule?.supportingEvidenceIds ?? []),
    ]),
  )

  // Deduplicated rule IDs
  const matchedRuleIds = deduplicateIds(
    perAgentResults.map((r) => r.matchedRules.map((m) => m.ruleId)),
  )

  // Secondary risk drivers: union excluding the primary
  const secondaryRiskDrivers = [
    ...new Set(
      perAgentResults
        .flatMap((r) => r.secondaryRiskDrivers)
        .filter((d) => d !== dominant.primaryRiskDriver),
    ),
  ]

  // Combination status
  const selectedAgentIds = perAgentResults.map((r) => r.agentId)
  let combinationEffectsStatus: CombinationEffectsStatus
  let combinationWarning: string | null = null

  if (perAgentResults.length <= 1) {
    combinationEffectsStatus = 'single-agent'
  } else if (
    hasDedicatedCombinationRule(selectedAgentIds, agentParentClassMap, allRules)
  ) {
    combinationEffectsStatus = 'combination-rule-applied'
  } else {
    combinationEffectsStatus = 'multiple-agents-not-modelled'
    combinationWarning = MULTI_AGENT_WARNING
  }

  // Evidence-pending check
  const hasPending = evidenceStatuses.some((s) => s.status === 'pending')

  // Toxicity statement
  const toxicityStatement = buildToxicityStatement(
    dominant.alertLevel,
    dominant.rationaleText,
    toxicityDomainLabels,
    dominant.fallbackUsed,
    dominant.fallbackReason,
  )

  return {
    alertLevel: dominant.alertLevel,
    toxicityStatement,
    toxicityDomainIds,
    toxicityDomainLabels,
    primaryRiskDriver: dominant.primaryRiskDriver ?? 'Unclassified',
    secondaryRiskDrivers,
    rationaleText: dominant.rationaleText ?? '',
    evidenceLinkIds,
    supportingEvidenceIds,
    evidenceLevel: dominant.evidenceLevel ?? 'Not assessed',
    uncertainty: dominant.uncertainty ?? 'Not assessed',
    matchedRuleIds,
    perAgentResults,
    combinationEffectsStatus,
    combinationWarning,
    hasEvidencePending: hasPending,
    evidenceStatuses,
    diagnostics,
    fallbackReason: dominant.fallbackReason,
  }
}

function buildToxicityStatement(
  alertLevel: AlertLevel,
  rationaleText: string | null,
  domainLabels: string[],
  fallbackUsed: boolean,
  fallbackReason: string | null,
): string {
  if (fallbackUsed && fallbackReason) return fallbackReason

  if (alertLevel === 'No specific alert') {
    return 'No specific interaction alert identified for the selected combination and timing.'
  }

  if (alertLevel === 'Uncertain / evidence limited') {
    return rationaleText ?? 'Direct evidence for this drug–RT scenario is insufficient.'
  }

  if (domainLabels.length > 0) {
    const domains = domainLabels.join(', ')
    return rationaleText
      ? `${rationaleText} Risk domains: ${domains}.`
      : `Potential interaction involving: ${domains}.`
  }

  return rationaleText ?? `${alertLevel} — see per-agent details.`
}
