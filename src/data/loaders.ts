/**
 * Data access layer — loads and validates Step 1 JSON data.
 * All clinical data is sourced from validated JSON; nothing is hard-coded here.
 */

import type {
  Agent,
  AgentAlias,
  RTSite,
  TimingDefinition,
  FractionationCategory,
  ToxicityDomain,
  InteractionRule,
  AgentSuggestion,
  RecordStatus,
} from './types'

// ── Raw JSON imports (Vite resolves these at build time) ─────────────────────
import rawAgents from './raw/agents.json'
import rawAliases from './raw/agent_aliases.json'
import rawSites from './raw/rt_sites.json'
import rawTiming from './raw/timing_definitions.json'
import rawFractionation from './raw/fractionation_categories.json'
import rawDomains from './raw/toxicity_domains.json'
import rawRules from './raw/interaction_rules.json'
import rawEvidenceLinks from './raw/evidence_links.json'

import rawAgentsAmended from './raw/agents-amended.json'
import rawHighRiskWatchlist from './raw/high-risk-watchlist.json'
import rawAustralianMaster from './raw/australian-medicine-master.json'
import rawRTInteractionLogic from './raw/rt-interaction-logic.json'
import rawAppOutputResolved from './raw/app-output-resolved.json'
// ── Typed accessors ──────────────────────────────────────────────────────────

export function getAgents(): Agent[] {
  return rawAgents as unknown as Agent[]
}

export function getAliases(): AgentAlias[] {
  return rawAliases as AgentAlias[]
}

export function getRTSites(): RTSite[] {
  return (rawSites as RTSite[]).filter((s) => s.status === 'active')
}

export function getTimingDefinitions(): TimingDefinition[] {
  return (rawTiming as TimingDefinition[]).filter((t) => t.status === 'active')
}

export function getFractionationCategories(): FractionationCategory[] {
  return (rawFractionation as FractionationCategory[]).filter(
    (f) => f.status === 'active',
  )
}

export function getToxicityDomains(): ToxicityDomain[] {
  return (rawDomains as ToxicityDomain[]).filter((d) => d.status === 'active')
}

export function getInteractionRules(): InteractionRule[] {
  return (rawRules as InteractionRule[]).filter((r) => r.status === 'active')
}

// ── Derived helpers ──────────────────────────────────────────────────────────

/** Returns unique rt_site strings (parent sites) in original order */
export function getUniqueSites(): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const s of getRTSites()) {
    if (!seen.has(s.rt_site)) {
      seen.add(s.rt_site)
      result.push(s.rt_site)
    }
  }
  return result
}

/** Returns subsites for a given parent rt_site */
export function getSubsitesForSite(rtSite: string): RTSite[] {
  return getRTSites().filter((s) => s.rt_site === rtSite)
}

/** Builds a flat list of agent suggestions (agents + aliases) for autocomplete */
export function buildAgentSuggestions(): AgentSuggestion[] {
  // Only canonical agents are selectable. Classes remain usable for rule
  // matching, but must not appear as duplicate "drugs" in clinician search.
  const agents = getAgents().filter((a) => a.status === 'active' && a.type === 'agent')
  const aliases = getAliases().filter(
    (a) =>
      a.status === 'active' &&
      ['brand', 'common', 'abbreviation', 'generic'].includes(a.alias_type),
  )

  // Map agent_id → agent for alias lookup
  const agentMap = new Map<string, Agent>(agents.map((a) => [a.agent_id, a]))

  const suggestions: AgentSuggestion[] = []

  // One suggestion per active agent (canonical name)
  for (const agent of agents) {
    suggestions.push({
      agent,
      displayLabel: agent.canonical_name,
      searchKey: agent.canonical_name.toLowerCase(),
    })
  }

  // Additional suggestions for aliases (brand names, common names)
  for (const alias of aliases) {
    const agent = agentMap.get(alias.resolves_to_id)
    if (!agent) continue
    suggestions.push({
      agent,
      matchedAlias: alias,
      displayLabel: `${alias.alias_text} (${agent.canonical_name})`,
      searchKey: alias.alias_text.toLowerCase(),
    })
  }

  return suggestions
}

/** Filter suggestions by query string (prefix + substring match) */
export function filterAgentSuggestions(
  suggestions: AgentSuggestion[],
  query: string,
  maxResults = 10,
): AgentSuggestion[] {
  if (!query.trim()) return []
  const q = query.toLowerCase().trim()

  // Prefer prefix matches first, then substring
  const prefix = suggestions.filter((s) => s.searchKey.startsWith(q))
  const substring = suggestions.filter(
    (s) => !s.searchKey.startsWith(q) && s.searchKey.includes(q),
  )

  // A brand alias and the canonical name can both match the same query. Show
  // one result per agent so the user cannot select the same drug twice.
  const seenAgentIds = new Set<string>()
  return [...prefix, ...substring]
    .filter((suggestion) => {
      if (seenAgentIds.has(suggestion.agent.agent_id)) return false
      seenAgentIds.add(suggestion.agent.agent_id)
      return true
    })
    .slice(0, maxResults)
}

/** Look up a domain label by ID */
export function getDomainLabel(domainId: string): string {
  const domains = getToxicityDomains()
  return domains.find((d) => d.domain_id === domainId)?.label ?? domainId
}

// ─── Evidence link types and accessor ───────────────────────────────────────

export interface EvidenceLink {
  evidence_id: string
  title: string
  first_author: string
  publication_year: number
  journal: string
  publication_type: string
  doi: string | null
  pmid: string | null
  stable_url: string | null
  evidence_level: string | null
  uncertainty: string | null
  date_reviewed: string | null
  version: string
  status: RecordStatus
}

export function getEvidenceLinks(): EvidenceLink[] {
  return (rawEvidenceLinks as EvidenceLink[]).filter((e) => e.status === 'active')
}

// ── Amended database accessors (June 2026) ──────────────────────────────────

export function getAmendedAgents() {
  return rawAgentsAmended as any[]
}

export function getHighRiskWatchlist() {
  return rawHighRiskWatchlist as any[]
}

export function getAustralianMedicinesMaster() {
  return rawAustralianMaster as any[]
}

export function getRTInteractionLogic() {
  return rawRTInteractionLogic as any[]
}

// ── v22 flat interaction database (App_Output_Resolved) ──────────────────────

export function getAppOutputResolved() {
  return rawAppOutputResolved as unknown[]
}
