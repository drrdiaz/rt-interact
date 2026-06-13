import React from 'react'

export function Header(): React.ReactElement {
  return (
    <header className="sticky top-0 z-20 bg-slate-900 px-4 pt-safe-top shadow-md">
      <div className="mx-auto flex max-w-2xl flex-col py-3">
        <span className="text-xl font-bold tracking-tight text-teal-400">
          RT Interact
        </span>
        <span className="text-xs font-medium text-slate-400">
          RT / systemic therapy toxicity alert tool
        </span>
      </div>
      <div className="border-t border-amber-500/40 bg-amber-950/60 py-1.5">
        <p className="mx-auto max-w-2xl text-center text-xs font-semibold tracking-wide text-amber-300">
          Research/QI prototype — not validated for clinical use
        </p>
      </div>
    </header>
  )
}
