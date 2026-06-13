# RT Interact — Phase 1

RT Interact is a mobile-first clinical decision-support tool for radiation oncologists and radiation therapists. It provides structured toxicity alert information for concurrent or near-concurrent use of systemic therapies with radiotherapy, sourced exclusively from validated reference data.

---

## Purpose

RT Interact is a reference tool, not a prescribing system. It surfaces relevant toxicity alert information for a given combination of systemic therapy + RT site + timing + fractionation. It does **not** issue hold/proceed instructions, management recommendations, or escalation prompts.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| Testing | Vitest 1.6 + Testing Library |
| Runtime target | Modern browsers (esnext) |

---

## Project Structure

```
rt-interact/
├── src/
│   ├── components/
│   │   ├── layout/          Header, TabBar, TabContent
│   │   ├── interaction/     InteractionTab, TherapyAutocomplete, RTSiteSelector,
│   │   │                    TimingSelector, FractionationSelector, AlertDisplay
│   │   ├── reporting/       ReportingTab, ReportForm, ReportList
│   │   └── info/            InfoTab
│   ├── data/
│   │   ├── types.ts          All TypeScript interfaces for JSON data shapes
│   │   └── loaders.ts        Typed async loaders for all 9 JSON files
│   ├── engine/
│   │   ├── ruleEngine.ts     Main entry point — evaluateRules()
│   │   ├── matcher.ts        matchRulesForAgent(), conditionsMatch()
│   │   ├── precedence.ts     resolveByPrecedence(), detectConflicts()
│   │   ├── aggregator.ts     aggregateResults(), hasDedicatedCombinationRule()
│   │   ├── completeness.ts   checkAgentInputCompleteness()
│   │   ├── evidence.ts       resolveEvidence(), deduplicateIds()
│   │   └── types.ts          AlertLevel, MatchedRule, EngineOutput, etc.
│   ├── reporting/
│   │   ├── reportModel.ts    ToxicityReport, validateReportInput(), buildReport()
│   │   └── reportRepository.ts  In-memory anonymous report store
│   └── __tests__/            All test files
├── public/
│   └── data/                 9 validated JSON reference files
│       ├── agents.json
│       ├── agent_aliases.json
│       ├── agent_classes.json
│       ├── rt_sites.json
│       ├── timing_definitions.json
│       ├── fractionation_categories.json
│       ├── toxicity_domains.json
│       ├── interaction_rules.json
│       └── evidence_links.json
├── VALIDATION_REPORT.md
└── RELEASE_NOTES.md
```

---

## Three-Tab Interface

### Interaction (default tab)
The main clinical workflow. Users select:
1. **Systemic therapy / therapies** — autocomplete over agent catalogue and aliases
2. **RT site** — hierarchical (site → subsite)
3. **Timing** — concurrent / recent / distant
4. **Fractionation** — standard / hypofractionated / SABR / palliative
5. **Timing interval** (days) — shown only when timing-sensitive agent + recent/concurrent timing selected
6. **Treatment intent** — optional

The rule engine evaluates the combination and returns a structured alert with alert level, toxicity domains, rationale, and evidence status.

**Alert levels (ascending severity):**
- No specific alert
- Caution
- Uncertain / evidence limited
- Moderate toxicity alert
- High toxicity alert

### Reporting
Anonymous toxicity reporting form. Submitted reports are stored in-memory (session-scoped; no network transmission, no patient data). Reports can be viewed in the same tab.

### Info
Reference information about the tool, data sources, version, and limitations.

---

## Rule Engine — Specificity Hierarchy

When multiple rules match a given agent + site + timing + fractionation combination, the engine applies the following precedence (highest wins):

1. **Specific-agent rule** — rule explicitly targeting this agent ID
2. **Class-level rule** — rule targeting an agent class that includes this agent
3. **General rule** — rule applying to any agent (e.g. IR015, IR016)

When no rule matches at any level, the engine applies an "Uncertain / evidence limited" fallback and sets `fallbackUsed = true`.

---

## Input Completeness State Machine

Certain agents require additional input before the engine can evaluate:

- **timing_sensitivity_flag = true** + recent/concurrent timing selected → `timingIntervalDays` becomes required
- **dose_relevance_flag = true** + active fractionation context → `fractionationId` becomes required

When required fields are absent, the engine returns an **incomplete** result (`out.incomplete = true`) instead of an alert. The UI renders a prompting state rather than an alert panel.

---

## Data Integrity

All 9 JSON files are validated at build time and in CI. Checks include:
- Unique IDs within each file
- Cross-reference resolution (agent_class_ids, rt_site_ids, timing_ids, fractionation_ids, toxicity_domain_ids, evidence_link_ids, parent_class_ids)
- No orphaned references

---

## Running Locally

```bash
npm install
npm run dev           # Dev server at http://localhost:5173
npm run build         # Production build
npm run test          # Run test suite
npm run typecheck     # TypeScript strict mode check
```

---

## Constraints (Phase 1)

The following features are explicitly **out of scope** for Phase 1:

- No patient data input or storage
- No user accounts, profiles, history, or saved cases
- No authentication
- No external AI or clinical API calls
- No copy-note function
- No management recommendations or hold/proceed instructions
- No Medical Oncology or senior RO escalation prompts

---

## Version

**1.0.0** — Phase 1 release candidate. See `RELEASE_NOTES.md` for details.
