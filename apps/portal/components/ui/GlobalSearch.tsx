'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  label: string
  sub: string
  meta: string
  href: string
  type: 'landlord' | 'property' | 'unit' | 'tenant'
}

interface SearchResults {
  landlords: SearchResult[]
  properties: SearchResult[]
  units: SearchResult[]
  tenants: SearchResult[]
}

const TYPE_CONFIG = {
  landlord:  { label: 'Landlords',  icon: '🏢', color: 'bg-success-100 text-success-700' },
  property:  { label: 'Properties', icon: '🏠', color: 'bg-primary-100 text-primary-700' },
  unit:      { label: 'Units',      icon: '🔑', color: 'bg-primary-100 text-primary-700' },
  tenant:    { label: 'Tenants',    icon: '👤', color: 'bg-warning-100 text-warning-700' },
}

function statusColor(status: string) {
  if (status === 'ACTIVE' || status === 'OCCUPIED') return 'text-success-600'
  if (status === 'INACTIVE' || status === 'VACANT') return 'text-neutral-500'
  return 'text-yellow-600'
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const router = useRouter()

  // Flatten results for keyboard nav
  const allResults = results
    ? [
        ...results.landlords,
        ...results.properties,
        ...results.units,
        ...results.tenants,
      ]
    : []

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results)
      setActiveIdx(-1)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 250)
    return () => clearTimeout(debounceRef.current)
  }, [query, search])

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navigate = (href: string) => {
    setOpen(false)
    setQuery('')
    setResults(null)
    router.push(href)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, allResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      navigate(allResults[activeIdx].href)
    }
  }

  const hasResults = results && (
    results.landlords.length + results.properties.length +
    results.units.length + results.tenants.length > 0
  )

  // Render a group of results
  const renderGroup = (items: SearchResult[], type: keyof typeof TYPE_CONFIG, startIdx: number) => {
    if (!items.length) return null
    const cfg = TYPE_CONFIG[type]
    return (
      <div key={type}>
        <div className="px-3 py-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>{cfg.icon}</span> {cfg.label}
        </div>
        {items.map((item, i) => {
          const idx = startIdx + i
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
                activeIdx === idx ? 'bg-primary-50' : 'hover:bg-neutral-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${cfg.color}`}>
                {cfg.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900 truncate">{item.label}</p>
                {item.sub && <p className="text-xs text-neutral-500 truncate">{item.sub}</p>}
              </div>
              <span className={`text-xs font-medium flex-shrink-0 ${statusColor(item.meta)}`}>
                {item.meta}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  let idx = 0
  const landlordStart = idx; idx += (results?.landlords.length ?? 0)
  const propertyStart = idx; idx += (results?.properties.length ?? 0)
  const unitStart = idx; idx += (results?.units.length ?? 0)
  const tenantStart = idx

  return (
    <div ref={containerRef} className="relative">
      {/* Search trigger button */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="flex items-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition text-sm text-neutral-500 w-64"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-surface border border-neutral-300 rounded text-xs text-neutral-400">
          ⌘K
        </kbd>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-[480px] bg-surface rounded-xl shadow-2xl border border-neutral-200 z-50 overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-b border-neutral-100">
            <svg className="w-4 h-4 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search landlords, properties, units, tenants..."
              className="flex-1 text-sm outline-none bg-transparent text-neutral-900 placeholder-neutral-400"
              autoComplete="off"
            />
            {loading && (
              <svg className="w-4 h-4 text-neutral-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {query && !loading && (
              <button onClick={() => { setQuery(''); setResults(null) }} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto divide-y divide-neutral-50">
            {query.length < 2 && (
              <div className="px-4 py-8 text-center text-sm text-neutral-400">
                Type at least 2 characters to search
              </div>
            )}
            {query.length >= 2 && !loading && !hasResults && (
              <div className="px-4 py-8 text-center text-sm text-neutral-400">
                No results for &quot;{query}&quot;
              </div>
            )}
            {results && hasResults && (
              <>
                {renderGroup(results.landlords, 'landlord', landlordStart)}
                {renderGroup(results.properties, 'property', propertyStart)}
                {renderGroup(results.units, 'unit', unitStart)}
                {renderGroup(results.tenants, 'tenant', tenantStart)}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-neutral-100 flex items-center gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1"><kbd className="px-1 bg-neutral-100 rounded">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1 bg-neutral-100 rounded">↵</kbd> open</span>
            <span className="flex items-center gap-1"><kbd className="px-1 bg-neutral-100 rounded">Esc</kbd> close</span>
          </div>
        </div>
      )}
    </div>
  )
}
