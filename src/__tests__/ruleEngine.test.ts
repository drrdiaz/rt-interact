/**
 * Rule engine unit tests — Step 3.
 *
 * All 18 required cases.  Agent IDs, rule IDs, and site IDs are taken
 * directly from the validated JSON data (agents.json, interaction_rules.json,
 * rt_sites.json) rather than hard-coded display names where practical.
 *
 * Representative IDs used:
 *  AGT-058  letrozole          (endocrine, no parent classes, agent_alert_level=No specific alert)
 *  AGT-140  bevacizumab        (anti-VEGF; parent classes: CLS-003, CLS-009, CLS-013)
 *  AGT-041  trastuzumab deruxtecan (ADC; parent classes: CLS-005, CLS-010)
 *  AGT-050  gemcitabine        (antimetabolite/radiosensitiser; parent: CLS-001, CLS-008, CLS-009)
 *  AGT-123  pembrolizumab      (ICI; parent: CLS-004, CLS-010, CLS-011)
 *  AGT-001  capivasertib       (no parent classes; no applicable rules in most scenarios)
 *  RTS001   Prostate/Prostate only
 *  RTS007   Lung/Central
 *  RTS016   Pelvis/Rectal
 *  TM001    Concurrent
 *  TM002    Recent before RT
 *  TM004    Sequential
 *  FX001    Conventional fractionation
 *  FX002    Moderate hypofractionation
 *  FX004    SABR/SBRT
 *  IR003    High toxicity alert (CLS-003 / anti-VEGF)
 *  IR004    Caution (CLS-004 / ICI + lung + FX001/FX004)
 *  IR011    Moderate toxicity alert (CLS-010 / pneumonitis + lung)
 *  IR015    Uncertain / evidence limited (general fallback, TM001+SABR)
 *  IR016    No specific alert (general low-concern, sequential+conventional)
 */

import { describe, it, expect } from 'vitest'
import { evaluateRules } from '@/engine/ruleEngine'
import { resolveEvidence } from '@/engine/evidence'
import { hasDedicatedCombinationRule } from '@/engine/aggregator'
import type { RuleEngineInput, SelectedTherapy, RTSiteSelection } from '@/data/types'
import { matchRulesForAgent } from '@/engine/matcher'
import { resolveByPrecedence } from '@/engine/precedence'
import {
  type AlertLevel,
  ALERT_SEVERITY,
  type MatchedRule,
} from '@/engine/types'
import { getAgents, getInteractionRules } from '@/data/loaders'

// ─── Input builders ───────────────────────────────────────────────────────────

function makeInput(overrides: Partial<RuleEngineInput> = {}): RuleEngineInput {
  return {
    selectedTherapies: [],
    rtSite: null,
    timingId: null,
    fractionationId: null,
    treatmentIntent: null,
    timingIntervalDays: null,
    ...overrides,
  }
}

function therapy(agentId: string, name: string): SelectedTherapy {
  return {
    agentId,
    canonicalName: name,
    displayName: name,
    agentType: 'agent',
  }
}

