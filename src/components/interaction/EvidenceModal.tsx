/**
 * EvidenceModal — accessible modal showing full evidence details.
 *
 * Opened from the AlertCard "View evidence / Reference" link.
 * Uses a native <dialog> element for focus-trap and Escape handling.
 */

import React, { useEffect, useRef } from 'react'
import { getEvidenceLinks } from '@/data/loaders'
import type { EngineOutput } from '@/engine/types'

interface EvidenceModalProps {
  open: boolean
  onClose: () => void
  engineOutput: EngineOutput & { incomplete: false }
}

function resolveUrl(record: {
  doi: string | null
  pmid: string | null
  stable_url: string | null
}): string | null {
  if (record.doi) return `https://doi.org/${record.doi}`
  if (record.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${record.pmid}/`
  return record.stable_url ?? null
}

export function EvidenceModal({
  open,
  onClose,
  engineOutput,
}: EvidenceModalProps): React.ReactElement | null {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose()
  }

  const allEvidenceLinks = getEvidenceLinks()
  const evidenceLinkMap = new Map(allEvidenceLinks.map((e) => [e.evidence_id, e]))

  const uniqueIds = [
    ...new Set([
      ...engineOutput.evidenceLinkIds,
      ...engineOutput.supportingEvidenceIds,
    ]),
  ]

  const presentRecords = uniqueIds
    .map((id) => ({ id, record: evidenceLinkMap.get(id) ?? null }))
    .filter((e) => e.record !== null) as Array<{
      id: string
      record: NonNullable<ReturnType<typeof evidenceLinkMap.get>>
    }>

  const pendingIds = uniqueIds.filter((id) => !evidenceLinkMap.has(id))

  const hasExpertConsensus = engineOutput.perAgentResults.some(
    (r) => r.matchedRules.length > 0,
  )

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="m-auto max-h-[90dvh] w-full max-w-lg overflow-hidden rounded-2xl border-0
                 bg-white p-0 shadow-2xl backdrop:bg-black/40 open:flex open:flex-col"
      aria-labelledby="evidence-modal-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 id="evidence-modal-title" className="text-base font-bold text-slate-800">
          Evidence / References
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close evidence panel"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500
                     hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Summary meta */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <MetaChip label="Evidence level" value={engineOutput.evidenceLevel} />
          <MetaChip label="Uncertainty" value={engineOutput.uncertainty} />
        </div>

        {/* Expert consensus note */}
        {hasExpertConsensus && (
          <div
            className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800"
            data-testid="expert-consensus-note"
          >
            <span className="font-semibold">Expert consensus basis:</span>{' '}
            One or more applicable rules include expert-consensus support. Clinical
            judgement remains essential.
          </div>
        )}

        {/* Evidence records */}
        {presentRecords.length > 0 && (
          <section aria-label="Evidence records" className="mb-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Evidence records ({presentRecords.length})
            </h3>
            <ol className="flex flex-col gap-3">
              {presentRecords.map(({ id, record }) => {
                const url = resolveUrl(record)
                return (
                  <li
                    key={id}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                    data-testid={`evidence-record-${id}`}
                  >
                    <p className="text-sm font-medium text-slate-800 leading-snug">
                      {record.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {record.first_author} · {record.journal} · {record.publication_year}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
                        {record.publication_type}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
                        Level: {record.evidence_level}
                      </span>
                    </div>
                    {record.date_reviewed && (
                      <p className="mt-1.5 text-xs text-slate-400">
                        Reviewed {record.date_reviewed}
                      </p>
                    )}
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium
                                   text-teal-700 hover:underline focus:outline-none
                                   focus:ring-2 focus:ring-teal-400 rounded"
                      >
                        {record.doi
                          ? `DOI: ${record.doi}`
                          : record.pmid
                          ? `PMID: ${record.pmid}`
                          : 'View source'}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </a>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400">No link available</p>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>
        )}

        {/* Pending evidence notice */}
        {(pendingIds.length > 0 || presentRecords.length === 0) && (
          <div
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            data-testid="evidence-pending"
          >
            <p className="font-medium text-slate-700">
              Evidence pending / requires review
            </p>
            {pendingIds.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                {pendingIds.length} reference
                {pendingIds.length > 1 ? 's' : ''} referenced but not yet catalogued.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-slate-100 py-2.5 text-sm font-semibold
                     text-slate-700 hover:bg-slate-200 focus:outline-none
                     focus:ring-2 focus:ring-teal-400"
        >
          Close
        </button>
      </div>
    </dialog>
  )
}

function MetaChip({
  label,
  value,
  className = '',
}: {
  label: string
  value: string | null
  className?: string
}) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 ${className}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800">
        {value ?? 'Not assessed'}
      </p>
    </div>
  )
}
