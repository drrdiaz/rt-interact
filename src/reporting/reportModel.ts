/**
 * Typed report model and validation for anonymous toxicity-signal reporting.
 *
 * Design constraints:
 * - No patient-identifying fields (no name, DOB, UR/MRN, address, Medicare,
 *   age, diagnosis, exact dates, hospital, clinician, blood results, images,
 *   clinical notes, or narrative free text).
 * - Submission month stored — not an exact timestamp.
 * - All fields use controlled structured IDs from validated JSON.
 */

import {
  getAgents,
  getRTSites,
  getTimingDefinitions,
  getFractionationCategories,
  getToxicityDomains,
} from '@/data/loaders'

// ── Valid controlled values ─────────────────────────────────────────────────

export const ONSET_OPTIONS = [
  { id: 'during_rt', label: 'During RT' },
  { id: 'within_weeks', label: 'Within weeks' },
  { id: 'months_later', label: 'Months later' },
  { id: 'unclear', label: 'Unclear' },
] as const

export type ApproximateOnset = (typeof ONSET_OPTIONS)[number]['id']

export const SEVERITY_OPTIONS = [
  { id: 'G1', label: 'G1 Mild' },
  { id: 'G2', label: 'G2 Moderate' },
  { id: 'G3', label: 'G3 Severe' },
  { id: 'G4', label: 'G4 Life-threatening' },
  { id: 'G5', label: 'G5 Death' },
  { id: 'unclear', label: 'Unclear' },
] as const

export type Severity = (typeof SEVERITY_OPTIONS)[number]['id']

export const TRISTATE_OPTIONS = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'unclear', label: 'Unclear' },
] as const

export type Tristate = (typeof TRISTATE_OPTIONS)[number]['id']

// ── Report model ─────────────────────────────────────────────────────────────

/**
 * The anonymised toxicity-signal report.
 * Contains only structured controlled fields — no free text, no identifiers.
 */
export interface ToxicityReport {
  /** Non-identifying report ID (UUID v4) */
  reportId: string
  /** Submission month in YYYY-MM format — no exact date */
  submissionMonth: string
  /** Agent IDs from the validated agents.json */
  therapyIds: string[]
  /** Site ID from rt_sites.json */
  rtSiteId: string
  /** Timing ID from timing_definitions.json */
  timingId: string
  /** Fractionation ID from fractionation_categories.json */
  fractionationId: string
  /** Domain IDs from toxicity_domains.json */
  toxicityDomainIds: string[]
  approximateOnset: ApproximateOnset
  severity: Severity
  treatmentInterrupted: Tristate
  hospitalAdmission: Tristate
}

/** Fields that the user fills in before the reportId / submissionMonth are generated */
export type ToxicityReportInput = Omit<ToxicityReport, 'reportId' | 'submissionMonth'>

// ── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/** Validate a report input against all controlled ID sets and structural rules. */
export function validateReportInput(input: ToxicityReportInput): ValidationResult {
  const errors: string[] = []

  const validAgentIds = new Set(getAgents().map((a) => a.agent_id))
  const validSiteIds = new Set(getRTSites().map((s) => s.site_id))
  const validTimingIds = new Set(getTimingDefinitions().map((t) => t.timing_id))
  const validFracIds = new Set(getFractionationCategories().map((f) => f.fractionation_id))
  const validDomainIds = new Set(getToxicityDomains().map((d) => d.domain_id))
  const validOnsetIds = new Set(ONSET_OPTIONS.map((o) => o.id))
  const validSeverityIds = new Set(SEVERITY_OPTIONS.map((s) => s.id))
  const validTristateIds = new Set(TRISTATE_OPTIONS.map((t) => t.id))

  if (!input.therapyIds || input.therapyIds.length === 0) {
    errors.push('At least one systemic therapy is required.')
  } else {
    for (const id of input.therapyIds) {
      if (!validAgentIds.has(id)) {
        errors.push(`Unrecognised therapy ID: ${id}`)
      }
    }
  }

  if (!input.rtSiteId) {
    errors.push('RT site is required.')
  } else if (!validSiteIds.has(input.rtSiteId)) {
    errors.push(`Unrecognised RT site ID: ${input.rtSiteId}`)
  }

  if (!input.timingId) {
    errors.push('Timing relative to RT is required.')
  } else if (!validTimingIds.has(input.timingId)) {
    errors.push(`Unrecognised timing ID: ${input.timingId}`)
  }

  if (!input.fractionationId) {
    errors.push('Fractionation category is required.')
  } else if (!validFracIds.has(input.fractionationId)) {
    errors.push(`Unrecognised fractionation ID: ${input.fractionationId}`)
  }

  if (!input.toxicityDomainIds || input.toxicityDomainIds.length === 0) {
    errors.push('At least one toxicity domain is required.')
  } else {
    for (const id of input.toxicityDomainIds) {
      if (!validDomainIds.has(id)) {
        errors.push(`Unrecognised toxicity domain ID: ${id}`)
      }
    }
  }

  if (!input.approximateOnset) {
    errors.push('Approximate onset is required.')
  } else if (!validOnsetIds.has(input.approximateOnset)) {
    errors.push(`Invalid onset value: ${input.approximateOnset}`)
  }

  if (!input.severity) {
    errors.push('Severity is required.')
  } else if (!validSeverityIds.has(input.severity)) {
    errors.push(`Invalid severity value: ${input.severity}`)
  }

  if (!input.treatmentInterrupted) {
    errors.push('Treatment interrupted status is required.')
  } else if (!validTristateIds.has(input.treatmentInterrupted)) {
    errors.push(`Invalid treatment interrupted value: ${input.treatmentInterrupted}`)
  }

  if (!input.hospitalAdmission) {
    errors.push('Hospital admission status is required.')
  } else if (!validTristateIds.has(input.hospitalAdmission)) {
    errors.push(`Invalid hospital admission value: ${input.hospitalAdmission}`)
  }

  // Guard: no unexpected properties
  const allowedKeys: (keyof ToxicityReportInput)[] = [
    'therapyIds',
    'rtSiteId',
    'timingId',
    'fractionationId',
    'toxicityDomainIds',
    'approximateOnset',
    'severity',
    'treatmentInterrupted',
    'hospitalAdmission',
  ]
  const inputKeys = Object.keys(input)
  for (const key of inputKeys) {
    if (!(allowedKeys as string[]).includes(key)) {
      errors.push(`Unexpected field: ${key}`)
    }
  }

  return { valid: errors.length === 0, errors }
}

// ── Report builder ────────────────────────────────────────────────────────────

function generateReportId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function generateSubmissionMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/** Build a complete ToxicityReport from validated input. Throws on invalid input. */
export function buildReport(input: ToxicityReportInput): ToxicityReport {
  const validation = validateReportInput(input)
  if (!validation.valid) {
    throw new Error(`Report validation failed: ${validation.errors.join('; ')}`)
  }
  return {
    ...input,
    reportId: generateReportId(),
    submissionMonth: generateSubmissionMonth(),
  }
}

/** Prohibited field names — used in tests to verify no patient data is stored */
export const PROHIBITED_FIELD_NAMES: string[] = [
  'patientName',
  'name',
  'dateOfBirth',
  'dob',
  'urNumber',
  'mrn',
  'address',
  'medicareNumber',
  'age',
  'diagnosis',
  'date',
  'hospital',
  'clinician',
  'bloodResults',
  'imagingResults',
  'clinicalNotes',
  'notes',
  'freeText',
  'narrative',
  'description',
  'comments',
  'caseDescription',
  'observedToxicity',
  'timeframe',
  'additionalNotes',
]
