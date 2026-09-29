'use client'

import React, { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  getAllExpeditions,
  getAllDatasets,
  getAllDocuments,
  ExpeditionHub,
  DatasetSpoke,
  DocumentSpoke,
} from '@/lib/data/knowledge-graph'
import {
  Search,
  Compass,
  Database,
  FileText,
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar,
  MapPin,
  ExternalLink,
  ChevronRight,
  Shield,
  BookOpen,
} from 'lucide-react'

type CategoryFilter = 'all' | 'expeditions' | 'datasets' | 'documents'

interface SearchResultCard {
  id: string
  badgeType: 'Expedition Hub' | 'Scientific Dataset' | 'Official Publication'
  title: string
  categoryBadge: string
  region: string
  year?: number | null
  expeditionId: string
  expeditionName: string
  description: string
  detailUrl: string
  metadataLabel: string
}

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')
  const [regionFilter, setRegionFilter] = useState<string>('all')

  const expeditions = useMemo(() => getAllExpeditions(), [])
  const datasets = useMemo(() => getAllDatasets(), [])
  const documents = useMemo(() => getAllDocuments(), [])

  // Build unified search index
  const allCards = useMemo<SearchResultCard[]>(() => {
    const list: SearchResultCard[] = []

    // 1. Expeditions
    for (const exp of expeditions) {
      list.push({
        id: `exp-${exp.id}`,
        badgeType: 'Expedition Hub',
        title: `${exp.name} (${exp.short_name})`,
        categoryBadge: 'Expedition',
        region: exp.region,
        year: exp.year,
        expeditionId: exp.id,
        expeditionName: exp.name,
        description: exp.description || exp.research_summary,
        detailUrl: `/polar-hub?expedition=${exp.id}`,
        metadataLabel: `Chief Scientist: ${exp.chief_scientist} · Station: ${exp.polar_region}`,
      })
    }

    // 2. Datasets
    for (const ds of datasets) {
      list.push({
        id: `ds-${ds.id}`,
        badgeType: 'Scientific Dataset',
        title: ds.title,
        categoryBadge: 'Dataset',
        region: ds.region,
        year: ds.year,
        expeditionId: ds.expedition_id,
        expeditionName: ds.expedition_name,
        description: `${ds.summary} Parameters: ${ds.parameter}. Station: ${ds.station}. Records: ${ds.row_count} rows.`,
        detailUrl: `/polar-hub?expedition=${ds.expedition_id}`,
        metadataLabel: `Station: ${ds.station} · ${ds.dataset_type} · ${ds.row_count} Data Rows`,
      })
    }

    // 3. Documents
    for (const doc of documents) {
      list.push({
        id: `doc-${doc.id}`,
        badgeType: 'Official Publication',
        title: doc.title,
        categoryBadge: 'Document',
        region: doc.region,
        year: doc.year,
        expeditionId: doc.expedition_id,
        expeditionName: doc.expedition_name,
        description: `${doc.summary} Published under ${doc.expedition_name}. Type: ${doc.doc_type}. Pages: ${doc.pages}.`,
        detailUrl: `/knowledge-repository?doc=${doc.id}`,
        metadataLabel: `${doc.doc_type} · ${doc.pages} Pages · File Size: ${doc.file_size}`,
      })
    }

    return list
  }, [expeditions, datasets, documents])

  // Filter items by Query, Category, and Region
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    const tokens = q ? q.split(/\s+/).filter(Boolean) : []

    return allCards.filter((card) => {
      // Category filter
      if (activeCategory === 'expeditions' && card.badgeType !== 'Expedition Hub') return false
      if (activeCategory === 'datasets' && card.badgeType !== 'Scientific Dataset') return false
      if (activeCategory === 'documents' && card.badgeType !== 'Official Publication') return false

      // Region filter
      if (regionFilter !== 'all') {
        if (!card.region.toLowerCase().includes(regionFilter.toLowerCase())) return false
      }

      // Keyword match
      if (tokens.length === 0) return true
      const searchTarget = `${card.title} ${card.description} ${card.region} ${card.expeditionName} ${card.metadataLabel}`.toLowerCase()
      return tokens.every((token) => searchTarget.includes(token))
    })
  }, [allCards, query, activeCategory, regionFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  // Snippet highlighter helper
  const highlightSnippet = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text
    const cleanTerm = searchTerm.trim().toLowerCase()
    const parts = text.split(new RegExp(`(${cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === cleanTerm ? (
            <mark key={i} className="bg-amber-200 text-slate-900 px-0.5 rounded-xs font-semibold transition-colors duration-300">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300 pb-24">
      {/* 1. Large Top Search Bar Header (Scholar / Registry Style) */}
      <section className="bg-brand-navy text-white py-10 px-4 sm:px-8 border-b-4 border-cyan-500 shadow-md">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-2 flex items-center gap-2 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Shield size={14} />
            <span>National Polar Data Registry · Unified Search</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-4">
            Search India’s Polar Research Archive
          </h1>

          {/* Large Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-3xl">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-4 size-5 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search expeditions, AWS telemetry, ice cores, Maitri, Bharati, Himadri, documents..."
                className="h-14 w-full rounded-sm bg-white pl-12 pr-32 text-sm sm:text-base font-medium text-slate-900 shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-300"
              />
              <button
                type="submit"
                className="absolute right-2 h-10 px-6 bg-brand-navy hover:bg-[#0b3b6f] text-white text-xs sm:text-sm font-bold rounded-sm transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>Search</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </form>

          {/* Quick Filters / Counts */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-200">
            <span className="font-semibold text-white">Suggested searches:</span>
            {['43rd Antarctic', 'Larsemann Hills', 'Maitri AWS', 'Himadri Arctic IndARC', 'Ice Core δ18O'].map((suggest) => (
              <button
                key={suggest}
                type="button"
                onClick={() => setQuery(suggest)}
                className="rounded-xs border border-white/20 bg-white/10 hover:bg-white/20 px-2.5 py-1 text-xs text-white transition-colors"
              >
                {suggest}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Main Search Results Workspace */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8 pt-8">
        
        {/* Filter Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 pb-4 mb-6 transition-colors duration-300">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-200/80 p-1 rounded-sm text-xs font-bold">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xs transition-colors ${ activeCategory === 'all' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-600 hover:text-slate-900' }`}
            >
              All Records ({allCards.length})
            </button>
            <button
              onClick={() => setActiveCategory('expeditions')}
              className={`px-3 py-1.5 rounded-xs transition-colors ${ activeCategory === 'expeditions' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-600 hover:text-slate-900' }`}
            >
              Expeditions ({expeditions.length})
            </button>
            <button
              onClick={() => setActiveCategory('datasets')}
              className={`px-3 py-1.5 rounded-xs transition-colors ${ activeCategory === 'datasets' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-600 hover:text-slate-900' }`}
            >
              Datasets ({datasets.length})
            </button>
            <button
              onClick={() => setActiveCategory('documents')}
              className={`px-3 py-1.5 rounded-xs transition-colors ${ activeCategory === 'documents' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-600 hover:text-slate-900' }`}
            >
              Publications ({documents.length})
            </button>
          </div>

          {/* Region Dropdown Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Filter size={13} /> Region:
            </label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="h-8 border border-slate-300 bg-white text-xs font-semibold px-2 rounded-sm text-slate-800 outline-none focus:border-brand-navy transition-colors duration-300"
            >
              <option value="all">All Regions</option>
              <option value="Antarctica">Antarctica</option>
              <option value="Arctic">Arctic (Svalbard)</option>
              <option value="Himalaya">Himalayas (Chandra Basin)</option>
            </select>
          </div>
        </div>

        {/* Results Count Banner */}
        <div className="flex items-center justify-between text-xs text-slate-600 mb-4">
          <p>
            Showing <strong>{filteredResults.length}</strong> verified scientific record{filteredResults.length === 1 ? '' : 's'}
            {query.trim() && (
              <> for <span className="font-bold text-brand-navy transition-colors duration-300">"{query}"</span></>
            )}
          </p>
          <span className="text-[11px] text-slate-500 font-mono">
            Source: NCPOR / MoES Knowledge Graph &amp; Vault
          </span>
        </div>

        {/* Horizontal Cards Stream (Google Scholar / Gov Registry Layout) */}
        {filteredResults.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-sm p-8 transition-colors duration-300">
            <Search className="mx-auto size-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800 transition-colors duration-300">No matching polar records found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Please try different scientific terms like "ice core", "AWS", "Bharati", "Kongsfjorden", or reset your category filters.
            </p>
            <button
              onClick={() => {
                setQuery('')
                setActiveCategory('all')
                setRegionFilter('all')
              }}
              className="mt-4 px-4 py-1.5 bg-brand-navy text-white text-xs font-bold rounded-sm hover:bg-[#0b3b6f]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredResults.map((card) => {
              const isExp = card.badgeType === 'Expedition Hub'
              const isDs = card.badgeType === 'Scientific Dataset'
              const isDoc = card.badgeType === 'Official Publication'

              const badgeColor = isExp
                ? 'bg-blue-100 text-blue-900 border-blue-300'
                : isDs
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'

              const badgeIcon = isExp ? (
                <Compass size={12} className="text-blue-700" />
              ) : isDs ? (
                <Database size={12} className="text-emerald-700" />
              ) : (
                <FileText size={12} className="text-amber-700" />
              )

              return (
                <article
                  key={card.id}
                  className="group border border-slate-300 hover:border-brand-navy bg-white rounded-sm p-4 sm:p-5 transition-all shadow-2xs hover:shadow-md flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors duration-300"
                >
                  <div className="flex-1 min-w-0">
                    {/* Header Strip: Badge + Region + Year */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xs border ${badgeColor}`}
                      >
                        {badgeIcon}
                        {card.badgeType}
                      </span>

                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400" />
                        {card.region}
                      </span>

                      {card.year && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                            <Calendar size={11} className="text-slate-400" />
                            {card.year}
                          </span>
                        </>
                      )}

                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] font-medium text-slate-600 truncate max-w-[280px]">
                        Hub: {card.expeditionName}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-base sm:text-lg font-bold text-brand-navy group-hover:underline leading-snug transition-colors duration-300">
                      <Link href={card.detailUrl}>
                        {highlightSnippet(card.title, query)}
                      </Link>
                    </h2>

                    {/* 2-Line Snippet with Highlighting */}
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {highlightSnippet(card.description, query)}
                    </p>

                    {/* Registry Metadata Footer */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span className="font-semibold text-slate-700 transition-colors duration-300">{card.metadataLabel}</span>
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div className="shrink-0 flex items-center md:flex-col md:items-end justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <Link
                      href={card.detailUrl}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-sm bg-slate-100 hover:bg-brand-navy text-brand-navy hover:text-white px-4 text-xs font-bold transition-colors border border-slate-300 hover:border-brand-navy"
                    >
                      <span>View Details</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent flex items-center justify-center p-8 text-xs text-slate-500 font-semibold transition-colors duration-300">
          Loading Polar Knowledge Registry...
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  )
}
