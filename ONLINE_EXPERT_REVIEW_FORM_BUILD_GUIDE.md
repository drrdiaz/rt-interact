# RT Interact Phase 1 — Online Expert Review Form: Build Guide

**Version:** Phase 1 Expert Review — Step 8A  
**Status:** Internal build reference — do not share with reviewers  
**Date:** June 2026

---

## Overview

This guide provides complete step-by-step instructions for building the expert review form in either **Google Forms** or **Microsoft Forms**. The accompanying file `ONLINE_EXPERT_REVIEW_FORM_QUESTIONS.csv` lists every question with its options, section, and branching logic.

The form must collect one row per reviewer per scenario, producing a response spreadsheet compatible with Step 9 analysis.

---

## Required Response Schema (Step 9 Compatibility)

Each submitted response must yield a row with these columns:

| Column | Source |
|---|---|
| `reviewer_code` | Reviewer information section |
| `reviewer_role` | Reviewer information section |
| `experience_band` | Reviewer information section |
| `scenario_id` | Auto-populated per section |
| `alert_appropriate` | Per-scenario question 1 |
| `preferred_alert_level` | Per-scenario question 2 (conditional) |
| `toxicity_domains_appropriate` | Per-scenario question 3 |
| `risk_driver_appropriate` | Per-scenario question 4 |
| `rationale_appropriate` | Per-scenario question 5 |
| `evidence_appropriate` | Per-scenario question 6 |
| `uncertainty_appropriate` | Per-scenario question 7 |
| `false_reassurance` | Per-scenario question 8 |
| `confidence` | Per-scenario question 9 |
| `suggested_correction` | Per-scenario question 10 (optional) |

> **Note on multi-section forms:** Google Forms and Microsoft Forms record all sections in a single response row. Scenario ID is captured as a fixed/hidden answer at the start of each section. Ensure the export spreadsheet column headers match the schema above exactly before Step 9 analysis.

---

## Part 1: Google Forms Instructions

### 1.1 Create a new form

1. Go to forms.google.com and sign in.
2. Click **Blank form**.
3. Set the title to: `RT Interact Phase 1 — Expert Clinical Validation`
4. Set the description to the privacy statement (see Part 3 below).

### 1.2 Prevent email address collection

1. Click the **Settings** gear icon (top right).
2. Under **Responses**, ensure **Collect email addresses** is set to **Do not collect**.
3. Disable **Response receipts**.

### 1.3 Enable progress bar

1. In **Settings → Presentation**, toggle **Show progress bar** to ON.
2. Under **Confirmation message**, enter:
   `Thank you for completing this review. Your responses have been recorded.`

### 1.4 Save and resume

Google Forms does not natively support save-and-resume. Advise reviewers to complete the form in one session. Consider splitting into two forms (S001–S021 and S022–S042) if reviewer fatigue is a concern.

### 1.5 Create sections

Google Forms uses **Sections** to separate pages.

1. Click **Add section** (horizontal lines icon in right toolbar).
2. Name each section: `Reviewer Information`, then `Scenario S001`, `Scenario S002`, … `Scenario S042`.
3. Create 43 sections total (reviewer information + 42 scenarios) plus a final confirmation section.

Tip: Use the CSV file to copy/paste question text and options efficiently.

### 1.6 Add questions

For each section, add questions using the **+** button:

- **Multiple choice** → for all appropriateness questions and confidence.
- **Short answer** → for reviewer code, role, and suggested correction.

For each question:
1. Click the question type dropdown and select the appropriate type.
2. Paste the question text from the CSV (`question_text` column).
3. Paste the answer options (one per line) from the CSV (`options` column, pipe-separated).
4. Toggle **Required** ON for all except `suggested_correction`.

### 1.7 Add scenario summaries

At the start of each scenario section, add a **Title and description** text block (not a question) with the scenario summary from the CSV `scenario_summary` column. This allows reviewers to see the scenario inputs without switching documents.

