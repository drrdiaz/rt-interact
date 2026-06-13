/**
 * Input-completeness validator.
 *
 * Determines whether the current engine input contains all fields required
 * to issue a final alert.  Returns an array of missing fields; an empty
 * array means the input is complete.
 *
 * Rules:
 *  - fractionationId is required when the agent's dose_relevance_flag is true
 *    OR any potentially-applicable rule has non-null fractionation_ids.
 *  - timingIntervalDays is required when timingId is a recent/concurrent
 *    timing category AND the agent's timing_sensitivity_flag is true.
 */

import type { Agent, InteractionRule } from '@/data/types'
import type { MissingField } from './types'

/** Timing IDs that represent recent or concurrent therapy (require an interval). */
const RECENT_TIMING_IDS = new Set(['TM001', 'TM002', 'TM003'])

/**
 * Check whether fractionation input is required for a given agent and
 * any tentatively-matching rules (matched on agent+site+timing, before
 * fractionation filtering).
 */
export function fractionationRequired(
  agent: Agent,
  candidateRules: InteractionRule[],
): boolean {
  if (agent.dose_relevance_flag) return true
  return candidateRules.some((r) => r.conditions.fractionation_ids !== null)
}

/**
 * Check whether a timing interval (days) is required for a given agent.
 */
export function timingIntervalRequired(
  agent: Agent,
  timingId: string | null,
): boolean {
  if (!timingId) return false
  return RECENT_TIMING_IDS.has(timingId) && agent.timing_sensitivity_flag
}

/**
 * Validate completeness for a single agent.
 *
 * @param agent            Agent record.
 * @param timingId         Selected timing ID.
 * @param fractionationId  Selected fractionation ID (may be null).
 * @param timingIntervalDays  Days between therapy and RT (may be null).
 * @param candidateRules   Rules that match agent+site+timing (pre-fractionation).
 * @returns Array of missing fields; empty = complete.
 */
export function checkAgentInputCompleteness(
  agent: Agent,
  timingId: string | null,
  fractionationId: string | null,
  timingIntervalDays: number | null,
  candidateRules: InteractionRule[],
): MissingField[] {
  const missing: MissingField[] = []

  if (
    fractionationRequired(agent, candidateRules) &&
    fractionationId === null
  ) {
    missing.push({
      field: 'fractionationId',
      reason:
        `Fractionation category is required for ${agent.canonical_name} ` +
        `(dose-relevant agent or applicable rule requires fractionation).`,
    })
  }

  if (timingIntervalRequired(agent, timingId) && timingIntervalDays === null) {
    missing.push({
      field: 'timingIntervalDays',
      reason:
        `Timing interval (days) is required for ${agent.canonical_name} ` +
        `with ${timingId} (timing-sensitive agent with recent/concurrent timing).`,
    })
  }

  return missing
}
