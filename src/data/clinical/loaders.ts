import rawApplicability from './raw/evidence_applicability.json'
import rawEvidenceGaps from './raw/evidence_gaps.json'
import rawClaims from './raw/interaction_claims.json'
import rawSafeguards from './raw/practice_safeguards.json'
import type {
  ClinicalDatabase,
  EvidenceApplicability,
  EvidenceGap,
  InteractionClaim,
  PracticeSafeguard,
} from './types'

/**
 * This is intentionally separate from the legacy flat lookup. Records enter
 * this layer only after their source scope and clinical conclusion are reviewed.
 */
export function getClinicalDatabase(): ClinicalDatabase {
  return {
    claims: rawClaims as InteractionClaim[],
    applicability: rawApplicability as EvidenceApplicability[],
    evidenceGaps: rawEvidenceGaps as EvidenceGap[],
    safeguards: rawSafeguards as PracticeSafeguard[],
  }
}
