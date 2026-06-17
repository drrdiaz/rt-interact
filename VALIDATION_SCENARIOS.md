# RT Interact Phase 1 — Expert Validation Scenarios

**Version:** Phase 1 Expert Review — Step 8  
**Status:** Expert review in progress — do not distribute externally  
**Scenario count:** 42  
**Date:** June 2026

---

## Purpose

This document provides the full set of 42 synthetic clinical validation scenarios for expert review of RT Interact Phase 1. Each scenario documents the current app output (alert level, toxicity domains, rationale, evidence references) and the clinical validation purpose. Reviewers assess whether the app output is clinically appropriate using the `EXPERT_REVIEW_FORM.csv`.

No patient data is included. All scenarios are synthetic and constructed to probe specific rule engine behaviours.

---

## Scenario Categories

| Category | Scenarios | Purpose |
|---|---|---|
| Low concern / No specific alert | S001–S005 | Confirm no false-high alerts for standard low-risk sequential combinations |
| Caution | S006–S008 | Protocol chemoradiation and ICI+brain SRS; confirm calibration |
| Moderate toxicity alert | S009–S017 | Key combination alerts; domain and rationale adequacy |
| High toxicity alert | S018–S023 | Anti-VEGF+SBRT, CAR-T, bispecifics; confirm High is clinically warranted |
| Uncertain / evidence limited | S024–S029 | Known and novel agents with limited rules; false-reassurance assessment |
| Unmatched / evolving evidence | S030–S031 | Novel agents (KRAS inhibitor, bisphosphonate) returned via fallback |
| Missing input states | S032–S034 | Incomplete inputs; confirm safe handling |
| Multi-agent | S035–S036 | Dual ICI and platinum+taxane doublet; combination gap assessment |
| Timing-sensitive | S037–S039 | Anti-VEGF timing, recent capecitabine, anthracycline recall |
| Fractionation-sensitive | S040–S041 | ICI+SBRT vs conventional; CDK4/6 domain change with fractionation |
| Site-specific interaction | S042 | Trastuzumab + breast RT; classification and alert assessment |

---

## Alert Level Definitions

| Alert level | Meaning |
|---|---|
| **No specific alert** | No interaction signal for this combination; standard clinical checks apply |
| **Caution** | Recognised combination with expected managed toxicity (e.g. protocol chemoradiation); alert level reflects awareness, not crisis |
| **Moderate toxicity alert** | Meaningful evidence of enhanced toxicity requiring active monitoring |
| **High toxicity alert** | Well-documented severe/life-threatening enhanced toxicity; combination requires specialist coordination |
| **Uncertain / evidence limited** | Insufficient evidence to assign an alert level; fallback output from agent data |

---

## Scenarios

### Low concern

#### S001: enzalutamide — Prostate — Prostate only

**Therapy group:** Androgen receptor antagonist / ADT  
**RT site:** Prostate — Prostate only  
**Timing:** Sequential  
**Fractionation:** Palliative single fraction  
**Multi-agent:** No  

**Expected app alert level:** `No specific alert`  
**Expected app toxicity domains:** —  
**Expected app risk driver:** Agent-driven  
**Expected app rationale:** *No major interaction signal identified; proceed with standard clinical checks and clinician override.*  
**Matched rules:** IR016  
**App evidence IDs:** EVID-0069, EVID-0070  
**Fallback used:** No  

**Validation purpose:** Well-established ADT + prostate RT combination. Confirm that sequential enzalutamide does not generate a spurious alert.  
**Primary clinical concern:** False-high alert risk  
**Fractionation sensitivity:** No  
**Timing sensitivity:** Yes  

---

#### S002: letrozole — Breast — Whole breast

**Therapy group:** Aromatase inhibitor / endocrine therapy  
**RT site:** Breast — Whole breast  
**Timing:** Planned after RT  
**Fractionation:** Palliative multifraction  
**Multi-agent:** No  

**Expected app alert level:** `No specific alert`  
**Expected app toxicity domains:** —  
**Expected app risk driver:** Agent-driven  
**Expected app rationale:** *No major interaction signal identified; proceed with standard clinical checks and clinician override.*  
**Matched rules:** IR016  
**App evidence IDs:** EVID-0069, EVID-0070  
**Fallback used:** No  

**Validation purpose:** Aromatase inhibitor planned after breast RT. Confirm no false alert for this standard adjuvant sequence.  
**Primary clinical concern:** False-high alert risk  
**Fractionation sensitivity:** No  
**Timing sensitivity:** Yes  

---

#### S003: abiraterone — Prostate — Prostate + pelvic nodes

**Therapy group:** Androgen synthesis inhibitor / ADT  
**RT site:** Prostate — Prostate + pelvic nodes  
**Timing:** Sequential  
**Fractionation:** Palliative multifraction  
**Multi-agent:** No  

**Expected app alert level:** `No specific alert`  
**Expected app toxicity domains:** —  
**Expected app risk driver:** Agent-driven  
**Expected app rationale:** *No major interaction signal identified; proceed with standard clinical checks and clinician override.*  
**Matched rules:** IR016  
**App evidence IDs:** EVID-0069, EVID-0070  
**Fallback used:** No  

**Validation purpose:** Abiraterone sequential before/after pelvic RT. Confirm appropriate low concern.  
**Primary clinical concern:** False-high alert risk  
**Fractionation sensitivity:** No  
**Timing sensitivity:** Yes  

---

#### S004: bicalutamide — Spine — Lumbar/sacral

**Therapy group:** Androgen receptor antagonist / ADT  
**RT site:** Spine — Lumbar/sacral  
**Timing:** Sequential  
**Fractionation:** Palliative multifraction  
**Multi-agent:** No  

**Expected app alert level:** `No specific alert`  
**Expected app toxicity domains:** —  
**Expected app risk driver:** Agent-driven  
**Expected app rationale:** *No major interaction signal identified; proceed with standard clinical checks and clinician override.*  
**Matched rules:** IR016  
**App evidence IDs:** EVID-0069, EVID-0070  
**Fallback used:** No  

