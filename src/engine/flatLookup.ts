/**
 * Flat database lookup — v22 App_Output_Resolved
 *
 * Searches the flat interaction lookup table from the Excel database
 * before falling back to the class-based rule engine.
 *
 * Matching logic (from Excel READ_ME):
 *   1. Match by agent searchable_agents (any token, case-insensitive)
 *   2. Filter by site_key
 *   3. Exact fractionation_key + timing_key → use that row
 *   4. If no exact match, fall back to fractionation_key = "Any" with timing_key
 *   5. If still no match, return most conservative (highest risk) row for agent+site
 *   6. If no rows for agent+site → return null (caller falls back to rule engine)
 */

import type { AlertLevel, PerAgentResult } from './types'
import { getAppOutputResolved } from '@/data/loaders'

// ─── Risk category → AlertLevel ───────────────────────────────────────────────

const RISK_TO_ALERT: Record<string, AlertLevel> = {
  'high-risk interaction': 'High toxicity alert',
  'avoid concurrent treatment unless justified': 'High toxicity alert',
  'moderate concern': 'Moderate toxicity alert',
  'caution': 'Caution',
  'low concern': 'No specific alert',
  'insufficient evidence, seek specialist review': 'Uncertain / evidence limited',
}

const RISK_PRIORITY: Record<string, number> = {
  'avoid concurrent treatment unless justified': 6,
  'high-risk interaction': 5,
  'moderate concern': 4,
  'caution': 3,
  'low concern': 2,
  'insufficient evidence, seek specialist review': 1,
}

// ─── Site key mapping: prototype RTS IDs → Excel site keys ───────────────────

export const SITE_ID_TO_KEY: Record<string, string> = {
  RTS001: 'pelvis',        // Prostate only
  RTS002: 'pelvis',        // Prostate + pelvic nodes
  RTS003: 'oesophagus',    // Oesophagus cervical/upper
  RTS004: 'oesophagus',    // Oesophagus mid-thoracic
  RTS005: 'oesophagus',    // Oesophagus lower/GOJ
  RTS006: 'lung',          // Lung peripheral
  RTS007: 'lung',          // Lung central
  RTS008: 'lung',          // Lung ultracentral
  RTS009: 'lung',          // Lung apical/Pancoast
  RTS010: 'breast',        // Breast whole
  RTS011: 'breast',        // Breast chest wall
  RTS012: 'breast',        // Breast + regional nodes
  RTS013: 'head_neck',     // H&N oral cavity/oropharynx
  RTS014: 'head_neck',     // H&N larynx/hypopharynx
  RTS015: 'head_neck',     // H&N nasopharynx/skull base
  RTS016: 'pelvis',        // Pelvis rectal
  RTS017: 'pelvis',        // Pelvis anal
  RTS018: 'pelvis',        // Pelvis gynaecological
  RTS019: 'pelvis',        // Pelvis para-aortic nodes
  RTS020: 'brain',         // Brain WBRT
  RTS021: 'brain',         // Brain SRS/focal
  RTS022: 'spine',         // Spine cervical
  RTS023: 'spine',         // Spine thoracic
  RTS024: 'spine',         // Spine lumbar/sacral
  RTS025: 'upper_abdomen', // Upper abdomen liver
  RTS026: 'upper_abdomen', // Upper abdomen pancreas
  RTS027: 'upper_abdomen', // Upper abdomen adrenal
  RTS028: 'skin',          // Skin/superficial
  RTS029: 'bone',          // Bone (non-spine)
  RTS030: 'nonspecific',   // Other/Custom
}

// ─── Fractionation key mapping: FX IDs → Excel keys ─────────────────────────

export const FRAC_ID_TO_KEY: Record<string, string> = {
  FX001: 'Conventional',  // Conventional fractionation
  FX002: 'Conventional',  // Moderate hypofractionation
  FX003: 'Stereotactic',  // Ultra-hypofractionation
  FX004: 'Stereotactic',  // SABR/SBRT
  FX005: 'Stereotactic',  // SRS
  FX006: 'Palliative',    // Palliative single fraction
  FX007: 'Palliative',    // Palliative multifraction
  FX008: 'Any',           // Large-field marrow-exposing RT
  FX009: 'Any',           // Re-irradiation
  FX010: 'Any',           // Custom
}

// ─── Timing key mapping: TM IDs → Excel keys ────────────────────────────────

export const TIMING_ID_TO_KEY: Record<string, string> = {
  TM001: 'Concurrent',
  TM002: 'Recent (before/after RT)',
  TM003: 'Recent (before/after RT)',
  TM004: 'Sequential',
  TM005: 'Planned/future',
  TM006: 'Concurrent',  // Unknown → worst-case concurrent
}

// ─── Row type ─────────────────────────────────────────────────────────────────

