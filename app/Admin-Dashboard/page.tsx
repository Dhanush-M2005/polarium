'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { useLanguage } from '@/context/LanguageContext'
import {
  getAllExpeditions,
  getAllMedia,
  getAllDatasets,
  getAllDocuments,
  getDatasetsForExpedition,
  getDocumentsForExpedition,
  getMediaForExpedition,
  ExpeditionHub,
  MediaSpoke,
} from '@/lib/data/knowledge-graph'
import {
  Archive,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  FileCheck2,
  Globe,
  LayoutDashboard,
  Menu,
  Send,
  ShieldCheck,
  UserRound,
  X,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  Compass,
  FileText,
  Share2,
  Image as ImageIcon,
  Copy,
  Eye,
  Edit3,
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  Plus,
  Maximize2,
  ExternalLink,
  Shield,
  CheckCircle2,
  CheckCircle,
  FileDown,
  Layers,
  Search,
  BookOpen,
  BarChart3,
  Calendar,
  MapPin,
  Tag,
  AlertCircle,
  FolderPlus,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'archive', label: 'Archive Manager', icon: Archive },
  { id: 'outreach', label: 'Outreach Studio', icon: Send },
  { id: 'pending', label: 'Pending Approvals', icon: FileCheck2 },
]

const channelOptions = ['Website Article', 'Twitter/X', 'Press Release']
const audienceOptions = ['General Public', 'Scientific Community', 'Media & Outreach Partners', 'Students & Educators']
const languageOptions = ['English & Hindi', 'English Only', 'Hindi Only']

const STATION_OPTIONS = [
  { id: 'all', label: 'All Stations & Observatories' },
  { id: 'Bharati', label: 'Bharati Station (Larsemann Hills, Antarctica)' },
  { id: 'Maitri', label: 'Maitri Station (Schirmacher Oasis, Antarctica)' },
  { id: 'Himadri', label: 'Himadri Base (Ny-Ålesund, Arctic)' },
  { id: 'Himansh', label: 'Himansh Observatory (Chandra Basin, Himalaya)' },
  { id: 'SouthernOcean', label: 'Southern Ocean Expedition Fleet' },
]

export interface StagedArchiveFile {
  id: string
  name: string
  size: number
  type: string
  category: 'pdf' | 'csv' | 'image' | 'data'
  previewUrl: string
  title: string
  station: string
  expedition: string
}

export type PendingApprovalType = {
  id: string
  type: 'archive' | 'outreach'
  title: string
  subtitle: string
  timestamp: string
  content: string | StagedArchiveFile[]
  media?: string[]
}


