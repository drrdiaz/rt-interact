# RT Interact Phase 1 — Adjudication Template

**Version:** Phase 1 Expert Review — Step 8  
**Status:** To be completed after expert review forms are returned  
**Date:** June 2026

---

## Purpose

This template is used after blinded expert review forms have been collated. It records adjudication decisions for scenarios where reviewers disagreed, and tracks any resulting changes to rules, evidence, wording, or classifications.

Adjudication must be completed by at least two Radiation Oncology experts and the project lead before any rule change is implemented.

---

## Analysis Plan

Before adjudication, calculate the following metrics from the collated reviewer forms:

### Primary Agreement Metrics

| Metric | Calculation | Acceptance threshold |
|---|---|---|
| **Overall alert appropriateness** | % scenarios where ≥80% of reviewers rated alert as appropriate | ≥80% of scenarios |
| **Alert appropriateness by alert level** | As above, stratified by: No alert / Caution / Moderate / High / Uncertain | ≥90% for High alert scenarios |
| **Alert appropriateness by therapy class** | As above, stratified by therapy group | Review all classes below 70% |
| **Alert appropriateness by RT site** | As above, stratified by RT site | Review all sites below 70% |
| **Toxicity domain appropriateness** | % scenarios where ≥80% of reviewers rated domains as appropriate | ≥80% of scenarios |
| **False-reassurance rate** | Number of scenarios where any reviewer identified false reassurance | Zero accepted |
| **Under-alert rate** | Number of High alert scenarios where any reviewer considered alert undercalled | ≥90% must not be undercalled |
| **Over-alert rate** | Number of scenarios where majority considered alert over-escalated | Document and review |
| **Uncertainty appropriateness rate** | % scenarios where ≥80% rated uncertainty signalling appropriate | ≥80% of scenarios |
| **Missing-domain rate** | % scenarios where ≥1 reviewer identified a missing domain | Document all; act on ≥2 reviewers |
| **Evidence appropriateness rate** | % scenarios where ≥80% rated evidence basis appropriate | ≥80% of scenarios |

### Interpretation Notes

- These metrics apply to the 39 evaluable scenarios (S001–S031, S035–S042). Missing-input scenarios S032–S034 are assessed descriptively.
- A small expert sample (3 reviewers) is insufficient for statistical validation. Do not claim formal clinical validation from this exercise.
- The purpose is to identify candidate rule gaps and content errors, not to certify the product.

---

## Adjudication Record

Complete one block per scenario that required adjudication (i.e. any scenario where reviewers disagreed on ≥1 dimension or where false reassurance was identified).

---

### Adjudication Record Template

Copy this block for each scenario requiring adjudication.

```
Scenario ID:
Date reviewed:
Adjudicators:

─── Reviewer Disagreement ────────────────────────────────────────────────────
Alert level disagreement (Yes / No):
  Reviewer responses: [list]
  Direction of disagreement: Under-alert / Over-alert / Mixed

Domain disagreement (Yes / No):
  Missing domains identified by reviewers: [list]
  Inappropriate domains identified by reviewers: [list]

Rationale disagreement (Yes / No):
  Summary of concern: [free text]

Evidence disagreement (Yes / No):
  Summary of concern: [free text]

False reassurance identified (Yes / No):
  Reviewer(s) raising concern: [list]
  Nature of concern: [free text]

─── Consensus Decision ───────────────────────────────────────────────────────
Consensus reached (Yes / No / Unresolved):

Decision type (choose one or more):
  [ ] Rule change required
  [ ] Evidence change required
  [ ] Wording/rationale change required
  [ ] Classification change required (agent class assignment)
  [ ] No change — current output acceptable

─── Change Record ────────────────────────────────────────────────────────────
Required rule change:
  Rule ID: [e.g. IR024 (new) or IR009 (modify)]
  Change description: [free text]

Required evidence change:
  Evidence ID(s): [e.g. EVID-0071 (new)]
  Change description: [free text]

Required wording/rationale change:
  Change description: [free text]

Required classification change:
  Agent ID: [e.g. AGT-152]
  Current class: [e.g. CLS-003]
  Proposed class: [e.g. CLS-014 (new — HER2-targeted)]
  Change description: [free text]

─── Responsible Owner ────────────────────────────────────────────────────────
Responsible owner:
Status: Pending / In progress / Completed
Version targeted: [e.g. Phase 1.1 or Phase 2]
Date completed:

─── Unresolved Disagreement ──────────────────────────────────────────────────
Unresolved (Yes / No):
Nature of unresolved disagreement: [free text]
Action: Escalate to full panel / Seek additional reviewer / Defer to Phase 2 / Accept uncertainty
```

---

## Pre-Populated Candidate Adjudication Scenarios

The following scenarios are predicted to require adjudication based on the known clinical concerns identified during scenario design. Complete the adjudication record above for each after forms are returned.

