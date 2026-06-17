# RT Interact Phase 1 — Expert Review Instructions

**Version:** Phase 1 Expert Review — Step 8  
**Status:** Expert review in progress — not for external distribution  
**Date:** June 2026

---

## Overview

You are reviewing a decision-support prototype called **RT Interact**. This tool generates alerts for potential interactions between radiotherapy (RT) and systemic agents. It is a research/QI prototype and is **not approved for clinical reliance**.

Your task is to assess whether the app's current output — alert level, toxicity domains, rationale, and evidence — is clinically appropriate for each of 42 synthetic scenarios.

---

## What You Are Reviewing

For each scenario you will see:

| Field | Description |
|---|---|
| **Agent(s)** | The systemic therapy or drug class |
| **RT site** | The site and subsite of radiotherapy |
| **Timing** | Relationship between RT and systemic therapy |
| **Fractionation** | RT fractionation category |
| **App alert level** | The alert the app currently produces |
| **App toxicity domains** | The toxicity organs/systems flagged |
| **App risk driver** | The primary driver of the alert |
| **App rationale** | The narrative displayed to clinicians |
| **App evidence IDs** | Internal references used by the app |

You are assessing **content validity** — not the interface or technical implementation.

---

## How to Complete the Review

### Step 1: Read the scenario

Open `VALIDATION_SCENARIOS.md` and locate the scenario by its ID (e.g. S001).

Read the full validation purpose and clinical concern text for context before assessing.

### Step 2: Open the review form

Open `EXPERT_REVIEW_FORM.csv` in Excel or a spreadsheet application.

Locate the row for the scenario ID you are reviewing.

### Step 3: Assess each dimension

Complete one row per scenario. The fields to complete are:

| Field | Instructions |
|---|---|
| `reviewer_id_or_initials` | Your initials or reviewer code (e.g. RO-1). Do not include your full name in the shared file. |
| `reviewer_specialty_role` | Your specialty and seniority (e.g. Radiation Oncologist — Consultant; Radiation Oncologist — Trainee) |
| `review_date` | Date reviewed (DD/MM/YYYY) |
| `alert_appropriate_yes_no_uncertain` | Is the displayed alert level clinically appropriate? Enter: **Yes**, **No**, or **Uncertain** |
| `preferred_alert_level` | If No or Uncertain: what alert level do you consider more appropriate? |
| `toxicity_domains_appropriate_yes_no_uncertain` | Are the listed toxicity domains appropriate? Enter: **Yes**, **No**, or **Uncertain** |
| `missing_toxicity_domains` | List any toxicity domains you consider missing (free text) |
| `inappropriate_toxicity_domains` | List any toxicity domains you consider incorrectly included (free text) |
| `risk_driver_appropriate_yes_no_uncertain` | Is the primary risk driver appropriate? |
| `rationale_appropriate_yes_no_uncertain` | Is the rationale narrative accurate and appropriately qualified? |
| `evidence_appropriate_yes_no_uncertain` | Is the evidence basis appropriate for the alert level? |
| `uncertainty_rating_appropriate_yes_no_uncertain` | Is the uncertainty signalling appropriate? |
| `potential_false_reassurance_yes_no` | Does the output risk creating false reassurance (under-alerting a real risk)? |
| `suggested_correction_or_comment` | Your specific suggestion, if any |
| `reviewer_confidence_low_moderate_high` | Your confidence: **Low**, **Moderate**, or **High** |

---

## Alert Level Reference

| Level | Approximate clinical meaning |
|---|---|
| **No specific alert** | No major interaction signal; routine clinical checks adequate |
| **Caution** | Expected managed toxicity (e.g. protocol chemoradiation); clinician awareness required |
| **Moderate toxicity alert** | Enhanced toxicity likely; active monitoring required |
| **High toxicity alert** | High risk of severe/life-threatening toxicity; requires specialist coordination |
| **Uncertain / evidence limited** | Insufficient evidence; do not interpret as low-risk; specialist review recommended |

---

## Guidance on Specific Scenarios

### Missing-input scenarios (S032–S034)

The app should return an incomplete/prompt state — not a clinical alert. Assess whether the handling is appropriate.

### Fallback scenarios (marked "Fallback used: Yes")

These return "Uncertain / evidence limited" because no matching rule was found. Assess:

1. Is Uncertain appropriate, or is there sufficient clinical evidence to warrant a specific alert?
2. Are the agent-fallback domains clinically relevant for this site?
3. Does the output risk **false reassurance** — i.e. does Uncertain imply the combination is safer than it actually is?

### Critical scenarios — please pay particular attention

- **S024**: Gemcitabine + lung RT → Uncertain. Gemcitabine is a known pulmonary radiosensitiser.
- **S025**: Temozolomide + brain WBRT → Uncertain. TMZ+WBRT is the standard Stupp protocol.
- **S036**: Carboplatin + paclitaxel + central lung RT → Uncertain. Standard NSCLC chemoradiation doublet.
- **S042**: Trastuzumab + breast/nodal RT → Uncertain. Class assignment may be inaccurate.
- **S022**: Tarlatamab bispecific → High alert via class rule, agent-level is Caution.
- **S037**: Bevacizumab after liver SBRT → Uncertain despite known wound-healing concern.
- **S039**: Doxorubicin after chest wall RT → Uncertain despite known radiation recall risk.

---

## Validation Method

- Reviews are **independent** — complete your form without reference to other reviewers.
- Blinded results will be collated before adjudication.
- A minimum of 3 Radiation Oncology specialist reviewers is required per scenario.
- No rule change will be made on the basis of a single reviewer's opinion alone.

---

## Acceptance Criteria (Prototype Thresholds)

| Criterion | Threshold |
|---|---|
| False-reassurance cases | Zero accepted |
| Under-alert for High scenarios | ≥90% reviewer agreement not undercalled |
| Alert appropriateness overall | ≥80% reviewer agreement |
| Toxicity domain appropriateness overall | ≥80% reviewer agreement |
| Evidence links valid or pending | 100% |
| Unmatched scenarios fail safe | All return Uncertain, not No specific alert |
| No-rule scenarios return Uncertain not Low concern | Confirmed |

These are prototype thresholds only and do not constitute formal clinical validation.

---

## Returning Your Form

- Save your completed CSV as: `EXPERT_REVIEW_FORM_[YourInitials]_[Date].csv`
- Return to the project lead by the agreed date.
- Do not share your form with other reviewers before blinded collation.

---

## Scope Reminder

You are reviewing **content validity** only. Please do not comment on interface design, technical implementation, or Phase 2 feature requests (management recommendations, dose constraints).

---

*This document is part of the RT Interact Phase 1 expert review package. RT Interact is a research/QI prototype and must not be used to guide patient care.*