export interface AppOutputRow {
  agent: string
  drug_class: string
  site_key: string
  fractionation_key: string
  timing_key: string
  risk_category: string
  risk_priority: number
  inferred_oars: string
  toxicity_domains: string
  risk_drivers: string
  interaction_warning: string
  fractionation_warning: string
  site_recommendation: string
  medonc_discussion: string
  senior_ro_review: string
  uncertainty: string
  evidence_directness: string
  citations: string
  searchable_agents: string[]
}

// ─── Lookup ───────────────────────────────────────────────────────────────────

/**
 * Look up a single agent in the flat database.
 * Returns a PerAgentResult or null if no match found.
 */
export function lookupInFlatDatabase(
  agentId: string,
  canonicalName: string,
  siteId: string | null,
  fractionationId: string | null,
  timingId: string | null,
): PerAgentResult | null {
  if (!siteId || !timingId) return null

  const siteKey = SITE_ID_TO_KEY[siteId] ?? null
  const fracKey = fractionationId ? (FRAC_ID_TO_KEY[fractionationId] ?? 'Any') : 'Any'
  const timingKey = TIMING_ID_TO_KEY[timingId] ?? 'Concurrent'

  if (!siteKey) return null

  const db = getAppOutputResolved() as AppOutputRow[]
  const agentNameLower = canonicalName.toLowerCase().trim()

  // 1. All rows matching this agent (searchable_agents token match)
  const agentRows = db.filter((row) =>
    row.searchable_agents.some(
      (s) =>
        s === agentNameLower ||
        agentNameLower === s ||
        agentNameLower.startsWith(s) ||
        s.startsWith(agentNameLower),
    ),
  )

  if (agentRows.length === 0) return null

  // 2. Filter by site key
  const siteRows = agentRows.filter((row) => row.site_key === siteKey)
  if (siteRows.length === 0) return null

  // 3a. Exact fractionation + exact timing
  let match = siteRows.find(
    (row) => row.fractionation_key === fracKey && row.timing_key === timingKey,
  )

  // 3b. fractionation=Any + exact timing
  if (!match) {
    match = siteRows.find(
      (row) => row.fractionation_key === 'Any' && row.timing_key === timingKey,
    )
  }

  // 3c. Exact fractionation + broader timing
  if (!match) {
    match = siteRows.find(
      (row) =>
        row.fractionation_key === fracKey &&
        row.timing_key === 'Concurrent or sequential',
    )
  }

  // 3d. Any/Any → most conservative row for agent+site
  if (!match) {
    match = [...siteRows].sort(
      (a, b) =>
        (RISK_PRIORITY[(b.risk_category ?? '').toLowerCase()] ?? 0) -
        (RISK_PRIORITY[(a.risk_category ?? '').toLowerCase()] ?? 0),
    )[0]
  }

  if (!match) return null
  return rowToPerAgentResult(agentId, canonicalName, match)
}

// ─── Row → PerAgentResult ─────────────────────────────────────────────────────

function rowToPerAgentResult(
  agentId: string,
  canonicalName: string,
  row: AppOutputRow,
): PerAgentResult {
  const riskLower = (row.risk_category ?? '').toLowerCase().trim()
  const alertLevel: AlertLevel =
    RISK_TO_ALERT[riskLower] ?? 'Uncertain / evidence limited'

  const toxicityDomains = (row.toxicity_domains ?? '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)

  const riskDriverParts = (row.risk_drivers ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const primaryRiskDriver = riskDriverParts[0] ?? 'Agent-driven'
  const secondaryRiskDrivers = riskDriverParts.slice(1)

  const rationaleText = row.interaction_warning?.trim() || null

  const fractionationWarning =
    row.fractionation_warning && row.fractionation_warning !== 'None'
      ? row.fractionation_warning.trim()
      : null

  const siteRecommendation =
    row.site_recommendation && row.site_recommendation !== 'None'
      ? row.site_recommendation.trim()
      : null

  if (row.medonc_discussion === 'Yes' || row.medonc_discussion === 'Consider')
    secondaryRiskDrivers.push('Medical Oncology discussion recommended')
  if (row.senior_ro_review === 'Yes')
    secondaryRiskDrivers.push('Senior RO review recommended')

  return {
    agentId,
    canonicalName,
    alertLevel,
    matchedRules: [],
    controllingRule: null,
    toxicityDomains,
    evidenceLinkIds: [],
    evidenceLevel: row.evidence_directness ?? 'Not assessed',
    uncertainty: row.uncertainty ?? 'Not assessed',
    primaryRiskDriver,
    secondaryRiskDrivers: [...new Set(secondaryRiskDrivers)],
    rationaleText,
    fractionationWarning,
    siteRecommendation,
    fallbackUsed: false,
    fallbackReason: null,
    agentUnrecognised: false,
  }
}