**Validation purpose:** Bicalutamide with palliative bone RT. Standard low-concern combination; confirm no false alert.  
**Primary clinical concern:** False-high alert risk  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

#### S005: anastrozole — Breast — Chest wall

**Therapy group:** Aromatase inhibitor / endocrine therapy  
**RT site:** Breast — Chest wall  
**Timing:** Planned after RT  
**Fractionation:** Palliative single fraction  
**Multi-agent:** No  

**Expected app alert level:** `No specific alert`  
**Expected app toxicity domains:** —  
**Expected app risk driver:** Agent-driven  
**Expected app rationale:** *No major interaction signal identified; proceed with standard clinical checks and clinician override.*  
**Matched rules:** IR016  
**App evidence IDs:** EVID-0069, EVID-0070  
**Fallback used:** No  

**Validation purpose:** Anastrozole planned after chest wall RT. Confirm appropriate low concern for this sequence.  
**Primary clinical concern:** False-high alert risk  
**Fractionation sensitivity:** No  
**Timing sensitivity:** Yes  

---

### Caution

#### S006: paclitaxel — Head and neck — Larynx/hypopharynx

**Therapy group:** Cytotoxic chemotherapy — taxane  
**RT site:** Head and neck — Larynx/hypopharynx  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Intent:** Curative  
**Multi-agent:** No  

**Expected app alert level:** `Caution`  
**Expected app toxicity domains:** DOM-03 (Mucositis / oesophagitis); DOM-01 (GI toxicity); DOM-06 (Marrow suppression / cytopenias)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *This is a recognised concurrent chemoradiation combination; toxicity risk is expected and should be managed according to the relevant protocol.*  
**Matched rules:** IR009  
**App evidence IDs:** EVID-0041, EVID-0043, EVID-0044  
**Fallback used:** No  

**Validation purpose:** Taxane-based H&N chemoradiation. Confirm Caution (not over-escalated to Moderate/High) for protocol combination. Assess whether mucositis, GI and marrow domains are appropriate.  
**Primary clinical concern:** Alert level calibration; domain completeness  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** Yes  

---

#### S007: ipilimumab — Brain — SRS/focal

**Therapy group:** Immune checkpoint inhibitor — anti-CTLA-4  
**RT site:** Brain — SRS/focal  
**Timing:** Concurrent  
**Fractionation:** SRS  
**Multi-agent:** No  

**Expected app alert level:** `Caution`  
**Expected app toxicity domains:** DOM-10 (CNS oedema / radionecrosis)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *SRS with immune checkpoint therapy may increase inflammatory imaging changes, oedema or radionecrosis in selected settings.*  
**Matched rules:** IR005  
**App evidence IDs:** EVID-0002, EVID-0024  
**Fallback used:** No  

**Validation purpose:** Anti-CTLA-4 ICI with intracranial SRS. Assess whether Caution is appropriate, whether CNS oedema/radionecrosis is the correct domain, and whether uncertainty is adequately signalled.  
**Primary clinical concern:** Alert level; uncertainty signalling; potential for over-reassurance  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** No  

---

#### S008: docetaxel — Head and neck — Oral cavity/oropharynx

**Therapy group:** Cytotoxic chemotherapy — taxane  
**RT site:** Head and neck — Oral cavity/oropharynx  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Intent:** Curative  
**Multi-agent:** No  

**Expected app alert level:** `Caution`  
**Expected app toxicity domains:** DOM-03 (Mucositis / oesophagitis); DOM-01 (GI toxicity); DOM-06 (Marrow suppression / cytopenias)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *This is a recognised concurrent chemoradiation combination; toxicity risk is expected and should be managed according to the relevant protocol.*  
**Matched rules:** IR009  
**App evidence IDs:** EVID-0041, EVID-0043, EVID-0044  
**Fallback used:** No  

**Validation purpose:** Docetaxel H&N chemoradiation (curative). Confirm protocol-based Caution. Note: docetaxel lacks CLS-009 classification so IR010 does not fire; only Caution expected, not Moderate.  
**Primary clinical concern:** Alert calibration; class coverage completeness for taxanes  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** Yes  

---

### Moderate

#### S009: cisplatin — Head and neck — Oral cavity/oropharynx

**Therapy group:** Cytotoxic chemotherapy — platinum, Strong mucosal radiosensitiser  
**RT site:** Head and neck — Oral cavity/oropharynx  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Intent:** Curative  
**Multi-agent:** No  

**Expected app alert level:** `Moderate toxicity alert`  
**Expected app toxicity domains:** DOM-03 (Mucositis / oesophagitis); DOM-01 (GI toxicity); DOM-06 (Marrow suppression / cytopenias)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *Concurrent systemic therapy may intensify mucosal toxicity in the irradiated field. This is also a recognised concurrent chemoradiation combination with expected toxicity managed per protocol.*  
**Matched rules:** IR009, IR010  
**App evidence IDs:** EVID-0003, EVID-0041, EVID-0043, EVID-0044  
**Fallback used:** No  

**Validation purpose:** Cisplatin concurrent H&N chemoradiation — highest-evidence combination in the app. Evaluate whether Moderate (not High) is appropriate for a well-documented radiosensitiser with severe mucositis risk. Assess domain completeness.  
**Primary clinical concern:** Under-alert risk; domain completeness; nausea/nephrotoxicity not captured in current domains  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** Yes  

---

#### S010: palbociclib — Pelvis — Rectal

**Therapy group:** CDK4/6 inhibitor  
**RT site:** Pelvis — Rectal  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `Moderate toxicity alert`  
**Expected app toxicity domains:** DOM-01 (GI toxicity); DOM-06 (Marrow suppression / cytopenias)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *Concurrent CDK4/6 inhibition may increase marrow and gastrointestinal toxicity, particularly with pelvic or abdominal RT.*  
**Matched rules:** IR002, IR012  
**App evidence IDs:** EVID-0001, EVID-0002, EVID-0015, EVID-0016  
**Fallback used:** No  

