/**
 * AlertCard — Step 4 full implementation.
 *
 * Consumes EngineOutput directly. Displays all required states:
 *   - Incomplete (awaiting required inputs)
 *   - Incomplete (missing conditional fields)
 *   - Complete with alert level, toxicity statement, domain chips,
 *     risk driver, rationale, evidence link, expandable sections.
 *
 * No hold/proceed recommendations, treatment-management advice, or
 * numerical risk estimates are rendered.
 */

import React, { useState } from 'react'
import type { EngineOutput, AlertLevel } from '@/engine/types'
import type { RuleEngineInput } from '@/data/types'
import { EvidenceModal } from './EvidenceModal'

interface AlertCardProps {
  engineOutput: EngineOutput
  engineInput: RuleEngineInput
}

// ─── Visual config ────────────────────────────────────────────────────────────

interface LevelStyle {
  card: string
  badge: string
  badgeText: string
  icon: React.ReactElement
  label: string
}

const LEVEL_CONFIG: Record<AlertLevel, LevelStyle> = {
  'No specific alert': {
    card: 'border-green-300 bg-green-50',
    badge: 'bg-green-100 border-green-300',
    badgeText: 'text-green-800',
    label: 'No specific alert',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  'Caution': {
    card: 'border-amber-400 bg-amber-50',
    badge: 'bg-amber-100 border-amber-400',
    badgeText: 'text-amber-900',
    label: 'Caution',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  'Moderate toxicity alert': {
    card: 'border-orange-500 bg-orange-50',
    badge: 'bg-orange-100 border-orange-500',
    badgeText: 'text-orange-900',
    label: 'Moderate toxicity alert',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  'High toxicity alert': {
    card: 'border-red-500 bg-red-50',
    badge: 'bg-red-100 border-red-500',
    badgeText: 'text-red-900',
    label: 'High toxicity alert',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  'Uncertain / evidence limited': {
    card: 'border-slate-400 bg-slate-50',
    badge: 'bg-slate-100 border-slate-400',
    badgeText: 'text-slate-700',
    label: 'Uncertain / evidence limited',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-4 w-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AlertCard({
  engineOutput,
  engineInput,
}: AlertCardProps): React.ReactElement {
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [secondaryExpanded, setSecondaryExpanded] = useState(false)
  const [perAgentExpanded, setPerAgentExpanded] = useState(false)

  // ── Empty state — not enough to evaluate ────────────────────────────────────
  if (engineOutput.incomplete && engineOutput.missingFields.length === 0) {
    // Also covers the case where basic fields (therapy/site/timing) are absent
    const hasTherapies = engineInput.selectedTherapies.length > 0
    const hasSite = engineInput.rtSite !== null
    const hasTiming = engineInput.timingId !== null

    const remaining: string[] = []
    if (!hasTherapies) remaining.push('systemic therapy')
    if (!hasSite) remaining.push('RT site')
    if (!hasTiming) remaining.push('timing relationship')

    return (
      <div
        className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
        role="status"
        aria-label="Awaiting clinical inputs"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center
                          rounded-full bg-teal-100 text-teal-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Interaction result will appear here
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {remaining.length > 0
                ? `Still required: ${remaining.join(', ')}.`
                : 'Complete all required fields to evaluate.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Incomplete — conditional fields missing ──────────────────────────────────
  if (engineOutput.incomplete && engineOutput.missingFields.length > 0) {
    return (
      <div
        className="rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm"
        role="status"
        aria-label="Additional inputs required"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center
                          rounded-full bg-amber-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Additional inputs required
            </p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {engineOutput.missingFields.map((f) => (
                <li key={f.field} className="text-xs text-amber-800">
                  • {f.reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // ── Complete output ──────────────────────────────────────────────────────────
  if (engineOutput.incomplete) return <></> // type narrowing guard

  const output = engineOutput
  const config = LEVEL_CONFIG[output.alertLevel]
  const multiAgent = output.perAgentResults.length > 1
  const hasSecondary = output.secondaryRiskDrivers.length > 0
  const hasEvidenceLink =
    output.evidenceLinkIds.length > 0 || output.supportingEvidenceIds.length > 0

  const isUnknownTiming = engineInput.timingId === 'TM006'

  return (
    <>
      {/* TM006 warning banner */}
      {isUnknownTiming && (
        <div
          className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 shadow-sm flex items-start gap-2"
          role="note"
          data-testid="unknown-timing-banner"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs font-medium text-amber-900">
            Timing unknown — evaluated as concurrent (worst case). Confirm timing before clinical action.
          </p>
        </div>
      )}
      <div
        className={`rounded-xl border-2 p-5 shadow-sm ${config.card}`}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        data-testid="alert-card-complete"
      >
        {/* 1. Alert level badge */}
        <div className="flex items-center gap-2">
          {config.icon}
          <span
            className={`rounded-full border px-3 py-0.5 text-xs font-bold uppercase
                        tracking-wide ${config.badge} ${config.badgeText}`}
            data-testid="alert-level-badge"
          >
            {config.label}
          </span>
        </div>

        {/* 2. Toxicity statement */}
        <p
          className="mt-3 text-sm font-medium text-slate-800 leading-snug"
          data-testid="toxicity-statement"
        >
          {output.toxicityStatement}
        </p>

        {/* Combination warning */}
        {output.combinationWarning && (
          <p
            className="mt-2 text-xs font-semibold text-slate-600"
            data-testid="combination-warning"
          >
            ⚠ {output.combinationWarning}
          </p>
        )}

        {/* 3. Toxicity domain chips */}
        {output.toxicityDomainLabels.length > 0 && (
          <div
            className="mt-3 flex flex-wrap gap-1.5"
            aria-label="Toxicity domains"
            data-testid="toxicity-domain-chips"
          >
            {output.toxicityDomainLabels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-white/70 border border-slate-200
                           px-2.5 py-0.5 text-xs text-slate-700 font-medium"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* 4. Primary risk driver */}
        {output.primaryRiskDriver && (
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Primary risk driver
            </span>
            <p
              className="mt-0.5 text-sm text-slate-700"
              data-testid="primary-risk-driver"
            >
              {output.primaryRiskDriver}
            </p>
          </div>
        )}

        {/* 5. Rationale */}
        {output.rationaleText && (
          <p
            className="mt-3 text-xs text-slate-600 italic"
            data-testid="rationale-text"
          >
            {output.rationaleText}
          </p>
        )}

        {/* Uncertainty / evidence-limited flag */}
        {output.hasEvidencePending && (
          <p
            className="mt-2 text-xs text-slate-500"
            data-testid="evidence-pending-inline"
          >
            Evidence pending / requires review
          </p>
        )}

        {/* 6. Evidence link — one only */}
        <div className="mt-4 border-t border-black/10 pt-3">
          {hasEvidenceLink ? (
            <button
              type="button"
              onClick={() => setEvidenceOpen(true)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900
                         hover:underline focus:outline-none focus:ring-2
                         focus:ring-teal-400 rounded"
              data-testid="view-evidence-link"
            >
              View evidence / Reference →
            </button>
          ) : (
            <span
              className="text-xs text-slate-500"
              data-testid="evidence-pending-link"
            >
              Evidence pending / requires review
            </span>
          )}
        </div>

        {/* Secondary risk drivers — expandable */}
        {hasSecondary && (
          <div className="mt-3 border-t border-black/10 pt-3">
            <button
              type="button"
              onClick={() => setSecondaryExpanded((v) => !v)}
              className="flex w-full items-center justify-between text-xs font-semibold
                         text-slate-600 hover:text-slate-800 focus:outline-none
                         focus:ring-2 focus:ring-teal-400 rounded"
              aria-expanded={secondaryExpanded}
              aria-controls="secondary-risk-panel"
            >
              <span>Secondary risk drivers ({output.secondaryRiskDrivers.length})</span>
              <ChevronIcon open={secondaryExpanded} />
            </button>
            {secondaryExpanded && (
              <ul
                id="secondary-risk-panel"
                className="mt-2 flex flex-col gap-1"
                data-testid="secondary-risk-drivers"
              >
                {output.secondaryRiskDrivers.map((d) => (
                  <li key={d} className="text-xs text-slate-600">
                    · {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Per-agent results — expandable when multi-agent */}
        {multiAgent && (
          <div className="mt-3 border-t border-black/10 pt-3">
            <button
              type="button"
              onClick={() => setPerAgentExpanded((v) => !v)}
              className="flex w-full items-center justify-between text-xs font-semibold
                         text-slate-600 hover:text-slate-800 focus:outline-none
                         focus:ring-2 focus:ring-teal-400 rounded"
              aria-expanded={perAgentExpanded}
              aria-controls="per-agent-panel"
            >
              <span>Per-agent results ({output.perAgentResults.length})</span>
              <ChevronIcon open={perAgentExpanded} />
            </button>
            {perAgentExpanded && (
              <ul
                id="per-agent-panel"
                className="mt-2 flex flex-col gap-2"
                data-testid="per-agent-results"
              >
                {output.perAgentResults.map((r) => {
                  const agentConfig = LEVEL_CONFIG[r.alertLevel]
                  return (
                    <li
                      key={r.agentId}
                      className="rounded-lg border border-black/10 bg-white/50 px-3 py-2"
                      data-testid={`per-agent-${r.agentId}`}
                    >
                      <div className="flex items-center gap-1.5">
                        {agentConfig.icon}
                        <span className="text-xs font-semibold text-slate-700">
                          {r.canonicalName}
                        </span>
                        <span
                          className={`ml-auto rounded-full border px-2 py-0.5 text-xs
                                      font-semibold ${agentConfig.badge} ${agentConfig.badgeText}`}
                        >
                          {agentConfig.label}
                        </span>
                      </div>
                      {r.rationaleText && (
                        <p className="mt-1 text-xs text-slate-500 italic">
                          {r.rationaleText}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Evidence modal */}
      {evidenceOpen && (
        <EvidenceModal
          open={evidenceOpen}
          onClose={() => setEvidenceOpen(false)}
          engineOutput={output}
        />
      )}
    </>
  )
}
