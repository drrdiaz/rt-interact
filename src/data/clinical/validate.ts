import type {
  ClinicalDatabase,
  ClinicalDatabaseIssue,
  InteractionScope,
} from './types'

function hasScope(scope: InteractionScope): boolean {
  return (
    scope.rtSiteIds.length > 0 &&
    scope.treatmentTypes.length > 0 &&
    scope.acuteEndpoints.length > 0 &&
    (scope.agentIds.length > 0 || scope.regimenIds.length > 0 || scope.therapyClassIds.length > 0)
  )
}

/**
 * Prevents a source from reaching a clinical claim without a reviewed, scoped
 * applicability record. The legacy flat table does not satisfy this contract.
 */
export function validateClinicalDatabase(
  database: ClinicalDatabase,
  knownEvidenceIds: Set<string>,
): ClinicalDatabaseIssue[] {
  const issues: ClinicalDatabaseIssue[] = []
  const claimsById = new Map(database.claims.map((claim) => [claim.claimId, claim]))
  const applicabilityById = new Map(
    database.applicability.map((record) => [record.applicabilityId, record]),
  )

  for (const claim of database.claims) {
    if (!hasScope(claim.scope)) {
      issues.push({ recordType: 'claim', recordId: claim.claimId, message: 'Claim scope is incomplete.' })
    }
    if (claim.status !== 'approved') continue
    if (!claim.reviewer || !claim.reviewedAt) {
      issues.push({ recordType: 'claim', recordId: claim.claimId, message: 'Approved claim requires reviewer and review date.' })
    }

    const links = claim.applicabilityIds
      .map((id) => applicabilityById.get(id))
      .filter((record): record is NonNullable<typeof record> => Boolean(record))

    if (claim.basisType === 'direct_evidence' && !links.some((link) => link.applicability === 'direct')) {
      issues.push({ recordType: 'claim', recordId: claim.claimId, message: 'Direct-evidence claim requires a direct evidence applicability link.' })
    }
    if (claim.basisType === 'documented_evidence_gap' && links.length > 0) {
      issues.push({ recordType: 'claim', recordId: claim.claimId, message: 'Evidence-gap claim cannot display evidence applicability links.' })
    }
  }

  for (const link of database.applicability) {
    if (!claimsById.has(link.claimId)) {
      issues.push({ recordType: 'applicability', recordId: link.applicabilityId, message: 'Applicability link points to an unknown claim.' })
    }
    if (!knownEvidenceIds.has(link.evidenceId)) {
      issues.push({ recordType: 'applicability', recordId: link.applicabilityId, message: 'Applicability link points to unknown evidence.' })
    }
    if (link.status === 'approved' && (!link.reviewer || !link.reviewedAt || !link.scopeNote)) {
      issues.push({ recordType: 'applicability', recordId: link.applicabilityId, message: 'Approved applicability requires scope note, reviewer, and review date.' })
    }
  }

  for (const gap of database.evidenceGaps) {
    if (!hasScope(gap.scope) || !gap.searchQuestion || !gap.searchDate || !gap.reviewer || gap.sourcesSearched.length === 0) {
      issues.push({ recordType: 'gap', recordId: gap.gapId, message: 'Evidence gap requires scope and documented search provenance.' })
    }
  }

  for (const safeguard of database.safeguards) {
    if (!hasScope(safeguard.scope) || !safeguard.approvalReference || !safeguard.reviewer || !safeguard.reviewedAt) {
      issues.push({ recordType: 'safeguard', recordId: safeguard.safeguardId, message: 'Safeguard requires scope and governance metadata.' })
    }
  }

  return issues
}