**Validation purpose:** CDK4/6 inhibitor with pelvic RT. Assess whether Moderate is appropriate, and whether GI and marrow domains adequately reflect the risk. Evaluate evidence strength for this class effect.  
**Primary clinical concern:** Alert level; evidence quality; applicability of class-level rule to individual CDK4/6 agents  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** No  

---

#### S011: osimertinib — Lung — Peripheral

**Therapy group:** EGFR TKI (3rd generation)  
**RT site:** Lung — Peripheral  
**Timing:** Concurrent  
**Fractionation:** SABR/SBRT  
**Multi-agent:** No  

**Expected app alert level:** `Moderate toxicity alert`  
**Expected app toxicity domains:** DOM-05 (Pneumonitis); DOM-04 (Dermatitis / skin toxicity); DOM-03 (Mucositis / oesophagitis)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *Concurrent thoracic RT with targeted kinase inhibition may increase pulmonary toxicity.*  
**Matched rules:** IR007, IR011  
**App evidence IDs:** EVID-0003, EVID-0020, EVID-0025  
**Fallback used:** No  

**Validation purpose:** 3rd-generation EGFR TKI with lung SBRT. Assess whether pneumonitis, skin and mucositis domains are appropriate. Evaluate whether Moderate is appropriately calibrated vs High for this combination.  
**Primary clinical concern:** Alert level; pneumonitis domain; ILD interaction evidence currency  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** Yes  

---

#### S012: trastuzumab deruxtecan — Lung — Central

**Therapy group:** HER2-directed antibody-drug conjugate  
**RT site:** Lung — Central  
**Timing:** Concurrent  
**Fractionation:** Moderate hypofractionation  
**Multi-agent:** No  

**Expected app alert level:** `Moderate toxicity alert`  
**Expected app toxicity domains:** DOM-05 (Pneumonitis)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *Potential additive interstitial lung disease/pneumonitis risk with thoracic RT.*  
**Matched rules:** IR006, IR011  
**App evidence IDs:** EVID-0007, EVID-0008, EVID-0009, EVID-0020, EVID-0025  
**Fallback used:** No  

**Validation purpose:** T-DXd (trastuzumab deruxtecan) with central lung RT. T-DXd has a specific ILD black-box warning. Assess whether Moderate is appropriately calibrated and whether pneumonitis domain alone is sufficient.  
**Primary clinical concern:** Alert level; ILD-specific evidence for T-DXd; potential under-alert  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** No  

---

#### S013: nivolumab — Lung — Peripheral

**Therapy group:** Immune checkpoint inhibitor — anti-PD-1  
**RT site:** Lung — Peripheral  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `Moderate toxicity alert`  
**Expected app toxicity domains:** DOM-05 (Pneumonitis)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *The selected systemic therapy and thoracic RT have overlapping pneumonitis/ILD risk.*  
**Matched rules:** IR004, IR011  
**App evidence IDs:** EVID-0002, EVID-0020, EVID-0025, EVID-0031  
**Fallback used:** No  

**Validation purpose:** Anti-PD-1 ICI with conventional thoracic RT. Assess whether Moderate is appropriate. Note: alert level does not change between conventional and SBRT for this combination (compare with S040).  
**Primary clinical concern:** Alert level appropriateness; fractionation insensitivity; pneumonitis domain completeness  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

#### S014: dabrafenib — Skin/superficial — Skin lesion

**Therapy group:** BRAF inhibitor  
**RT site:** Skin/superficial — Skin lesion  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `Moderate toxicity alert`  
**Expected app toxicity domains:** DOM-04 (Dermatitis / skin toxicity); DOM-19 (Radiation recall)  
**Expected app risk driver:** Agent-driven  
**Expected app rationale:** *BRAF inhibition may enhance radiation dermatitis and, rarely, visceral toxicity or radiation recall.*  
**Matched rules:** IR008  
**App evidence IDs:** EVID-0003  
**Fallback used:** No  

**Validation purpose:** BRAF inhibitor with skin RT. Assess whether Moderate is appropriate for radiation dermatitis and recall risk. Evaluate evidence basis (single reference EVID-0003) as sufficient for Moderate alert.  
**Primary clinical concern:** Evidence strength; domain completeness; recall risk signalling  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

#### S015: cetuximab — Oesophagus — Mid-thoracic

**Therapy group:** EGFR-targeted monoclonal antibody  
**RT site:** Oesophagus — Mid-thoracic  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `Moderate toxicity alert`  
**Expected app toxicity domains:** DOM-03 (Mucositis / oesophagitis); DOM-01 (GI toxicity)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *Concurrent systemic therapy may intensify mucosal toxicity in the irradiated field.*  
**Matched rules:** IR010  
**App evidence IDs:** EVID-0003, EVID-0041  
**Fallback used:** No  

**Validation purpose:** Cetuximab with oesophageal RT at conventional fractionation. Mucositis and GI are triggered via strong mucosal radiosensitiser class. Assess whether this accurately reflects cetuximab-specific toxicity.  
**Primary clinical concern:** Class vs agent-specific risk; domain completeness; skin toxicity not listed (cetuximab causes acneiform rash)  
**Fractionation sensitivity:** No  
**Timing sensitivity:** Yes  

---

#### S016: ribociclib — Pelvis — Gynaecological

**Therapy group:** CDK4/6 inhibitor  
**RT site:** Pelvis — Gynaecological  
**Timing:** Concurrent  
**Fractionation:** Moderate hypofractionation  
**Multi-agent:** No  

**Expected app alert level:** `Moderate toxicity alert`  
**Expected app toxicity domains:** DOM-01 (GI toxicity); DOM-06 (Marrow suppression / cytopenias)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *Concurrent CDK4/6 inhibition may increase marrow and gastrointestinal toxicity, particularly with pelvic or abdominal RT.*  
**Matched rules:** IR002, IR012  
**App evidence IDs:** EVID-0001, EVID-0002, EVID-0015, EVID-0016  
**Fallback used:** No  

