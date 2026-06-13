# RT Interact — Release Notes

---

## v1.0.0 — Phase 1 Release Candidate (2026-06-13)

### Summary

First release of RT Interact, a mobile-first clinical decision-support tool for radiation oncologists and radiation therapists. Provides structured toxicity alert information for concurrent or near-concurrent systemic therapy + radiotherapy combinations based on validated reference data.

---

### Features

**Interaction Tab (default)**
- Systemic therapy autocomplete with alias resolution (brand names, generic names, abbreviations → canonical agent)
- RT site selector with site/subsite hierarchy
- Timing selector (concurrent, recent, distant)
- Fractionation selector (standard, hypofractionated, SABR, palliative)
- Conditional timing interval input for timing-sensitive agents
- Optional treatment intent selection
- Rule engine evaluation with five-level alert system
- Per-agent results for multi-drug inputs
- Combination warning when no dedicated multi-drug rule exists
- Incomplete-input state machine with contextual prompting
- Evidence status display (present / pending) per matched rule

**Reporting Tab**
- Anonymous toxicity report submission
- In-memory session-scoped report store (no external network transmission)
- Report list view within session

**Info Tab**
- Tool purpose and scope
- Version and data source information
- Limitations and disclaimers

---

### Alert Levels

| Level | Meaning |
|---|---|
| No specific alert | No identified interaction concern for this combination |
| Caution | Low-level concern; monitor |
| Uncertain / evidence limited | Insufficient direct evidence; general caution applies |
| Moderate toxicity alert | Identified interaction concern requiring attention |
| High toxicity alert | Significant interaction concern |

---

### Rule Engine

- Specificity hierarchy: specific-agent > class-level > general
- Fallback to "Uncertain / evidence limited" when no rule matches
- Evidence-pending status tracked and displayed without suppressing the alert
- Completeness state machine gates evaluation when required fields absent

---

### Data

Nine validated reference JSON files loaded from `public/data/`:

| File | Purpose |
|---|---|
| agents.json | Agent catalogue with flags (timing sensitivity, dose relevance, etc.) |
| agent_aliases.json | Brand names, abbreviations, generics → canonical agent |
| agent_classes.json | Drug class hierarchy |
| rt_sites.json | RT site/subsite catalogue with default OARs and toxicity domains |
| timing_definitions.json | Timing category definitions |
| fractionation_categories.json | Fractionation category definitions |
| toxicity_domains.json | Toxicity domain labels |
| interaction_rules.json | Interaction rules with conditions and outputs |
| evidence_links.json | Evidence link metadata |

All files passed full integrity audit (unique IDs, all cross-references resolve).

---

### Code Changes Since Last Development Snapshot

**Bug fixes:**
- `Header.tsx`: `bg-navy-900` (invalid Tailwind v3 class, renders transparent) replaced with `bg-slate-900`
- `vite.config.ts`: Added `emptyOutDir: false` to prevent EPERM on dist cleanup in constrained environments

**Code quality:**
- `src/data/types.ts`: Removed dead `AlertItem` and `RuleEngineOutput` interfaces (legacy scaffold artefacts, never imported)

**New tests:**
- `src/__tests__/scenarioVerification.test.ts`: 42 tests covering all 12 required clinical scenarios (S01–S12)

---

### Test Coverage

150 tests across 7 suites — all pass.

---

### Known Limitations

- Coverage instrumentation requires `@vitest/coverage-v8` or `@vitest/coverage-istanbul`; install as a devDependency in your CI environment to enable line coverage reporting
- Phase 1 scope does not include: patient data, saved cases, user accounts, external API calls, management recommendations, or hold/proceed instructions

---

### Upgrade Path

Phase 2 planning items (not in scope for this release):
- Persistent (non-session) anonymous report aggregation
- Evidence link deep-linking
- Printable interaction summary (no patient data)
- Additional agent and rule coverage as evidence base grows

---

### Constraints (immutable for Phase 1)

- No patient data
- No authentication
- No external AI or clinical API calls
- No management recommendations
- No hold/proceed instructions
- No Medical Oncology or senior RO escalation prompts
- No copy-note function
- No profile, history, settings, or saved cases
