import React from 'react'
import type { TreatmentIntent } from '@/data/types'

interface TreatmentIntentToggleProps {
  value: TreatmentIntent
  onChange: (intent: TreatmentIntent) => void
}

const options: { value: NonNullable<TreatmentIntent>; label: string }[] = [
  { value: 'radical', label: 'Radical / curative' },
  { value: 'palliative', label: 'Palliative' },
]

export function TreatmentIntentToggle({
  value,
  onChange,
}: TreatmentIntentToggleProps): React.ReactElement {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        Treatment intent{' '}
        <span className="font-normal text-slate-400">(optional)</span>
      </span>
      <div className="flex gap-2" role="group" aria-label="Treatment intent">
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(isSelected ? null : opt.value)}
              aria-pressed={isSelected}
              className={[
                'flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300',
                isSelected
                  ? 'border-teal-500 bg-teal-50 text-teal-800'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