**Validation purpose:** Ribociclib with hypofractionated gynaecological RT. Assess domain completeness and whether evidence for pelvic interaction is adequate.  
**Primary clinical concern:** Alert level; class extrapolation strength; clinical use context (ribociclib is HR+/HER2- breast cancer agent)  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** No  

---

#### S017: gemcitabine — Spine — Thoracic

**Therapy group:** Cytotoxic chemotherapy — antimetabolite / gemcitabine  
**RT site:** Spine — Thoracic  
**Timing:** Concurrent  
**Fractionation:** Large-field marrow-exposing RT  
**Multi-agent:** No  

**Expected app alert level:** `Moderate toxicity alert`  
**Expected app toxicity domains:** DOM-06 (Marrow suppression / cytopenias)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *Potential additive marrow suppression from systemic therapy and marrow-exposing RT.*  
**Matched rules:** IR001  
**App evidence IDs:** EVID-0069, EVID-0070  
**Fallback used:** No  

**Validation purpose:** Gemcitabine with marrow-exposing thoracic spine RT. Only marrow suppression (DOM-06) is returned — not pulmonary toxicity (DOM-05). Assess whether this adequately captures the full risk.  
**Primary clinical concern:** Domain completeness; gemcitabine has high pulmonary radiosensitisation risk not captured by marrow rule alone  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** No  

---

### High

#### S018: bevacizumab — Upper abdomen — Pancreas

**Therapy group:** Anti-VEGF monoclonal antibody  
**RT site:** Upper abdomen — Pancreas  
**Timing:** Concurrent  
**Fractionation:** SABR/SBRT  
**Multi-agent:** No  

**Expected app alert level:** `High toxicity alert`  
**Expected app toxicity domains:** DOM-07 (Bleeding); DOM-08 (Fistula / perforation); DOM-09 (Wound-healing complication); DOM-03 (Mucositis / oesophagitis); DOM-01 (GI toxicity)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *Anti-VEGF pathway inhibition may increase bleeding, perforation, fistula, vascular injury and impaired healing with high-dose RT near hollow viscera or major vessels.*  
**Matched rules:** IR003, IR010, IR014  
**App evidence IDs:** EVID-0034, EVID-0035  
**Fallback used:** No  

**Validation purpose:** Bevacizumab with pancreatic SBRT — highest-risk anti-VEGF scenario. Assess whether High is appropriate, domain completeness, and whether fistula/perforation/wound-healing domains are correctly prioritised.  
**Primary clinical concern:** Alert level; domain completeness; evidence strength for hollow-viscera interaction  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** Yes  

---

#### S019: axitinib — Upper abdomen — Liver

**Therapy group:** Anti-VEGFR TKI  
**RT site:** Upper abdomen — Liver  
**Timing:** Concurrent  
**Fractionation:** SABR/SBRT  
**Multi-agent:** No  

**Expected app alert level:** `High toxicity alert`  
**Expected app toxicity domains:** DOM-07 (Bleeding); DOM-08 (Fistula / perforation); DOM-09 (Wound-healing complication)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *Anti-VEGF pathway inhibition may increase bleeding, perforation, fistula, vascular injury and impaired healing with high-dose RT near hollow viscera or major vessels.*  
**Matched rules:** IR003, IR014  
**App evidence IDs:** EVID-0034, EVID-0035  
**Fallback used:** No  

**Validation purpose:** VEGFR TKI with liver SBRT. Assess whether High is appropriate for this combination and whether hepatotoxicity (DOM-13) is a missing domain.  
**Primary clinical concern:** Alert level; hepatic toxicity domain missing; evidence basis for VEGFR TKI class  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** No  

---

#### S020: sorafenib — Upper abdomen — Adrenal

**Therapy group:** Multi-kinase / anti-VEGFR inhibitor  
**RT site:** Upper abdomen — Adrenal  
**Timing:** Concurrent  
**Fractionation:** SABR/SBRT  
**Multi-agent:** No  

**Expected app alert level:** `High toxicity alert`  
**Expected app toxicity domains:** DOM-07 (Bleeding); DOM-08 (Fistula / perforation); DOM-09 (Wound-healing complication)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *Anti-VEGF pathway inhibition may increase bleeding, perforation, fistula, vascular injury and impaired healing with high-dose RT near hollow viscera or major vessels.*  
**Matched rules:** IR003, IR014  
**App evidence IDs:** EVID-0034, EVID-0035  
**Fallback used:** No  

**Validation purpose:** Multi-kinase inhibitor with adrenal SBRT. Assess whether High is appropriate for adrenal SBRT and anti-VEGF combination.  
**Primary clinical concern:** Alert level for adrenal site; adrenal gland-specific risks not captured  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** No  

---

#### S021: tisagenlecleucel — Brain — Whole brain

**Therapy group:** CAR-T cell therapy  
**RT site:** Brain — Whole brain  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `High toxicity alert`  
**Expected app toxicity domains:** DOM-10 (CNS oedema / radionecrosis); DOM-06 (Marrow suppression / cytopenias)  
**Expected app risk driver:** Timing-driven  
**Expected app rationale:** *Avoid elective RT during active cytokine-release syndrome, ICANS or unstable immune toxicity.*  
**Matched rules:** IR013  
**App evidence IDs:** EVID-0066, EVID-0067  
**Fallback used:** No  

**Validation purpose:** CAR-T therapy with whole brain RT. Assess whether High is appropriate for this combination (CRS, ICANS risk context), and whether CNS oedema and marrow suppression domains are correct.  
**Primary clinical concern:** Alert level; timing rationale (is WBRT typically delivered during active CAR-T therapy?); domain completeness  
**Fractionation sensitivity:** No  
**Timing sensitivity:** Yes  

---

#### S022: tarlatamab — Head and neck — Oral cavity/oropharynx