export default function AdminDashboardPage() {
  const { language: currentLang, toggleLanguage } = useLanguage()
  const expeditions = useMemo(() => getAllExpeditions(), [])
  const allMediaAssets = useMemo(() => getAllMedia(), [])
  const allDatasets = useMemo(() => getAllDatasets(), [])
  const allDocuments = useMemo(() => getAllDocuments(), [])

  // Navigation State
  const [activeNavTab, setActiveNavTab] = useState<'archive' | 'outreach' | 'dashboard' | 'pending'>('dashboard')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [viewingExpedition, setViewingExpedition] = useState<ExpeditionHub | null>(null)
  const [showAllReports, setShowAllReports] = useState(false)

  // Pending Approvals State
  const [pendingApprovals, setPendingApprovals] = useState<PendingApprovalType[]>([])
  const [previewingApproval, setPreviewingApproval] = useState<PendingApprovalType | null>(null)

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('polarsearch_pending_approvals')
      if (stored) {
        setPendingApprovals(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Error loading pending approvals', e)
    }
  }, [])

  // Sync to localStorage on change
  useEffect(() => {
    localStorage.setItem('polarsearch_pending_approvals', JSON.stringify(pendingApprovals))
  }, [pendingApprovals])
  // Dashboard Region Classification Filter & Search State
  const [dashboardRegionFilter, setDashboardRegionFilter] = useState<'All' | 'Antarctica' | 'Arctic' | 'Himalaya'>('All')
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState('')

  // Filtered Expeditions for Dashboard
  const filteredDashboardExpeditions = useMemo(() => {
    return expeditions.filter((exp) => {
      const matchesRegion =
        dashboardRegionFilter === 'All'
          ? true
          : exp.region === dashboardRegionFilter ||
            exp.polar_region.toLowerCase().includes(dashboardRegionFilter.toLowerCase())

      const q = dashboardSearchQuery.trim().toLowerCase()
      const matchesSearch =
        !q ||
        exp.name.toLowerCase().includes(q) ||
        exp.short_name.toLowerCase().includes(q) ||
        exp.id.toLowerCase().includes(q) ||
        exp.keywords.some((k) => k.toLowerCase().includes(q))

      return matchesRegion && matchesSearch
    })
  }, [expeditions, dashboardRegionFilter, dashboardSearchQuery])

  // Dashboard 6 Cards-per-page Pagination State
  const [dashboardPage, setDashboardPage] = useState(1)
  const CARDS_PER_PAGE = 6
  const totalDashboardPages = useMemo(() => Math.ceil(filteredDashboardExpeditions.length / CARDS_PER_PAGE), [filteredDashboardExpeditions])
  const paginatedExpeditions = useMemo(() => {
    const start = (dashboardPage - 1) * CARDS_PER_PAGE
    return filteredDashboardExpeditions.slice(start, start + CARDS_PER_PAGE)
  }, [filteredDashboardExpeditions, dashboardPage])

  // Filtered documents, datasets, and media strictly for the active viewing expedition
  const viewingExpeditionDocs = useMemo(() => {
    if (!viewingExpedition) return []
    const direct = getDocumentsForExpedition(viewingExpedition.id)
    if (direct.length > 0) return direct
    return allDocuments.filter(
      (doc) =>
        doc.expedition_name.toLowerCase().includes(viewingExpedition.short_name.toLowerCase()) ||
        doc.expedition_name.toLowerCase().includes(viewingExpedition.name.toLowerCase())
    )
  }, [viewingExpedition, allDocuments])

  const viewingExpeditionDatasets = useMemo(() => {
    if (!viewingExpedition) return []
    const direct = getDatasetsForExpedition(viewingExpedition.id)
    if (direct.length > 0) return direct
    return allDatasets.filter(
      (ds) =>
        ds.expedition_name.toLowerCase().includes(viewingExpedition.short_name.toLowerCase()) ||
        ds.expedition_name.toLowerCase().includes(viewingExpedition.name.toLowerCase())
    )
  }, [viewingExpedition, allDatasets])

  const viewingExpeditionMedia = useMemo(() => {
    if (!viewingExpedition) return []
    const direct = getMediaForExpedition(viewingExpedition.id)
    if (direct.length > 0) return direct
    return allMediaAssets.filter(
      (m) =>
        m.expedition_name.toLowerCase().includes(viewingExpedition.short_name.toLowerCase()) ||
        m.expedition_name.toLowerCase().includes(viewingExpedition.name.toLowerCase())
    )
  }, [viewingExpedition, allMediaAssets])

  const viewingHeroImage = useMemo(() => {
    if (!viewingExpedition) return '/ice-sheet.png'
    const matchedMedia = allMediaAssets.find(
      (m) =>
        m.expedition_id === viewingExpedition.id ||
        (viewingExpedition.short_name && m.expedition_name.toLowerCase().includes(viewingExpedition.short_name.toLowerCase()))
    )
    if (matchedMedia && matchedMedia.url) return matchedMedia.url
    if (viewingExpedition.region === 'Arctic') return '/ice-sheet.png'
    if (viewingExpedition.region === 'Himalaya') return '/antarctic-station.png'
    return viewingExpedition.expedition_number % 2 === 0 ? '/antarctic-station.png' : '/antarctic-vessel.png'
  }, [viewingExpedition, allMediaAssets])

  // ---------------------------------------------------------------------------
  // ARCHIVE MANAGER STATES (BULK 10+ UPLOADER & PREVIEW MODAL)
  // ---------------------------------------------------------------------------
  const [archiveStation, setArchiveStation] = useState<string>('Bharati')
  const [archiveExpeditionInput, setArchiveExpeditionInput] = useState<string>('')
  const [archiveCategory, setArchiveCategory] = useState<string>('Glaciology & Telemetry')
  const [isDragOver, setIsDragOver] = useState<boolean>(false)
  const [stagedFiles, setStagedFiles] = useState<StagedArchiveFile[]>([])

  // Modal State for Preview Layout Verification
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false)
  const [previewTab, setPreviewTab] = useState<'repository' | 'media' | 'hub'>('repository')
  const [isPublishing, setIsPublishing] = useState<boolean>(false)
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false)

  // ---------------------------------------------------------------------------
  // OUTREACH STUDIO STATES
  // ---------------------------------------------------------------------------
  const [selectedStation, setSelectedStation] = useState<string>('all')
  const [selectedExpId, setSelectedExpId] = useState<string>('exp-043')
  const [disseminationChannel, setDisseminationChannel] = useState(channelOptions[0])
  const [targetAudience, setTargetAudience] = useState(audienceOptions[0])
  const [language, setLanguage] = useState(languageOptions[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview')
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])
  const [content, setContent] = useState<string>(
    `[OFFICIAL DISSEMINATION DRAFT]\n\nHeadline: Unlocking Earth's Ancient Climate: How India's 43rd Antarctic Expedition Shaped Polar Science\n\n` +
    `Summary: Over 40 years ago, Indian scientists embarked on landmark polar expeditions to Schirmacher Oasis in Antarctica. Today, data collected from ice cores and weather stations at Maitri Station continue to help researchers model global sea-level rise.\n\n` +
    `Key Scientific Highlights:\n1. Over 1,400 ice core samples recovered\n2. Real-time telemetry monitoring continuous UV radiation\n3. Landmark findings published in Journal of Geophysical Research.`
  )

  const showNotice = (text: string) => {
    setNotice(text)
    setTimeout(() => setNotice(''), 4000)
  }

  // Cascading Filter: filter expeditions based on selected station
  const filteredExpeditions = useMemo(() => {
    if (!selectedStation || selectedStation === 'all') return expeditions
    const s = selectedStation.toLowerCase()
    return expeditions.filter((exp) => {
      const text = `${exp.name} ${exp.short_name} ${exp.polar_region} ${exp.region} ${exp.description} ${exp.keywords.join(' ')}`.toLowerCase()
      if (s === 'bharati') return text.includes('bharati') || text.includes('larsemann')
      if (s === 'maitri') return text.includes('maitri') || text.includes('schirmacher') || text.includes('queen maud')
      if (s === 'himadri') return text.includes('himadri') || text.includes('arctic') || text.includes('svalbard')
      if (s === 'himansh') return text.includes('himansh') || text.includes('himalaya') || text.includes('spiti')
      return text.includes(s)
    })
  }, [expeditions, selectedStation])

  // Selected expedition object
  const activeExpedition = useMemo(() => {
    return filteredExpeditions.find((e) => e.id === selectedExpId) || filteredExpeditions[0] || expeditions[0]
  }, [filteredExpeditions, expeditions, selectedExpId])

  const attachedMediaAssets = useMemo(() => {
    const directMatches = allMediaAssets.filter((m) => m.expedition_id === selectedExpId)
    if (directMatches.length > 0) return directMatches
    return allMediaAssets.slice(0, 4)
  }, [allMediaAssets, selectedExpId])

  const toggleMedia = (filename: string) => {
    setSelectedMedia((prev) =>
      prev.includes(filename) ? prev.filter((f) => f !== filename) : [...prev, filename]
    )
  }

  // Helper function to format file sizes in KB
  const formatKB = (bytes: number): string => {
    const validBytes = bytes && bytes > 0 ? bytes : Math.floor(Math.random() * 400000) + 150000
    const kb = Math.round(validBytes / 1024)
    return `${kb.toLocaleString()} KB`
  }

  // ---------------------------------------------------------------------------
  // ARCHIVE MANAGER FUNCTIONS (BULK FILE HANDLING & PREVIEW)
  // ---------------------------------------------------------------------------
  const handleFilesAdded = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const newItems: StagedArchiveFile[] = fileArray.map((file, idx) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || ''
      let category: 'pdf' | 'csv' | 'image' | 'data' = 'data'
      if (['pdf', 'doc', 'docx'].includes(extension)) category = 'pdf'
      else if (['csv', 'xlsx', 'xls', 'json', 'nc', 'netcdf'].includes(extension)) category = 'csv'
      else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(extension)) category = 'image'

      const previewUrl = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : '/placeholder-user.jpg'

      return {
        id: `file-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        size: file.size > 0 ? file.size : Math.floor(Math.random() * 400000) + 150000,
        type: file.type || extension.toUpperCase(),
        category,
        previewUrl,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        station: archiveStation,
        expedition: archiveExpeditionInput || '44-IAE Antarctic Expedition',
      }
    })

    setStagedFiles((prev) => [...prev, ...newItems])
    showNotice(`Staged ${newItems.length} new document(s). Total files in queue: ${stagedFiles.length + newItems.length}`)
  }

  // Pre-populate 10+ realistic demo files for testing bulk upload
  const loadDemoBulkFiles = () => {
    const demoFiles: StagedArchiveFile[] = [
      {
        id: 'demo-1',
        name: '44_IAE_Glaciology_Firn_Core_Analysis.pdf',
        size: 4820100,
        type: 'PDF Document',
        category: 'pdf',
        previewUrl: '/placeholder-user.jpg',
        title: '44-IAE Glaciological Firn Core Isotope Report',
        station: archiveStation,
        expedition: archiveExpeditionInput,
      },
      {
        id: 'demo-2',
        name: 'Bharati_AWS_Continuous_Barometric_Pressure_2026.csv',
        size: 1420800,
        type: 'CSV Dataset',
        category: 'csv',
        previewUrl: '/placeholder-user.jpg',
        title: 'Bharati Station Atmospheric Pressure Timeseries',
        station: archiveStation,
        expedition: archiveExpeditionInput,
      },
      {
        id: 'demo-3',
        name: 'Bharati_Station_Winter_Traverse_Larsemann.jpg',
        size: 3280400,
        type: 'JPEG Image',
        category: 'image',
        previewUrl: '/antarctic-station.png',
        title: 'Bharati Observatory Winter Traverse Photography',
        station: archiveStation,
        expedition: archiveExpeditionInput,
      },
      {
        id: 'demo-4',
        name: 'Maitri_Schirmacher_Oasis_AWS_Windspeed.csv',
        size: 980100,
        type: 'CSV Dataset',
        category: 'csv',
        previewUrl: '/placeholder-user.jpg',
        title: 'Maitri Schirmacher Oasis Windspeed Log (AWS)',
        station: archiveStation,
        expedition: archiveExpeditionInput,
      },
      {
        id: 'demo-5',
        name: 'Research_Vessel_Southern_Ocean_Break.png',
        size: 4120900,
        type: 'PNG Image',
        category: 'image',
        previewUrl: '/antarctic-vessel.png',
        title: 'Southern Ocean Research Vessel Icebreaking Traverse',
        station: archiveStation,
        expedition: archiveExpeditionInput,
      },
      {
        id: 'demo-6',
        name: 'Himadri_Arctic_Aerosol_Optical_Depth_2026.pdf',
        size: 2950300,
        type: 'PDF Document',
        category: 'pdf',
        previewUrl: '/placeholder-user.jpg',
        title: 'Himadri Arctic Atmospheric Aerosol Monograph',
        station: archiveStation,
        expedition: archiveExpeditionInput,
      },
      {
        id: 'demo-7',
        name: 'Himansh_Himalayan_Cryosphere_Mass_Balance.csv',
        size: 1890200,
        type: 'CSV Dataset',
        category: 'csv',
        previewUrl: '/placeholder-user.jpg',
        title: 'Himansh Observatory Spiti Glacier Mass Balance',
        station: archiveStation,
        expedition: archiveExpeditionInput,
      },
      {
        id: 'demo-8',
        name: 'Polar_Sky_Aurora_Observation_Bharati.jpg',
        size: 5120400,
        type: 'JPEG Image',
        category: 'image',
        previewUrl: '/ice-sheet.png',
        title: 'Polar Aurora Borealis Field Photography',
        station: archiveStation,
        expedition: archiveExpeditionInput,
      },
      {
        id: 'demo-9',
        name: 'NCPOR_Declassified_Monograph_Series_Vol44.pdf',
        size: 8910000,
        type: 'PDF Document',
        category: 'pdf',
        previewUrl: '/placeholder-user.jpg',
        title: 'Official NCPOR Declassified Expedition Monograph',
        station: archiveStation,
        expedition: archiveExpeditionInput,
      },
      {
        id: 'demo-10',
        name: 'Southern_Ocean_CTD_Hydrography_Series.csv',
        size: 2310500,
        type: 'CSV Dataset',
        category: 'csv',
        previewUrl: '/placeholder-user.jpg',
        title: 'Southern Ocean CTD Hydrography Profile Data',
        station: archiveStation,
        expedition: archiveExpeditionInput,
      },
      {
        id: 'demo-11',
        name: 'Skua_Wildlife_Telemetry_Larsemann.png',
        size: 1980300,
        type: 'PNG Image',
        category: 'image',
        previewUrl: '/antarctic-station.png',
        title: 'Skua Wildlife Field Telemetry Photography',
        station: archiveStation,
        expedition: archiveExpeditionInput,
      },
    ]

    setStagedFiles(demoFiles)
    showNotice('Loaded 11 verified polar scientific documents into Archive Queue!')
  }

  const removeStagedFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const submitArchiveForApproval = async () => {
    setIsPublishing(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsPublishing(false)
    
    const newItem: PendingApprovalType = {
      id: `pending-${Date.now()}`,
      type: 'archive',
      title: `Bulk Document Upload: ${archiveExpeditionInput}`,
      subtitle: `Station: ${archiveStation} | Category: ${archiveCategory}`,
      timestamp: new Date().toLocaleString(),
      content: [...stagedFiles],
    }
    setPendingApprovals((prev) => [newItem, ...prev])
    setPublishSuccess(true)
    
    setTimeout(() => {
      setPublishSuccess(false)
      setShowPreviewModal(false)
      setStagedFiles([])
      showNotice('Documents submitted for Declassification & Official Approval!')
    }, 1200)
  }

  const handleApprovalAction = (id: string, action: 'approve' | 'reject') => {
    setPendingApprovals(prev => prev.filter(p => p.id !== id))
    if (action === 'approve') {
      showNotice('Content Officially Approved & Published to Live Website!')
    } else {
      showNotice('Content Rejected & Removed from Queue.')
    }
  }

  const handleGenerateDraft = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeExpedition.name,
          expedition_id: activeExpedition.id,
          report_id: activeExpedition.id,
          channel: disseminationChannel,
          language: language,
          target_audience: targetAudience,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.drafted_text) {
          setContent(data.drafted_text)
          showNotice('Official Dissemination Draft generated successfully!')
          return
        }
      }
    } catch (err) {
      console.warn('Backend fallback notice:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    showNotice('Draft content copied to clipboard!')
  }

  const counts = useMemo(() => {
    const pdfs = stagedFiles.filter((f) => f.category === 'pdf').length
    const csvs = stagedFiles.filter((f) => f.category === 'csv').length
    const images = stagedFiles.filter((f) => f.category === 'image').length
    return { pdfs, csvs, images, total: stagedFiles.length }
  }, [stagedFiles])

  // Strict Validation: Preview and Approval are ONLY enabled when all required details are filled
  const isArchiveFormComplete = useMemo(() => {
    const hasStation = Boolean(archiveStation && archiveStation.trim() !== '')
    const hasExpedition = Boolean(archiveExpeditionInput && archiveExpeditionInput.trim() !== '')
    const hasDiscipline = Boolean(archiveCategory && archiveCategory.trim() !== '')
    const hasFiles = stagedFiles.length > 0

    const isValid = hasStation && hasExpedition && hasDiscipline && hasFiles

    const missingFields: string[] = []
    if (!hasStation) missingFields.push('Target Station')
    if (!hasExpedition) missingFields.push('Expedition Hub Name')
    if (!hasDiscipline) missingFields.push('Scientific Discipline')
    if (!hasFiles) missingFields.push('At least 1 Document / File Upload')

    return {
      isValid,
      hasStation,
      hasExpedition,
      hasDiscipline,
      hasFiles,
      missingFields,
    }
  }, [archiveStation, archiveExpeditionInput, archiveCategory, stagedFiles])

  return (
    <div className="min-h-screen bg-transparent font-sans transition-colors duration-300">
      {/* 1. Official Government Double Header Bar matching main site Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 shadow-xs font-sans transition-all transition-colors duration-300">
        {/* Top Ministry Bar */}
        <div className="bg-brand-navy text-white">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-8 py-1 text-[11px] tracking-wide">
            <div className="flex items-center gap-3 uppercase font-medium">
              <span className="font-bold flex items-center gap-1.5 text-amber-300 drop-shadow-xs">
                <Shield className="w-3.5 h-3.5 text-amber-300" /> सत्यमेव जयते | INDIA
              </span>
              <span className="h-3 w-px bg-white/20" />
              <span className="text-slate-200 font-semibold">MINISTRY OF EARTH SCIENCES (MoES)</span>
              <span className="hidden md:inline text-slate-400">|</span>
              <span className="hidden md:inline text-slate-300 text-[10px] tracking-normal">
                NATIONAL CENTRE FOR POLAR AND OCEAN RESEARCH (NCPOR)
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer border border-white/20"
                title="Toggle Language / भाषा बदलें"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-300" />
                <span className={currentLang === 'en' ? 'text-amber-300 font-bold' : 'text-slate-300'}>English</span>
                <span className="text-white/40">/</span>
                <span className={currentLang === 'hi' ? 'text-amber-300 font-bold' : 'text-slate-300'}>हिन्दी</span>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main Header Bar with matching Logo & Nav Links */}
        <div className="bg-white/95 border-b border-slate-200 transition-colors duration-300">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-8 py-2 min-h-[72px]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden text-slate-700 hover:text-slate-900 transition-colors duration-300"
                aria-label="Toggle navigation"
              >
                <Menu size={20} />
              </button>

              <Link href="/" prefetch={true} className="flex items-center group py-0.5">
                <img
                  src="/polarium-logo.png"
                  alt="POLARIUM Logo"
                  className="h-14 sm:h-16 md:h-18 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03] drop-shadow-xs"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links for Admin Modules */}
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
              {navItems.map(({ id, label }) => {
                const isActive = activeNavTab === id
                return (
                  <button
                    key={id}
                    onClick={() => setActiveNavTab(id as any)}
                    className={`px-4 py-2 rounded-sm transition-all duration-200 relative cursor-pointer ${ isActive ? 'bg-slate-100/90 text-brand-navy font-bold border-b-2 border-brand-navy shadow-xs' : 'text-slate-700 hover:text-brand-navy hover:bg-slate-50' }`}
                  >
                    <span>{label}</span>
                  </button>
                )
              })}
            </nav>

            <div className="flex items-center gap-3 text-xs font-semibold">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-brand-navy bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-sm font-bold transition-all transition-colors duration-300"
              >
                <ArrowLeft size={14} /> Back to Portal
              </Link>
              <div className="flex size-8 items-center justify-center rounded-full bg-brand-navy text-amber-300 shadow-xs">
                <UserRound size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown for Admin Modules */}
        {mobileNavOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-1 text-xs font-semibold shadow-md transition-colors duration-300">
            {navItems.map(({ id, label }) => {
              const isActive = activeNavTab === id
              return (
                <button
                  key={id}
                  onClick={() => {
                    setActiveNavTab(id as any)
                    setMobileNavOpen(false)
                  }}
                  className={`w-full px-3 py-2 rounded-sm transition-all text-left font-bold cursor-pointer ${ isActive ? 'bg-slate-100 text-brand-navy border-l-4 border-brand-navy' : 'text-slate-700 hover:bg-slate-50' }`}
                >
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        )}
      </header>

      {/* 2. Full-Width Workspace Body (Side Navbar Removed) */}
      <div className="min-h-[calc(100vh-3.5rem)] bg-slate-100 transition-colors duration-300">
        <main className="w-full overflow-x-hidden">
          {notice && (
            <div className="bg-brand-navy text-white text-xs px-4 py-2.5 font-bold flex items-center justify-between border-b border-amber-400/40 shadow-sm animate-fade-in">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                {notice}
              </span>
              <button onClick={() => setNotice('')} className="hover:text-amber-300">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="mx-auto max-w-[1440px] p-4 sm:p-6 pb-24 space-y-6">

            {/* =================================================================== */}
            {/* MODULE 1: ARCHIVE MANAGER (DYNAMIC BULK UPLOADER & PREVIEW VERIFICATION) */}
            {/* =================================================================== */}
            {activeNavTab === 'archive' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Title Bar */}
                <div className="border-b border-slate-300 pb-4 transition-colors duration-300">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-navy uppercase tracking-wider mb-1 transition-colors duration-300">
                    <Archive className="w-4 h-4 text-amber-500" />
                    <span>National Polar Registry Ingestion Manager</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-brand-navy transition-colors duration-300">
                    Archive Manager &amp; Document Ingestion Studio
                  </h1>
                  <p className="text-xs text-slate-600 mt-1 max-w-4xl leading-relaxed">
                    Upload PDF monographs, CSV datasets, and photo archives. Select target station and expedition hub to stage files. Preview how your submissions appear in Knowledge Repository, Media Gallery &amp; Polar Hub before official publication.
                  </p>
                </div>

                {/* Form Controls Grid */}
                <div className="bg-white border border-slate-300 rounded-sm p-5 shadow-xs space-y-4 transition-colors duration-300">
                  <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2 transition-colors duration-300">
                    <FolderPlus className="w-4 h-4 text-cyan-600" />
                    1. Station &amp; Expedition Metadata Configuration
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Station Select */}
                    <div className="md:col-span-4">
                      <label htmlFor="archive-station-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 transition-colors duration-300">
                        Select Target Station:
                      </label>
                      <select
                        id="archive-station-select"
                        value={archiveStation}
                        onChange={(e) => setArchiveStation(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-navy cursor-pointer transition-colors duration-300"
                      >
                        <option value="Bharati">Bharati Station (Larsemann Hills, Antarctica)</option>
                        <option value="Maitri">Maitri Station (Schirmacher Oasis, Antarctica)</option>
                        <option value="Himadri">Himadri Base (Ny-Ålesund, Arctic)</option>
                        <option value="Himansh">Himansh Observatory (Chandra Basin, Himalaya)</option>
                        <option value="SouthernOcean">Southern Ocean Expedition Fleet</option>
                      </select>
                    </div>

                    {/* Expedition Input */}
                    <div className="md:col-span-5">
                      <label htmlFor="archive-expedition-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 transition-colors duration-300">
                        Expedition Hub (Type or Select):
                      </label>
                      <input
                        id="archive-expedition-input"
                        type="text"
                        value={archiveExpeditionInput}
                        onChange={(e) => setArchiveExpeditionInput(e.target.value)}
                        placeholder="e.g. 44th Indian Scientific Expedition to Antarctica (44-IAE)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-navy focus:bg-white placeholder:text-slate-400 placeholder:font-normal transition-colors duration-300"
                      />
                    </div>

                    {/* Category Selector */}
                    <div className="md:col-span-3">
                      <label htmlFor="archive-category-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 transition-colors duration-300">
                        Scientific Discipline:
                      </label>
                      <select
                        id="archive-category-select"
                        value={archiveCategory}
                        onChange={(e) => setArchiveCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-sm text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-navy cursor-pointer transition-colors duration-300"
                      >
                        <option>Glaciology &amp; Telemetry</option>
                        <option>Atmospheric Science</option>
                        <option>Oceanography &amp; CTD</option>
                        <option>Polar Expeditions Archive</option>
                        <option>Field Documentation Photography</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bulk Multi-File Upload Drag & Drop Zone */}
                <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-xs space-y-4 transition-colors duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2 transition-colors duration-300">
                    <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2 transition-colors duration-300">
                      <UploadCloud className="w-4 h-4 text-blue-600" />
                      2. Bulk Multi-File Document Ingestion Space (Supports 10+ Documents)
                    </h2>

                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-sm border border-slate-200 transition-colors duration-300">
                      {counts.total} Files Staged
                    </span>
                  </div>

                  {/* Dropzone Area */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragOver(true)
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDragOver(false)
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleFilesAdded(e.dataTransfer.files)
                      }
                    }}
                    className={`border-2 border-dashed rounded-sm p-8 text-center transition-all cursor-pointer ${ isDragOver ? 'border-brand-navy bg-blue-50/80 scale-[1.01]' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80' }`}
                  >
                    <input
                      type="file"
                      id="bulk-archive-file-input"
                      multiple
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFilesAdded(e.target.files)
                        }
                      }}
                      className="hidden"
                    />

                    <label htmlFor="bulk-archive-file-input" className="cursor-pointer space-y-3 block">
                      <div className="mx-auto size-12 rounded-full bg-brand-navy/10 flex items-center justify-center text-brand-navy transition-colors duration-300">
                        <UploadCloud className="w-6 h-6 text-brand-navy transition-colors duration-300" />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800 transition-colors duration-300">
                          <span className="text-brand-navy underline transition-colors duration-300">Click to browse</span> or drag and drop 10+ documents here
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Supports PDF Monographs, CSV Weather Telemetry, High-Res Expedition Photography (PNG/JPG), and NetCDF Datasets.
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-3 pt-2">
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-xs">.PDF Monographs</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-xs">.CSV Telemetry</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-xs">.JPG/.PNG Photos</span>
                      </div>
                    </label>
                  </div>

                  {/* File Queue List */}
                  {stagedFiles.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 transition-colors duration-300">
                          Staged Document Queue ({counts.total} Items):
                        </h3>
                        <button
                          onClick={() => setStagedFiles([])}
                          className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Clear Queue
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                        {stagedFiles.map((item) => (
                          <div
                            key={item.id}
                            className="bg-slate-50 border border-slate-200 rounded-sm p-3 flex items-start gap-3 relative group hover:border-brand-navy transition-colors"
                          >
                            <div className="shrink-0 size-9 rounded-xs bg-white border border-slate-200 flex items-center justify-center overflow-hidden transition-colors duration-300">
                              {item.category === 'pdf' ? (
                                <FileText className="w-5 h-5 text-red-600" />
                              ) : item.category === 'csv' ? (
                                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 text-xs space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-slate-900 truncate transition-colors duration-300">{item.title}</span>
                                <span className="text-[10px] font-mono text-slate-500 font-bold shrink-0 bg-white border border-slate-200 px-1.5 py-0.5 rounded-xs transition-colors duration-300">
                                  {formatKB(item.size)}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono truncate">{item.name}</p>
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[9px] font-bold uppercase rounded-xs transition-colors duration-300">
                                  {item.category}
                                </span>
                                <span className="text-[10px] text-slate-600 font-medium truncate">
                                  Target: {item.station}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => removeStagedFile(item.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Verification & Strict Form Validation Banner */}
                  <div className={`p-4 rounded-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${ isArchiveFormComplete.isValid ? 'bg-gradient-to-r from-blue-50 via-emerald-50 to-blue-50 border-emerald-300' : 'bg-amber-50/90 border-amber-300' }`}>
                    <div className="flex items-start gap-2.5 text-xs text-slate-800 transition-colors duration-300">
                      {isArchiveFormComplete.isValid ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-extrabold text-brand-navy flex items-center gap-2 transition-colors duration-300">
                          <span>Verification &amp; Preview Gated Checklist</span>
                          {isArchiveFormComplete.isValid ? (
                            <span className="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-bold rounded-xs uppercase">
                              All Requirements Complete ✓
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold rounded-xs uppercase">
                              Complete Required Fields
                            </span>
                          )}
                        </p>

                        {isArchiveFormComplete.isValid ? (
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            All metadata and files ready! Click Preview to inspect layout mockups across Knowledge Repository, Media Gallery &amp; Polar Hub.
                          </p>
                        ) : (
                          <div className="text-[11px] text-slate-700 mt-1 space-y-1 transition-colors duration-300">
                            <p className="font-semibold text-amber-900">
                              Please complete all required details before enabling Preview &amp; Approval:
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {isArchiveFormComplete.missingFields.map((field) => (
                                <span key={field} className="px-2 py-0.5 bg-amber-200/80 text-amber-950 font-bold text-[10px] rounded border border-amber-300">
                                  ❌ Missing: {field}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowPreviewModal(true)}
                      disabled={!isArchiveFormComplete.isValid}
                      className="w-full sm:w-auto bg-brand-navy hover:bg-[#0b3b6f] text-white px-5 py-2.5 rounded-sm text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    >
                      <Eye className="w-4 h-4 text-amber-300" />
                      <span>Preview &amp; Verify Layout ({counts.total})</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* MODULE 2: OUTREACH STUDIO MODULE */}
            {/* =================================================================== */}
            {activeNavTab === 'outreach' && (
              <div className="space-y-6 animate-fade-in">
                {/* Page Title */}
                <div className="flex items-end justify-between border-b border-slate-200 pb-3 transition-colors duration-300">
                  <div>
                    <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Official MoES Government Communications Hub
                    </p>
                    <h1 className="text-xl font-bold tracking-tight text-brand-navy transition-colors duration-300">
                      Outreach Studio
                    </h1>
                  </div>
                </div>

                {/* SECTION 1: CAMPAIGN CONFIGURATION */}
                <section className="mb-4 border border-slate-300 bg-white rounded-sm transition-colors duration-300">
                  <div className="flex items-center gap-2 border-b border-slate-300 px-4 py-2.5 bg-slate-50 transition-colors duration-300">
                    <span className="flex size-5 items-center justify-center rounded-sm bg-brand-navy text-[10px] font-bold text-white">
                      1
                    </span>
                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide transition-colors duration-300">
                      1. Campaign Configuration
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4">
                    {/* Station Dropdown */}
                    <label className="flex flex-col gap-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider transition-colors duration-300">
                      Station:
                      <div className="relative mt-0.5">
                        <select
                          value={selectedStation}
                          onChange={(e) => setSelectedStation(e.target.value)}
                          disabled={isGenerating}
                          className="h-9 w-full appearance-none rounded-sm border border-slate-300 bg-white px-2.5 pr-8 text-xs font-semibold text-slate-900 outline-none focus:border-brand-navy disabled:opacity-60 cursor-pointer transition-colors duration-300"
                        >
                          {STATION_OPTIONS.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={14}
                        />
                      </div>
                    </label>

                    {/* Filtered Expedition Hub Dropdown */}
                    <label className="flex flex-col gap-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider transition-colors duration-300">
                      Expedition Hub:
                      <div className="relative mt-0.5">
                        <select
                          value={selectedExpId}
                          onChange={(e) => setSelectedExpId(e.target.value)}
                          disabled={isGenerating}
                          className="h-9 w-full appearance-none rounded-sm border border-slate-300 bg-white px-2.5 pr-8 text-xs font-semibold text-slate-900 outline-none focus:border-brand-navy disabled:opacity-60 cursor-pointer transition-colors duration-300"
                        >
                          {filteredExpeditions.map((exp) => (
                            <option key={exp.id} value={exp.id}>
                              {exp.id.toUpperCase()}: {exp.short_name} ({exp.year})
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={14}
                        />
                      </div>
                    </label>

                    {/* Dissemination Channel */}
                    <label className="flex flex-col gap-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider transition-colors duration-300">
                      Channel:
                      <div className="relative mt-0.5">
                        <select
                          value={disseminationChannel}
                          onChange={(e) => setDisseminationChannel(e.target.value)}
                          disabled={isGenerating}
                          className="h-9 w-full appearance-none rounded-sm border border-slate-300 bg-white px-2.5 pr-8 text-xs font-semibold text-slate-900 outline-none focus:border-brand-navy disabled:opacity-60 cursor-pointer transition-colors duration-300"
                        >
                          {channelOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={14}
                        />
                      </div>
                    </label>

                    {/* Target Audience */}
                    <label className="flex flex-col gap-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider transition-colors duration-300">
                      Target Audience:
                      <div className="relative mt-0.5">
                        <select
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          disabled={isGenerating}
                          className="h-9 w-full appearance-none rounded-sm border border-slate-300 bg-white px-2.5 pr-8 text-xs font-semibold text-slate-900 outline-none focus:border-brand-navy disabled:opacity-60 cursor-pointer transition-colors duration-300"
                        >
                          {audienceOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={14}
                        />
                      </div>
                    </label>

                    {/* Language */}
                    <label className="flex flex-col gap-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider transition-colors duration-300">
                      Language / Bhashini:
                      <div className="relative mt-0.5">
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          disabled={isGenerating}
                          className="h-9 w-full appearance-none rounded-sm border border-slate-300 bg-white px-2.5 pr-8 text-xs font-semibold text-slate-900 outline-none focus:border-brand-navy disabled:opacity-60 cursor-pointer transition-colors duration-300"
                        >
                          {languageOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={14}
                        />
                      </div>
                    </label>
                  </div>

                  {/* Action Button Strip */}
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors duration-300">
                    <div className="text-xs text-slate-500">
                      Selected Hub: <strong className="text-slate-800 transition-colors duration-300">{activeExpedition.name}</strong> ({activeExpedition.region})
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateDraft}
                      disabled={isGenerating}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-brand-navy hover:bg-[#0b3b6f] px-5 text-xs font-bold text-white transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Generating Draft...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} className="text-amber-300" />
                          <span>Generate Outreach Release</span>
                        </>
                      )}
                    </button>
                  </div>
                </section>

                {/* SECTION 2 & 3: EDITING & MEDIA ATTACHMENTS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left 2 Cols: Markdown Draft Editor & Preview */}
                  <div className="lg:col-span-2 border border-slate-300 bg-white rounded-sm flex flex-col transition-colors duration-300">
                    <div className="flex items-center justify-between border-b border-slate-300 px-4 py-2 bg-slate-50 transition-colors duration-300">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 items-center justify-center rounded-sm bg-brand-navy text-[10px] font-bold text-white">
                          2
                        </span>
                        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide transition-colors duration-300">
                          Draft Review &amp; Dissemination Text
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="bg-slate-200 p-0.5 rounded-xs flex items-center text-xs font-semibold transition-colors duration-300">
                          <button
                            onClick={() => setViewMode('preview')}
                            className={`px-2.5 py-1 rounded-xs flex items-center gap-1 ${ viewMode === 'preview' ? 'bg-brand-navy text-white font-bold' : 'text-slate-700' }`}
                          >
                            <Eye size={12} /> Formatted View
                          </button>
                          <button
                            onClick={() => setViewMode('edit')}
                            className={`px-2.5 py-1 rounded-xs flex items-center gap-1 ${ viewMode === 'edit' ? 'bg-brand-navy text-white font-bold' : 'text-slate-700' }`}
                          >
                            <Edit3 size={12} /> Edit Text
                          </button>
                        </div>

                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1 text-xs text-brand-navy hover:underline font-semibold ml-2 cursor-pointer transition-colors duration-300"
                        >
                          <Copy size={13} /> Copy All
                        </button>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col min-h-[380px]">
                      {viewMode === 'preview' ? (
                        <div className="flex-1 w-full bg-slate-50/70 border border-slate-200 rounded-sm p-4 overflow-y-auto max-h-[460px] text-xs leading-relaxed text-slate-800 space-y-3 font-sans transition-colors duration-300">
                          <ReactMarkdown
                            components={{
                              h1: ({ node, ...props }) => (
                                <h1 className="text-base font-black text-brand-navy border-b border-slate-200 pb-1.5 mb-2 transition-colors duration-300" {...props} />
                              ),
                              h2: ({ node, ...props }) => (
                                <h2 className="text-sm font-bold text-brand-navy mt-3 mb-1 transition-colors duration-300" {...props} />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mt-2 mb-1 transition-colors duration-300" {...props} />
                              ),
                              p: ({ node, ...props }) => (
                                <p className="text-xs text-slate-700 leading-relaxed mb-2 transition-colors duration-300" {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc pl-4 space-y-1 mb-2 text-xs text-slate-700 transition-colors duration-300" {...props} />
                              ),
                            }}
                          >
                            {content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows={16}
                          className="w-full flex-1 p-3 border border-slate-300 rounded-sm font-mono text-xs leading-relaxed text-slate-800 outline-none focus:border-brand-navy resize-y transition-colors duration-300"
                          placeholder="Generated draft will appear here..."
                        />
                      )}

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span>Characters: {content.length} | Lines: {content.split('\n').length}</span>
                        <span className="font-semibold text-emerald-700">Strict Channel: {disseminationChannel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right 1 Col: Media Assets Attachments */}
                  <div className="border border-slate-300 bg-white rounded-sm flex flex-col transition-colors duration-300">
                    <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5 bg-slate-50 transition-colors duration-300">
                      <span className="flex size-5 items-center justify-center rounded-sm bg-brand-navy text-[10px] font-bold text-white">
                        3
                      </span>
                      <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide transition-colors duration-300">
                        Attached Media Assets
                      </h2>
                    </div>

                    <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                      <p className="text-[11px] text-slate-500">
                        Select official NCPOR photography to bundle with the release:
                      </p>

                      <div className="space-y-2">
                        {attachedMediaAssets.map((media) => {
                          const isSelected = selectedMedia.includes(media.url.split('/').pop() || '')
                          return (
                            <div
                              key={media.id}
                              onClick={() => toggleMedia(media.url.split('/').pop() || '')}
                              className={`flex items-center gap-3 p-2 border rounded-sm cursor-pointer transition-colors ${ isSelected ? 'border-brand-navy bg-blue-50/60' : 'border-slate-200 bg-white hover:bg-slate-50' }`}
                            >
                              <div className="size-10 bg-slate-100 rounded-xs overflow-hidden shrink-0 border border-slate-200 transition-colors duration-300">
                                <img
                                  src={media.url}
                                  alt={media.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0 text-xs">
                                <p className="font-bold text-slate-800 truncate transition-colors duration-300">
                                  {media.title.split('-').pop()?.trim()}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {media.category} · {media.region}
                                </p>
                              </div>

                              <div className={`size-4 rounded-xs border flex items-center justify-center ${ isSelected ? 'bg-brand-navy border-brand-navy text-white' : 'border-slate-300' }`}>
                                {isSelected && <Check size={11} />}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-200 transition-colors duration-300">
                      <button
                        onClick={() => {
                          const newItem: PendingApprovalType = {
                            id: `pending-${Date.now()}`,
                            type: 'outreach',
                            title: `Draft Release: ${activeExpedition.name}`,
                            subtitle: `Channel: ${disseminationChannel} | Audience: ${targetAudience}`,
                            timestamp: new Date().toLocaleString(),
                            content,
                            media: selectedMedia
                          }
                          setPendingApprovals(prev => [newItem, ...prev])
                          setContent('')
                          setSelectedMedia([])
                          showNotice('Draft submitted for Official Approval!')
                        }}
                        className="w-full flex items-center justify-center gap-1.5 rounded-sm bg-brand-navy hover:bg-[#0b3b6f] text-white py-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Send size={13} />
                        <span>Submit for Approval</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* MODULE 3: DASHBOARD OVERVIEW MODULE (3-CARD GRID & EXPEDITION DETAIL VIEW) */}
            {/* =================================================================== */}
            {activeNavTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                {!viewingExpedition ? (
                  // -----------------------------------------------------------------
                  // VIEW 1: 3-CARD ROW EXPEDITION GRID (MATCHING IMAGE 1)
                  // -----------------------------------------------------------------
                  <div className="space-y-6">
                    {/* Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-300 pb-4 gap-3 transition-colors duration-300">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-brand-navy uppercase tracking-wider mb-1 transition-colors duration-300">
                          <Compass className="w-4 h-4 text-cyan-600" />
                          <span>POLARIUM National Polar Registry</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-brand-navy transition-colors duration-300">
                          Indian Scientific Expeditions Directory
                        </h1>
                        <p className="text-xs text-slate-600 mt-1">
                          Browse all registered expeditions across Antarctica, the Arctic, and the Himalayas. Click &quot;View Expedition →&quot; to inspect full voyage dossiers, scientific reports, datasets, and photo media.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="bg-brand-navy text-white px-3 py-1.5 rounded-sm text-xs font-bold font-mono">
                          {expeditions.length} Active Expeditions
                        </span>
                      </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-4 border border-slate-300 rounded-sm shadow-xs flex items-center justify-between transition-colors duration-300">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Expeditions</p>
                          <p className="text-2xl font-black text-brand-navy mt-0.5 transition-colors duration-300">{expeditions.length}</p>
                          <span className="text-[10px] text-emerald-700 font-bold">100% Declassified</span>
                        </div>
                        <Compass className="w-8 h-8 text-blue-600/30" />
                      </div>

                      <div className="bg-white p-4 border border-slate-300 rounded-sm shadow-xs flex items-center justify-between transition-colors duration-300">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Published Reports</p>
                          <p className="text-2xl font-black text-brand-navy mt-0.5 transition-colors duration-300">{allDocuments.length}</p>
                          <span className="text-[10px] text-blue-700 font-bold">Peer-Reviewed Monograph</span>
                        </div>
                        <FileText className="w-8 h-8 text-cyan-600/30" />
                      </div>

                      <div className="bg-white p-4 border border-slate-300 rounded-sm shadow-xs flex items-center justify-between transition-colors duration-300">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ingested Datasets</p>
                          <p className="text-2xl font-black text-brand-navy mt-0.5 transition-colors duration-300">{allDatasets.length}</p>
                          <span className="text-[10px] text-emerald-700 font-bold">AWS &amp; NetCDF Streams</span>
                        </div>
                        <FileSpreadsheet className="w-8 h-8 text-emerald-600/30" />
                      </div>

                      <div className="bg-white p-4 border border-slate-300 rounded-sm shadow-xs flex items-center justify-between transition-colors duration-300">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Media Gallery Assets</p>
                          <p className="text-2xl font-black text-brand-navy mt-0.5 transition-colors duration-300">{allMediaAssets.length}</p>
                          <span className="text-[10px] text-amber-700 font-bold">Vector Match: 1.000</span>
                        </div>
                        <ImageIcon className="w-8 h-8 text-amber-600/30" />
                      </div>
                    </div>

                    {/* CATEGORY CLASSIFICATION FILTER & KEYWORD SEARCH BAR (MATCHING USER IMAGE) */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-slate-300 rounded-lg shadow-xs transition-colors duration-300">
                      {/* Category Filter Pills */}
                      <div className="bg-slate-100/80 border border-slate-300 rounded-md p-1 flex items-center gap-1 overflow-x-auto shrink-0 transition-colors duration-300">
                        {(['All', 'Antarctica', 'Arctic', 'Himalaya'] as const).map((region) => {
                          const isActive = dashboardRegionFilter === region
                          return (
                            <button
                              key={region}
                              onClick={() => {
                                setDashboardRegionFilter(region)
                                setDashboardPage(1)
                              }}
                              className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer ${ isActive ? 'bg-brand-navy text-white shadow-xs font-extrabold' : 'text-brand-navy hover:bg-slate-200/70 font-bold' }`}
                            >
                              {region}
                            </button>
                          )
                        })}
                      </div>

                      {/* Search Input Box */}
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        <input
                          type="text"
                          value={dashboardSearchQuery}
                          onChange={(e) => {
                            setDashboardSearchQuery(e.target.value)
                            setDashboardPage(1)
                          }}
                          placeholder="Filter hub by keyword or ID..."
                          className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all transition-colors duration-300"
                        />
                        {dashboardSearchQuery && (
                          <button
                            onClick={() => {
                              setDashboardSearchQuery('')
                              setDashboardPage(1)
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Empty Search Fallback */}
                    {filteredDashboardExpeditions.length === 0 && (
                      <div className="bg-white border border-slate-300 rounded-lg p-8 text-center space-y-3 transition-colors duration-300">
                        <Compass className="w-10 h-10 text-slate-400 mx-auto" />
                        <h3 className="text-sm font-bold text-slate-800 transition-colors duration-300">No Expeditions Found</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          No registered scientific expeditions match your filter selection or search query.
                        </p>
                        <button
                          onClick={() => {
                            setDashboardRegionFilter('All')
                            setDashboardSearchQuery('')
                            setDashboardPage(1)
                          }}
                          className="px-4 py-2 bg-brand-navy text-white text-xs font-bold rounded-md hover:bg-[#0b3b6f] cursor-pointer"
                        >
                          Reset Filters &amp; View All
                        </button>
                      </div>
                    )}

                    {/* 3-CARD GRID ROW DISPLAYING 6 CARDS PER PAGE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {paginatedExpeditions.map((exp, idx) => {
                        // Find the best photography image specifically for this expedition
                        const matchedMedia = allMediaAssets.find(
                          (m) =>
                            m.expedition_id === exp.id ||
                            (exp.short_name && m.expedition_name.toLowerCase().includes(exp.short_name.toLowerCase()))
                        )
                        const heroImage =
                          matchedMedia && matchedMedia.url
                            ? matchedMedia.url
                            : exp.region === 'Arctic'
                            ? '/ice-sheet.png'
                            : exp.region === 'Himalaya'
                            ? '/antarctic-station.png'
                            : exp.expedition_number % 2 === 0
                            ? '/antarctic-station.png'
                            : '/antarctic-vessel.png'

                        const code = exp.short_name || `${exp.expedition_number}-IAE`
                        const focusTags = exp.keywords && exp.keywords.length > 0
                          ? exp.keywords.slice(0, 4)
                          : ['Glaciology', 'Atmospheric Physics', 'Geodesy', 'Cryospheric Geobiology']

                        return (
                          <div
                            key={exp.id}
                            className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1 transition-colors"
                          >
                            {/* Card Hero Header Image with Badges (Matching Image 1) */}
                            <div className="h-52 bg-slate-900 relative overflow-hidden shrink-0">
                              <img
                                src={heroImage}
                                alt={exp.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                              />

                              {/* Badges Bar */}
                              <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                                <span className="bg-brand-navy/90 text-cyan-200 text-[10px] font-extrabold px-2.5 py-1 rounded-sm shadow-xs uppercase">
                                  {exp.region}
                                </span>
                                <span className="bg-slate-900/80 text-slate-200 text-[10px] font-mono font-bold px-2 py-1 rounded-sm shadow-xs">
                                  {exp.year}
                                </span>
                                <span
                                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-sm shadow-xs uppercase ${ exp.status === 'Completed' ? 'bg-emerald-700 text-white' : 'bg-emerald-900/90 text-emerald-300 border border-emerald-500/40' }`}
                                >
                                  {exp.status || 'Under Analysis'}
                                </span>
                              </div>

                              {/* Dark Overlay Gradient with Code & Title */}
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-4 text-white space-y-0.5">
                                <p className="text-[11px] font-mono font-extrabold text-cyan-300 tracking-wider">
                                  {code}
                                </p>
                                <h3 className="text-base font-extrabold leading-snug line-clamp-2 text-white">
                                  {exp.name}
                                </h3>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                {exp.description ||
                                  'Conducted comprehensive glaciological traverse across the Polar Ice Sheet, deployed automated weather buoys, drilled 120m ice cores near Dronning Maud Land, and replenished research station infrastructure.'}
                              </p>

                              <div className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3 font-medium transition-colors duration-300">
                                <p className="flex items-center gap-2 text-slate-800 font-semibold transition-colors duration-300">
                                  <UserRound size={14} className="text-cyan-600 shrink-0" />
                                  <span>Lead: <strong className="text-brand-navy transition-colors duration-300">{exp.chief_scientist || 'Dr. Vikramaditya Sen'}</strong></span>
                                </p>
                                <p className="flex items-center gap-2 text-slate-600">
                                  <Compass size={14} className="text-emerald-600 shrink-0" />
                                  <span className="truncate">
                                    {exp.region === 'Arctic'
                                      ? 'Himadri Base & Svalbard Fleet'
                                      : exp.region === 'Himalaya'
                                      ? 'Himansh High-Altitude Observatory'
                                      : 'Chartered Ice-Class Vessel MV Vasiliy Golovnin & Bharati Station'}
                                  </span>
                                </p>
                                <p className="flex items-center gap-2 text-slate-600">
                                  <Calendar size={14} className="text-amber-600 shrink-0" />
                                  <span>
                                    Duration: 114 Days (Nov {exp.year - 1} - Mar {exp.year})
                                  </span>
                                </p>
                              </div>

                              {/* Research Focus Tags */}
                              <div className="space-y-1 pt-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Research Focus:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {focusTags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-xs border border-slate-200 transition-colors duration-300"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Card Action Footer: Single Primary View Button (NO Download Report per user instruction!) */}
                              <div className="pt-2 border-t border-slate-100">
                                <button
                                  onClick={() => {
                                    setViewingExpedition(exp)
                                    setShowAllReports(false)
                                  }}
                                  className="w-full bg-brand-navy hover:bg-[#0b3b6f] text-white py-2.5 px-4 rounded-lg text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-2 group-hover:bg-[#1c5d9f] cursor-pointer"
                                >
                                  <span>View Expedition</span>
                                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* 6-CARD PAGINATION FOOTER CONTROL */}
                    {totalDashboardPages > 1 && (
                      <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 transition-colors duration-300">
                        <div className="text-xs text-slate-600 font-medium">
                          Showing <strong className="text-brand-navy font-extrabold font-mono transition-colors duration-300">{(dashboardPage - 1) * CARDS_PER_PAGE + 1}</strong> to{' '}
                          <strong className="text-brand-navy font-extrabold font-mono transition-colors duration-300">{Math.min(dashboardPage * CARDS_PER_PAGE, filteredDashboardExpeditions.length)}</strong> of{' '}
                          <strong className="text-brand-navy font-extrabold font-mono transition-colors duration-300">{filteredDashboardExpeditions.length}</strong> Scientific Expeditions
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Previous Button */}
                          <button
                            onClick={() => {
                              setDashboardPage((prev) => Math.max(prev - 1, 1))
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            disabled={dashboardPage === 1}
                            className="px-3.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-brand-navy text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs transition-colors duration-300"
                          >
                            <ChevronLeft size={14} />
                            <span>Prev</span>
                          </button>

                          {/* Page Numbers (1, 2, ...) */}
                          {Array.from({ length: totalDashboardPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => {
                                setDashboardPage(pageNum)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              className={`size-8 rounded-md text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center border ${ dashboardPage === pageNum ? 'bg-brand-navy text-white border-brand-navy shadow-xs scale-105' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-brand-navy' }`}
                            >
                              {pageNum}
                            </button>
                          ))}

                          {/* Next Button */}
                          <button
                            onClick={() => {
                              setDashboardPage((prev) => Math.min(prev + 1, totalDashboardPages))
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            disabled={dashboardPage === totalDashboardPages}
                            className="px-3.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-brand-navy text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs transition-colors duration-300"
                          >
                            <span>Next</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // -----------------------------------------------------------------
                  // VIEW 2: FULL EXPEDITION DETAIL VIEW (MATCHING IMAGES 2, 3, 4)
                  // -----------------------------------------------------------------
                  <div className="space-y-6 animate-fade-in">
                    {/* Back Button */}
                    <button
                      onClick={() => setViewingExpedition(null)}
                      className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-brand-navy px-4 py-2 rounded-sm border border-slate-300 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={15} />
                      <span>Back to All Expeditions</span>
                    </button>

                    {/* HERO HEADER SECTION WITH EXPEDITION REAL PHOTOGRAPHY BACKGROUND */}
                    <div className="bg-brand-dark text-white rounded-xl overflow-hidden shadow-xl relative group min-h-[220px] flex flex-col justify-end">
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-45 transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url('${viewingHeroImage}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/85 to-brand-dark/30" />
                      <div className="relative z-10 p-6 sm:p-8 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-extrabold px-3 py-1 rounded-xs uppercase tracking-wider border border-cyan-400/30">
                            {viewingExpedition.region}
                          </span>
                          <span className="bg-white/10 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-xs border border-white/20">
                            {viewingExpedition.short_name || `${viewingExpedition.expedition_number}-IAE`}
                          </span>
                          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-xs border border-emerald-400/30 uppercase">
                            • {viewingExpedition.status || 'Under Analysis'}
                          </span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white max-w-4xl">
                          {viewingExpedition.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 font-medium pt-2 border-t border-white/10">
                          <span className="flex items-center gap-2">
                            <UserRound size={15} className="text-amber-300" />
                            Lead Scientist: <strong className="text-white">{viewingExpedition.chief_scientist || 'Dr. Vikramaditya Sen'}</strong>
                          </span>
                          <span className="flex items-center gap-2">
                            <Calendar size={15} className="text-amber-300" />
                            114 Days (Nov {viewingExpedition.year - 1} - Mar {viewingExpedition.year})
                          </span>
                          <span className="flex items-center gap-2">
                            <Compass size={15} className="text-amber-300" />
                            Platform: Chartered Ice-Class Vessel MV Vasiliy Golovnin
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* MAIN CONTENT GRID (MATCHING IMAGES 3 & 4) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                      {/* Left Column (8 cols): Summary, Highlights, Reports, Datasets, Media */}
                      <div className="lg:col-span-8 space-y-6">

                        {/* SECTION A: EXPEDITION OVERVIEW */}
                        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-xs space-y-3 transition-colors duration-300">
                          <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider border-b border-slate-200 pb-2 transition-colors duration-300">
                            Expedition Overview &amp; Mission Summary
                          </h2>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium transition-colors duration-300">
                            {viewingExpedition.description}
                          </p>
                          {viewingExpedition.research_summary && (
                            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 border border-slate-200 rounded-sm transition-colors duration-300">
                              {viewingExpedition.research_summary}
                            </p>
                          )}
                        </div>

                        {/* SECTION B: VOYAGE HIGHLIGHTS & FIELD MILESTONES (MATCHING IMAGE 3) */}
                        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-xs space-y-3 transition-colors duration-300">
                          <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider border-b border-slate-200 pb-2 transition-colors duration-300">
                            Voyage Highlights &amp; Field Milestones
                          </h2>

                          <div className="space-y-2.5">
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-semibold text-slate-800 flex items-center gap-3 transition-colors duration-300">
                              <span className="text-amber-500 font-black text-sm">✦</span>
                              <span>Successfully traversed 1,800 km on snow cats across rugged sastrugi terrains</span>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-semibold text-slate-800 flex items-center gap-3 transition-colors duration-300">
                              <span className="text-amber-500 font-black text-sm">✦</span>
                              <span>Discovered anomalous micro-layering in firn cores indicating historic storm regimes</span>
                            </div>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-semibold text-slate-800 flex items-center gap-3 transition-colors duration-300">
                              <span className="text-amber-500 font-black text-sm">✦</span>
                              <span>Zero lost-time safety incidents during extreme -48°C katabatic winds</span>
                            </div>
                          </div>
                        </div>

                        {/* SECTION C: VOYAGE SCIENTIFIC REPORTS (WITH DROPDOWN BUTTON FOR > 2 REPORTS) */}
                        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-xs space-y-4 transition-colors duration-300">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2 transition-colors duration-300">
                            <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2 transition-colors duration-300">
                              <FileText className="w-4 h-4 text-blue-600" />
                              Voyage Scientific Reports ({viewingExpeditionDocs.length})
                            </h2>
                            {viewingExpeditionDocs.length > 2 && (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-xs">
                                {showAllReports
                                  ? `All ${viewingExpeditionDocs.length} Reports Visible`
                                  : `Showing Top 2 (${viewingExpeditionDocs.length - 2} Hidden)`}
                              </span>
                            )}
                          </div>

                          {viewingExpeditionDocs.length === 0 ? (
                            <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-sm text-center text-xs text-slate-500 transition-colors duration-300">
                              No scientific reports published for {viewingExpedition.name} yet. Use Archive Manager to upload PDF monographs.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Primary Reports List (Showing first 2, or all if expanded) */}
                              {(showAllReports ? viewingExpeditionDocs : viewingExpeditionDocs.slice(0, 2)).map((doc, idx) => (
                                <div key={doc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-navy transition-colors">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] font-mono">
                                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-xs">
                                        POL-REP-2024-00{idx + 1}
                                      </span>
                                      <span className="text-slate-500 font-semibold">{doc.doc_type}</span>
                                    </div>
                                    <h3 className="text-xs font-bold text-brand-navy transition-colors duration-300">{doc.title}</h3>
                                    <p className="text-[11px] text-slate-500">Lead: {doc.expedition_name || viewingExpedition.chief_scientist}</p>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      onClick={() => showNotice(`Opened ${doc.title} in Story Studio`)}
                                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xs border border-slate-300 flex items-center gap-1 cursor-pointer transition-colors duration-300"
                                    >
                                      <Tag size={12} className="text-amber-500" /> Story Studio
                                    </button>
                                    <button
                                      onClick={() => showNotice(`Viewing Report: ${doc.title}`)}
                                      className="px-3.5 py-1.5 bg-brand-navy hover:bg-[#0b3b6f] text-white text-xs font-bold rounded-xs flex items-center gap-1 cursor-pointer"
                                    >
                                      <BookOpen size={12} /> Read Report
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {/* Dropdown Button when more than 2 reports exist */}
                              {viewingExpeditionDocs.length > 2 && (
                                <div className="pt-2 border-t border-slate-100 flex justify-center">
                                  <button
                                    onClick={() => setShowAllReports(!showAllReports)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-navy/5 hover:bg-brand-navy/10 text-brand-navy hover:text-[#0b3b6f] px-5 py-2.5 rounded-md text-xs font-extrabold border border-brand-navy/20 transition-all shadow-xs cursor-pointer group transition-colors duration-300"
                                  >
                                    <span>
                                      {showAllReports
                                        ? 'Collapse Reports Menu'
                                        : `Show More Reports (${viewingExpeditionDocs.length - 2} More Available)`}
                                    </span>
                                    <ChevronDown
                                      size={15}
                                      className={`text-brand-navy transition-transform duration-300 ${ showAllReports ? 'rotate-180' : '' }`}
                                    />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* SECTION D: GENERATED OPEN DATASETS (MATCHING IMAGE 4) */}
                        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-xs space-y-4 transition-colors duration-300">
                          <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2 transition-colors duration-300">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            Generated Open Datasets ({viewingExpeditionDatasets.length})
                          </h2>

                          {viewingExpeditionDatasets.length === 0 ? (
                            <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-sm text-center text-xs text-slate-500 transition-colors duration-300">
                              No open dataset streams attached for {viewingExpedition.name} yet. Use Archive Manager to stage CSV telemetry datasets.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {viewingExpeditionDatasets.map((ds) => (
                                <div key={ds.id} className="p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-2 hover:border-emerald-600 transition-colors">
                                  <div className="flex items-center justify-between text-[10px] font-mono">
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-xs">
                                      {ds.dataset_type || 'CSV'}
                                    </span>
                                    <span className="text-slate-500 font-semibold">{ds.row_count?.toLocaleString() || '482,500'} records</span>
                                  </div>
                                  <h3 className="text-xs font-bold text-slate-900 leading-snug transition-colors duration-300">{ds.title}</h3>
                                  <p className="text-[11px] text-slate-600 line-clamp-2">{ds.summary}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* SECTION E: EXPEDITION MEDIA GALLERY (MATCHING IMAGE 4) */}
                        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-xs space-y-4 transition-colors duration-300">
                          <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2 transition-colors duration-300">
                            <ImageIcon className="w-4 h-4 text-amber-500" />
                            Expedition Media Gallery ({viewingExpeditionMedia.length})
                          </h2>

                          {viewingExpeditionMedia.length === 0 ? (
                            <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-sm text-center text-xs text-slate-500 transition-colors duration-300">
                              No photographic media assets uploaded for {viewingExpedition.name} yet. Use Archive Manager to upload expedition photos.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {viewingExpeditionMedia.map((media) => (
                                <div key={media.id} className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-xs hover:shadow-md transition-all space-y-2 p-2 group transition-colors duration-300">
                                  <div className="h-32 bg-slate-100 rounded-xs overflow-hidden relative transition-colors duration-300">
                                    <img src={media.url} alt={media.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    <span className="absolute top-1.5 left-1.5 bg-brand-navy text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase">
                                      {media.region}
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-slate-900 truncate transition-colors duration-300">{media.title}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Right Column (4 cols): Metadata Sidebar */}
                      <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white border border-slate-300 rounded-sm p-6 shadow-xs space-y-4 transition-colors duration-300">
                          <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider border-b border-slate-200 pb-2 transition-colors duration-300">
                            Expedition Metadata
                          </h3>

                          <div className="space-y-3 text-xs">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Expedition Code:</p>
                              <p className="font-mono font-bold text-brand-navy text-sm transition-colors duration-300">
                                {viewingExpedition.short_name || `${viewingExpedition.expedition_number}-IAE`}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Scientific Personnel:</p>
                              <p className="font-bold text-slate-800 transition-colors duration-300">48 Researchers &amp; Field Support</p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Vessel &amp; Base Infrastructure:</p>
                              <p className="font-bold text-slate-800 transition-colors duration-300">MV Vasiliy Golovnin &amp; Bharati Station</p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Vector Index Score:</p>
                              <p className="font-mono font-bold text-emerald-700">1.000 (Active)</p>
                            </div>

                            <div className="pt-3 border-t border-slate-200 transition-colors duration-300">
                              <Link
                                href="/polar-hub"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:underline transition-colors duration-300"
                              >
                                Explore Historical Timeline &rarr;
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================================== */}
            {/* MODULE 4: PENDING APPROVALS MODULE */}
            {/* =================================================================== */}
            {activeNavTab === 'pending' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-300 pb-3 transition-colors duration-300">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-navy transition-colors duration-300">
                    Pending Approvals Queue
                  </h1>
                  <p className="text-xs text-slate-600 mt-1">
                    Review and declassify scientific reports submitted by field teams before they are published to POLARIUM.
                  </p>
                </div>

                {pendingApprovals.length === 0 ? (
                  <div className="bg-white border border-slate-300 rounded-sm p-8 text-center space-y-3 transition-colors duration-300">
                    <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800 transition-colors duration-300">All Submitted Scientific Files Verified</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      There are currently zero pending approval requests in the government queue. All ingested datasets are active in POLARIUM.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingApprovals.map((item) => (
                      <div key={item.id} className="bg-white border border-slate-300 rounded-sm shadow-xs flex flex-col hover:-translate-y-1 hover:shadow-md transition-all animate-fade-in-up transition-colors duration-300">
                        <div className="p-4 border-b border-slate-100 flex-1 flex flex-col">
                           <div className="flex items-center justify-between mb-3">
                             <span className={`px-2 py-0.5 text-[10px] font-bold rounded-xs uppercase tracking-wider ${ item.type === 'archive' ? 'bg-amber-100 text-amber-800' : 'bg-cyan-100 text-cyan-800' }`}>
                               {item.type === 'archive' ? 'Archive Ingestion' : 'Outreach Draft'}
                             </span>
                             <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                           </div>
                           <h3 className="text-sm font-bold text-slate-800 mb-1 leading-snug line-clamp-2 transition-colors duration-300">{item.title}</h3>
                           <p className="text-[11px] text-slate-500 mb-3 line-clamp-1">{item.subtitle}</p>
                           
                           {item.type === 'archive' ? (
                             <div className="mt-auto flex items-center gap-2 text-xs font-mono text-brand-navy bg-slate-50 p-2 rounded-xs border border-slate-200 transition-colors duration-300">
                               <FileDown size={14} />
                               {(item.content as StagedArchiveFile[]).length} Staged Files
                             </div>
                           ) : (
                             <div className="mt-auto text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xs border border-slate-200 line-clamp-3 font-mono transition-colors duration-300">
                               {(item.content as string).substring(0, 120)}...
                             </div>
                           )}
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-2 shrink-0 transition-colors duration-300">
                           <button onClick={() => setPreviewingApproval(item)} className="col-span-2 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white border border-brand-navy/20 text-brand-navy text-xs font-bold rounded-xs hover:bg-slate-100 transition-colors cursor-pointer">
                             <Eye size={14} /> Preview &amp; Review
                           </button>
                           <button onClick={() => handleApprovalAction(item.id, 'reject')} className="col-span-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xs border border-red-200 transition-colors cursor-pointer">
                             <X size={14} /> Reject
                           </button>
                           <button onClick={() => handleApprovalAction(item.id, 'approve')} className="col-span-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xs transition-colors cursor-pointer">
                             <Check size={14} /> Approve
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* LIVE TRI-VIEW PREVIEW VERIFICATION MODAL (SHOWS EXACT REPOSITORY, GALLERY & HUB LAYOUTS) */}
      {/* ========================================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-sm shadow-2xl border border-slate-300 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up transition-colors duration-300">
            
            {/* Modal Top Header Bar */}
            <div className="bg-brand-navy text-white p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-xs">
                  <Shield className="w-4 h-4 text-amber-300" />
                </span>
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-300 uppercase tracking-wider font-bold">
                    <span>POLARIUM Live Website Output Verification</span>
                    <span>•</span>
                    <span>Target Station: {archiveStation}</span>
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white">
                    Official Publishing Preview: {archiveExpeditionInput || 'New Expedition Hub'}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-xs text-amber-300 font-bold border border-white/10">
                  {stagedFiles.length} Uploaded File(s)
                </span>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-slate-300 hover:text-white p-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Tab Switcher: Repository View vs Media Gallery View vs Polar Hub View */}
            <div className="bg-slate-100 border-b border-slate-300 px-4 pt-2.5 flex items-center gap-2 shrink-0 overflow-x-auto transition-colors duration-300">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 shrink-0">
                Live Website Tab View:
              </span>

              {[
                { id: 'repository', label: 'Knowledge Repository View (/knowledge-repository)', icon: BookOpen },
                { id: 'media', label: 'Media Gallery View (/media-gallery)', icon: ImageIcon },
                { id: 'hub', label: 'Polar Hub Workspace View (/polar-hub)', icon: Database },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPreviewTab(tab.id as any)}
                  className={`px-4 py-2 text-xs font-bold rounded-t-sm transition-all flex items-center gap-1.5 cursor-pointer border-t border-x ${ previewTab === tab.id ? 'bg-white text-brand-navy border-slate-300 border-b-transparent shadow-xs' : 'bg-slate-200/70 text-slate-600 border-transparent hover:bg-slate-200' }`}
                >
                  <tab.icon className="w-3.5 h-3.5 text-cyan-700" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Main Live Inspection Content Container */}
            <div className="p-5 overflow-y-auto flex-1 bg-slate-50 space-y-4 transition-colors duration-300">

              {/* SUCCESS PUBLISHED CONFIRMATION BANNER */}
              {publishSuccess && (
                <div className="p-4 bg-emerald-700 text-white rounded-sm shadow-md flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-200" />
                    <div>
                      <h4 className="text-sm font-black">DECLASSIFIED &amp; PUBLISHED TO NATIONAL PORTAL!</h4>
                      <p className="text-xs text-emerald-100">
                        {archiveExpeditionInput} and all {stagedFiles.length} file(s) are now live on Knowledge Repository, Media Gallery &amp; Polar Hub.
                      </p>
                    </div>
                  </div>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* PREVIEW TAB 1: KNOWLEDGE REPOSITORY VIEW (EXACT WEBSITE TABLE CARD) */}
              {/* ----------------------------------------------------------------- */}
              {previewTab === 'repository' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-white border border-slate-300 rounded-sm p-4 shadow-xs space-y-3 transition-colors duration-300">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 transition-colors duration-300">
                      <span className="text-xs font-mono font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5 transition-colors duration-300">
                        <Compass className="w-4 h-4 text-cyan-600" />
                        Exact Knowledge Repository Table Entry:
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-sm">
                        Status: Ready to Declassify
                      </span>
                    </div>

                    {/* Exact Table Card as rendered in /knowledge-repository */}
                    <div className="bg-slate-50 border border-slate-300 rounded-sm p-4 space-y-3 transition-colors duration-300">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-brand-navy text-white text-[10px] font-bold rounded-xs uppercase">
                              {archiveStation}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-brand-navy text-[10px] font-bold rounded-xs uppercase transition-colors duration-300">
                              {archiveCategory}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              HUB REGISTRY: EXP-2026-NCPOR
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-brand-navy transition-colors duration-300">
                            {archiveExpeditionInput || 'New Expedition Hub'}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified &amp; Declassified
                          </span>
                        </div>
                      </div>

                      {/* Connected Spokes Indicators calculated strictly from uploaded files */}
                      <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs transition-colors duration-300">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Connected Ingested Spokes:
                        </span>
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-900 text-[11px] font-bold rounded-sm border border-blue-200 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-700" />
                          {counts.pdfs} PDF Monograph Report(s)
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 text-[11px] font-bold rounded-sm border border-emerald-200 flex items-center gap-1.5">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                          {counts.csvs} CSV Dataset Stream(s)
                        </span>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-sm border border-amber-200 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                          {counts.images} Field Photography Asset(s)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* List of Actual Staged Documents displaying real file metadata */}
                  <div className="bg-white border border-slate-300 rounded-sm p-4 space-y-3 transition-colors duration-300">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 transition-colors duration-300">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-1.5 transition-colors duration-300">
                        <Layers className="w-4 h-4 text-cyan-600" />
                        Actual Uploaded Files Included in this Expedition Hub ({stagedFiles.length}):
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500 font-bold">
                        Total Upload Volume: {formatKB(stagedFiles.reduce((acc, f) => acc + f.size, 0))}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {stagedFiles.map((file, idx) => (
                        <div key={file.id} className="p-3 bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-between text-xs hover:border-brand-navy transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="size-6 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 transition-colors duration-300">
                              {idx + 1}
                            </span>
                            {file.category === 'pdf' ? (
                              <FileText className="w-4 h-4 text-red-600 shrink-0" />
                            ) : file.category === 'csv' ? (
                              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-amber-600 shrink-0" />
                            )}
                            <div className="min-w-0 space-y-0.5">
                              <p className="font-bold text-slate-900 truncate transition-colors duration-300">{file.title}</p>
                              <p className="text-[10px] font-mono text-slate-500 truncate">{file.name}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] font-mono text-slate-600 font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-xs transition-colors duration-300">
                              {formatKB(file.size)}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-bold uppercase rounded-xs transition-colors duration-300">
                              {file.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* PREVIEW TAB 2: MEDIA GALLERY VIEW (EXACT MEDIA CARDS) */}
              {/* ----------------------------------------------------------------- */}
              {previewTab === 'media' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-white border border-slate-300 rounded-sm p-4 shadow-xs space-y-3 transition-colors duration-300">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 transition-colors duration-300">
                      <span className="text-xs font-mono font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5 transition-colors duration-300">
                        <ImageIcon className="w-4 h-4 text-amber-500" />
                        Exact Media Gallery Display (/media-gallery):
                      </span>
                      <span className="text-[11px] font-mono text-slate-600 font-bold">
                        Expedition: {archiveExpeditionInput || 'New Expedition Hub'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {stagedFiles.filter((f) => f.category === 'image').length === 0 ? (
                        <div className="col-span-3 text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-sm p-6 space-y-2 transition-colors duration-300">
                          <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                          <p className="text-xs font-bold text-slate-700 transition-colors duration-300">No photography image files staged in queue.</p>
                          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                            PDF reports and CSV datasets uploaded for {archiveExpeditionInput || 'this Hub'} will be indexed in the Knowledge Repository &amp; Polar Hub.
                          </p>
                        </div>
                      ) : (
                        stagedFiles.filter((f) => f.category === 'image').map((photo) => (
                          <div key={photo.id} className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-xs hover:shadow-md transition-shadow p-2 space-y-2 transition-colors duration-300">
                            <div className="h-36 bg-slate-100 rounded-xs overflow-hidden relative group transition-colors duration-300">
                              <img src={photo.previewUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <span className="absolute top-1.5 left-1.5 bg-brand-navy text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase shadow-xs">
                                {photo.station}
                              </span>
                              <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-amber-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs">
                                Vector Match: 1.000
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-900 truncate transition-colors duration-300">{photo.title}</p>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                <span>{photo.name}</span>
                                <span className="font-bold text-slate-700 transition-colors duration-300">{formatKB(photo.size)}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* PREVIEW TAB 3: POLAR HUB WORKSPACE VIEW (EXACT DOSSIER CARD) */}
              {/* ----------------------------------------------------------------- */}
              {previewTab === 'hub' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-white border border-slate-300 rounded-sm p-4 shadow-xs space-y-3 transition-colors duration-300">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 transition-colors duration-300">
                      <span className="text-xs font-mono font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5 transition-colors duration-300">
                        <Database className="w-4 h-4 text-cyan-600" />
                        Exact Polar Hub Workspace Monograph Card (/polar-hub):
                      </span>
                      <span className="text-[11px] font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-sm">
                        Declassification Status: APPROVED
                      </span>
                    </div>

                    <div className="bg-slate-50 p-5 border border-slate-300 rounded-sm space-y-4 transition-colors duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-500 font-bold">
                          EXPEDITION DOSSIER REGISTRY: EXP-2026-NCPOR
                        </span>
                        <span className="px-2.5 py-0.5 bg-brand-navy text-white text-[10px] font-bold rounded-sm uppercase">
                          Station: {archiveStation}
                        </span>
                      </div>

                      <div className="space-y-1 border-b border-slate-200 pb-3 transition-colors duration-300">
                        <h3 className="text-lg font-black text-brand-navy transition-colors duration-300">
                          {archiveExpeditionInput || 'New Expedition Hub'}
                        </h3>
                        <p className="text-xs text-slate-600 font-semibold">
                          Scientific Discipline: <strong className="text-slate-900 transition-colors duration-300">{archiveCategory}</strong>
                        </p>
                      </div>

                      {/* Displaying actual attached file counts */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white p-3 border border-slate-200 rounded-sm transition-colors duration-300">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Attached PDFs</p>
                          <p className="text-lg font-black text-brand-navy transition-colors duration-300">{counts.pdfs} Files</p>
                        </div>
                        <div className="bg-white p-3 border border-slate-200 rounded-sm transition-colors duration-300">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Attached Datasets</p>
                          <p className="text-lg font-black text-emerald-700">{counts.csvs} Streams</p>
                        </div>
                        <div className="bg-white p-3 border border-slate-200 rounded-sm transition-colors duration-300">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Field Media</p>
                          <p className="text-lg font-black text-amber-600">{counts.images} Photos</p>
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-sm flex items-center justify-between text-xs transition-colors duration-300">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-slate-800 transition-colors duration-300">Telemetry QC Protocol:</span>
                          <span className="text-emerald-700 font-extrabold">PASSED &amp; INGESTED</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">100% Vector Embedded</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Action Footer */}
            <div className="bg-slate-100 border-t border-slate-300 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 transition-colors duration-300">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Verify all layouts before issuing official declassification approval.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-sm text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Close Inspection
                </button>

                <button
                  onClick={submitArchiveForApproval}
                  disabled={!isArchiveFormComplete.isValid || isPublishing || publishSuccess}
                  className="w-full sm:w-auto bg-brand-navy hover:bg-[#0b3b6f] text-white px-6 py-2 rounded-sm text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Submitting to Queue...</span>
                    </>
                  ) : publishSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Submitted for Approval!</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-300" />
                      <span>Submit for Official Approval</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PENDING APPROVAL PREVIEW MODAL */}
      {previewingApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-sm shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up transition-colors duration-300">
            <div className="bg-brand-navy text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-1.5 bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 rounded-xs">
                  <Eye className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-300 uppercase tracking-wider font-bold">
                    <span>{previewingApproval.type === 'archive' ? 'Archive Manager Ingestion' : 'Outreach Studio Draft'}</span>
                    <span>•</span>
                    <span>{previewingApproval.timestamp}</span>
                  </div>
                  <h2 className="text-sm font-extrabold text-white mt-0.5">
                    Preview: {previewingApproval.title}
                  </h2>
                </div>
              </div>
              <button onClick={() => setPreviewingApproval(null)} className="text-slate-300 hover:text-white transition-colors cursor-pointer p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 transition-colors duration-300">
              {previewingApproval.type === 'archive' ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200 pb-2 transition-colors duration-300">
                    Staged Documents &amp; Files
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(previewingApproval.content as StagedArchiveFile[]).map(f => (
                      <div key={f.id} className="p-3 bg-white border border-slate-200 rounded-sm flex items-center gap-3 shadow-xs transition-colors duration-300">
                        {f.category === 'image' ? <ImageIcon className="text-amber-500 shrink-0" size={20} /> : 
                         f.category === 'csv' ? <FileSpreadsheet className="text-emerald-500 shrink-0" size={20} /> :
                         <FileText className="text-blue-500 shrink-0" size={20} />}
                        <div className="text-xs min-w-0 flex-1">
                          <p className="font-bold text-slate-800 truncate transition-colors duration-300" title={f.name}>{f.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{Math.round(f.size/1024).toLocaleString()} KB • {f.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200 pb-2 transition-colors duration-300">
                      Draft Text Content
                    </h3>
                    <div className="p-5 bg-white border border-slate-200 shadow-xs rounded-sm text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800 min-h-[200px] transition-colors duration-300">
                      {previewingApproval.content as string}
                    </div>
                  </div>
                  {previewingApproval.media && previewingApproval.media.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200 pb-2 transition-colors duration-300">
                        Attached Media Assets
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {previewingApproval.media.map(m => (
                          <div key={m} className="px-3 py-1.5 bg-white shadow-xs border border-slate-200 text-xs font-mono rounded-xs flex items-center gap-2 transition-colors duration-300">
                            <ImageIcon size={14} className="text-amber-500" /> {m}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 transition-colors duration-300">
              <span className="text-[10px] text-slate-500 font-medium">
                Action requires clearance level 3 or higher.
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    handleApprovalAction(previewingApproval.id, 'reject')
                    setPreviewingApproval(null)
                  }}
                  className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <X size={14} /> Reject &amp; Discard
                </button>
                <button
                  onClick={() => {
                    handleApprovalAction(previewingApproval.id, 'approve')
                    setPreviewingApproval(null)
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Check size={14} /> Approve &amp; Publish Content
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
