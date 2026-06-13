/**
 * ReportingForm — anonymous toxicity-signal reporting form.
 *
 * All fields are controlled (no free text). Reuses TherapyAutocomplete and
 * TherapyChip from the Interaction tab.
 *
 * Privacy guarantees:
 * - No patient-identifying fields rendered
 * - No free-text inputs
 * - Submission month stored only (not exact date)
 */

import React, { useCallback, useState } from 'react'
import { TherapyAutocomplete } from '@/components/interaction/TherapyAutocomplete'
import { TherapyChip } from '@/components/interaction/TherapyChip'
import {
  getRTSites,
  getTimingDefinitions,
  getFractionationCategories,
  getToxicityDomains,
} from '@/data/loaders'
import type { SelectedTherapy } from '@/data/types'
import {
  ONSET_OPTIONS,
  SEVERITY_OPTIONS,
  TRISTATE_OPTIONS,
  type ApproximateOnset,
  type Severity,
  type Tristate,
  type ToxicityReportInput,
  validateReportInput,
  buildReport,
} from '@/reporting/reportModel'
import { reportRepository } from '@/reporting/reportRepository'

// ── Form state ────────────────────────────────────────────────────────────────

interface FormState {
  selectedTherapies: SelectedTherapy[]
  rtSiteId: string
  timingId: string
  fractionationId: string
  toxicityDomainIds: string[]
  approximateOnset: ApproximateOnset | ''
  severity: Severity | ''
  treatmentInterrupted: Tristate | ''
  hospitalAdmission: Tristate | ''
}

const EMPTY_FORM: FormState = {
  selectedTherapies: [],
  rtSiteId: '',
  timingId: '',
  fractionationId: '',
  toxicityDomainIds: [],
  approximateOnset: '',
  severity: '',
  treatmentInterrupted: '',
  hospitalAdmission: '',
}

