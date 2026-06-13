import React, { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { InteractionPage } from '@/pages/InteractionPage'
import { ReportingPage } from '@/pages/ReportingPage'
import { InfoPage } from '@/pages/InfoPage'

export type TabId = 'interaction' | 'reporting' | 'info'

const TAB_LABELS: Record<TabId, string> = {
  interaction: 'Interaction',
  reporting: 'Reporting',
  info: 'Info',
}

export function App(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabId>('interaction')

  function renderPage(): React.ReactElement {
    switch (activeTab) {
      case 'interaction':
        return <InteractionPage />
      case 'reporting':
        return <ReportingPage />
      case 'info':
        return <InfoPage />
    }
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      <div role="main" aria-label={TAB_LABELS[activeTab]}>
        {renderPage()}
      </div>
    </AppShell>
  )
}
