/**
 * Rule engine types — Step 3 implementation.
 *
 * These types are internal to the engine and cover the full structured
 * alert output required by the specification.  UI-facing types remain in
 * src/data/types.ts to keep the engine free of UI dependencies.
 */

// ─── Alert levels ─────────────────────────────────────────────────────────────

/**
 * The complete set of permissible alert levels.
 * `No specific alert` may only be returned by an explicit applicable
 * low-concern rule — absence of a matching rule never produces it.
 */
export type AlertLevel =
  | 'No specific alert'
  | 'Caution'
  | 'Uncertain / evidence limited'
  | 'Moderate toxicity alert'
  | 'High toxicity alert'

/**
 * Numeric severity for comparison.  Higher = more clinically urgent.
 * `Uncertain / evidence limited` ranks above `Caution` because lack of
 * evidence is itself a safety signal; both rank below confirmed toxicity alerts.
 */
export const ALERT_SEVERITY: Record<AlertLevel, number> = {
  'No specific alert': 0,
  'Caution': 1,
  'Uncertain / evidence limited': 2,
  'Moderate toxicity alert': 3,
  'High toxicity alert': 4,
}

/** Return the higher-severity AlertLevel of two. */
export function maxAlertLevel(a: AlertLevel, b: AlertLevel): AlertLevel {
  return ALERT_SEVERITY[a] >= ALERT_SEVERITY[b] ? a : b
}

// ─── Rule specificity ─────────────────────────────────────────────────────────

/**
 * How a rule was matched to an agent.
 * Specificity resolves which rule controls the alert level when multiple
 * rules apply to the same agent.
 *
 * Precedence (highest → lowest):
 *   specific-agent  > class-level  > general
 */
export type RuleSpecificity = 'specific-agent' | 'class-level' | 'general'

export const RULE_SPECIFICITY_RANK: Record<RuleSpecificity, number> = {
  'specific-agent': 2,
  'class-level': 1,
  'general': 0,
}

// ─── Per-rule match record ────────────────────────────────────────────────────

/** A rule that matched all relevant conditions for a given agent. */
export interface MatchedRule {
  ruleId: string
  alertLevel: AlertLevel
  specificity: RuleSpecificity
  toxicityDomains: string[]
  evidenceLinkIds: string[]
  supportingEvidenceIds: string[]
  evidenceLevel: string
  uncertainty: string
  primaryRiskDriver: string
  secondaryRiskDrivers: string[]
  rationaleText: string
  /** True when the rule's agent_class_ids contained the agent's own agent_id. */
  matchedByAgentId: boolean
  /** The class ID(s) that linked this rule to the agent (if class-level match). */
  matchedByClassIds: string[]
}

// ─── Per-agent evaluation ─────────────────────────────────────────────────────

/** The evaluation result for a single selected therapy. */
export interface PerAgentResult {
  agentId: string
  canonicalName: string
  alertLevel: AlertLevel
  /** All rules that matched, best-specificity first. */
  matchedRules: MatchedRule[]
  /** The single controlling rule after precedence resolution (null = pure fallback). */
  controllingRule: MatchedRule | null
  toxicityDomains: string[]
  evidenceLinkIds: string[]
  evidenceLevel: string | null
  uncertainty: string | null
  primaryRiskDriver: string | null
  secondaryRiskDrivers: string[]
  rationaleText: string | null
  fallbackUsed: boolean
  fallbackReason: string | null
  /** True when the agent_id was not found in the agent catalogue. */
  agentUnrecognised: boolean
}

// ─── Evidence status ──────────────────────────────────────────────────────────

export interface EvidenceStatus {
  evidenceId: string
  /** `present` = found in evidence_links.json; `pending` = ID referenced but absent. */
  status: 'present' | 'pending'
}

// ─── Incomplete-input state ───────────────────────────────────────────────────

export interface MissingField {
  field: 'fractionationId' | 'timingInterval'
  reason: string
}

export interface IncompleteInputState {
  incomplete: true
  missingFields: MissingField[]
  /**
   * Partial per-agent results for diagnostic use only.
   * No alert level is finalised when input is incomplete.
   */
  partialPerAgentResults: PerAgentResult[]
}

// ─── Developer diagnostics ───────────────────────────────────────────────────

export interface RuleConflict {
  agentId: string
  ruleIds: string[]
  specificity: RuleSpecificity
  alertLevels: AlertLevel[]
  description: string
}

export interface EngineDiagnostics {
  evaluatedAt: string
  agentCount: number
  totalRulesInspected: number
  totalRulesMatched: number
  conflicts: RuleConflict[]
  unrecognisedAgentIds: string[]
  evidenceStatuses: EvidenceStatus[]
}

// ─── Combination flag ─────────────────────────────────────────────────────────

export type CombinationEffectsStatus =
  | 'single-agent'
  | 'multiple-agents-not-modelled'
  | 'combination-rule-applied'

// ─── Complete engine output ───────────────────────────────────────────────────

/** The structured toxicity alert returned when inputs are complete. */
export interface ToxicityAlert {
  /** Overall highest alert level across all selected therapies. */
  alertLevel: AlertLevel
  /** One concise statement of the primary toxicity concern. */
  toxicityStatement: string
  /** Union of toxicity domain IDs from all matched rules. */
  toxicityDomainIds: string[]
  /** Human-readable labels for toxicityDomainIds. */
  toxicityDomainLabels: string[]
  /** Primary risk driver from the controlling rule with highest severity. */
  primaryRiskDriver: string
  /** Secondary risk drivers from all matched rules, deduplicated. */
  secondaryRiskDrivers: string[]
  /** One-line rationale. */
  rationaleText: string
  /** Deduplicated primary evidence IDs. */
  evidenceLinkIds: string[]
  /** Deduplicated supporting evidence IDs. */
  supportingEvidenceIds: string[]
  evidenceLevel: string
  uncertainty: string
  /** All rule IDs that contributed to the result. */
  matchedRuleIds: string[]
  /** Breakdown per selected therapy. */
  perAgentResults: PerAgentResult[]
  combinationEffectsStatus: CombinationEffectsStatus
  combinationWarning: string | null
  /** True when any evidence ID could not be resolved. */
  hasEvidencePending: boolean
  evidenceStatuses: EvidenceStatus[]
  diagnostics: EngineDiagnostics
  fallbackReason: string | null
}

// ─── Top-level return type ────────────────────────────────────────────────────

export type EngineOutput =
  | ({ incomplete: false } & ToxicityAlert)
  | IncompleteInputState
