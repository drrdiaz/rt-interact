import React, { useMemo } from 'react'
import { getFractionationCategories } from '@/data/loaders'

interface FractionationFieldProps {
  value: string | null
  onChange: (fractionationId: string | null) => void
  /** Show only when SABR/SBRT or clinical context warrants it */
  visible: boolean
}

export function FractionationField({
  value,
  onChange,
  visible,
}: FractionationFieldProps): React.ReactElement | null {
  const categories = useMemo(() => getFractionationCategories(), [])

  if (!visible) return null

  return (
    <div>
      <label
        htmlFor="fractionation-select"
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        Fractionation
      </label>
      <select
        id="fractionation-select"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3
                   text-base text-slate-800
                   focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200
                   appearance-none"
      >
        <option value="">Select fractionation…</option>
        {categories.map((f) => (
          <option key={f.fractionation_id} value={f.fractionation_id}>
            {f.category}
          </option>
        ))}
      </select>
      {value && (
        <p className="mt-1.5 text-xs text-slate-500">
          {categories.find((f) => f.fractionation_id === value)?.rule_definition}
        </p>
      )}
    </div>
  )
}
