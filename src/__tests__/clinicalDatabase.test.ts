import { describe, expect, it } from 'vitest'
import { auditLegacyFlatDatabase, getClinicalDatabase } from '@/data/clinical'
import { getAgents, getEvidenceLinks } from '@/data/loaders'
import { validateClinicalDatabase } from '@/data/clinical'
import { lookupInFlatDatabase } from '@/engine/flatLookup'

describe('clinical database contract', () => {
  it('starts empty rather than importing unreviewed legacy claims', () => {
    const database = getClinicalDatabase()
    expect(database.claims).toEqual([])
    expect(database.applicability).toEqual([])
  })

  it('has no invalid reviewed records', () => {
    const evidenceIds = new Set(getEvidenceLinks().map((evidence) => evidence.evidence_id))
    expect(validateClinicalDatabase(getClinicalDatabase(), evidenceIds)).toEqual([])
  })

  it('quarantines contradictory legacy evidence labels', () => {
    const audit = auditLegacyFlatDatabase([
      {
        agent: 'Example agent',
        site_key: 'brain',
        fractionation_key: 'Stereotactic',
        timing_key: 'Concurrent',
        risk_category: 'Caution',
        evidence_directness: 'Direct RT-combination',
        citations: '',
      },
      {
        agent: 'Example agent',
        site_key: 'pelvis',
        fractionation_key: 'Conventional',
        timing_key: 'Concurrent',
        risk_category: 'Insufficient evidence, seek specialist review',
        evidence_directness: 'No applicable evidence',
        citations: 'Regulatory/product-information warning | References: (no external RT-combination citation)',
      },
    ])

    expect(audit.issues.map((issue) => issue.issueType)).toEqual([
      'direct_claim_without_citation',
      'no_evidence_claim_with_citation',
      'pseudo_citation',
    ])
  })

  it('does not present the unreferenced cisplatin whole-brain palliative row as supported evidence', () => {
    const cisplatin = getAgents().find(
      (agent) => agent.canonical_name.toLowerCase() === 'cisplatin',
    )
    expect(cisplatin).toBeDefined()

    const result = lookupInFlatDatabase(
      cisplatin!.agent_id,
      cisplatin!.canonical_name,
      'RTS020',
      'FX006',
      'TM001',
    )

    expect(result?.alertLevel).toBe('Caution')
    expect(result?.evidenceLevel).toContain('No verified direct evidence')
    expect(result?.rationaleText).toContain('Evidence for this exact combination is limited')
    expect(result?.rationaleText).toContain('CNS toxicity additive with WBRT')
    expect(result?.citationText).toBeNull()
    expect(result?.toxicityDomains).toContain('Neurocognitive')
    expect(result?.fractionationWarning).not.toContain('confirm timing')
    expect(result?.siteRecommendation).toContain('Caution')
  })
})
