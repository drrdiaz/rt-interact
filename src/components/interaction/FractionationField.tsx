import React, { useMemo } from 'react'
import { getFractionationCategories } from '@/data/loaders'

// Which fractionation IDs are valid for each RT site group.
// Re-irradiation (FX009) and Custom (FX010) are always available.
const ALWAYS_AVAILABLE = new Set(['FX009', 'FX010'])

const SITE_ALLOWED_FRACTIONS: Record<string, string[]> = {
  // Brain — whole brain: conventional / hypo / palliative only
  RTS020: ['FX001', 'FX002', 'FX006', 'FX007'],
  // Brain — SRS/focal: ultra-hypo (fractionated SRS) + SRS only
  RTS021: ['FX003', 'FX005'],

  // Oesophagus
  RTS003: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS004: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS005: ['FX001', 'FX002', 'FX006', 'FX007'],

  // Lung — all subtypes include SABR/SBRT
  RTS006: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],
  RTS007: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],
  RTS008: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],
  RTS009: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],

  // Breast
  RTS010: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS011: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS012: ['FX001', 'FX002', 'FX006', 'FX007'],

  // Head and neck
  RTS013: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS014: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS015: ['FX001', 'FX002', 'FX006', 'FX007'],

  // Pelvis — include large-field marrow
  RTS016: ['FX001', 'FX002', 'FX006', 'FX007', 'FX008'],
  RTS017: ['FX001', 'FX002', 'FX006', 'FX007', 'FX008'],
  RTS018: ['FX001', 'FX002', 'FX006', 'FX007', 'FX008'],
  RTS019: ['FX001', 'FX002', 'FX006', 'FX007', 'FX008'],

  // Prostate — includes ultra-hypo and SABR
  RTS001: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],
  RTS002: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007', 'FX008'],

  // Spine — includes spine SBRT and large-field marrow
  RTS022: ['FX001', 'FX002', 'FX004', 'FX006', 'FX007', 'FX008'],
  RTS023: ['FX001', 'FX002', 'FX004', 'FX006', 'FX007', 'FX008'],
  RTS024: ['FX001', 'FX002', 'FX004', 'FX006', 'FX007', 'FX008'],

  // Upper abdomen — includes SBRT (liver/pancreas)
  RTS025: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],
  RTS026: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],
  RTS027: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],

  // Skin / superficial
  RTS028: ['FX001', 'FX002', 'FX006', 'FX007'],

  // Bone mets — SBRT eligible
  RTS029: ['FX001', 'FX002', 'FX004', 'FX006', 'FX007'],

  // Other/custom — all
  RTS030: ['FX001', 'FX002', 'FX003', 'FX004', 'FX005', 'FX006', 'FX007', 'FX008'],
}

interface FractionationFieldProps {
  value: string | null
  onChange: (fractionationId: string | null) => void
  /** Show only when SABR/SBRT or clinical context warrants it */
  visible: boolean
  /** Current selected RT site ID — used to filter valid fractionation options */
  siteId?: string | null
}

export function FractionationField({
  value,
  onChange,
  visible,
  siteId,
}: FractionationFieldProps): React.ReactElement | null {
  const allCategories = useMemo(() => getFractionationCategories(), [])

  const categories = useMemo(() => {
    if (!siteId) return allCategories
    const allowed = SITE_ALLOWED_FRACTIONS[siteId]
    if (!allowed) return allCategories
    const allowedSet = new Set(allowed)
    return allCategories.filter(
      (f) => allowedSet.has(f.fractionation_id) || ALWAYS_AVAILABLE.has(f.fractionation_id),
    )
  }, [allCategories, siteId])

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
          {allCategories.find((f) => f.fractionation_id === value)?.rule_definition}
        </p>
      )}
    </div>
  )
}
