/**
 * TimingIntervalField — controlled approximate-interval selector.
 *
 * Shown only for timing-sensitive therapies when timing is Recent or Sequential.
 * Never shown for Concurrent, Planned, or Unknown timing.
 */

import React from 'react'
import type { TimingInterval } from '@/data/types'

interface TimingIntervalFieldProps {
  value: TimingInterval | null
  onChange: (interval: TimingInterval | null) => void
  /** Only rendered when true */
  visible: boolean
}

const INTERVAL_OPTIONS: { value: TimingInterval; label: string }[] = [
  { value: 'lt1w',    label: 'Less than 1 week' },
  { value: '1-4w',   label: '1–4 weeks' },
  { value: 'gt4w',   label: 'More than 4 weeks' },
  { value: 'unknown', label: 'Unknown' },
]

export function TimingIntervalField({
  value,
  onChange,
  visible,
}: TimingIntervalFieldProps): React.ReactElement | null {
  if (!visible) return null

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange(null)
    } else {
      onChange(raw as TimingInterval)
    }
  }

  return (
    <div>
      <label
        htmlFor="timing-interval-select"
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        Approximate interval
      </label>
      <select
        id="timing-interval-select"
        value={value ?? ''}
        onChange={handleChange}
        aria-describedby="timing-interval-hint"
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3
                   text-base text-slate-800
                   focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200
                   appearance-none"
      >
        <option value="">Select interval…</option>
        {INTERVAL_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <p id="timing-interval-hint" className="mt-1.5 text-xs text-slate-500">
        Shown only when the interval may materially affect the interaction assessment.
      </p>
    </div>
  )
}
