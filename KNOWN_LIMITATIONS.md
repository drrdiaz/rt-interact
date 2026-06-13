# RT Interact Phase 1 — Known Limitations

**Version:** Phase 1 Research Preview  
**Status:** Research/QI prototype — not validated for clinical use

This document summarises the known limitations of RT Interact Phase 1. It must be provided to any expert reviewer and disclosed to any person who accesses the prototype.

---

## Regulatory and Approval Status

- **Not approved or cleared** for clinical reliance in any jurisdiction.
- **Not a medical device** as currently constituted; no TGA, FDA, or CE regulatory process has been initiated.
- This prototype is intended solely for expert content review and quality improvement research.

## Content Verification Incomplete

- **ARTG / PBS verification incomplete:** Agent names, classifications, and availability have not been fully verified against the Australian Register of Therapeutic Goods (ARTG) or the Pharmaceutical Benefits Scheme (PBS). International brand names and generic names may be inconsistently represented.
- **eviQ verification incomplete:** Rules have not been cross-checked against the current eviQ cancer treatment protocols. Discrepancies with eviQ recommendations may exist.
- **Expert consensus validation incomplete:** Alert levels, toxicity domains, and rationale text have not yet undergone formal consensus validation by a multidisciplinary expert panel.

## Clinical Scope Limitations

- **No patient-specific factors:** The tool does not account for renal function, hepatic function, performance status, prior toxicity, age, comorbidities, or concurrent medications.
- **No prior RT or re-irradiation assessment:** The tool does not assess cumulative dose implications for patients who have received prior RT to the same or adjacent fields.
- **No exact dose or dose-constraint logic:** Alert levels are not tied to specific prescription doses, fractionation schedules beyond broad categories, or organ-at-risk dose constraints.
- **No management recommendations:** The tool does not provide guidance on dose modifications, agent holds, supportive care, or monitoring protocols.
- **Combination-specific rules are limited:** For patients receiving multiple systemic agents simultaneously, the tool evaluates each agent individually. Synergistic or additive toxicity risks from drug combinations are not modelled in Phase 1.
- **No disease-specific context:** Rules are not stratified by tumour histology, stage, treatment intent (curative vs. palliative), or performance status.

## Technical Limitations

- **Reporting backend is mock/local only:** The Reporting tab stores concern reports in browser memory only. No data is transmitted to any server. Reports are lost on page refresh. A persistent backend is planned for a future phase.
- **Agent list is not exhaustive:** The current agent list represents a curated subset of systemic agents with documented RT interaction potential. Many agents are not yet included.
- **Rule engine uses categorical logic only:** Rules are based on categorical inputs (agent, site, timing category, fractionation category). Continuous variables (e.g. actual dose in Gy) are not modelled.
- **Evidence links may become outdated:** External evidence references were current at the time of authorship and are not automatically updated.

## Data Privacy

- No patient information is collected, stored, or transmitted by this application.
- All interaction queries and reports remain in the user's browser.
- No analytics, telemetry, or tracking is included.

---

*These limitations must be considered by all expert reviewers. They will be addressed iteratively in subsequent phases prior to any consideration of clinical deployment.*
