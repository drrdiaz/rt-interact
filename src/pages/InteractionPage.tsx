import React, { useCallback, useMemo, useState } from 'react'
import { TherapyAutocomplete } from '@/components/interaction/TherapyAutocomplete'
import { TherapyChip } from '@/components/interaction/TherapyChip'
import { RTSiteSelector } from '@/components/interaction/RTSiteSelector'
import { TimingSelector } from '@/components/interaction/TimingSelector'
import { TimingIntervalField } from '@/components/interaction/TimingIntervalField'
import { FractionationField } from '@/components/interaction/FractionationField'
import { AlertCard } from '@/components/interaction/AlertCard'
import { evaluateRules } from '@/engine/ruleEngine'
import type {
  SelectedTherapy,
  RTSiteSelection,
  TimingInterval,
  RuleEngineInput,
} from '@/data/types'

// Fractionation IDs valid for each site — must match FractionationField's map
const ALWAYS_AVAILABLE_FX = new Set(['FX009', 'FX010'])
const SITE_ALLOWED_FRACTIONS: Record<string, string[]> = {
  RTS020: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS021: ['FX003', 'FX005'],
  RTS003: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS004: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS005: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS006: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],
  RTS007: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],
  RTS008: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],
  RTS009: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],
  RTS010: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS011: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS012: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS013: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS014: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS015: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS016: ['FX001', 'FX002', 'FX006', 'FX007', 'FX008'],
  RTS017: ['FX001', 'FX002', 'FX006', 'FX007', 'FX008'],
  RTS018: ['FX001', 'FX002', 'FX006', 'FX007', 'FX008'],
  RTS019: ['FX001', 'FX002', 'FX006', 'FX007', 'FX008'],
  RTS001: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],
  RTS002: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007', 'FX008'],
  RTS022: ['FX001', 'FX002', 'FX004', 'FX006', 'FX007', 'FX008'],
  RTS023: ['FX001', 'FX002', 'FX004', 'FX006', 'FX007', 'FX008'],
  RTS024: ['FX001', 'FX002', 'FX004', 'FX006', 'FX007', 'FX008'],
  RTS025: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],
  RTS026: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],
  RTS027: ['FX001', 'FX002', 'FX003', 'FX004', 'FX006', 'FX007'],
  RTS028: ['FX001', 'FX002', 'FX006', 'FX007'],
  RTS029: ['FX001', 'FX002', 'FX004', 'FX006', 'FX007'],
  RTS030: ['FX001', 'FX002', 'FX003', 'FX004', 'FX005', 'FX006', 'FX007', 'FX008'],
}

function isFractionationValidForSite(fxId: string, siteId: string | null | undefined): boolean {
  if (!siteId) return true
  if (ALWAYS_AVAILABLE_FX.has(fxId)) return true
  const allowed = SITE_ALLOWED_FRACTIONS[siteId]
  if (!allowed) return true
  return allowed.includes(fxId)
}

export function InteractionPage(): React.ReactElement {
  const [selectedTherapies, setSelectedTherapies] = useState<SelectedTherapy[]>([])
  const [rtSite, setRtSite] = useState<RTSiteSelection | null>(null)
  const [timingId, setTimingId] = useState<string | null>(null)
  const [timingInterval, setTimingInterval] = useState<TimingInterval | null>(null)
  const [fractionationId, setFractionationId] = useState<string | null>(null)

  const handleAddTherapy = useCallback((therapy: SelectedTherapy) => {
    setSelectedTherapies((prev) => {
      if (prev.some((t) => t.agentId === therapy.agentId)) return prev
      return [...prev, therapy]
    })
  }, [])

  const handleRemoveTherapy = useCallback((agentId: string) => {
    setSelectedTherapies((prev) => prev.filter((t) => t.agentId !== agentId))
  }, [])

  // When RT site changes, reset fractionation if it's no longer valid
  const handleRtSiteChange = useCallback(
    (newSite: RTSiteSelection | null) => {
      setRtSite(newSite)
      if (fractionationId && !isFractionationValidForSite(fractionationId, newSite?.siteId)) {
        setFractionationId(null)
      }
    },
    [fractionationId],
  )

  const engineInput = useMemo<RuleEngineInput>(
    () => ({
      selectedTherapies,
      rtSite,
      timingId,
      fractionationId,
      treatmentIntent: null,
      timingInterval,
    }),
    [selectedTherapies, rtSite, timingId, fractionationId, timingInterval],
  )

  const engineOutput = useMemo(() => evaluateRules(engineInput), [engineInput])

  const showTimingInterval = useMemo(() => {
    if (timingInterval !== null) return true
    if (!engineOutput.incomplete) return false
    return engineOutput.missingFields.some((f) => f.field === 'timingInterval')
  }, [timingInterval, engineOutput])

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Alert card — top of page, reactive */}
      <section aria-label="Interaction alerts">
        <AlertCard engineOutput={engineOutput} engineInput={engineInput} />
      </section>

      {/* 2–7. Input card */}
      <section
        aria-label="Clinical inputs"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
          Clinical inputs
        </h2>

        <div className="flex flex-col gap-5">
          {/* 2. Systemic therapy autocomplete */}
          <TherapyAutocomplete
            selectedTherapies={selectedTherapies}
            onAdd={handleAddTherapy}
          />

          {/* Selected therapy chips */}
          {selectedTherapies.length > 0 && (
            <div
              className="flex flex-wrap gap-2"
              aria-label="Selected therapies"
              aria-live="polite"
            >
              {selectedTherapies.map((t) => (
                <TherapyChip
                  key={t.agentId}
                  therapy={t}
                  onRemove={handleRemoveTherapy}
                />
              ))}
            </div>
          )}

          {/* 3. RT site/subsite */}
          <RTSiteSelector value={rtSite} onChange={handleRtSiteChange} />

          {/* 4. Timing relationship */}
          <TimingSelector value={timingId} onChange={setTimingId} />

          {/* 5. Conditional approximate interval (Recent or Sequential + timing-sensitive) */}
          <TimingIntervalField
            value={timingInterval}
            onChange={setTimingInterval}
            visible={showTimingInterval}
          />

          {/* 6. Fractionation category — filtered by selected site */}
          <FractionationField
            value={fractionationId}
            onChange={setFractionationId}
            visible={true}
            siteId={rtSite?.siteId}
          />
        </div>
      </section>
    </div>
  )
}
