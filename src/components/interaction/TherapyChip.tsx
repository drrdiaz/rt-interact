import React from 'react'
import type { SelectedTherapy } from '@/data/types'

interface TherapyChipProps {
  therapy: SelectedTherapy
  onRemove: (agentId: string) => void
}

export function TherapyChip({
  therapy,
  onRemove,
}: TherapyChipProps): React.ReactElement {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1.5
                 text-sm font-medium text-teal-800 ring-1 ring-teal-300"
    >
      <span className="max-w-[180px] truncate" title={therapy.canonicalName}>
        {therapy.canonicalName}
        {therapy.aliasUsed && therapy.aliasUsed !== therapy.canonicalName && (
          <span className="ml-1 text-xs text-teal-600">
            ({therapy.aliasUsed})
          </span>
        )}
      </span>
      <button
        type="button"
        onClick={() => onRemove(therapy.agentId)}
        className="ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                   text-teal-600 hover:bg-teal-200 hover:text-teal-900
                   focus:outline-none focus:ring-2 focus:ring-teal-500"
        aria-label={`Remove ${therapy.canonicalName}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0
               111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10
               11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293
               5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </span>
  )
}
