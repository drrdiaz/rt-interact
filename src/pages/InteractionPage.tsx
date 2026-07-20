import React, { useCallback, useMemo, useState } from 'react'
import { TherapyAutocomplete } from '@/components/interaction/TherapyAutocomplete'
import { TherapyChip } from '@/components/interaction/TherapyChip'
import { RTSiteSelector } from '@/components/interaction/RTSiteSelector'
import { FractionationField } from '@/components/interaction/FractionationField'
import { AlertCard } from '@/components/interaction/AlertCard'
import { evaluateRules } from '@/engine/ruleEngine'
import type {
  SelectedTherapy,
  RTSiteSelection,
  RuleEngineInput,
} from '@/data/types'

export function InteractionPage(): React.ReactElement {
  const [selectedTherapies, setSelectedTherapies] = useState<SelectedTherapy[]>([])
  const [rtSite, setRtSite] = useState<RTSiteSelection | null>(null)
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

  const engineInput = useMemo<RuleEngineInput>(
    () => ({
      selectedTherapies,
      rtSite,
      // The app assesses concomitant/recent use only; timing is not a user choice.
      timingId: 'TM001',
      fractionationId,
      treatmentIntent: null,
      timingInterval: null,
    }),
    [selectedTherapies, rtSite, fractionationId],
  )

  const engineOutput = useMemo(() => evaluateRules(engineInput), [engineInput])

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

          {/* Acute interaction context only. */}
          <FractionationField
            value={fractionationId}
            onChange={setFractionationId}
            visible={true}
          />
        </div>
      </section>
    </div>
  )
}
