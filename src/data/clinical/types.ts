import type { AlertLevel } from '@/engine/types'

export type ClinicalRecordStatus = 'draft' | 'approved' | 'retired'
export type RTTreatmentType = 'conventional' | 'palliative' | 'stereotactic'
export type EvidenceApplicabilityType = 'direct' | 'indirect'
export type ClaimBasisType =
  | 'direct_evidence'
  | 'indirect_evidence'
  | 'practice_safeguard'
  | 'documented_evidence_gap'

export interface InteractionScope {
  agentIds: string[]
  regimenIds: string[]
  therapyClassIds: string[]
  rtSiteIds: string[]
  treatmentTypes: RTTreatmentType[]
  acuteEndpoints: string[]
}

/** A clinician-reviewed acute systemic therapy / RT interaction conclusion. */
export interface InteractionClaim {
  claimId: string
  status: ClinicalRecordStatus
  scope: InteractionScope
  alertLevel: AlertLevel
  basisType: ClaimBasisType
  rationale: string
  applicabilityIds: string[]
  reviewer: string | null
  reviewedAt: string | null
  version: string
}

/** States exactly why a source supports one interaction claim. */
export interface EvidenceApplicability {
  applicabilityId: string
  status: ClinicalRecordStatus
  claimId: string
  evidenceId: string
  applicability: EvidenceApplicabilityType
  scopeNote: string
  reviewer: string | null
  reviewedAt: string | null
}

/** A negative search result is evidence only when its search provenance is retained. */
export interface EvidenceGap {
  gapId: string
  status: ClinicalRecordStatus
  scope: InteractionScope
  searchQuestion: string
  sourcesSearched: string[]
  searchDate: string
  reviewer: string
  conclusion: string
}

/** A safety rule may fire with limited direct evidence, but never masquerades as direct evidence. */
export interface PracticeSafeguard {
  safeguardId: string
  status: ClinicalRecordStatus
  scope: InteractionScope
  alertLevel: AlertLevel
  rationale: string
  approvalReference: string
  reviewer: string
  reviewedAt: string
}

export interface ClinicalDatabase {
  claims: InteractionClaim[]
  applicability: EvidenceApplicability[]
  evidenceGaps: EvidenceGap[]
  safeguards: PracticeSafeguard[]
}

export interface ClinicalDatabaseIssue {
  recordType: 'claim' | 'applicability' | 'gap' | 'safeguard'
  recordId: string
  message: string
}
