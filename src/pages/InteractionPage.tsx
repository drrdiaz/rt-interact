import React, { useCallback, useMemo, useState } from 'react'
import { TherapyAutocomplete } from '@/components/interaction/TherapyAutocomplete'
import { TherapyChip } from '@/components/interaction/TherapyChip'
import { RTSiteSelector } from '@/components/interaction/RTSiteSelector'
import { TimingSelector } from '@/components/interaction/TimingSelector'
import { TimingIntervalField } from '@/components/interaction/TimingIntervalField'
import { TreatmentIntentToggle } from '@/components/interaction/TreatmentIntentToggle'
import { FractionationField } from '@/components/interaction/FractionationField'
import { AlertCard } from '@/components/interaction/AlertCard'
import { evaluateRules } from '@/engine/ruleEngine'
import type {
  SelectedTherapy,
  RTSiteSelection,
  TreatmentIntent,
  RuleEngineInput,
} from '@/data/types'

export function InteractionPage(): React.ReactElement {
  const [selectedTherapies, setSelectedTherapies] = useState<SelectedTherapy[]>([])
  const [rtSite, setRtSite] = useState<RTSiteSelection | null>(null)
  const [timingId, setTimingId] = useState<string | null>(null)
  const [timingIntervalDays, setTimingIntervalDays] = useState<number | null>(null)
  const [fractionationId, setFractionationId] = useState<string | null>(null)
  const [treatmentIntent, setTreatmentIntent] = useState<TreatmentIntent>(null)

  const handleAddTherapy = useCallback((therapy: SelectedTherapy) => {
    setSelectedTherapies((prev) => {
      if (prev.some((t) => t.agentId === therapy.agentId)) return prev
      return [...prev, therapy]
    })
  }, [])

  const handleRemoveTherapy = useCallback((agentId: string) => {
    setSelectedTherapies((prev) => prev.filter((t) => t.agentId !== agentId))
  }, [])

  const engineInput = useMemo<RuleEngineInput>(
    () => ({
      selectedTherapies,
      rtSite,
      timingId,
      fractionationId,
      treatmentIntent,
      timingIntervalDays,
    }),
    [selectedTherapies, rtSite, timingId, fractionationId, treatmentIntent, timingIntervalDays],
  )

  const engineOutput = useMemo(() => evaluateRules(engineInput), [engineInput])

  // ── Conditional field visibility ────────────────────────────────────────────
  //
  // Show fractionation when:
  //   - it's already been provided, OR
  //   - the engine says it's a missing required field
  //
  // Show timing interval when:
  //   - it's already been provided, OR
  //   - the engine says it's a missing required field
  //
  // These two conditions ensure the field appears as soon as the engine
  // determines it's required, and stays visible once the user interacts.

  const showFractionation = useMemo(() => {
    if (fractionationId !== null) return true
    if (!engineOutput.incomplete) return false
    return engineOutput.missingFields.some((f) => f.field === 'fractionationId')
  }, [fractionationId, engineOutput])

  const showTimingInterval = useMemo(() => {
    if (timingIntervalDays !== null) return true
    if (!engineOutput.incomplete) return false
    return engineOutput.missingFields.some((f) => f.field === 'timingIntervalDays')
  }, [timingIntervalDays, engineOutput])

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
          <RTSiteSelector value={rtSite} onChange={setRtSite} />

          {/* 4. Timing relationship */}
          <TimingSelector value={timingId} onChange={setTimingId} />

          {/* 5. Conditional timing interval (days) */}
          <TimingIntervalField
            value={timingIntervalDays}
            onChange={setTimingIntervalDays}
            visible={showTimingInterval}
          />

          {/* 6. Optional treatment intent */}
          <TreatmentIntentToggle
            value={treatmentIntent}
            onChange={setTreatmentIntent}
          />

          {/* 7. Conditional fractionation category */}
          <FractionationField
            value={fractionationId}
            onChange={setFractionationId}
            visible={showFractionation}
          />
        </div>
      </section>
    </div>
  )
}