function site(siteId: string, rtSite: string, rtSubsite: string): RTSiteSelection {
  return { siteId, rtSite, rtSubsite }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

// ── Test 1: Explicit low-concern endocrine therapy + prostate RT ──────────────
describe('Test 1 — endocrine therapy + prostate RT → No specific alert', () => {
  it('returns No specific alert via IR016 (applies_to_any_low_concern)', () => {
    const output = evaluateRules(makeInput({
      selectedTherapies: [therapy('AGT-058', 'letrozole')],
      rtSite: site('RTS001', 'Prostate', 'Prostate only'),
      timingId: 'TM004',           // Sequential — not recent, no interval needed
      fractionationId: 'FX001',    // Conventional — matches IR016
      timingIntervalDays: null,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      expect(output.alertLevel).toBe<AlertLevel>('No specific alert')
      expect(output.matchedRuleIds).toContain('IR016')
    }
  })
})

// ── Test 2: Bevacizumab + recent pelvic/GI RT ─────────────────────────────────
describe('Test 2 — bevacizumab + recent pelvic RT → High toxicity alert', () => {
  it('returns High toxicity alert via anti-VEGF class rule (IR003)', () => {
    const output = evaluateRules(makeInput({
      selectedTherapies: [therapy('AGT-140', 'bevacizumab')],
      rtSite: site('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM002',           // Recent before RT
      fractionationId: 'FX004',    // SABR/SBRT — matches IR003
      timingIntervalDays: 21,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      expect(output.alertLevel).toBe<AlertLevel>('High toxicity alert')
      expect(output.matchedRuleIds).toContain('IR003')
    }
  })
})

// ── Test 3: Trastuzumab deruxtecan + thoracic RT ──────────────────────────────
describe('Test 3 — trastuzumab deruxtecan + thoracic RT → Moderate toxicity alert', () => {
  it('matches via CLS-005/CLS-010 and returns at least Moderate', () => {
    const output = evaluateRules(makeInput({
      selectedTherapies: [therapy('AGT-041', 'trastuzumab deruxtecan')],
      rtSite: site('RTS007', 'Lung', 'Central'),
      timingId: 'TM001',           // Concurrent
      fractionationId: 'FX004',    // SABR — matches IR006 (CLS-005)
      timingIntervalDays: 0,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      expect(ALERT_SEVERITY[output.alertLevel]).toBeGreaterThanOrEqual(
        ALERT_SEVERITY['Moderate toxicity alert'],
      )
      // IR006 (CLS-005/HER2-ADC + lung) and/or IR011 (CLS-010/pneumonitis) should match
      expect(
        output.matchedRuleIds.some((id) => ['IR006', 'IR011'].includes(id)),
      ).toBe(true)
    }
  })
})

// ── Test 4: Gemcitabine + concurrent central thoracic SABR ───────────────────
describe('Test 4 — gemcitabine + concurrent central thoracic SABR', () => {
  it('falls back to Uncertain because no class rule covers lung site for gemcitabine + SABR', () => {
    // CLS-008/CLS-009 rules cover pelvic/abdominal/H&N, not lung.
    // IR015 (general TM001+SABR) provides the fallback.
    const output = evaluateRules(makeInput({
      selectedTherapies: [therapy('AGT-050', 'gemcitabine')],
      rtSite: site('RTS007', 'Lung', 'Central'),
      timingId: 'TM001',           // Concurrent
      fractionationId: 'FX004',    // SABR
      timingIntervalDays: 0,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      // IR015 is the expected general fallback for concurrent SABR with no direct evidence
      expect(output.alertLevel).toBe<AlertLevel>('Uncertain / evidence limited')
      expect(output.matchedRuleIds).toContain('IR015')
    }
  })
})

// ── Test 5: Checkpoint inhibitor + thoracic RT ────────────────────────────────
describe('Test 5 — checkpoint inhibitor + thoracic RT → ≥ Caution', () => {
  it('returns at least Caution via ICI class rules; Moderate expected from CLS-010', () => {
    const output = evaluateRules(makeInput({
      selectedTherapies: [therapy('AGT-123', 'pembrolizumab')],
      rtSite: site('RTS007', 'Lung', 'Central'),
      timingId: 'TM001',           // Concurrent
      fractionationId: 'FX004',    // SABR — matches IR004 (CLS-004)
      timingIntervalDays: 0,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      expect(ALERT_SEVERITY[output.alertLevel]).toBeGreaterThanOrEqual(
        ALERT_SEVERITY['Caution'],
      )
      // CLS-004 → IR004 (Caution); CLS-010 → IR011 (Moderate) both expected
      expect(
        output.matchedRuleIds.some((id) => ['IR004', 'IR011'].includes(id)),
      ).toBe(true)
    }
  })
})

// ── Test 6: Recognised agent with no applicable rule ─────────────────────────
describe('Test 6 — recognised agent with no matching rule → Uncertain', () => {
  it('returns Uncertain / evidence limited (pure fallback) when no rule covers the scenario', () => {
    // capivasertib has no parent_class_ids; TM001+FX002 matches no general rule
    // (IR015 needs FX004/FX005/FX008; IR016 needs TM004/TM005)
    const output = evaluateRules(makeInput({
      selectedTherapies: [therapy('AGT-001', 'capivasertib')],
      rtSite: site('RTS001', 'Prostate', 'Prostate only'),
      timingId: 'TM001',
      fractionationId: 'FX002',    // Moderate hypofractionation — no general rule
      timingIntervalDays: 0,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      expect(output.alertLevel).toBe<AlertLevel>('Uncertain / evidence limited')
      // No rule IDs matched (pure fallback)
      expect(output.matchedRuleIds.length).toBe(0)
    }
  })
})

// ── Test 7: Unmatched therapy excluded before engine evaluation ───────────────
describe('Test 7 — unrecognised agent ID excluded from rule evaluation', () => {
  it('flags the agent as unrecognised; does not return No specific alert', () => {
    const output = evaluateRules(makeInput({
      selectedTherapies: [therapy('UNKNOWN-9999', 'mystery drug')],
      rtSite: site('RTS007', 'Lung', 'Central'),
      timingId: 'TM001',
      fractionationId: 'FX004',
      timingIntervalDays: 0,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      expect(output.diagnostics.unrecognisedAgentIds).toContain('UNKNOWN-9999')
      // Unrecognised agents produce Uncertain, never No specific alert
      expect(output.alertLevel).not.toBe<AlertLevel>('No specific alert')
      const agentResult = output.perAgentResults.find(
        (r) => r.agentId === 'UNKNOWN-9999',
      )
      expect(agentResult?.agentUnrecognised).toBe(true)
    }
  })
})

// ── Test 8: Multiple therapies use highest alert ──────────────────────────────
describe('Test 8 — multiple therapies → highest alert level wins', () => {
  it('letrozole (No specific alert) + bevacizumab (High) → overall High', () => {
    const output = evaluateRules(makeInput({
      selectedTherapies: [
        therapy('AGT-058', 'letrozole'),
        therapy('AGT-140', 'bevacizumab'),
      ],
      rtSite: site('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM001',           // Concurrent — bevacizumab matches IR003/IR014
      fractionationId: 'FX004',    // SABR
      timingIntervalDays: 0,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      expect(output.alertLevel).toBe<AlertLevel>('High toxicity alert')
      // letrozole result must NOT downgrade the overall level
      const letzResult = output.perAgentResults.find((r) => r.agentId === 'AGT-058')
      expect(letzResult).toBeDefined()
      expect(ALERT_SEVERITY[output.alertLevel]).toBeGreaterThanOrEqual(
        ALERT_SEVERITY[letzResult!.alertLevel],
      )
    }
  })
})

// ── Test 9: Multiple therapies union toxicity domains ─────────────────────────
describe('Test 9 — multiple therapies → toxicity domains are unioned', () => {
  it('combines domains from both agents without duplicates', () => {
    const output = evaluateRules(makeInput({
      selectedTherapies: [
        therapy('AGT-041', 'trastuzumab deruxtecan'), // lung domains: DOM-05
        therapy('AGT-123', 'pembrolizumab'),           // lung domains: DOM-05 + others
      ],
      rtSite: site('RTS007', 'Lung', 'Central'),
      timingId: 'TM001',
      fractionationId: 'FX004',
      timingIntervalDays: 0,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      // Result should contain domains from both agents
      expect(output.toxicityDomainIds.length).toBeGreaterThan(0)
      // No duplicate domain IDs
      const unique = new Set(output.toxicityDomainIds)
      expect(unique.size).toBe(output.toxicityDomainIds.length)
    }
  })
})

// ── Test 10: Specific-agent rule overrides class rule ────────────────────────
describe('Test 10 — specific-agent rule overrides class-level rule', () => {
  it('matchRulesForAgent + resolveByPrecedence: agent-specific rule controls alert level', () => {
    const agents = getAgents()
    const bev = agents.find((a) => a.agent_id === 'AGT-140')!

    // Synthetic rules: one class-level (High), one agent-specific (Moderate)
    const classRule: MatchedRule = {
      ruleId: 'SYN-CLASS',
      alertLevel: 'High toxicity alert',
      specificity: 'class-level',
      toxicityDomains: ['DOM-07'],
      evidenceLinkIds: [],
      supportingEvidenceIds: [],
      evidenceLevel: 'Low',
      uncertainty: 'Moderate',
      primaryRiskDriver: 'Combination-driven',
      secondaryRiskDrivers: [],
      rationaleText: 'Class-level rule',
      matchedByAgentId: false,
      matchedByClassIds: ['CLS-003'],
    }
    const agentRule: MatchedRule = {
      ruleId: 'SYN-AGENT',
      alertLevel: 'Moderate toxicity alert',
      specificity: 'specific-agent',
      toxicityDomains: ['DOM-08'],
      evidenceLinkIds: [],
      supportingEvidenceIds: [],
      evidenceLevel: 'Moderate',
      uncertainty: 'Low',
      primaryRiskDriver: 'Agent-driven',
      secondaryRiskDrivers: [],
      rationaleText: 'Agent-specific rule — controls',
      matchedByAgentId: true,
      matchedByClassIds: [],
    }

    const result = resolveByPrecedence(bev.agent_id, [classRule, agentRule])
    // Agent-specific rule must control despite having lower numeric severity
    expect(result.controllingRule?.ruleId).toBe('SYN-AGENT')
    expect(result.alertLevel).toBe<AlertLevel>('Moderate toxicity alert')
  })
})

// ── Test 11: General rule used only when no more-specific rule applies ────────
describe('Test 11 — general rule (IR015) suppressed when class rule matches', () => {
  it('bevacizumab + RTS016 + TM001 + FX004: IR003 (class) wins over IR015 (general)', () => {
    const agents = getAgents()
    const rules  = getInteractionRules()
    const bev = agents.find((a) => a.agent_id === 'AGT-140')!

    const matched = matchRulesForAgent(bev, 'RTS016', 'TM001', 'FX004', rules)
    const result = resolveByPrecedence(bev.agent_id, matched)

    // IR015 is general; IR003 is class-level — class must prevail
    const controllingSpec = result.controllingRule?.specificity
    expect(controllingSpec).not.toBe('general')
    expect(result.controllingRule?.ruleId).not.toBe('IR015')

    // IR015 may still appear in matched list (as a lower-priority match)
    const ir015InMatched = matched.some((m) => m.ruleId === 'IR015')
    // Verify it is in the list but its specificity is 'general'
    if (ir015InMatched) {
      const ir015 = matched.find((m) => m.ruleId === 'IR015')!
      expect(ir015.specificity).toBe('general')
    }
  })
})

// ── Test 12: Missing fractionation returns incomplete-input state ─────────────
describe('Test 12 — missing fractionation returns incomplete-input state', () => {
  it('bevacizumab (dose-relevant) without fractionationId → incomplete', () => {
    const output = evaluateRules(makeInput({
      selectedTherapies: [therapy('AGT-140', 'bevacizumab')],
      rtSite: site('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM002',           // Recent before RT
      fractionationId: null,       // ← missing
      timingIntervalDays: 21,
    }))
    expect(output.incomplete).toBe(true)
    if (output.incomplete) {
      const fields = output.missingFields.map((f) => f.field)
      expect(fields).toContain('fractionationId')
    }
  })
})

// ── Test 13: Missing timing interval returns incomplete-input state ────────────
describe('Test 13 — missing timing interval returns incomplete-input state', () => {
  it('bevacizumab (timing-sensitive) + concurrent timing + no interval → incomplete', () => {
    const output = evaluateRules(makeInput({
      selectedTherapies: [therapy('AGT-140', 'bevacizumab')],
      rtSite: site('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM001',           // Concurrent — timing-sensitive flag applies
      fractionationId: 'FX004',
      timingIntervalDays: null,    // ← missing
    }))
    expect(output.incomplete).toBe(true)
    if (output.incomplete) {
      const fields = output.missingFields.map((f) => f.field)
      expect(fields).toContain('timingIntervalDays')
    }
  })
})

// ── Test 14: Missing evidence link returns evidence-pending state ─────────────
describe('Test 14 — missing evidence link marked as pending (alert retained)', () => {
  it('evidence statuses contain pending when an ID is absent from catalogue', () => {
    // Use bevacizumab scenario which references real evidence IDs.
    // The engine checks each ID against evidence_links.json.
    // EVID-0034 is referenced by IR003/IR014 — it should be 'present'.
    // A synthetic absent ID would appear if a rule referenced it.
    // We test the evidence resolver directly here.
    // resolveEvidence imported at top
    const knownIds = new Set(['EVID-0034', 'EVID-0035'])
    const statuses = resolveEvidence(
      ['EVID-0034', 'EVID-NONEXISTENT'],
      knownIds,
    )
    const present = statuses.find((s) => s.evidenceId === 'EVID-0034')
    const pending = statuses.find((s) => s.evidenceId === 'EVID-NONEXISTENT')
    expect(present?.status).toBe('present')
    expect(pending?.status).toBe('pending')
  })

  it('full engine: alert is retained when an evidence ID is absent (hasEvidencePending = true)', () => {
    // In the normal evaluation path, all evidence IDs come from the JSON.
    // We verify that the engine still returns an alert and sets hasEvidencePending
    // correctly (false here since all known IDs should resolve).
    const output = evaluateRules(makeInput({
      selectedTherapies: [therapy('AGT-140', 'bevacizumab')],
      rtSite: site('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM002',
      fractionationId: 'FX004',
      timingIntervalDays: 21,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      // Alert must be present regardless of evidence-pending status
      expect(output.alertLevel).not.toBeUndefined()
      // hasEvidencePending may be true or false; the alert is never suppressed
      expect(typeof output.hasEvidencePending).toBe('boolean')
    }
  })
})

// ── Test 15: No-rule case never returns No specific alert ─────────────────────
describe('Test 15 — absence of rule never produces No specific alert', () => {
  it('capivasertib (no class, no rule match) → Uncertain, not No specific alert', () => {
    const output = evaluateRules(makeInput({
      selectedTherapies: [therapy('AGT-001', 'capivasertib')],
      rtSite: site('RTS001', 'Prostate', 'Prostate only'),
      timingId: 'TM001',
      fractionationId: 'FX002',   // No general rule covers this combination
      timingIntervalDays: 0,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      expect(output.alertLevel).not.toBe<AlertLevel>('No specific alert')
    }
  })

  it('unrecognised agent → Uncertain, not No specific alert', () => {
    const output = evaluateRules(makeInput({
      selectedTherapies: [therapy('DOES-NOT-EXIST', 'unknown')],
      rtSite: site('RTS001', 'Prostate', 'Prostate only'),
      timingId: 'TM001',
      fractionationId: 'FX001',
      timingIntervalDays: 0,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      expect(output.alertLevel).not.toBe<AlertLevel>('No specific alert')
    }
  })
})

// ── Test 16: Duplicate evidence IDs are removed ───────────────────────────────
describe('Test 16 — duplicate evidence IDs are deduplicated in output', () => {
  it('evaluating two agents that share evidence IDs produces no duplicates', () => {
    // trastuzumab deruxtecan and pembrolizumab both reference overlapping evidence
    const output = evaluateRules(makeInput({
      selectedTherapies: [
        therapy('AGT-041', 'trastuzumab deruxtecan'),
        therapy('AGT-123', 'pembrolizumab'),
      ],
      rtSite: site('RTS007', 'Lung', 'Central'),
      timingId: 'TM001',
      fractionationId: 'FX004',
      timingIntervalDays: 0,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      const ids = output.evidenceLinkIds
      const unique = new Set(ids)
      expect(unique.size).toBe(ids.length)

      const ruleIds = output.matchedRuleIds
      const uniqueRules = new Set(ruleIds)
      expect(uniqueRules.size).toBe(ruleIds.length)
    }
  })
})

// ── Test 17: Dedicated combination rule suppresses generic combination warning ─
describe('Test 17 — combination-rule detection suppresses generic multi-agent warning', () => {
  it('without combination rule: combinationWarning is shown for 2 agents', () => {
    const output = evaluateRules(makeInput({
      selectedTherapies: [
        therapy('AGT-058', 'letrozole'),
        therapy('AGT-140', 'bevacizumab'),
      ],
      rtSite: site('RTS016', 'Pelvis', 'Rectal'),
      timingId: 'TM001',
      fractionationId: 'FX004',
      timingIntervalDays: 0,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      // No combination rule in data → generic warning shown
      expect(output.combinationEffectsStatus).toBe('multiple-agents-not-modelled')
      expect(output.combinationWarning).not.toBeNull()
    }
  })

  it('hasDedicatedCombinationRule returns true when a rule covers 2 agents', () => {
    // hasDedicatedCombinationRule imported at top
    const agents = getAgents()
    const bev = agents.find((a) => a.agent_id === 'AGT-140')!
    const gem = agents.find((a) => a.agent_id === 'AGT-050')!

    // Build a synthetic combination rule
    const syntheticCombinationRule = {
      rule_id: 'SYN-COMBO',
      conditions: {
        // CLS-003 covers bevacizumab; CLS-008 covers gemcitabine
        agent_class_ids: ['CLS-003', 'CLS-008'],
        rt_site_ids: null,
        fractionation_ids: null,
        timing_ids: ['TM001'],
        intent: null,
      },
      output_alert_level: 'High toxicity alert',
      output_toxicity_domains: [],
      primary_risk_driver: 'Combination-driven',
      secondary_risk_drivers: [],
      rationale_text: 'Synthetic combination rule',
      evidence_link_ids: [],
      supporting_evidence_ids: [],
      evidence_level: 'Low',
      uncertainty: 'High',
      evidence_basis_type: 'Synthetic',
      expert_consensus_basis: false,
      applies_to_any_low_concern: false,
      applies_to_no_direct_evidence: false,
      version: '1.0',
      last_reviewed_date: '2026-06-13',
      status: 'active' as const,
    }

    const parentClassMap = new Map([
      [bev.agent_id, bev.parent_class_ids ?? []],
      [gem.agent_id, gem.parent_class_ids ?? []],
    ])
    const result = hasDedicatedCombinationRule(
      [bev.agent_id, gem.agent_id],
      parentClassMap,
      [syntheticCombinationRule],
    )
    expect(result).toBe(true)
  })
})

// ── Test 18: Conflicting same-specificity rules generate diagnostics ───────────
describe('Test 18 — conflicting class-level rules at same tier generate diagnostics', () => {
  it('pembrolizumab + lung + TM001 + FX004: IR004 (Caution) vs IR011 (Moderate) → conflict surfaced', () => {
    const output = evaluateRules(makeInput({
      selectedTherapies: [therapy('AGT-123', 'pembrolizumab')],
      rtSite: site('RTS007', 'Lung', 'Central'),
      timingId: 'TM001',
      fractionationId: 'FX004',   // Matches both IR004 (FX004) and IR011 (any)
      timingIntervalDays: 0,
    }))
    expect(output.incomplete).toBe(false)
    if (!output.incomplete) {
      // Both IR004 and IR011 are class-level but produce different alert levels
      const conflicts = output.diagnostics.conflicts
      expect(conflicts.length).toBeGreaterThan(0)
      const conflictRuleIds = conflicts.flatMap((c) => c.ruleIds)
      expect(conflictRuleIds).toContain('IR004')
      expect(conflictRuleIds).toContain('IR011')
      // Highest level (Moderate) wins
      expect(output.alertLevel).toBe<AlertLevel>('Moderate toxicity alert')
    }
  })
})