### 1.8 Capture the scenario ID

Add a **Short answer** question at the start of each scenario section:
- Question text: `Scenario ID (pre-filled — do not change)`
- Set a default value to the scenario ID (e.g. `S001`) using the three-dot menu → **Default value**.
- Mark as **Required**.

### 1.9 Configure branching

**Recommended simple approach:** Show `preferred_alert_level` for all reviewers with `N/A — alert is appropriate` as an option. This avoids complex section-level branching and works well for this form size.

**Branching approach (if preferred):** On the `alert_appropriate` question, click the three-dot menu → **Go to section based on answer**. For **Yes**, go to next section. For **No** or **Uncertain**, go to a sub-section containing `preferred_alert_level`.

For `suggested_correction`: always show it (with the privacy warning) but mark it as optional.

### 1.10 Disable response visibility

1. In **Settings → Responses**, disable **See summary charts and text responses**.
2. Ensure only the form owner can view individual responses.

### 1.11 Link responses to a spreadsheet

1. In the **Responses** tab, click the Google Sheets icon.
2. Select **Create a new spreadsheet** and name it: `RT_Interact_Review_Responses`.
3. Responses populate automatically as reviewers submit.
4. Rename the column headers to match the Step 9 schema (see Part 5).

### 1.12 Test the form

1. Click the eye icon (Preview) to open the form as a reviewer.
2. Complete a test submission for one scenario.
3. Verify the response appears in the linked spreadsheet with correct column values.
4. Verify scenario ID is captured correctly.
5. Delete test responses before sending to reviewers.

### 1.13 Create a reviewer-only sharing link

1. Click **Send** (top right) → link icon.
2. Copy the full link.
3. Share only this link with reviewers via the invitation — do **not** share edit access.

---

## Part 2: Microsoft Forms Instructions

### 2.1 Create a new form

1. Go to forms.microsoft.com and sign in with a Microsoft 365 account.
2. Click **New Form**.
3. Title: `RT Interact Phase 1 — Expert Clinical Validation`
4. Subtitle: paste the privacy statement from Part 3.

### 2.2 Prevent email collection and disable response visibility

1. Click the three-dot menu (top right) → **Settings**.
2. Disable **Record name**.
3. Under **Options**, disable **Results summary** so reviewers cannot see others' responses.
4. Enable **Accept responses**.

### 2.3 Enable progress bar

In Settings, toggle **Show progress** to ON.

### 2.4 Allow save and resume

In Settings, enable **Allow respondents to save and resume later**. Reviewers will receive a link to return to their in-progress form.

### 2.5 Create sections

1. Click **Add new** → **Section**.
2. Name each section: `Reviewer Information`, then `Scenario S001` through `Scenario S042`.
3. Create 43 sections total plus a final confirmation section.

### 2.6 Add questions

Within each section, click **Add new**:
- **Choice** → for all appropriateness questions and confidence.
- **Text** → for reviewer code, role, and suggested correction.

Paste question text and options from the CSV. Toggle **Required** for all except `suggested_correction`.

### 2.7 Add scenario summaries

At the start of each scenario section, add a **Text** element (not a question) with the scenario summary from the CSV `scenario_summary` column.

### 2.8 Capture scenario ID

Add a **Text** question at the start of each scenario section:
- Label: `Scenario ID`
- Set **Default value** to the scenario ID (e.g. `S001`).
- Mark as **Required**.

### 2.9 Configure branching

1. On the `alert_appropriate` question, click the three-dot menu → **Add branching**.
2. For **No** → show `preferred_alert_level`.
3. For **Uncertain** → show `preferred_alert_level`.
4. For **Yes** → skip `preferred_alert_level`.

Recommended simple alternative: show all questions with `N/A` as an option for `preferred_alert_level`.

### 2.10 Link responses to a spreadsheet

1. In the **Responses** tab, click **Open in Excel**.
2. Responses will populate a `.xlsx` file in OneDrive.
3. Rename column headers to match the Step 9 schema (see Part 5).

