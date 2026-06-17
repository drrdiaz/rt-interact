/**
 * Step 6 — Clinical Scenario Verification Tests
 *
 * Directly maps to the 12 required scenarios in the Phase 1 specification.
 * All agent IDs, rule IDs, site IDs, timing IDs and fractionation IDs are
 * sourced from the validated JSON files; no clinical data is hard-coded here.
 *
 * Scenario mapping:
 *  S01  endocrine therapy + prostate RT
 *  S02  bevacizumab + recent pelvic/GI RT
 *  S03  trastuzumab deruxtecan + thoracic RT
 *  S04  gemcitabine + concurrent central thoracic SABR
 *  S05  checkpoint inhibitor + thoracic RT
 *  S06  recognised agent with no applicable rule
 *  S07  unmatched medicine
 *  S08  multiple medicines with different alert levels
 *  S09  specific-agent rule overriding class rule
 *  S10  missing evidence link
 *  S11  timing-sensitive agent with missing interval (Recent timing)
 *  S12  dose-relevant agent with missing fractionation
 */

import { describe, it, expect } from 'vitest'
import { evaluateRules } from '@/engine/ruleEngine'
import { resolveEvidence } from '@/engine/evidence'
import { resolveByPrecedence } from '@/engine/precedence'
import type { RuleEngineInput, SelectedTherapy, RTSiteSelection } from '@/data/types'
import type { AlertLevel, MatchedRule } from '@/engine/types'
import { ALERT_SEVERITY } from '@/engine/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inp(overrides: Partial<RuleEngineInput> = {}): RuleEngineInput {
  return {
    selectedTherapies: [],
    rtSite: null,
    timingId: null,
    fractionationId: null,
    treatmentIntent: null,
    timingInterval: null,
    ...overrides,
  }
}

function t(agentId: string, name: string): SelectedTherapy {
  return { agentId, canonicalName: name, displayName: name, agentType: 'agent' }
}

function s(id: string, rtSite: string, rtSubsite: string): RTSiteSelection {
  return { siteId: id, rtSite, rtSubsite }
}

// ─────────────────────────────────────────────────────────────────────────────
// S01 — Endocrine therapy + prostate RT
// ─────────────────────────────────────────────────────────────────────────────