**Therapy group:** Bispecific T-cell engager (DLL3xCD3)  
**RT site:** Head and neck — Oral cavity/oropharynx  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `High toxicity alert`  
**Expected app toxicity domains:** DOM-10 (CNS oedema / radionecrosis); DOM-06 (Marrow suppression / cytopenias)  
**Expected app risk driver:** Timing-driven  
**Expected app rationale:** *Avoid elective RT during active cytokine-release syndrome, ICANS or unstable immune toxicity.*  
**Matched rules:** IR013  
**App evidence IDs:** EVID-0066, EVID-0067  
**Fallback used:** No  

**Validation purpose:** Novel DLL3-targeted bispecific with H&N RT. Tarlatamab's individual agent_alert_level is Caution, but the class rule (CLS-012) fires High. Assess whether High is clinically appropriate for this novel agent in this setting.  
**Primary clinical concern:** Class vs agent-specific alert level discrepancy; evolving evidence for tarlatamab specifically; domain appropriateness for H&N RT  
**Fractionation sensitivity:** No  
**Timing sensitivity:** Yes  

---

#### S023: ramucirumab — Oesophagus — Lower/GOJ

**Therapy group:** Anti-VEGFR2 monoclonal antibody  
**RT site:** Oesophagus — Lower/GOJ  
**Timing:** Concurrent  
**Fractionation:** SABR/SBRT  
**Multi-agent:** No  

**Expected app alert level:** `High toxicity alert`  
**Expected app toxicity domains:** DOM-07 (Bleeding); DOM-08 (Fistula / perforation); DOM-09 (Wound-healing complication); DOM-03 (Mucositis / oesophagitis); DOM-01 (GI toxicity)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *Anti-VEGF pathway inhibition may increase bleeding, perforation, fistula, vascular injury and impaired healing with high-dose RT near hollow viscera or major vessels.*  
**Matched rules:** IR003, IR010  
**App evidence IDs:** EVID-0034, EVID-0035, EVID-0003, EVID-0041  
**Fallback used:** No  

**Validation purpose:** Anti-VEGFR2 antibody with GOJ SBRT. Gastric/oesophageal fistula and perforation are well-recognised risks. Assess whether High is appropriate and domain set is complete.  
**Primary clinical concern:** Alert level; site-specific fistula risk; esophageal/gastric anatomy proximity to SBRT  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** No  

---

### Uncertain

#### S024: gemcitabine — Lung — Peripheral

**Therapy group:** Cytotoxic chemotherapy — antimetabolite / gemcitabine  
**RT site:** Lung — Peripheral  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `Uncertain / evidence limited`  
**Expected app toxicity domains:** DOM-01 (GI toxicity); DOM-03 (Mucositis / oesophagitis); DOM-04 (Dermatitis / skin toxicity); DOM-05 (Pneumonitis)  
**Expected app risk driver:** Uncertainty-driven  
**Expected app rationale:** *Direct evidence for this drug–RT combination is insufficient. Specialist review and documented multidisciplinary reasoning are recommended.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** Yes  

**Validation purpose:** CRITICAL VALIDATION SCENARIO. Gemcitabine has agent_alert_level of High toxicity alert and is classified as a strong pulmonary radiosensitiser, yet the rule engine falls back to Uncertain for lung RT because no class-level lung rule matches gemcitabine's parent classes. Assess whether this is a false reassurance risk and whether a High alert rule is needed.  
**Primary clinical concern:** Potential false reassurance; gemcitabine + thoracic RT is a high-risk, well-documented combination (radiation pneumonitis risk); this is a candidate rule gap  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

#### S025: temozolomide — Brain — Whole brain

**Therapy group:** Alkylating-like agent — TMZ  
**RT site:** Brain — Whole brain  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `Uncertain / evidence limited`  
**Expected app toxicity domains:** DOM-01 (GI toxicity); DOM-03 (Mucositis / oesophagitis); DOM-04 (Dermatitis / skin toxicity); DOM-06 (Marrow suppression / cytopenias); DOM-19 (Radiation recall)  
**Expected app risk driver:** Uncertainty-driven  
**Expected app rationale:** *Direct evidence for this drug–RT combination is insufficient. Specialist review and documented multidisciplinary reasoning are recommended.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** Yes  

**Validation purpose:** CRITICAL VALIDATION SCENARIO. TMZ concurrent with brain RT is the standard of care for glioblastoma (Stupp protocol) and has well-characterised toxicity. The app produces Uncertain via fallback because TMZ has no parent class assignment. Assess whether Uncertain is acceptable or whether a Caution/Moderate rule is needed.  
**Primary clinical concern:** Potential false reassurance; standard-of-care protocol not recognized; candidate rule gap  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

#### S026: olaparib — Pelvis — Gynaecological

**Therapy group:** PARP inhibitor  
**RT site:** Pelvis — Gynaecological  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `Uncertain / evidence limited`  
**Expected app toxicity domains:** DOM-03 (Mucositis / oesophagitis); DOM-04 (Dermatitis / skin toxicity); DOM-05 (Pneumonitis); DOM-06 (Marrow suppression / cytopenias)  
**Expected app risk driver:** Uncertainty-driven  
**Expected app rationale:** *Direct evidence for this drug–RT combination is insufficient. Specialist review and documented multidisciplinary reasoning are recommended.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** Yes  

**Validation purpose:** PARP inhibitor with pelvic gynaecological RT. PARP inhibitors are DNA damage repair inhibitors used in ovarian cancer; concurrent pelvic RT is an emerging setting. Assess whether Uncertain is appropriate or whether a Moderate alert is warranted.  
**Primary clinical concern:** Evolving evidence; potential radiosensitisation via DNA repair inhibition; no pelvic-specific PARP rule exists  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

#### S027: venetoclax — Pelvis — Rectal