### 2.11 Test the form

1. Click **Preview** to open the form.
2. Complete a test submission.
3. Verify responses appear in the linked spreadsheet.
4. Delete test responses from the Responses tab.

### 2.12 Share the form

1. Click **Collect responses** → select **Anyone with the link can respond**.
2. Copy the link and share via the reviewer invitation.
3. Do **not** share edit access.

---

## Part 3: Privacy and Governance Wording

**Form opening statement** (place as subtitle or description at the top of the form):

> This review assesses a research/QI prototype. Do not enter patient-identifying information. Responses will be used for expert content validation and rule refinement only.

**Warning above suggested correction field** (place as section description or question label):

> Do not include any patient-identifying or case-specific information.

**Pre-submission statement** (place in the final section before the submit button):

> Submitting this form confirms that your responses relate only to the synthetic validation scenarios provided.

---

## Part 4: Scenario Section Structure

Each of the 42 scenario sections must contain:

1. Section title: `Scenario S[XXX]`
2. Section description: scenario summary (from CSV `scenario_summary` column)
3. Q1 — Scenario ID (short text, pre-filled, required)
4. Q2 — Is the alert appropriate? (choice: Yes / No / Uncertain, required)
5. Q3 — Preferred alert level (choice, required if Q2 = No; show for all with N/A option)
6. Q4 — Toxicity domains appropriate? (choice: Yes / No / Uncertain, required)
7. Q5 — Risk driver appropriate? (choice: Yes / No / Uncertain, required)
8. Q6 — Rationale appropriate? (choice: Yes / No / Uncertain, required)
9. Q7 — Evidence appropriate? (choice: Yes / No / Uncertain, required)
10. Q8 — Uncertainty rating appropriate? (choice: Yes / No / Uncertain, required)
11. Q9 — Potential false reassurance? (choice: Yes / No / Uncertain, required)
12. Q10 — Reviewer confidence (choice: Low / Moderate / High, required)
13. Q11 — Suggested correction (short text, optional; privacy warning above)

---

## Part 5: Response Spreadsheet Column Mapping

Rename auto-generated columns to match the Step 9 schema:

| Form question label | Step 9 column |
|---|---|
| Reviewer initials or anonymous code | `reviewer_code` |
| Specialty / role | `reviewer_role` |
| Years of Radiation Oncology experience | `experience_band` |
| Scenario ID | `scenario_id` |
| Alert appropriate | `alert_appropriate` |
| Preferred alert level | `preferred_alert_level` |
| Toxicity domains appropriate | `toxicity_domains_appropriate` |
| Risk driver appropriate | `risk_driver_appropriate` |
| Rationale appropriate | `rationale_appropriate` |
| Evidence appropriate | `evidence_appropriate` |
| Uncertainty rating appropriate | `uncertainty_appropriate` |
| Potential false reassurance | `false_reassurance` |
| Reviewer confidence | `confidence` |
| Suggested correction | `suggested_correction` |

---

## Part 6: Pre-Launch Checklist

- [ ] Privacy statement at top of form
- [ ] Pre-submission confirmation in final section
- [ ] Email/name collection disabled
- [ ] Response visibility disabled for reviewers
- [ ] Progress bar enabled
- [ ] Save-and-resume enabled (Microsoft Forms) or split form advised (Google Forms)
- [ ] All 43 sections present (reviewer info + S001–S042)
- [ ] Scenario summary at top of each scenario section
- [ ] Scenario ID pre-filled in each section
- [ ] All required fields marked required
- [ ] Suggested correction field optional with privacy warning
- [ ] `preferred_alert_level` question visible for all scenarios
- [ ] Test submission completed and verified in spreadsheet
- [ ] Test response deleted
- [ ] Spreadsheet column headers renamed to Step 9 schema
- [ ] Reviewer-only link confirmed

---

*Internal build reference for RT Interact Phase 1 expert review. Do not distribute to reviewers.*
