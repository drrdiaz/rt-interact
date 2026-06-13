/**
 * TimingIntervalField — conditional number input for days between
 * last drug dose and RT start.
 *
 * Shown only when the engine's completeness check requires it.
 */

import React from 'react'

interface TimingIntervalFieldProps {
  value: number | null
  onChange: (days: number | null) => void
  /** Only rendered when true */
  visible: boolean
}

export function TimingIntervalField({
  value,
  onChange,
  visible,
}: TimingIntervalFieldProps): React.ReactElement | null {
  if (!visible) return null

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange(null)
      return
    }
    const parsed = parseInt(raw, 10)
    if (!isNaN(parsed) && parsed >= 0) onChange(parsed)
  }

  return (
    <div>
      <label
        htmlFor="timing-interval-input"
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        Timing interval
        <span className="ml-1 text-xs font-normal text-slate-500">(days between last dose and RT)</span>
      </label>
      <input
        id="timing-interval-input"
        type="number"
        inputMode="numeric"
        min={0}
        max={999}
        step={1}
        value={value ?? ''}
        onChange={handleChange}
        placeholder="e.g. 14"
        aria-describedby="timing-interval-hint"
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3
                   text-base text-slate-800 placeholder:text-slate-400
                   focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
      />
      <p id="timing-interval-hint" className="mt-1.5 text-xs text-slate-500">
        Enter the number of days between the last systemic therapy dose and the
        start of RT. Required for timing-sensitive agents with recent or concurrent timing.
      </p>
    </div>
  )
}
