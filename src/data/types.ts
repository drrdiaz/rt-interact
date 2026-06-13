// ─── Primitive enums ─────────────────────────────────────────────────────────

export type AgentType = 'agent' | 'class'
export type RecordStatus = 'active' | 'inactive'
export type AliasType = 'brand' | 'common' | 'abbreviation' | 'generic'

// ─── JSON data shapes ────────────────────────────────────────────────────────

export interface Agent {
  agent_id: string
  type: AgentType
  canonical_name: string
  description: string
  therapy_class: string
  subclass: string | null
  oncology_use_category: string | null
  route: string | null
  is_adc: boolean
  is_targeted: boolean
  is_io: boolean
  is_endocrine: boolean
  is_bone_modifying: boolean
  is_radiopharmaceutical: boolean
  parent_class_ids: string[]
  agent_alert_level: string | null
  toxicity_domain_ids: string[]
  risk_drivers: string[]
  dose_relevance_flag: boolean
  timing_sensitivity_flag: boolean
  evolving_evidence_flag: boolean
  radiation_recall_flag: boolean
  evidence_level: string | null
  uncertainty: string | null
  primary_evidence_ids: string[]
  supporting_evidence_ids: string[]
  review_date: string
  version: string
  status: RecordStatus
}

export interface AgentAlias {
  alias_id: string
  alias_text: string
  alias_type: AliasType
  resolves_to_id: string
  resolves_to_type: AgentType
  canonical_name: string
  version: string
  status: RecordStatus
}

export interface RTSite {
  site_id: string
  rt_site: string
  rt_subsite: string
  default_inferred_oars: string[]
  optional_context_oars: string[]
  default_toxicity_domains: string[]
  site_drivers: string[]
  notes: string
  version: string
  status: RecordStatus
}

export interface TimingDefinition {
  timing_id: string
  timing_category: string
  operational_definition: string
  required_user_input: string
  default_app_interpretation: string
  escalation_logic: string
  version: string
  status: RecordStatus
}

export interface FractionationCategory {
  fractionation_id: string
  category: string
  rule_definition: string
  dose_per_fraction_gy: string
  typical_fraction_count: string
  key_interaction_implications: string
  default_risk_driver: string[]
  version: string
  status: RecordStatus
}

export interface ToxicityDomain {
  domain_id: string
  label: string
  description: string
  version: string
  status: RecordStatus
}

export interface InteractionRuleConditions {
  agent_class_ids: string[]
  rt_site_ids: string[] | null
  fractionation_ids: string[] | null
  timing_ids: string[]
  intent: string | null
}

export interface InteractionRule {
  rule_id: string
  conditions: InteractionRuleConditions
  output_alert_level: string
  output_toxicity_domains: string[]
  primary_risk_driver: string
  secondary_risk_drivers: string[]
  rationale_text: string
  evidence_link_ids: string[]
  supporting_evidence_ids: string[]
  evidence_level: string
  uncertainty: string
  evidence_basis_type: string
  expert_consensus_basis: boolean
  applies_to_any_low_concern: boolean
  applies_to_no_direct_evidence: boolean
  version: string
  last_reviewed_date: string
  status: RecordStatus
}

// ─── Application-level selection types ──────────────────────────────────────

export interface SelectedTherapy {
  agentId: string
  canonicalName: string
  /** The text actually typed/selected (may be an alias) */
  displayName: string
  aliasUsed?: string
  agentType: AgentType
}

export interface RTSiteSelection {
  siteId: string
  rtSite: string
  rtSubsite: string
}

export type TreatmentIntent = 'radical' | 'palliative' | null

export interface AgentSuggestion {
  agent: Agent
  matchedAlias?: AgentAlias
  displayLabel: string
  searchKey: string
}

// ─── Rule engine interface (implemented in Step 3) ──────────────────────────

export interface RuleEngineInput {
  selectedTherapies: SelectedTherapy[]
  rtSite: RTSiteSelection | null
  timingId: string | null
  fractionationId: string | null
  treatmentIntent: TreatmentIntent
  /** Days between last drug dose and RT start; required for timing-sensitive agents with recent/concurrent timing. */
  timingIntervalDays: number | null
}
