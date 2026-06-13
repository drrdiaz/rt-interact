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
    if (!rule.conditions.rt_site_ids.includes(siteId)) return false
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
