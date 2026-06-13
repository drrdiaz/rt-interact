import React from 'react'
import type { TabId } from '@/App'

interface NavItem {
  id: TabId
  label: string
  icon: React.ReactElement
}

const navItems: NavItem[] = [
  {
    id: 'interaction',
    label: 'Interaction',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    id: 'info',
    label: 'Info',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
]

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function BottomNav({
  activeTab,
  onTabChange,
}: BottomNavProps): React.ReactElement {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white pb-safe-bottom"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-2xl">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={[
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-3',
                'min-h-[56px] touch-manipulation transition-colors',
                isActive
                  ? 'text-teal-600'
                  : 'text-slate-400 hover:text-slate-600',
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              {item.icon}
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
