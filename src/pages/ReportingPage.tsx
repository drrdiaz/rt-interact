import React from 'react'
import { ReportingForm } from '@/components/reporting/ReportingForm'

export function ReportingPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-5">
      <section
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        aria-label="Anonymous toxicity signal reporting"
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
          Report a toxicity signal
        </h2>
        <ReportingForm />
      </section>
    </div>
  )
}
