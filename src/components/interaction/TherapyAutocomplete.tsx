import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  buildAgentSuggestions,
  filterAgentSuggestions,
} from '@/data/loaders'
import type { AgentSuggestion, SelectedTherapy } from '@/data/types'

interface TherapyAutocompleteProps {
  selectedTherapies: SelectedTherapy[]
  onAdd: (therapy: SelectedTherapy) => void
  disabled?: boolean
}

export function TherapyAutocomplete({
  selectedTherapies,
  onAdd,
  disabled = false,
}: TherapyAutocompleteProps): React.ReactElement {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Build suggestion list once — stable across re-renders
  const allSuggestions = useMemo(() => buildAgentSuggestions(), [])

  const selectedIds = useMemo(
    () => new Set(selectedTherapies.map((t) => t.agentId)),
    [selectedTherapies],
  )

  const filtered = useMemo(
    () =>
      filterAgentSuggestions(allSuggestions, query).filter(
        (s) => !selectedIds.has(s.agent.agent_id),
      ),
    [allSuggestions, query, selectedIds],
  )

  const handleSelect = useCallback(
    (suggestion: AgentSuggestion) => {
      const therapy: SelectedTherapy = {
        agentId: suggestion.agent.agent_id,
        canonicalName: suggestion.agent.canonical_name,
        displayName: suggestion.matchedAlias?.alias_text ?? suggestion.agent.canonical_name,
        aliasUsed: suggestion.matchedAlias?.alias_text,
        agentType: suggestion.agent.type,
      }
      onAdd(therapy)
      setQuery('')
      setIsOpen(false)
      setActiveIndex(-1)
      inputRef.current?.focus()
    },
    [onAdd],
  )

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || filtered.length === 0) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && filtered[activeIndex]) {
          handleSelect(filtered[activeIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement | undefined
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  const listId = 'therapy-autocomplete-list'
  const inputId = 'therapy-autocomplete-input'

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        Systemic therapy
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && filtered.length > 0}
          aria-controls={listId}
          aria-activedescendant={
            activeIndex >= 0 ? `therapy-option-${activeIndex}` : undefined
          }
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Search by name or brand (e.g. pembrolizumab, Keytruda)…"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3
                     text-base text-slate-800 placeholder:text-slate-400
                     focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200
                     disabled:cursor-not-allowed disabled:bg-slate-100"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                       hover:text-slate-600 focus:outline-none"
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Therapy suggestions"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg
                     border border-slate-200 bg-white shadow-lg"
        >
          {filtered.map((suggestion, index) => (
            <li
              key={`${suggestion.agent.agent_id}-${suggestion.matchedAlias?.alias_id ?? 'canon'}`}
              id={`therapy-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(suggestion) }}
              onMouseEnter={() => setActiveIndex(index)}
              className={[
                'flex cursor-pointer flex-col px-4 py-3 text-sm',
                index === activeIndex
                  ? 'bg-teal-50 text-teal-900'
                  : 'text-slate-800 hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="font-medium">
                {suggestion.matchedAlias
                  ? suggestion.matchedAlias.alias_text
                  : suggestion.agent.canonical_name}
              </span>
              {suggestion.matchedAlias && (
                <span className="text-xs text-slate-500">
                  {suggestion.agent.canonical_name}
                </span>
              )}
              <span className="mt-0.5 text-xs text-slate-400">
                {suggestion.agent.type === 'class' ? '⬡ Drug class — ' : ''}{suggestion.agent.therapy_class}
              </span>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.trim().length > 1 && filtered.length === 0 && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-slate-200
                        bg-white px-4 py-3 text-sm text-slate-500 shadow-lg">
          No match found — request database review.
        </div>
      )}
    </div>
  )
}
