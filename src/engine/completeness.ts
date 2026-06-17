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
 *  - timingInterval is required when timingId is Recent (TM002, TM003) or
 *    Sequential (TM004) AND the agent's timing_sensitivity_flag is true.
 *    Concurrent (TM001), Planned (TM005) and Unknown (TM006) do NOT require
 *    an interval — Concurrent means therapy is on-treatment during RT.
 */

import type { Agent, InteractionRule, TimingInterval } from '@/data/types'
import type { MissingField } from './types'

/**
 * Timing IDs for which an approximate interval is required
 * (Recent before/after RT and Sequential).
 * Concurrent, Planned and Unknown are intentionally excluded.
 */
const INTERVAL_REQUIRED_TIMING_IDS = new Set(['TM002', 'TM003', 'TM004'])

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
 * Check whether an approximate interval is required for a given agent.
 * Returns true only for timing-sensitive agents with Recent or Sequential timing.
 */
export function timingIntervalRequired(
  agent: Agent,
  timingId: string | null,
): boolean {
  if (!timingId) return false
  return INTERVAL_REQUIRED_TIMING_IDS.has(timingId) && agent.timing_sensitivity_flag
}

/**
 * Validate completeness for a single agent.
 *
 * @param agent            Agent record.
 * @param timingId         Selected timing ID.
 * @param fractionationId  Selected fractionation ID (may be null).
 * @param timingInterval   Selected interval category (may be null).
 * @param candidateRules   Rules that match agent+site+timing (pre-fractionation).
 * @returns Array of missing fields; empty = complete.
 */
export function checkAgentInputCompleteness(
  agent: Agent,
  timingId: string | null,
  fractionationId: string | null,
  timingInterval: TimingInterval | null,
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

  if (timingIntervalRequired(agent, timingId) && timingInterval === null) {
    missing.push({
      field: 'timingInterval',
      reason:
        `Approximate interval is required for ${agent.canonical_name} ` +
        `with ${timingId} (timing-sensitive agent with Recent or Sequential timing).`,
    })
  }

  return missing
}
