# RT Interact Phase 1 — Expert Review Guide

**Version:** Phase 1 Research Preview  
**Status:** Research/QI prototype — not validated for clinical use  
**Date:** June 2026

---

## Purpose of This Review

RT Interact is a decision-support prototype that generates alert levels for potential interactions between radiotherapy (RT) and systemic agents. This review asks clinical experts to assess whether the rule content (alert levels, toxicity domains, rationale, and evidence summaries) is clinically plausible and appropriately cautious.

This is **content validation only**. The tool is not approved for clinical reliance and must not be used to guide patient care.

---

## Scope of Phase 1

Phase 1 covers:

- **Agent lookup** — a curated list of systemic agents and drug classes with known RT interaction potential
- **Rule engine** — alert level assignment based on agent, RT site/subsite, timing, and fractionation
- **Toxicity domain tagging** — organs/tissues at risk for enhanced toxicity
- **Rationale and evidence summaries** — brief narrative justifications and uncertainty signals
- **Reporting tab** — local mock reporting of concerns (no data leaves the browser)
- **Info tab** — scope, methodology, and limitations disclosure

Phase 1 does **not** include dose/constraint modelling, management recommendations, patient-specific factors, or combination-specific rules beyond single-agent pairs.

---

## How to Use the Interaction Tab

1. **Open the Interaction tab** (default on load).
2. **Type an agent name or drug class** in the search field — the autocomplete will suggest matches from the agent list.
3. **Select an RT site** from the dropdown, then a **subsite** if prompted.
4. **Select timing** (e.g. concurrent, sequential within 4 weeks, prior RT).
5. **Select fractionation** if relevant (standard, SBRT/SABR, hypofractionated, palliative).
6. The tool displays:
   - An **alert level** (HIGH / MODERATE / LOW / INSUFFICIENT DATA)
   - **Toxicity domains** (e.g. mucositis, pneumonitis, skin, GI)
   - A **rationale** narrative
   - An **evidence and uncertainty** summary

---

## Required Review Scenarios

Please assess at minimum one scenario from each category:

| # | Agent / Class | RT Site | Timing | Fractionation |
|---|---|---|---|---|
| 1 | Cisplatin | Head and neck | Concurrent | Standard |
| 2 | Gemcitabine | Thorax / lung | Concurrent | Standard |
| 3 | Trastuzumab | Breast | Concurrent | Hypofractionated |
| 4 | Nivolumab (PD-1 inhibitor) | Lung | Sequential (within 4 wks) | SBRT |
| 5 | Capecitabine | Pelvis / rectum | Concurrent | Standard |
| 6 | Doxorubicin | Chest wall / breast | Prior RT | Standard |
| 7 | Bevacizumab | Brain | Concurrent | Standard |
| 8 | Carboplatin + paclitaxel | Thorax | Concurrent | Standard |

---

## How to Assess Alert Level

Ask: **Is this alert level appropriately cautious for routine clinical awareness?**

- HIGH — reserved for combinations with well-documented severe/life-threatening enhanced toxicity (e.g. cisplatin + H&N RT, gemcitabine + thoracic RT)
- MODERATE — combinations with meaningful evidence of enhanced toxicity requiring monitoring
- LOW — combinations with limited interaction potential at standard parameters
- INSUFFICIENT DATA — limited evidence; caution warranted

Flag if: the alert level seems too low (under-warning) or unjustifiably high (over-warning).

---

## How to Assess Toxicity Domains

Ask: **Are the listed organs/tissues the correct ones at risk for this combination?**

Check for:
- Missing domains (e.g. pneumonitis not listed for thoracic RT + immunotherapy)
- Incorrect domains (e.g. hepatotoxicity listed where not relevant)
- Appropriate specificity (mucositis vs. oesophagitis vs. skin)

---

## How to Assess Rationale

Ask: **Is the narrative explanation clinically accurate and appropriately qualified?**

Check for:
- Mechanistic accuracy (e.g. radiosensitisation mechanism correctly described)
- Appropriate hedging for uncertain or limited evidence
- Missing or misleading statements
- Whether the explanation would be useful to a non-specialist clinician

---

## How to Assess Evidence and Uncertainty

Ask: **Is the evidence summary honest about the strength and limitations of the evidence?**

Check for:
- Evidence level (RCT vs. case series vs. expert opinion) correctly characterised
- Whether uncertainty is clearly signalled
- Whether the absence of strong evidence is acknowledged
- Any unsupported strong claims

---

## How to Report Incorrect or Missing Content

Use one of these methods:

1. **In-app Reporting tab** — complete the concern report form. Data stays local (no submission to any server in Phase 1).
2. **Clinical Validation Form** (`CLINICAL_VALIDATION_FORM.md`) — complete per scenario and return to the project lead.
3. **Direct feedback** — email or annotated document to project lead.

Please include:
- The specific agent, RT site, timing, and fractionation tested
- What was observed
- What you expected
- Your suggested correction or alternative

---

*This document is part of the RT Interact Phase 1 expert review package.*