**Therapy group:** BCL-2 inhibitor  
**RT site:** Pelvis — Rectal  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `Uncertain / evidence limited`  
**Expected app toxicity domains:** DOM-01 (GI toxicity); DOM-06 (Marrow suppression / cytopenias)  
**Expected app risk driver:** Uncertainty-driven  
**Expected app rationale:** *Direct evidence for this drug–RT combination is insufficient. Specialist review and documented multidisciplinary reasoning are recommended.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** Yes  

**Validation purpose:** BCL-2 inhibitor with rectal chemoradiation context. Venetoclax has no parent class so falls back to Uncertain. Assess whether this is appropriate for a novel agent with limited RT interaction data.  
**Primary clinical concern:** Appropriate Uncertain for genuinely limited evidence; assess whether GI domain from agent is correct  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

#### S028: datopotamab deruxtecan — Lung — Peripheral

**Therapy group:** TROP2-directed antibody-drug conjugate (novel)  
**RT site:** Lung — Peripheral  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `Uncertain / evidence limited`  
**Expected app toxicity domains:** DOM-03 (Mucositis / oesophagitis); DOM-05 (Pneumonitis); DOM-06 (Marrow suppression / cytopenias)  
**Expected app risk driver:** Uncertainty-driven  
**Expected app rationale:** *Direct evidence for this drug–RT combination is insufficient. Specialist review and documented multidisciplinary reasoning are recommended.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** Yes  

**Validation purpose:** Novel TROP2 ADC (datopotamab deruxtecan) with lung RT. Evolving evidence; assess whether Uncertain is appropriate and whether ILD/pneumonitis (DOM-05) is correctly flagged from agent data.  
**Primary clinical concern:** Appropriate Uncertain for novel agent; ILD domain from agent data; evolving evidence flag  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

#### S029: zolbetuximab — Oesophagus — Lower/GOJ

**Therapy group:** Claudin 18.2 monoclonal antibody (novel)  
**RT site:** Oesophagus — Lower/GOJ  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `Uncertain / evidence limited`  
**Expected app toxicity domains:** DOM-20 (Other relevant site-specific toxicity)  
**Expected app risk driver:** Uncertainty-driven  
**Expected app rationale:** *Direct evidence for this drug–RT combination is insufficient. Specialist review and documented multidisciplinary reasoning are recommended.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** Yes  

**Validation purpose:** Novel claudin 18.2 antibody (used in gastric/GOJ cancer) with oesophageal RT. No class assignment; only DOM-20 (Other site-specific) from agent. Assess whether Uncertain is appropriate and whether the domain placeholder is acceptable.  
**Primary clinical concern:** Appropriate Uncertain for genuinely novel agent; domain placeholder (DOM-20) appropriateness  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

### Unmatched/evolving evidence

#### S030: sotorasib — Lung — Peripheral

**Therapy group:** KRAS G12C inhibitor (evolving evidence)  
**RT site:** Lung — Peripheral  
**Timing:** Concurrent  
**Fractionation:** SABR/SBRT  
**Multi-agent:** No  

**Expected app alert level:** `Uncertain / evidence limited`  
**Expected app toxicity domains:** DOM-01 (GI toxicity); DOM-05 (Pneumonitis); DOM-06 (Marrow suppression / cytopenias); DOM-13 (Hepatic toxicity)  
**Expected app risk driver:** Uncertainty-driven  
**Expected app rationale:** *Direct evidence for this drug–RT combination is insufficient. Specialist review and documented multidisciplinary reasoning are recommended.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** Yes  

**Validation purpose:** KRAS G12C inhibitor (sotorasib) with lung SBRT. Novel agent with emerging RT interaction data. Assess whether Uncertain is appropriate and whether pneumonitis (DOM-05) and hepatotoxicity (DOM-13) domains from agent data are clinically relevant.  
**Primary clinical concern:** Evolving evidence; agent has known ILD risk; appropriate Uncertain vs should this be Moderate  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

#### S031: clodronate — Spine — Lumbar/sacral

**Therapy group:** Bone-modifying agent — first-generation bisphosphonate  
**RT site:** Spine — Lumbar/sacral  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `Uncertain / evidence limited`  
**Expected app toxicity domains:** DOM-12 (Renal toxicity); DOM-16 (Osteonecrosis / ORN / bone-healing)  
**Expected app risk driver:** Uncertainty-driven  
**Expected app rationale:** *Direct evidence for this drug–RT combination is insufficient. Specialist review and documented multidisciplinary reasoning are recommended.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** Yes  

**Validation purpose:** Bone-modifying agent (bisphosphonate) with spinal RT. Assess whether Uncertain is appropriate, and whether renal toxicity (DOM-12) and osteonecrosis (DOM-16) domains are the correct domains for this agent/site combination.  
**Primary clinical concern:** Appropriate Uncertain for limited evidence; osteonecrosis (MRONJ) domain relevance to spinal RT context; zoledronic acid comparison  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

### Missing input — no therapy

#### S032: (no agent) — Lung — Peripheral

**Therapy group:** —  
**RT site:** Lung — Peripheral  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `Incomplete — no output`  
**Expected app toxicity domains:** —  
**Expected app risk driver:** —  
**Expected app rationale:** *No therapy selected — app returns incomplete state.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** No  

**Validation purpose:** No therapy selected with site and timing. Confirm the app returns an incomplete/prompt state rather than a default alert. Assess whether the incomplete state is clearly communicated.  
**Primary clinical concern:** Safe handling of missing inputs; no default alert generated  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

### Missing input — no site

#### S033: gemcitabine — Not selected

**Therapy group:** Cytotoxic chemotherapy — antimetabolite / gemcitabine  
**RT site:** Not selected  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `Incomplete — no output`  
**Expected app toxicity domains:** —  
**Expected app risk driver:** —  
**Expected app rationale:** *No RT site selected — app returns incomplete state.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** No  

**Validation purpose:** Agent selected (gemcitabine) but no RT site chosen. Confirm incomplete state is returned. Assess whether a partial result or prompt is displayed.  
**Primary clinical concern:** Safe handling of missing site input; no premature alert generated  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

### Missing input — fractionation required

