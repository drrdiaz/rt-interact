import React from 'react'

const TREATMENT_TYPES = [
  { id: 'FX001', label: 'Conventional RT' },
  { id: 'FX006', label: 'Palliative RT' },
  { id: 'FX004', label: 'Stereotactic RT (SRS/SBRT)' },
]

interface FractionationFieldProps {
  value: string | null
  onChange: (fractionationId: string | null) => void
  visible: boolean
}

export function FractionationField({
  value,
  onChange,
  visible,
}: FractionationFieldProps): React.ReactElement | null {
  if (!visible) return null

  return (
    <div>
      <label
        htmlFor="fractionation-select"
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        RT treatment type
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
        <option value="">Select RT treatment type…</option>
        {TREATMENT_TYPES.map((type) => (
          <option key={type.id} value={type.id}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  )
}
