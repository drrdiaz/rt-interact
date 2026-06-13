import React, { useMemo } from 'react'
import { getTimingDefinitions } from '@/data/loaders'

interface TimingSelectorProps {
  value: string | null
  onChange: (timingId: string | null) => void
}

export function TimingSelector({
  value,
  onChange,
}: TimingSelectorProps): React.ReactElement {
  const timingOptions = useMemo(() => getTimingDefinitions(), [])

  return (
    <div>
      <label
        htmlFor="timing-select"
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        Timing relationship
      </label>
      <select
        id="timing-select"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3
                   text-base text-slate-800
                   focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200
                   appearance-none"
      >
        <option value="">Select timing…</option>
        {timingOptions.map((t) => (
          <option key={t.timing_id} value={t.timing_id}>
            {t.timing_category}
          </option>
        ))}
      </select>
      {value && (
        <p className="mt-1.5 text-xs text-slate-500">
          {timingOptions.find((t) => t.timing_id === value)
            ?.operational_definition}
        </p>
      )}
    </div>
  )
}