// ── Sub-component helpers ─────────────────────────────────────────────────────

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-semibold text-slate-700"
    >
      {children}
    </label>
  )
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (val: string) => void
  options: Array<{ id: string; label: string }>
  placeholder: string
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3
                   text-base text-slate-800
                   focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200
                   disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function ButtonGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  warningIds,
  warningText,
}: {
  label: string
  options: ReadonlyArray<{ id: T; label: string }>
  value: T | ''
  onChange: (val: T) => void
  warningIds?: T[]
  warningText?: string
}) {
  const showWarning = warningIds && value && warningIds.includes(value)
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((o) => {
          const isActive = value === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              aria-pressed={isActive}
              className={[
                'rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors',
                'min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-teal-400',
                isActive
                  ? 'border-teal-600 bg-teal-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-teal-400 hover:text-teal-700',
              ].join(' ')}
            >
              {o.label}
            </button>
          )
        })}
      </div>
      {showWarning && warningText && (
        <p
          className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2
                     text-xs font-medium text-red-700"
          role="alert"
        >
          {warningText}
        </p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type SubmitStatus = 'idle' | 'success' | 'error'

export function ReportingForm(): React.ReactElement {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [fieldErrors, setFieldErrors] = useState<string[]>([])

  // Lazily-loaded controlled options
  const allSites = getRTSites()
  const allTimings = getTimingDefinitions()
  const allFractions = getFractionationCategories()
  const allDomains = getToxicityDomains()

  // ── Therapy handlers ────────────────────────────────────────────────────────

  const handleAddTherapy = useCallback((therapy: SelectedTherapy) => {
    setForm((prev) => {
      if (prev.selectedTherapies.some((t) => t.agentId === therapy.agentId)) return prev
      return { ...prev, selectedTherapies: [...prev.selectedTherapies, therapy] }
    })
  }, [])

  const handleRemoveTherapy = useCallback((agentId: string) => {
    setForm((prev) => ({
      ...prev,
      selectedTherapies: prev.selectedTherapies.filter((t) => t.agentId !== agentId),
    }))
  }, [])

  // ── Toxicity domain multi-select ───────────────────────────────────────────

  function toggleDomain(domainId: string) {
    setForm((prev) => {
      const existing = prev.toxicityDomainIds
      if (existing.includes(domainId)) {
        return { ...prev, toxicityDomainIds: existing.filter((d) => d !== domainId) }
      }
      return { ...prev, toxicityDomainIds: [...existing, domainId] }
    })
  }

  // ── Submission ──────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const input: ToxicityReportInput = {
      therapyIds: form.selectedTherapies.map((t) => t.agentId),
      rtSiteId: form.rtSiteId,
      timingId: form.timingId,
      fractionationId: form.fractionationId,
      toxicityDomainIds: form.toxicityDomainIds,
      approximateOnset: form.approximateOnset as ApproximateOnset,
      severity: form.severity as Severity,
      treatmentInterrupted: form.treatmentInterrupted as Tristate,
      hospitalAdmission: form.hospitalAdmission as Tristate,
    }

    const validation = validateReportInput(input)
    if (!validation.valid) {
      setFieldErrors(validation.errors)
      return
    }

    setFieldErrors([])

    try {
      const report = buildReport(input)
      await reportRepository.save(report)
      setSubmitStatus('success')
      setForm(EMPTY_FORM)
    } catch {
      // Preserve form state on failure
      setSubmitStatus('error')
    }
  }

  // ── Severity warning trigger ────────────────────────────────────────────────

  const highSeverityWarning =
    'This report does not replace local incident reporting, mortality review, adverse-event reporting or pharmacovigilance requirements.'

  // ── Render ──────────────────────────────────────────────────────────────────

  if (submitStatus === 'success') {
    return (
      <div
        className="rounded-xl border border-teal-200 bg-teal-50 px-5 py-6 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-base font-semibold text-teal-800">
          Anonymous toxicity signal submitted.
        </p>
        <button
          type="button"
          onClick={() => setSubmitStatus('idle')}
          className="mt-4 rounded-lg border border-teal-600 px-4 py-2 text-sm
                     font-semibold text-teal-700 hover:bg-teal-100
                     focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          Submit another report
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => { void handleSubmit(e) }}
      className="flex flex-col gap-6"
      aria-label="Anonymous toxicity signal reporting form"
      noValidate
    >
      {/* Privacy notice */}
      <p
        className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3
                   text-sm font-semibold text-sky-800"
        role="note"
      >
        Reports are anonymous and contain no patient-identifying fields.
      </p>

      {/* 1. Systemic therapy */}
      <div>
        <TherapyAutocomplete
          selectedTherapies={form.selectedTherapies}
          onAdd={handleAddTherapy}
        />
        {form.selectedTherapies.length > 0 && (
          <div
            className="mt-2 flex flex-wrap gap-2"
            aria-label="Selected therapies"
            aria-live="polite"
          >
            {form.selectedTherapies.map((t) => (
              <TherapyChip key={t.agentId} therapy={t} onRemove={handleRemoveTherapy} />
            ))}
          </div>
        )}
      </div>

      {/* 2. RT site / subsite */}
      <SelectField
        id="report-rt-site"
        label="RT site / subsite"
        value={form.rtSiteId}
        onChange={(val) => setForm((p) => ({ ...p, rtSiteId: val }))}
        options={allSites.map((s) => ({
          id: s.site_id,
          label: s.rt_site === s.rt_subsite ? s.rt_site : `${s.rt_site} — ${s.rt_subsite}`,
        }))}
        placeholder="Select RT site…"
      />

      {/* 3. Timing relative to RT */}
      <SelectField
        id="report-timing"
        label="Timing relative to RT"
        value={form.timingId}
        onChange={(val) => setForm((p) => ({ ...p, timingId: val }))}
        options={allTimings.map((t) => ({ id: t.timing_id, label: t.timing_category }))}
        placeholder="Select timing…"
      />

      {/* 4. Fractionation category */}
      <SelectField
        id="report-fractionation"
        label="Fractionation category"
        value={form.fractionationId}
        onChange={(val) => setForm((p) => ({ ...p, fractionationId: val }))}
        options={allFractions.map((f) => ({ id: f.fractionation_id, label: f.category }))}
        placeholder="Select fractionation…"
      />

      {/* 5. Toxicity domain (multi-select as toggle buttons) */}
      <div>
        <FieldLabel>Toxicity domain</FieldLabel>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Toxicity domain">
          {allDomains.map((d) => {
            const isActive = form.toxicityDomainIds.includes(d.domain_id)
            return (
              <button
                key={d.domain_id}
                type="button"
                onClick={() => toggleDomain(d.domain_id)}
                aria-pressed={isActive}
                className={[
                  'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                  'min-h-[36px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-teal-400',
                  isActive
                    ? 'border-teal-600 bg-teal-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-teal-400 hover:text-teal-700',
                ].join(' ')}
              >
                {d.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 6. Approximate onset */}
      <ButtonGroup
        label="Approximate onset"
        options={ONSET_OPTIONS}
        value={form.approximateOnset}
        onChange={(val) => setForm((p) => ({ ...p, approximateOnset: val }))}
      />

      {/* 7. Severity */}
      <ButtonGroup
        label="Severity"
        options={SEVERITY_OPTIONS}
        value={form.severity}
        onChange={(val) => setForm((p) => ({ ...p, severity: val }))}
        warningIds={['G4', 'G5']}
        warningText={highSeverityWarning}
      />

      {/* 8. Treatment interrupted */}
      <ButtonGroup
        label="RT or systemic therapy interrupted"
        options={TRISTATE_OPTIONS}
        value={form.treatmentInterrupted}
        onChange={(val) => setForm((p) => ({ ...p, treatmentInterrupted: val }))}
      />

      {/* 9. Hospital admission */}
      <ButtonGroup
        label="Hospital admission"
        options={TRISTATE_OPTIONS}
        value={form.hospitalAdmission}
        onChange={(val) => setForm((p) => ({ ...p, hospitalAdmission: val }))}
      />

      {/* Field-level validation errors */}
      {fieldErrors.length > 0 && (
        <div
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3"
          role="alert"
          aria-live="polite"
        >
          <p className="mb-1 text-sm font-semibold text-amber-800">
            Please complete all required fields:
          </p>
          <ul className="list-inside list-disc space-y-0.5 text-xs text-amber-700">
            {fieldErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Submission failure */}
      {submitStatus === 'error' && (
        <div
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm font-semibold text-red-800">
            Submission could not be completed. Your selections have been preserved. Please try again.
          </p>
        </div>
      )}

      {/* Pre-submission notice */}
      <p className="text-xs text-slate-500">
        Anonymous reports cannot be retracted or corrected after submission.
      </p>

      {/* Submit */}
      <button
        type="submit"
        className="w-full rounded-xl bg-teal-600 px-6 py-4 text-base font-bold
                   text-white shadow-sm transition-colors hover:bg-teal-700
                   focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
                   min-h-[52px] touch-manipulation"
      >
        Submit anonymous report
      </button>
    </form>
  )
}