| Priority | Scenario | Clinical concern | Expected disagreement area |
|---|---|---|---|
| Critical | S024 | Gemcitabine + lung RT → Uncertain | False reassurance; alert level undercalled |
| Critical | S025 | Temozolomide + brain WBRT → Uncertain | False reassurance; standard protocol not recognised |
| Critical | S036 | Carboplatin+paclitaxel + lung central → Uncertain | False reassurance; multi-agent standard doublet gap |
| High | S042 | Trastuzumab → CLS-003 classification | Class assignment accuracy |
| High | S009 | Cisplatin + H&N → Moderate (not High) | Alert level undercalled vs well-documented severe toxicity |
| High | S022 | Tarlatamab → High via class vs Caution at agent level | Class rule over-escalation |
| High | S037 | Bevacizumab after liver SBRT → Uncertain | Timing-based alert collapse |
| Moderate | S039 | Doxorubicin after chest wall RT → Uncertain | Recall risk in fallback domain DOM-19 |
| Moderate | S038 | Capecitabine recent before rectal RT → Uncertain | Residual radiosensitisation at TM002 |
| Moderate | S012 | T-DXd + central lung → Moderate (pneumonitis only) | ILD domain adequacy; T-DXd specific evidence |
| Moderate | S019 | Axitinib + liver SBRT → missing DOM-13 | Domain gap: hepatotoxicity |
| Moderate | S017 | Gemcitabine + spine marrow RT → DOM-06 only | Domain gap: pulmonary risk from gemcitabine |
| Lower | S035 | Dual ICI + lung SBRT → Moderate (no escalation) | Combination vs single-agent ICI risk |
| Lower | S040 | Nivolumab + lung SBRT = same alert as conventional | Fractionation insensitivity |
| Lower | S041 | Palbociclib + pelvic SBRT → DOM-06 lost vs conventional | Domain fractionation sensitivity |

---

## Summary Table

Complete after all adjudication is done.

| Scenario | Disagreement? | False reassurance? | Decision | Change type | Status | Version |
|---|---|---|---|---|---|---|
| S001 | | | | | | |
| S002 | | | | | | |
| S003 | | | | | | |
| S004 | | | | | | |
| S005 | | | | | | |
| S006 | | | | | | |
| S007 | | | | | | |
| S008 | | | | | | |
| S009 | | | | | | |
| S010 | | | | | | |
| S011 | | | | | | |
| S012 | | | | | | |
| S013 | | | | | | |
| S014 | | | | | | |
| S015 | | | | | | |
| S016 | | | | | | |
| S017 | | | | | | |
| S018 | | | | | | |
| S019 | | | | | | |
| S020 | | | | | | |
| S021 | | | | | | |
| S022 | | | | | | |
| S023 | | | | | | |
| S024 | | | | | | |
| S025 | | | | | | |
| S026 | | | | | | |
| S027 | | | | | | |
| S028 | | | | | | |
| S029 | | | | | | |
| S030 | | | | | | |
| S031 | | | | | | |
| S032 | | | | | | |
| S033 | | | | | | |
| S034 | | | | | | |
| S035 | | | | | | |
| S036 | | | | | | |
| S037 | | | | | | |
| S038 | | | | | | |
| S039 | | | | | | |
| S040 | | | | | | |
| S041 | | | | | | |
| S042 | | | | | | |

---

## Aggregate Findings Record

Complete after all adjudication and metric calculation.

```
Review date range:
Number of reviewers:
Number of scenarios reviewed:
Number of scenarios requiring adjudication:

─── Agreement Metrics ────────────────────────────────────────────────────────
Overall alert appropriateness rate:          % (threshold: ≥80%)     PASS / FAIL / N/A
Alert appropriateness — High alerts only:    % (threshold: ≥90%)     PASS / FAIL / N/A
Alert appropriateness — Caution alerts:      %
Alert appropriateness — Moderate alerts:     %
Alert appropriateness — No specific alert:   %
Alert appropriateness — Uncertain:           %
Toxicity domain appropriateness rate:        % (threshold: ≥80%)     PASS / FAIL / N/A
Evidence appropriateness rate:               % (threshold: ≥80%)     PASS / FAIL / N/A
Uncertainty appropriateness rate:            %

─── Safety Metrics ───────────────────────────────────────────────────────────
False-reassurance cases identified:          (threshold: 0)           PASS / FAIL / N/A
Under-alert rate for High scenarios:         %
Over-alert rate (majority considered too high): %
Missing-domain cases (≥2 reviewers):         

─── Rule Change Summary ──────────────────────────────────────────────────────
New rules required:
Rules modified:
Evidence records added:
Agent classifications corrected:
Wording changes:

─── Overall Validation Assessment ───────────────────────────────────────────
All acceptance criteria met:                 Yes / No
Critical concerns unresolved:                Yes / No (list if yes)
Recommendation: Proceed to Phase 1 release / Proceed with rule updates then re-check / Escalate to full panel
```

---

## Unresolved Limitations Register

Record any concerns that remain unresolved after adjudication and must be carried forward to Phase 2.

| ID | Scenario(s) | Nature of unresolved concern | Proposed resolution | Owner | Phase |
|---|---|---|---|---|---|
| UL-001 | | | | | |
| UL-002 | | | | | |
| UL-003 | | | | | |

---

*This template is part of the RT Interact Phase 1 expert review package. No patient information is recorded in this document. All scenario references are to synthetic test cases.*
