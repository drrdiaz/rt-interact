/**
 * InfoTab — app information, scope, disclaimer, evidence metadata,
 * research/governance context, and feedback placeholder.
 *
 * Evidence information is loaded dynamically from database_metadata.json —
 * version and review date are NOT hard-coded.
 */

import React from 'react'
import rawMetadata from '@/data/raw/database_metadata.json'

interface DatabaseMetadata {
  version: string
  last_reviewed_date: string
  phase: number
  notes: string[]
}

const metadata = rawMetadata as DatabaseMetadata & {
  evidence_levels?: string[]
  uncertainty_levels?: string[]
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function InfoSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-labelledby={`info-section-${title.toLowerCase().replace(/\W+/g, '-')}`}
    >
      <h2
        id={`info-section-${title.toLowerCase().replace(/\W+/g, '-')}`}
        className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500"
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function InfoParagraph({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-slate-600">{children}</p>
}

// ── Main component ────────────────────────────────────────────────────────────

export function InfoTab(): React.ReactElement {
  return (
    <div className="flex flex-col gap-4">

      {/* About */}
      <InfoSection title="About">
        <InfoParagraph>
          RT Interact is a Radiation Oncologist-facing tool that flags potential
          toxicity interactions between systemic anti-cancer therapy and
          radiotherapy.
        </InfoParagraph>
      </InfoSection>

      {/* Scope */}
      <InfoSection title="Scope">
        <InfoParagraph>
          RT Interact is limited to RT/systemic therapy toxicity-interaction assessment.
        </InfoParagraph>
        <p className="mt-3 text-sm font-semibold text-slate-700">This tool is not:</p>
        <ul className="mt-1.5 space-y-1 text-sm text-slate-600">
          {[
            'An RT prescription tool',
            'A dose-constraint calculator',
            'A contouring atlas',
            'A re-irradiation tool',
            'A systemic therapy prescribing tool',
            'A patient record',
            'A replacement for clinical judgement',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </InfoSection>

      {/* Disclaimer */}
      <InfoSection title="Disclaimer">
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
          role="note"
        >
          <InfoParagraph>
            RT Interact provides decision-support information only. It does not make
            clinical decisions or treatment recommendations. Final decisions remain
            the responsibility of the treating clinicians.
          </InfoParagraph>
        </div>
      </InfoSection>

      {/* Evidence information — dynamic from database_metadata.json */}
      <InfoSection title="Evidence information">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-slate-500">Database version</dt>
          <dd className="font-semibold text-slate-800" data-testid="db-version">
            {metadata.version}
          </dd>
          <dt className="text-slate-500">Last reviewed</dt>
          <dd className="font-semibold text-slate-800" data-testid="db-review-date">
            {metadata.last_reviewed_date}
          </dd>
          <dt className="text-slate-500">Phase</dt>
          <dd className="font-semibold text-slate-800">
            Phase {metadata.phase}
          </dd>
          <dt className="text-slate-500">Evidence status</dt>
          <dd className="font-semibold text-slate-800">
            Expert-consensus and published literature basis; ongoing review
          </dd>
        </dl>
        <p className="mt-3 text-xs italic text-slate-500">
          Uncertainty statement: Rule confidence varies by agent, site, and timing
          category. Evidence levels and uncertainty ratings are displayed per interaction.
        </p>
        <p
          className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2
                     text-xs font-semibold text-orange-800"
          role="note"
        >
          Absence of published evidence must not be interpreted as evidence of safety.
        </p>
      </InfoSection>

      {/* Research and governance */}
      <InfoSection title="Research and governance">
        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
          <InfoParagraph>
            RT Interact is a research and quality-improvement prototype. It has not
            undergone formal expert-consensus validation and must not be used for
            clinical decision-making until that validation is complete.
          </InfoParagraph>
          <InfoParagraph>
            Expert-consensus validation is required before any clinical reliance on
            this tool.
          </InfoParagraph>
          <InfoParagraph>
            Anonymous toxicity-signal reports submitted via the Reporting tab inform
            scheduled database reviews only. Reports do not automatically alter
            interaction rules.
          </InfoParagraph>
          <InfoParagraph>
            Local governance and regulatory review are required before deployment in
            any clinical setting.
          </InfoParagraph>
        </div>
      </InfoSection>

      {/* Feedback placeholder */}
      <InfoSection title="Feedback">
        <p className="text-sm text-slate-600">
          Feedback mechanisms are planned for a future release. They will cover:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-slate-500">
          {[
            'Evidence correction requests',
            'Missing medicine submissions',
            'Usability feedback',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-slate-300" aria-hidden="true">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p
          className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2
                     text-xs text-slate-500"
        >
          Patient-specific clinical advice is not accepted through this channel.
        </p>
      </InfoSection>

    </div>
  )
}
