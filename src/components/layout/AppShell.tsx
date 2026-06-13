import React from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import type { TabId } from '@/App'

interface AppShellProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  children: React.ReactNode
}

export function AppShell({
  activeTab,
  onTabChange,
  children,
}: AppShellProps): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1 overflow-y-auto pb-[72px]">
        <div className="mx-auto max-w-2xl px-4 py-4">{children}</div>
      </main>
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