#### S034: nivolumab — Lung — Peripheral

**Therapy group:** Immune checkpoint inhibitor — anti-PD-1  
**RT site:** Lung — Peripheral  
**Timing:** Concurrent  
**Fractionation:** Not selected  
**Multi-agent:** No  

**Expected app alert level:** `Incomplete — fractionation required`  
**Expected app toxicity domains:** —  
**Expected app risk driver:** —  
**Expected app rationale:** *Fractionation not specified — app prompts for this field before completing evaluation.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** No  

**Validation purpose:** Nivolumab + lung RT with timing selected but fractionation missing. Assess whether the completeness check fires correctly and whether the fractionation prompt is appropriately displayed.  
**Primary clinical concern:** Completeness gate; fractionation is required for some rules (IR004); failure to prompt could cause missed alerts  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** No  

---

### Multi-agent

#### S035: ipilimumab, nivolumab — Lung — Peripheral

**Therapy group:** Immune checkpoint inhibitor — dual ICI (anti-CTLA-4 + anti-PD-1)  
**RT site:** Lung — Peripheral  
**Timing:** Concurrent  
**Fractionation:** SABR/SBRT  
**Multi-agent:** Yes  

**Expected app alert level:** `Moderate toxicity alert`  
**Expected app toxicity domains:** DOM-05 (Pneumonitis)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *The selected systemic therapy and thoracic RT have overlapping pneumonitis/ILD risk. Note: combination-specific interaction effects between ipilimumab and nivolumab are not individually modelled.*  
**Matched rules:** IR004, IR011  
**App evidence IDs:** EVID-0002, EVID-0020, EVID-0025, EVID-0031  
**Fallback used:** No  

**Validation purpose:** Dual ICI (nivolumab+ipilimumab) with lung SBRT. Each agent independently triggers Moderate via IR011. Assess whether Moderate is appropriate for dual ICI and whether the multi-agent warning is sufficient. Combination effects are not individually modelled.  
**Primary clinical concern:** Combination effect under-modelling; dual ICI increases pneumonitis risk beyond single-agent ICI; multi-agent warning adequacy  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

#### S036: carboplatin, paclitaxel — Lung — Central

**Therapy group:** Cytotoxic chemotherapy — platinum + taxane doublet  
**RT site:** Lung — Central  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** Yes  

**Expected app alert level:** `Uncertain / evidence limited`  
**Expected app toxicity domains:** DOM-03 (Mucositis / oesophagitis); DOM-04 (Dermatitis / skin toxicity); DOM-05 (Pneumonitis); DOM-06 (Marrow suppression / cytopenias); DOM-12 (Renal toxicity); DOM-14 (Neuropathy / plexopathy)  
**Expected app risk driver:** Uncertainty-driven  
**Expected app rationale:** *Direct evidence for this drug–RT combination is insufficient. Specialist review and documented multidisciplinary reasoning are recommended. Combination-specific effects not individually modelled.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** Yes  

**Validation purpose:** CRITICAL VALIDATION SCENARIO. Carboplatin+paclitaxel is a standard concurrent chemoradiation doublet for non-small cell lung cancer. Neither agent has a class rule matching lung central (RTS007). Both fall back to Uncertain. Assess whether this represents a significant clinical gap.  
**Primary clinical concern:** Potential false reassurance for a standard chemoradiation regimen; rule gap for platinum+taxane in thoracic RT; multi-agent interaction not modelled  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---

### Timing-sensitive

#### S037: bevacizumab — Upper abdomen — Liver

**Therapy group:** Anti-VEGF monoclonal antibody  
**RT site:** Upper abdomen — Liver  
**Timing:** Planned after RT  
**Fractionation:** SABR/SBRT  
**Multi-agent:** No  

**Expected app alert level:** `Uncertain / evidence limited`  
**Expected app toxicity domains:** DOM-07 (Bleeding); DOM-08 (Fistula / perforation); DOM-09 (Wound-healing complication); DOM-03 (Mucositis / oesophagitis); DOM-10 (CNS oedema / radionecrosis); DOM-11 (Cardiac toxicity)  
**Expected app risk driver:** Uncertainty-driven  
**Expected app rationale:** *Direct evidence for this drug–RT combination is insufficient. Specialist review and documented multidisciplinary reasoning are recommended.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** Yes  

**Validation purpose:** Bevacizumab planned after liver SBRT (TM005). Compare with S018 (concurrent, High). IR003 requires TM001-003 so TM005 does not trigger the high alert. Assess whether the timing-based downgrade from High to Uncertain is clinically appropriate, or whether bevacizumab after SBRT still carries a wound-healing risk.  
**Primary clinical concern:** Timing-based alert collapse; bevacizumab wound-healing risk may persist after RT; incomplete timing-based rule coverage  
**Fractionation sensitivity:** No  
**Timing sensitivity:** Yes  

---

#### S038: capecitabine — Pelvis — Rectal

**Therapy group:** Cytotoxic chemotherapy — fluoropyrimidine  
**RT site:** Pelvis — Rectal  
**Timing:** Recent before RT  
**Fractionation:** Conventional fractionation  
**Interval:** 14 days  
**Multi-agent:** No  

**Expected app alert level:** `Uncertain / evidence limited`  
**Expected app toxicity domains:** DOM-01 (GI toxicity); DOM-03 (Mucositis / oesophagitis); DOM-04 (Dermatitis / skin toxicity); DOM-06 (Marrow suppression / cytopenias)  
**Expected app risk driver:** Uncertainty-driven  
**Expected app rationale:** *Direct evidence for this drug–RT combination is insufficient. Specialist review and documented multidisciplinary reasoning are recommended.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** Yes  

**Validation purpose:** Capecitabine stopped 14 days before starting rectal RT. IR010 and IR009 only fire for TM001 (concurrent). Assess whether Uncertain is appropriate for recent capecitabine with residual radiosensitisation risk, or whether a Caution/Moderate rule should cover TM002.  
**Primary clinical concern:** Timing gap: recent capecitabine carries residual radiosensitisation risk; TM002 not covered by mucosal radiosensitiser rules; potential under-alert  
**Fractionation sensitivity:** No  
**Timing sensitivity:** Yes  

