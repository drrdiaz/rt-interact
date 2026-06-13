/**
 * Precedence resolver — selects the controlling rule from a set of matched
 * rules for a single agent, and detects same-specificity conflicts.
 *
 * Precedence order (highest → lowest):
 *   1. specific-agent rule
 *   2. class-level rule
 *   3. general interaction rule
 *   4. pure fallback (no rules matched)
 *
 * When multiple rules exist at the same specificity tier:
 *   - The highest alert level controls.
 *   - Toxicity domains, evidence IDs, and risk drivers are unioned.
 *   - Conflicting alert levels within the same tier are surfaced in diagnostics.
 *
 * A general rule is only used when no more-specific rule is present.
 */

import {
  type MatchedRule,
  type RuleConflict,
  type AlertLevel,
  type RuleSpecificity,
  ALERT_SEVERITY,
  RULE_SPECIFICITY_RANK,
} from './types'

export interface PrecedenceResult {
  controllingRule: MatchedRule | null
  /** All rules at the highest-specificity tier that matched. */
  activeRules: MatchedRule[]
  /** Deduplicated union of toxicity domains across all activeRules. */
  toxicityDomains: string[]
  /** Deduplicated union of evidence link IDs across all activeRules. */
  evidenceLinkIds: string[]
  /** Deduplicated union of supporting evidence IDs. */
  supportingEvidenceIds: string[]
  /** Deduplicated union of secondary risk drivers (excluding the primary). */
  secondaryRiskDrivers: string[]
  alertLevel: AlertLevel
  conflicts: RuleConflict[]
}

/**
 * Resolve precedence for a single agent's matched rules.
 *
 * @param agentId      Used in conflict records (for diagnostics).
 * @param matched      All rules matched for the agent, any order.
 */
export function resolveByPrecedence(
  agentId: string,
  matched: MatchedRule[],
): PrecedenceResult {
  if (matched.length === 0) {
    return {
      controllingRule: null,
      activeRules: [],
      toxicityDomains: [],
      evidenceLinkIds: [],
      supportingEvidenceIds: [],
      secondaryRiskDrivers: [],
      alertLevel: 'Uncertain / evidence limited',
      conflicts: [],
    }
  }

  // Determine the highest specificity tier present
  const maxSpecRank = Math.max(
    ...matched.map((m) => RULE_SPECIFICITY_RANK[m.specificity]),
  )
  const topSpecificity: RuleSpecificity = (
    maxSpecRank === 2 ? 'specific-agent' :
    maxSpecRank === 1 ? 'class-level' :
    'general'
  )

  // Restrict to rules at the top specificity tier
  const atTopTier = matched.filter((m) => m.specificity === topSpecificity)

  // Controlling rule = highest alert level within the tier
  const controllingRule = atTopTier.reduce((best, r) =>
    ALERT_SEVERITY[r.alertLevel] >= ALERT_SEVERITY[best.alertLevel] ? r : best,
  )

  // Detect same-specificity conflicts (different alert levels at the same tier)
  const conflicts = detectConflicts(agentId, atTopTier)

  // Union across all rules at the top tier
  const toxicityDomains = deduplicate(atTopTier.flatMap((r) => r.toxicityDomains))
  const evidenceLinkIds = deduplicate(atTopTier.flatMap((r) => r.evidenceLinkIds))
  const supportingEvidenceIds = deduplicate(
    atTopTier.flatMap((r) => r.supportingEvidenceIds),
  )
  const secondaryRiskDrivers = deduplicate(
    atTopTier
      .flatMap((r) => [r.primaryRiskDriver, ...r.secondaryRiskDrivers])
      .filter((d) => d !== controllingRule.primaryRiskDriver),
  )

  return {
    controllingRule,
    activeRules: atTopTier,
    toxicityDomains,
    evidenceLinkIds,
    supportingEvidenceIds,
    secondaryRiskDrivers,
    alertLevel: controllingRule.alertLevel,
    conflicts,
  }
}

/**
 * Detect rules at the same specificity tier that produce different alert levels.
 */
export function detectConflicts(
  agentId: string,
  rules: MatchedRule[],
): RuleConflict[] {
  if (rules.length < 2) return []

  // Group by specificity (should all be the same tier here, but be safe)
  const bySpec = new Map<RuleSpecificity, MatchedRule[]>()
  for (const r of rules) {
    const existing = bySpec.get(r.specificity) ?? []
    existing.push(r)
    bySpec.set(r.specificity, existing)
  }

  const conflicts: RuleConflict[] = []
  for (const [specificity, group] of bySpec.entries()) {
    const levels = [...new Set(group.map((r) => r.alertLevel))]
    if (levels.length > 1) {
      conflicts.push({
        agentId,
        ruleIds: group.map((r) => r.ruleId),
        specificity,
        alertLevels: levels,
        description:
          `Agent ${agentId}: ${group.length} rules at ${specificity} tier ` +
          `produce conflicting alert levels: ${levels.join(', ')}. ` +
          `Highest level (${group.reduce((b, r) => ALERT_SEVERITY[r.alertLevel] >= ALERT_SEVERITY[b.alertLevel] ? r : b).alertLevel}) applied.`,
      })
    }
  }

  return conflicts
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function deduplicate<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}