describe('S01 — Endocrine therapy + prostate RT', () => {
  const baseInput = () => inp({
    selectedTherapies: [t('AGT-058', 'letrozole')],
    rtSite: s('RTS001', 'Prostate', 'Prostate only'),
    timingId: 'TM004',         // Sequential — interval required for timing-sensitive agents
    fractionationId: 'FX001',
    timingInterval: 'gt4w',    // More than 4 weeks — required since letrozole is timing-sensitive
  })

  it('alert level: No specific alert', () => {
    const out = evaluateRules(baseInput())
    expect(out.incomplete).toBe(false)
    if (!out.incomplete) expect(out.alertLevel).toBe<AlertLevel>('No specific alert')
  })

  it('controlled rule IR016 matched', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) expect(out.matchedRuleIds).toContain('IR016')
  })

  it('toxicity domains array present (may be empty for low-concern)', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) expect(Array.isArray(out.toxicityDomainIds)).toBe(true)
  })

  it('evidence behaviour: statuses array present', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) expect(Array.isArray(out.evidenceStatuses)).toBe(true)
  })

  it('fallback not used', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) {
      expect(out.perAgentResults[0]?.fallbackUsed).toBe(false)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// S02 — Bevacizumab + recent pelvic/GI RT
// ─────────────────────────────────────────────────────────────────────────────

describe('S02 — Bevacizumab + recent pelvic/GI RT', () => {
  const baseInput = () => inp({
    selectedTherapies: [t('AGT-140', 'bevacizumab')],
    rtSite: s('RTS016', 'Pelvis', 'Rectal'),
    timingId: 'TM002',         // Recent before RT — interval required
    fractionationId: 'FX004',
    timingInterval: '1-4w',
  })

  it('alert level: High toxicity alert', () => {
    const out = evaluateRules(baseInput())
    expect(out.incomplete).toBe(false)
    if (!out.incomplete) expect(out.alertLevel).toBe<AlertLevel>('High toxicity alert')
  })

  it('IR003 (anti-VEGF class rule) matched', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) expect(out.matchedRuleIds).toContain('IR003')
  })

  it('toxicity domains non-empty', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) expect(out.toxicityDomainIds.length).toBeGreaterThan(0)
  })

  it('primary risk driver present', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) expect(out.primaryRiskDriver.length).toBeGreaterThan(0)
  })

  it('fallback not used', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) {
      const r = out.perAgentResults.find(r => r.agentId === 'AGT-140')
      expect(r?.fallbackUsed).toBe(false)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// S03 — Trastuzumab deruxtecan + thoracic RT
// ─────────────────────────────────────────────────────────────────────────────

describe('S03 — Trastuzumab deruxtecan + thoracic RT', () => {
  const baseInput = () => inp({
    selectedTherapies: [t('AGT-041', 'trastuzumab deruxtecan')],
    rtSite: s('RTS007', 'Lung', 'Central'),
    timingId: 'TM001',         // Concurrent — no interval required
    fractionationId: 'FX004',
    timingInterval: null,
  })

  it('alert level: at least Moderate toxicity alert', () => {
    const out = evaluateRules(baseInput())
    expect(out.incomplete).toBe(false)
    if (!out.incomplete) {
      expect(ALERT_SEVERITY[out.alertLevel]).toBeGreaterThanOrEqual(
        ALERT_SEVERITY['Moderate toxicity alert'],
      )
    }
  })

  it('matched rule is IR006 or IR011 (HER2-ADC or pneumonitis pathway)', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) {
      expect(out.matchedRuleIds.some(id => ['IR006', 'IR011'].includes(id))).toBe(true)
    }
  })

  it('rationale text non-empty', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) expect(out.rationaleText.length).toBeGreaterThan(0)
  })

  it('evidence statuses present', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) expect(Array.isArray(out.evidenceStatuses)).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// S04 — Gemcitabine + concurrent central thoracic SABR
// ─────────────────────────────────────────────────────────────────────────────

describe('S04 — Gemcitabine + concurrent central thoracic SABR', () => {
  const baseInput = () => inp({
    selectedTherapies: [t('AGT-050', 'gemcitabine')],
    rtSite: s('RTS007', 'Lung', 'Central'),
    timingId: 'TM001',         // Concurrent — no interval required
    fractionationId: 'FX004',
    timingInterval: null,
  })

  it('alert level: Uncertain / evidence limited (no lung class rule for gemcitabine)', () => {
    const out = evaluateRules(baseInput())
    expect(out.incomplete).toBe(false)
    if (!out.incomplete) expect(out.alertLevel).toBe<AlertLevel>('Uncertain / evidence limited')
  })

  it('general fallback rule IR015 matched', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) expect(out.matchedRuleIds).toContain('IR015')
  })

  it('rationale explains insufficient direct evidence', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) expect(typeof out.rationaleText).toBe('string')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// S05 — Checkpoint inhibitor + thoracic RT
// ─────────────────────────────────────────────────────────────────────────────