---

#### S039: doxorubicin — Breast — Chest wall

**Therapy group:** Cytotoxic chemotherapy — anthracycline (radiation recall agent)  
**RT site:** Breast — Chest wall  
**Timing:** Recent after RT  
**Fractionation:** Conventional fractionation  
**Interval:** 21 days  
**Multi-agent:** No  

**Expected app alert level:** `Uncertain / evidence limited`  
**Expected app toxicity domains:** DOM-04 (Dermatitis / skin toxicity); DOM-06 (Marrow suppression / cytopenias); DOM-11 (Cardiac toxicity); DOM-19 (Radiation recall)  
**Expected app risk driver:** Uncertainty-driven  
**Expected app rationale:** *Direct evidence for this drug–RT combination is insufficient. Specialist review and documented multidisciplinary reasoning are recommended.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** Yes  

**Validation purpose:** Anthracycline started 21 days after chest wall RT. Doxorubicin is a well-known radiation recall agent; cardiac toxicity overlap with chest wall RT is also recognised. Fallback gives DOM-19 (recall). Assess whether Uncertain is adequate, and whether cardiac toxicity (DOM-11) and radiation recall (DOM-19) domains are appropriately emphasised.  
**Primary clinical concern:** Radiation recall risk; cardiac toxicity; Uncertain via fallback despite well-characterised recall potential; TM003 not covered by class rules for breast site  
**Fractionation sensitivity:** No  
**Timing sensitivity:** Yes  

---

### Fractionation-sensitive

#### S040: nivolumab — Lung — Peripheral

**Therapy group:** Immune checkpoint inhibitor — anti-PD-1  
**RT site:** Lung — Peripheral  
**Timing:** Concurrent  
**Fractionation:** SABR/SBRT  
**Multi-agent:** No  

**Expected app alert level:** `Moderate toxicity alert`  
**Expected app toxicity domains:** DOM-05 (Pneumonitis)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *The selected systemic therapy and thoracic RT have overlapping pneumonitis/ILD risk.*  
**Matched rules:** IR004, IR011  
**App evidence IDs:** EVID-0002, EVID-0020, EVID-0025, EVID-0031  
**Fallback used:** No  

**Validation purpose:** Nivolumab with lung SBRT. Compare with S013 (conventional fractionation, same alert). The alert does not escalate with SBRT fractionation for ICI + lung, which may not reflect the potentially higher pneumonitis risk with SBRT. Assess whether fractionation insensitivity is clinically appropriate.  
**Primary clinical concern:** Fractionation insensitivity for ICI + lung: SBRT may carry higher pneumonitis risk than conventional RT; no SBRT-specific escalation rule for ICIs  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** No  

---

#### S041: palbociclib — Pelvis — Rectal

**Therapy group:** CDK4/6 inhibitor  
**RT site:** Pelvis — Rectal  
**Timing:** Concurrent  
**Fractionation:** SABR/SBRT  
**Multi-agent:** No  

**Expected app alert level:** `Moderate toxicity alert`  
**Expected app toxicity domains:** DOM-01 (GI toxicity)  
**Expected app risk driver:** Combination-driven  
**Expected app rationale:** *Potential additive gastrointestinal toxicity from systemic therapy and bowel irradiation.*  
**Matched rules:** IR012  
**App evidence IDs:** EVID-0001, EVID-0002  
**Fallback used:** No  

**Validation purpose:** Palbociclib with pelvic SBRT. Compare with S010 (conventional, same agent): conventional gives DOM-01+DOM-06; SBRT gives only DOM-01. The marrow domain (DOM-06) is lost with SBRT because IR002 (which provides DOM-06) requires FX001-003. Assess whether this fractionation-dependent domain loss is clinically appropriate.  
**Primary clinical concern:** Fractionation-dependent domain change: marrow suppression risk (DOM-06) lost when fractionation is SBRT vs conventional; clinical impact assessment needed  
**Fractionation sensitivity:** Yes  
**Timing sensitivity:** No  

---

### Site-specific interaction

#### S042: trastuzumab — Breast — Breast/chest wall + regional nodes

**Therapy group:** HER2-directed monoclonal antibody (non-ADC)  
**RT site:** Breast — Breast/chest wall + regional nodes  
**Timing:** Concurrent  
**Fractionation:** Conventional fractionation  
**Multi-agent:** No  

**Expected app alert level:** `Uncertain / evidence limited`  
**Expected app toxicity domains:** DOM-03 (Mucositis / oesophagitis); DOM-10 (CNS oedema / radionecrosis); DOM-11 (Cardiac toxicity)  
**Expected app risk driver:** Uncertainty-driven  
**Expected app rationale:** *Direct evidence for this drug–RT combination is insufficient. Specialist review and documented multidisciplinary reasoning are recommended.*  
**Matched rules:** None (fallback)  
**App evidence IDs:** None (fallback)  
**Fallback used:** Yes  

**Validation purpose:** CRITICAL VALIDATION SCENARIO. Trastuzumab is classified under CLS-003 (Anti-VEGF/VEGFR agent) in the data, which does not accurately reflect its mechanism (HER2-directed). No breast-specific rule fires for anti-VEGF class. The fallback returns DOM-11 (cardiac) from agent data, which is clinically relevant but arrived at via fallback. Assess: (1) whether the CLS-003 classification of trastuzumab is appropriate; (2) whether Uncertain is clinically appropriate for concurrent trastuzumab + breast/nodal RT; (3) whether a specific trastuzumab rule is needed.  
**Primary clinical concern:** Potential misclassification of trastuzumab as anti-VEGF class; cardiac toxicity (DOM-11) domain arrives via fallback only; Uncertain output for a clinically important combination  
**Fractionation sensitivity:** No  
**Timing sensitivity:** No  

---
