/**
 * Read-only audit of the legacy flat lookup. This does not decide clinical
 * correctness; it identifies records that cannot be migrated without review.
 */
export interface LegacyScenarioRow {
  agent: string
  site_key: string
  fractionation_key: string
  timing_key: string
  risk_category: string
  evidence_directness: string
  citations: string
}

export interface LegacyAuditIssue {
  issueType:
    | 'direct_claim_without_citation'
    | 'no_evidence_claim_with_citation'
    | 'pseudo_citation'
  scenario: Pick<
    LegacyScenarioRow,
    'agent' | 'site_key' | 'fractionation_key' | 'timing_key' | 'risk_category' | 'evidence_directness'
  >
}

export interface LegacyAuditSummary {
  totalRows: number
  issues: LegacyAuditIssue[]
}

function hasCitation(row: LegacyScenarioRow): boolean {
  return Boolean(row.citations?.trim())
}

function isDirectClaim(value: string): boolean {
  return value === 'Direct RT-combination' || value === 'Partially direct RT-combination'
}

function isPseudoCitation(value: string): boolean {
  return /no external rt-combination citation|regulatory\/product-information warning/i.test(value)
}

function scenario(row: LegacyScenarioRow): LegacyAuditIssue['scenario'] {
  return {
    agent: row.agent,
    site_key: row.site_key,
    fractionation_key: row.fractionation_key,
    timing_key: row.timing_key,
    risk_category: row.risk_category,
    evidence_directness: row.evidence_directness,
  }
}

export function auditLegacyFlatDatabase(rows: LegacyScenarioRow[]): LegacyAuditSummary {
  const issues: LegacyAuditIssue[] = []

  for (const row of rows) {
    if (isDirectClaim(row.evidence_directness) && !hasCitation(row)) {
      issues.push({ issueType: 'direct_claim_without_citation', scenario: scenario(row) })
    }
    if (row.evidence_directness === 'No applicable evidence' && hasCitation(row)) {
      issues.push({ issueType: 'no_evidence_claim_with_citation', scenario: scenario(row) })
    }
    if (hasCitation(row) && isPseudoCitation(row.citations)) {
      issues.push({ issueType: 'pseudo_citation', scenario: scenario(row) })
    }
  }

  return { totalRows: rows.length, issues }
}