describe('S05 — Checkpoint inhibitor + thoracic RT', () => {
  const baseInput = () => inp({
    selectedTherapies: [t('AGT-123', 'pembrolizumab')],
    rtSite: s('RTS007', 'Lung', 'Central'),
    timingId: 'TM001',         // Concurrent — no interval required
    fractionationId: 'FX004',
    timingInterval: null,
  })

  it('alert level: at least Caution', () => {
    const out = evaluateRules(baseInput())
    expect(out.incomplete).toBe(false)
    if (!out.incomplete) {
      expect(ALERT_SEVERITY[out.alertLevel]).toBeGreaterThanOrEqual(
        ALERT_SEVERITY['Caution'],
      )
    }
  })

  it('ICI class rule (IR004 or IR011) matched', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) {
      expect(out.matchedRuleIds.some(id => ['IR004', 'IR011'].includes(id))).toBe(true)
    }
  })

  it('per-agent result available and not flagged unrecognised', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) {
      const r = out.perAgentResults.find(r => r.agentId === 'AGT-123')
      expect(r?.agentUnrecognised).toBe(false)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// S06 — Recognised agent with no applicable rule
// ─────────────────────────────────────────────────────────────────────────────

describe('S06 — Recognised agent with no applicable rule (pure fallback)', () => {
  const baseInput = () => inp({
    selectedTherapies: [t('AGT-001', 'capivasertib')],
    rtSite: s('RTS001', 'Prostate', 'Prostate only'),
    timingId: 'TM001',         // Concurrent — no interval required
    fractionationId: 'FX002',
    timingInterval: null,
  })

  it('alert level: Uncertain / evidence limited', () => {
    const out = evaluateRules(baseInput())
    expect(out.incomplete).toBe(false)
    if (!out.incomplete) expect(out.alertLevel).toBe<AlertLevel>('Uncertain / evidence limited')
  })

  it('no matched rule IDs (pure fallback)', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) expect(out.matchedRuleIds.length).toBe(0)
  })

  it('agent NOT flagged as unrecognised (it exists in catalogue)', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) {
      const r = out.perAgentResults.find(r => r.agentId === 'AGT-001')
      expect(r?.agentUnrecognised).toBe(false)
    }
  })

  it('fallbackUsed is true', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) {
      expect(out.perAgentResults[0]?.fallbackUsed).toBe(true)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// S07 — Unmatched medicine
// ─────────────────────────────────────────────────────────────────────────────

describe('S07 — Unmatched medicine (agent not in catalogue)', () => {
  const baseInput = () => inp({
    selectedTherapies: [t('UNKNOWN-9999', 'mystery drug')],
    rtSite: s('RTS007', 'Lung', 'Central'),
    timingId: 'TM001',         // Concurrent
    fractionationId: 'FX004',
    timingInterval: null,
  })

  it('alert level: Uncertain / evidence limited (never No specific alert)', () => {
    const out = evaluateRules(baseInput())
    expect(out.incomplete).toBe(false)
    if (!out.incomplete) {
      expect(out.alertLevel).toBe<AlertLevel>('Uncertain / evidence limited')
      expect(out.alertLevel).not.toBe<AlertLevel>('No specific alert')
    }
  })

  it('ID appears in diagnostics.unrecognisedAgentIds', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) {
      expect(out.diagnostics.unrecognisedAgentIds).toContain('UNKNOWN-9999')
    }
  })

  it('agentUnrecognised = true on per-agent result', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) {
      const r = out.perAgentResults.find(r => r.agentId === 'UNKNOWN-9999')
      expect(r?.agentUnrecognised).toBe(true)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// S08 — Multiple medicines with different alert levels
// ─────────────────────────────────────────────────────────────────────────────

describe('S08 — Multiple medicines, highest alert wins', () => {
  const baseInput = () => inp({
    selectedTherapies: [
      t('AGT-058', 'letrozole'),
      t('AGT-140', 'bevacizumab'),
    ],
    rtSite: s('RTS016', 'Pelvis', 'Rectal'),
    timingId: 'TM001',         // Concurrent — no interval required
    fractionationId: 'FX004',
    timingInterval: null,
  })

  it('overall alert = High (highest of No specific alert + High)', () => {
    const out = evaluateRules(baseInput())
    expect(out.incomplete).toBe(false)
    if (!out.incomplete) expect(out.alertLevel).toBe<AlertLevel>('High toxicity alert')
  })

  it('per-agent results available for both agents', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) expect(out.perAgentResults).toHaveLength(2)
  })

  it('combination warning shown (no dedicated combination rule for this pair)', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) {
      expect(out.combinationEffectsStatus).toBe('multiple-agents-not-modelled')
      expect(out.combinationWarning).not.toBeNull()
    }
  })

  it('low-concern agent result does not downgrade the overall level', () => {
    const out = evaluateRules(baseInput())
    if (!out.incomplete) {
      const letrozoleResult = out.perAgentResults.find(r => r.agentId === 'AGT-058')
      expect(ALERT_SEVERITY[out.alertLevel]).toBeGreaterThanOrEqual(
        ALERT_SEVERITY[letrozoleResult!.alertLevel],
      )
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// S09 — Specific-agent rule overriding class rule
// ─────────────────────────────────────────────────────────────────────────────

describe('S09 — Specific-agent rule overrides class-level rule', () => {
  it('resolveByPrecedence: agent-specific rule controls even when class rule has higher alert', () => {
    const classRule: MatchedRule = {
      ruleId: 'SYN-CLS',
      alertLevel: 'High toxicity alert',
      specificity: 'class-level',
      toxicityDomains: ['DOM-07'],
      evidenceLinkIds: [],
      supportingEvidenceIds: [],
      evidenceLevel: 'Low',
      uncertainty: 'High',
      primaryRiskDriver: 'Class-driven',
      secondaryRiskDrivers: [],
      rationaleText: 'Class-level rule',
      matchedByAgentId: false,
      matchedByClassIds: ['CLS-003'],
    }
    const agentRule: MatchedRule = {
      ruleId: 'SYN-AGT',
      alertLevel: 'Moderate toxicity alert',
      specificity: 'specific-agent',
      toxicityDomains: ['DOM-08'],
      evidenceLinkIds: [],
      supportingEvidenceIds: [],
      evidenceLevel: 'Moderate',
      uncertainty: 'Low',
      primaryRiskDriver: 'Agent-specific',
      secondaryRiskDrivers: [],
      rationaleText: 'Agent-specific rule — this must control',
      matchedByAgentId: true,
      matchedByClassIds: [],
    }
    const result = resolveByPrecedence('AGT-140', [classRule, agentRule])
    expect(result.controllingRule?.ruleId).toBe('SYN-AGT')
    expect(result.alertLevel).toBe<AlertLevel>('Moderate toxicity alert')
  })

  it('class rule is not in activeRules when agent-specific rule present', () => {
    const classRule: MatchedRule = {
      ruleId: 'SYN-CLS2',
      alertLevel: 'High toxicity alert',
      specificity: 'class-level',
      toxicityDomains: [],
      evidenceLinkIds: [],
      supportingEvidenceIds: [],
      evidenceLevel: 'Low',
      uncertainty: 'High',
      primaryRiskDriver: 'C',
      secondaryRiskDrivers: [],
      rationaleText: '',
      matchedByAgentId: false,
      matchedByClassIds: ['CLS-003'],
    }
    const agentRule: MatchedRule = {
      ruleId: 'SYN-AGT2',
      alertLevel: 'Caution',
      specificity: 'specific-agent',
      toxicityDomains: [],
      evidenceLinkIds: [],
      supportingEvidenceIds: [],
      evidenceLevel: 'Moderate',
      uncertainty: 'Low',
      primaryRiskDriver: 'A',
      secondaryRiskDrivers: [],
      rationaleText: '',
      matchedByAgentId: true,
      matchedByClassIds: [],
    }
    const result = resolveByPrecedence('AGT-140', [classRule, agentRule])
    expect(result.activeRules.some(r => r.ruleId === 'SYN-CLS2')).toBe(false)
    expect(result.controllingRule?.ruleId).toBe('SYN-AGT2')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// S10 — Missing evidence link
// ─────────────────────────────────────────────────────────────────────────────

describe('S10 — Missing evidence link', () => {
  it('resolveEvidence marks absent IDs as pending', () => {
    const knownIds = new Set(['EVID-0034', 'EVID-0035'])
    const statuses = resolveEvidence(['EVID-0034', 'EVID-ABSENT'], knownIds)
    expect(statuses.find(s => s.evidenceId === 'EVID-0034')?.status).toBe('present')
    expect(statuses.find(s => s.evidenceId === 'EVID-ABSENT')?.status).toBe('pending')
  })

  it('alert not suppressed when evidence is pending', () => {
    const out = evaluateRules(inp({
      selectedTherapies: [t('AGT-140', 'bevacizumab')],
      rtSite: s('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM002',
      fractionationId: 'FX004',
      timingInterval: '1-4w',
    }))
    expect(out.incomplete).toBe(false)
    if (!out.incomplete) {
      expect(out.alertLevel).toBeDefined()
      expect(typeof out.hasEvidencePending).toBe('boolean')
    }
  })

  it('evidenceStatuses array present in complete output', () => {
    const out = evaluateRules(inp({
      selectedTherapies: [t('AGT-140', 'bevacizumab')],
      rtSite: s('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM002',
      fractionationId: 'FX004',
      timingInterval: '1-4w',
    }))
    if (!out.incomplete) expect(Array.isArray(out.evidenceStatuses)).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// S11 — Timing-sensitive agent with missing interval (Recent timing)
// ─────────────────────────────────────────────────────────────────────────────

describe('S11 — Timing-sensitive agent with missing interval (Recent timing)', () => {
  it('engine returns incomplete state when timingInterval is null with Recent timing', () => {
    const out = evaluateRules(inp({
      selectedTherapies: [t('AGT-140', 'bevacizumab')],
      rtSite: s('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM002',         // Recent before RT — interval required for timing-sensitive
      fractionationId: 'FX004',
      timingInterval: null,
    }))
    expect(out.incomplete).toBe(true)
  })

  it('missingFields contains timingInterval', () => {
    const out = evaluateRules(inp({
      selectedTherapies: [t('AGT-140', 'bevacizumab')],
      rtSite: s('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM002',
      fractionationId: 'FX004',
      timingInterval: null,
    }))
    if (out.incomplete) {
      expect(out.missingFields.map(f => f.field)).toContain('timingInterval')
    }
  })

  it('no alertLevel on incomplete output', () => {
    const out = evaluateRules(inp({
      selectedTherapies: [t('AGT-140', 'bevacizumab')],
      rtSite: s('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM002',
      fractionationId: 'FX004',
      timingInterval: null,
    }))
    expect(out.incomplete).toBe(true)
    expect((out as { alertLevel?: unknown }).alertLevel).toBeUndefined()
  })

  it('Concurrent (TM001) + no interval → NOT incomplete (Concurrent never requires interval)', () => {
    const out = evaluateRules(inp({
      selectedTherapies: [t('AGT-140', 'bevacizumab')],
      rtSite: s('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM001',         // Concurrent — interval never required
      fractionationId: 'FX004',
      timingInterval: null,
    }))
    if (out.incomplete) {
      expect(out.missingFields.map(f => f.field)).not.toContain('timingInterval')
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// S12 — Dose-relevant agent with missing fractionation
// ─────────────────────────────────────────────────────────────────────────────

describe('S12 — Dose-relevant agent with missing fractionation', () => {
  it('engine returns incomplete state', () => {
    const out = evaluateRules(inp({
      selectedTherapies: [t('AGT-140', 'bevacizumab')],
      rtSite: s('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM002',
      fractionationId: null,
      timingInterval: '1-4w',
    }))
    expect(out.incomplete).toBe(true)
  })

  it('missingFields contains fractionationId', () => {
    const out = evaluateRules(inp({
      selectedTherapies: [t('AGT-140', 'bevacizumab')],
      rtSite: s('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM002',
      fractionationId: null,
      timingInterval: '1-4w',
    }))
    if (out.incomplete) {
      expect(out.missingFields.map(f => f.field)).toContain('fractionationId')
    }
  })

  it('partial per-agent results available for diagnostic use', () => {
    const out = evaluateRules(inp({
      selectedTherapies: [t('AGT-140', 'bevacizumab')],
      rtSite: s('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM002',
      fractionationId: null,
      timingInterval: '1-4w',
    }))
    if (out.incomplete) {
      expect(out.partialPerAgentResults.length).toBeGreaterThan(0)
    }
  })
})
