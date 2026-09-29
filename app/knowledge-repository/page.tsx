"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getAllExpeditions,
  getDatasetsForExpedition,
  getDocumentsForExpedition,
  getMediaForExpedition,
  getGraphMetrics,
  ExpeditionHub,
  DatasetSpoke,
  DocumentSpoke,
  MediaSpoke,
} from "@/lib/data/knowledge-graph";
import {
  FileText,
  Database,
  Image as ImageIcon,
  Compass,
  Download,
  Calendar,
  User,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  X,
  Sparkles,
  BarChart3,
  Table as TableIcon,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  Layers,
  Info,
  Maximize2,
  Check,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function KnowledgeRepositoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent flex items-center justify-center p-8 text-slate-600 font-mono text-xs transition-colors duration-300">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-brand-navy transition-colors duration-300" /> Loading Knowledge Repository...
        </div>
      }
    >
      <KnowledgeRepositoryContent />
    </Suspense>
  );
}

function KnowledgeRepositoryContent() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const initialExpId = searchParams.get("expedition") || "exp-043";

  const allExpeditions = useMemo(() => getAllExpeditions(), []);
  const metrics = useMemo(() => getGraphMetrics(), []);

  // Filter states
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  // Inline Accordion Expanded Expedition ID (null if closed, string if open)
  const [expandedExpId, setExpandedExpId] = useState<string | null>(initialExpId);

  // Lightbox Modal state
  const [activePhoto, setActivePhoto] = useState<MediaSpoke | null>(null);

  // Toggle row expansion (Accordion effect directly beneath the row)
  const handleToggleRow = (expId: string) => {
    setExpandedExpId((prev) => (prev === expId ? null : expId));
  };

  // Filtered expeditions list for the table
  const filteredExpeditions = useMemo(() => {
    return allExpeditions.filter((exp) => {
      const matchRegion = selectedRegion === "All" || exp.region === selectedRegion;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        exp.name.toLowerCase().includes(q) ||
        exp.short_name.toLowerCase().includes(q) ||
        exp.id.toLowerCase().includes(q) ||
        exp.chief_scientist.toLowerCase().includes(q) ||
        exp.keywords.some((k) => k.toLowerCase().includes(q));
      return matchRegion && matchQuery;
    });
  }, [allExpeditions, selectedRegion, searchQuery]);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegion, searchQuery]);

  useEffect(() => {
    const expParam = searchParams.get("expedition");
    if (expParam && allExpeditions.length > 0) {
      setExpandedExpId(expParam);
      const targetIndex = allExpeditions.findIndex(
        (e) => e.id.toLowerCase() === expParam.toLowerCase()
      );
      if (targetIndex !== -1) {
        const targetPage = Math.floor(targetIndex / ITEMS_PER_PAGE) + 1;
        setCurrentPage(targetPage);
      }
    }
  }, [searchParams, allExpeditions]);

  // Smooth scroll to targeted expedition row when expanded
  useEffect(() => {
    if (expandedExpId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`exp-row-${expandedExpId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [expandedExpId, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredExpeditions.length / ITEMS_PER_PAGE));

  const paginatedExpeditions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExpeditions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredExpeditions, currentPage]);

  return (
    <div className="min-h-screen bg-transparent flex flex-col transition-colors duration-300">
      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 sm:px-8 py-6">
        
        {/* Page Breadcrumb & Title */}
        <div className="mb-6 border-b border-slate-200 pb-4 transition-colors duration-300">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <Link href="/" className="hover:text-brand-navy transition-colors duration-300">{t('National Portal', 'राष्ट्रीय पोर्टल')}</Link>
            <span>/</span>
            <span className="text-brand-navy font-semibold transition-colors duration-300">{t('Knowledge Repository', 'ज्ञान भण्डार')}</span>
            <span>/</span>
            <span className="text-slate-700 transition-colors duration-300">{t('Relational Knowledge Graph (Hub & Spoke)', 'ज्ञान नेटवर्क (हब एवं स्पोक)')}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-navy transition-colors duration-300">
                {t('National Polar Knowledge Repository', 'राष्ट्रीय ध्रुवीय ज्ञान भण्डार')}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                {t(
                  'Official Relational Knowledge Graph linking Expedition Hubs with Ingested Datasets, Scientific Documents, and Photo Archives.',
                  'अभियान केंद्रों को डेटासेट, वैज्ञानिक दस्तावेजों और फोटो अभिलेखागार से जोड़ने वाला आधिकारिक ज्ञान नेटवर्क।'
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 rounded-sm transition-colors duration-300">
                {t('Official Scientific Archive', 'आधिकारिक वैज्ञानिक अभिलेखागार')}
              </span>
            </div>
          </div>
        </div>

        {/* METRICS COUNTER BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-slate-200 p-3 rounded-sm shadow-none transition-colors duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('Expedition Hubs', 'अभियान केंद्र')}</span>
              <Compass className="w-4 h-4 text-brand-navy transition-colors duration-300" />
            </div>
            <div className="text-2xl font-bold text-brand-navy mt-1 transition-colors duration-300">{metrics.expeditionsCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{t('Antarctic · Arctic · Himalayan', 'अंटार्कटिक · आर्कटिक · हिमालयी')}</div>
          </div>

          <div className="bg-white border border-slate-200 p-3 rounded-sm shadow-none transition-colors duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('Linked Datasets', 'संबद्ध डेटासेट')}</span>
              <Database className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{metrics.datasetsCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{t('Meteorology, AWS & Mass Balance', 'मौसम विज्ञान, एडब्ल्यूएस एवं द्रव्यमान संतुलन')}</div>
          </div>

          <div className="bg-white border border-slate-200 p-3 rounded-sm shadow-none transition-colors duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('Publications & Reports', 'प्रकाशन एवं रिपोर्ट')}</span>
              <FileText className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{metrics.documentsCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{t('Peer-Reviewed Monograph Series', 'समीक्षित मोनोग्राफ श्रृंखला')}</div>
          </div>

          <div className="bg-white border border-slate-200 p-3 rounded-sm shadow-none transition-colors duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('Media & Photo Assets', 'मीडिया एवं फोटो संपत्ति')}</span>
              <ImageIcon className="w-4 h-4 text-indigo-700" />
            </div>
            <div className="text-2xl font-bold text-indigo-700 mt-1">{metrics.mediaCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{t('NCPOR High-Res Archives', 'एनसीपीओआर उच्च गुणवत्ता अभिलेखागार')}</div>
          </div>
        </div>

        {/* SECTION: EXPEDITION HUBS TABLE WITH INLINE ACCORDION EXPANSION */}
        <div className="bg-white border border-slate-200 rounded-sm mb-8 shadow-xs transition-colors duration-300">
          {/* Table Header & Filters */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-300">
            <div>
              <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2 transition-colors duration-300">
                <Compass className="w-4 h-4 text-brand-navy transition-colors duration-300" />
                {t('Select Expedition Hub', 'अभियान केंद्र का चयन करें')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('Click any row below to expand its connected Spokes directly below the row. Click again to close.', 'नीचे किसी भी पंक्ति पर क्लिक करके उसके संबद्ध विवरण देखें। पुनः क्लिक करने पर बंद होगा।')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Region Filter Buttons */}
              <div className="inline-flex rounded-sm border border-slate-300 bg-white p-0.5 text-xs font-medium transition-colors duration-300">
                {["All", "Antarctica", "Arctic", "Himalaya"].map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-3 py-1 rounded-sm transition-colors ${ selectedRegion === region ? "bg-brand-navy text-white font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100" }`}
                  >
                    {region === 'All' ? t('All', 'सभी') : region === 'Antarctica' ? t('Antarctica', 'अंटार्कटिका') : region === 'Arctic' ? t('Arctic', 'आर्कटिक') : t('Himalaya', 'हिमालय')}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('Filter hub by keyword or ID...', 'कीवर्ड या आईडी द्वारा फ़िल्टर करें...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-sm bg-white w-48 sm:w-60 outline-none focus:border-brand-navy transition-colors duration-300"
                />
              </div>
            </div>
          </div>

          {/* Table List View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] transition-colors duration-300">
                  <th className="py-2.5 px-4">{t('Hub ID', 'हब आईडी')}</th>
                  <th className="py-2.5 px-4">{t('Expedition Name', 'अभियान का नाम')}</th>
                  <th className="py-2.5 px-4">{t('Region & Sector', 'क्षेत्र एवं सेक्टर')}</th>
                  <th className="py-2.5 px-4 text-center">{t('Season/Year', 'सत्र/वर्ष')}</th>
                  <th className="py-2.5 px-4">{t('Chief Scientist', 'मुख्य वैज्ञानिक')}</th>
                  <th className="py-2.5 px-4 text-center">{t('Connected Spokes', 'संबद्ध डेटा')}</th>
                  <th className="py-2.5 px-4 text-center">{t('Status', 'स्थिति')}</th>
                  <th className="py-2.5 px-4 text-right">{t('Action', 'कार्रवाई')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 transition-colors duration-300">
                {paginatedExpeditions.map((exp) => {
                  const isExpanded = exp.id === expandedExpId;
                  const dsCount = getDatasetsForExpedition(exp.id).length;
                  const docCount = getDocumentsForExpedition(exp.id).length;
                  const medCount = getMediaForExpedition(exp.id).length;

                  return (
                    <React.Fragment key={exp.id}>
                      {/* Main Expedition Table Row */}
                      <tr
                        id={`exp-row-${exp.id}`}
                        onClick={() => handleToggleRow(exp.id)}
                        className={`cursor-pointer transition-colors ${ isExpanded ? "bg-blue-50/90 font-medium border-l-4 border-l-[#082b57]" : "hover:bg-slate-50 text-slate-800" }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-brand-navy transition-colors duration-300">
                          {exp.id.toUpperCase()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 transition-colors duration-300">{exp.name}</div>
                          <div className="text-[11px] text-slate-500 font-normal">{exp.short_name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 transition-colors duration-300">
                            <MapPin className="w-3 h-3 text-brand-navy transition-colors duration-300" />
                            {exp.region}
                          </span>
                          <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                            {exp.polar_region}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold">
                          {exp.year}
                        </td>
                        <td className="py-3 px-4 text-brand-navy font-semibold transition-colors duration-300">
                          {exp.chief_scientist}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono">
                            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm" title="Datasets">
                              {dsCount} {t('Datasets', 'डेटासेट')}
                            </span>
                            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm" title="Reports">
                              {docCount} {t('Reports', 'रिपोर्ट')}
                            </span>
                            <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-sm transition-colors duration-300" title="Media">
                              {medCount} {t('Photos', 'चित्र')}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm">
                            <CheckCircle2 className="w-3 h-3" />
                            {t('Completed', 'पूर्ण')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleRow(exp.id);
                            }}
                            className={`px-3 py-1 text-xs font-semibold rounded-sm transition-all inline-flex items-center gap-1 ${ isExpanded ? "bg-brand-navy text-white font-bold shadow-xs" : "border border-slate-300 bg-white text-slate-700 hover:border-brand-navy hover:text-brand-navy" }`}
                          >
                            <span>{isExpanded ? t('Close', 'बंद करें') : t('Inspect Hub', 'हब देखें')}</span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${ isExpanded ? "rotate-180" : "" }`}
                            />
                          </button>
                        </td>
                      </tr>

                      {/* INLINE EXPANDED ACCORDION DETAIL ROW (Renders directly below the row) */}
                      {isExpanded && (
                        <tr key={`${exp.id}-details`}>
                          <td colSpan={8} className="p-0 bg-slate-100 border-b-2 border-brand-navy transition-colors duration-300">
                            <div className="p-3 sm:p-5">
                              <ExpeditionDetailWorkspace
                                expedition={exp}
                                setActivePhoto={setActivePhoto}
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Bar */}
          {filteredExpeditions.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-colors duration-300">
              <div className="text-slate-600 font-medium">
                Showing <span className="font-bold text-brand-navy transition-colors duration-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="font-bold text-brand-navy transition-colors duration-300">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredExpeditions.length)}
                </span>{" "}
                of <span className="font-bold text-brand-navy transition-colors duration-300">{filteredExpeditions.length}</span> Expedition Hubs
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const showEllipsis = prevP && p - prevP > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-1 text-slate-400 font-bold">...</span>}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`min-w-[28px] h-7 px-2 rounded-sm border font-semibold text-xs transition-colors ${ currentPage === p ? "bg-brand-navy text-white border-brand-navy" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100" }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* LIGHTBOX PREVIEW MODAL */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="bg-white border-2 border-brand-navy rounded-sm max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-brand-navy text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>NCPOR Archival Photo Preview</span>
              </div>
              <button
                onClick={() => setActivePhoto(null)}
                className="text-white/80 hover:text-white p-1"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 flex items-center justify-center max-h-[60vh] overflow-hidden">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            <div className="p-4 bg-white text-xs space-y-2 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-brand-navy transition-colors duration-300">{activePhoto.title}</h4>
                <span className="px-2 py-0.5 bg-blue-50 text-brand-navy border border-blue-200 rounded-sm font-semibold text-[10px] transition-colors duration-300">
                  {activePhoto.region}
                </span>
              </div>

              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-sm border border-slate-200 transition-colors duration-300">
                {activePhoto.caption}
              </p>

              <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1">
                <span>Hub Association: {activePhoto.expedition_name}</span>
                <span>Relational Knowledge Graph Storage: Supabase &amp; Local Public Sync</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

{/* INLINE DETAILED SPLIT-PANEL WORKSPACE COMPONENT */}
interface ExpeditionDetailWorkspaceProps {
  expedition: ExpeditionHub;
  setActivePhoto: (photo: MediaSpoke) => void;
}

function ExpeditionDetailWorkspace({ expedition, setActivePhoto }: ExpeditionDetailWorkspaceProps) {
  const { language, t } = useLanguage();
  const linkedDatasets = useMemo(() => getDatasetsForExpedition(expedition.id), [expedition.id]);
  const linkedDocuments = useMemo(() => getDocumentsForExpedition(expedition.id), [expedition.id]);
  const linkedMedia = useMemo(() => getMediaForExpedition(expedition.id), [expedition.id]);

  const [activeDatasetIndex, setActiveDatasetIndex] = useState(0);
  const [showAllReports, setShowAllReports] = useState(false);

  const visibleDocuments = useMemo(() => {
    if (showAllReports || linkedDocuments.length <= 2) {
      return linkedDocuments;
    }
    return linkedDocuments.slice(0, 2);
  }, [linkedDocuments, showAllReports]);

  const currentDataset = linkedDatasets[activeDatasetIndex] || linkedDatasets[0];

  const chartPoints = useMemo(() => {
    if (!currentDataset || !currentDataset.sample_data || currentDataset.sample_data.length === 0) {
      return [];
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const firstRow = currentDataset.sample_data[0];
    const points: { month: string; value: number }[] = [];
    months.forEach((m) => {
      const rawVal = firstRow[m];
      if (rawVal !== null && rawVal !== undefined && typeof rawVal === "number" && !isNaN(rawVal)) {
        points.push({ month: m, value: rawVal });
      }
    });
    return points;
  }, [currentDataset]);

  return (
    <div className="bg-white border-2 border-brand-navy rounded-sm shadow-md overflow-hidden my-1 transition-colors duration-300">
      {/* Split-Panel Header Bar */}
      <div className="bg-brand-navy text-white px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-[11px] uppercase tracking-widest font-semibold">
            <span>{t('Relational Knowledge Graph', 'ज्ञान नेटवर्क')}</span>
            <span>•</span>
            <span>{t('Active Hub:', 'सक्रिय हब:')} {expedition.id.toUpperCase()}</span>
            <span>•</span>
            <span className="text-amber-300 font-bold">{expedition.region}</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
            {expedition.name}
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-white/10 px-3 py-1 rounded-sm border border-white/15">
            <span className="text-blue-200">{t('Chief Scientist:', 'मुख्य वैज्ञानिक:')} </span>
            <span className="font-semibold text-white">{expedition.chief_scientist}</span>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-sm border border-white/15 font-mono">
            <span className="text-blue-200">{t('Year:', 'वर्ष:')} </span>
            <span className="font-semibold text-white">{expedition.year}</span>
          </div>
        </div>
      </div>

      {/* Sub-header status bar */}
      <div className="bg-slate-100 border-b border-slate-200 px-5 py-2 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-800 transition-colors duration-300">{t('Spokes Connected:', 'संबद्ध डेटा:')}</span>
          <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
            {linkedDatasets.length} {t('Scientific Datasets', 'वैज्ञानिक डेटासेट')}
          </span>
          <span className="font-medium text-blue-800 bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200">
            {linkedDocuments.length} {t('Official Publications', 'आधिकारिक प्रकाशन')}
          </span>
          <span className="font-medium text-slate-800 bg-slate-200 px-2 py-0.5 rounded-sm transition-colors duration-300">
            {linkedMedia.length} {t('Photographic Records', 'फोटो अभिलेख')}
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          {t('Vector Cosine Linking:', 'वेक्टर लिंकिंग:')} <span className="text-brand-navy font-bold transition-colors duration-300">{t('Validated', 'सत्यापित')}</span>
        </div>
      </div>

      {/* TWO-PANEL SPLIT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 transition-colors duration-300">
        
        {/* LEFT PANEL: Publications & Datasets */}
        <div className="p-4 sm:p-5 flex flex-col gap-6 bg-white transition-colors duration-300">
          {/* Publications */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2 transition-colors duration-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-2 transition-colors duration-300">
                <FileText className="w-4 h-4 text-blue-700" />
                {t('Official Publications & Reports', 'आधिकारिक प्रकाशन एवं रिपोर्ट')} ({linkedDocuments.length})
              </h3>
              <span className="text-[11px] text-slate-500">{t('Peer-Reviewed / NCPOR Monographs', 'समीक्षित / NCPOR मोनोग्राफ')}</span>
            </div>

            {linkedDocuments.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-500 italic rounded-sm text-center transition-colors duration-300">
                {t('No official report documents registered for this expedition hub yet.', 'इस अभियान हब हेतु कोई रिपोर्ट पंजीकृत नहीं है।')}
              </div>
            ) : (
              <div>
                <div className="space-y-3">
                  {visibleDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-slate-200 bg-slate-50/70 p-3 rounded-sm hover:border-brand-navy transition-all transition-colors duration-300"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-sm bg-blue-100 text-brand-navy flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 leading-snug transition-colors duration-300">
                              {doc.title}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 mt-1">
                              <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-sm font-semibold transition-colors duration-300">
                                {doc.doc_type}
                              </span>
                              <span>•</span>
                              <span>{doc.pages} {t('Pages', 'पृष्ठ')}</span>
                              <span>•</span>
                              <span>{doc.file_size}</span>
                              <span>•</span>
                              <span className="font-mono text-brand-navy font-semibold transition-colors duration-300">
                                {t('Vector Match:', 'वेक्टर मैच:')} {doc.match_confidence}
                              </span>
                            </div>
                          </div>
                        </div>

                        <a
                          href={doc.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-navy hover:bg-[#0b3b6f] text-white text-xs font-semibold rounded-sm transition-colors shrink-0"
                        >
                          <Download className="w-3 h-3" />
                          {t('Download', 'डाउनलोड')}
                        </a>
                      </div>

                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed bg-white p-2 border border-slate-200 rounded-sm transition-colors duration-300">
                        {doc.summary}
                      </p>
                    </div>
                  ))}
                </div>

                {linkedDocuments.length > 2 && (
                  <button
                    onClick={() => setShowAllReports(!showAllReports)}
                    className="w-full mt-3 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-brand-navy text-xs font-semibold rounded-sm border border-slate-300 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>
                      {showAllReports
                        ? t(`Show Less (Showing all ${linkedDocuments.length} reports)`, `कम दिखाएं (सभी ${linkedDocuments.length} रिपोर्ट प्रदर्शित)`)
                        : t(`Show All ${linkedDocuments.length} Reports`, `सभी ${linkedDocuments.length} रिपोर्ट देखें`)}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${ showAllReports ? "rotate-180" : "" }`}
                    />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dataset Analytics */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2 transition-colors duration-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-2 transition-colors duration-300">
                <Database className="w-4 h-4 text-emerald-700" />
                {t('Dataset Analytics & Telemetry', 'डेटासेट विश्लेषण एवं टेलीमीटरी')} ({linkedDatasets.length})
              </h3>
              <span className="text-[11px] text-slate-500">{t('Auto-Linked CSV & AWS Series', 'स्वचालित सीएसवी एवं एडब्ल्यूएस श्रृंखला')}</span>
            </div>

            {linkedDatasets.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-500 italic rounded-sm text-center transition-colors duration-300">
                {t('No observational datasets linked to this expedition yet.', 'इस अभियान से कोई प्रेक्षण डेटासेट संबद्ध नहीं है।')}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 scrollbar-none">
                  {linkedDatasets.map((ds, idx) => (
                    <button
                      key={ds.id}
                      onClick={() => setActiveDatasetIndex(idx)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-sm border whitespace-nowrap transition-colors ${ activeDatasetIndex === idx ? "bg-emerald-800 text-white border-emerald-900 font-bold" : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200" }`}
                    >
                      {ds.station}: {ds.parameter}
                    </button>
                  ))}
                </div>

                {currentDataset && (
                  <div className="border border-slate-200 rounded-sm bg-slate-50 p-3 space-y-3 transition-colors duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2 transition-colors duration-300">
                      <div>
                        <div className="text-xs font-bold text-slate-900 transition-colors duration-300">
                          {currentDataset.title}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{t('Station:', 'स्टेशन:')} <strong className="text-slate-700 transition-colors duration-300">{currentDataset.station}</strong></span>
                          <span>•</span>
                          <span>{t('Records:', 'अभिलेख:')} <strong className="text-slate-700 transition-colors duration-300">{currentDataset.row_count} {t('series', 'श्रृंखला')}</strong></span>
                          <span>•</span>
                          <span>{t('Cosine Sim:', 'समानता गुणांक:')} <strong className="text-emerald-700 font-mono">{currentDataset.match_confidence}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 border border-slate-200 text-slate-600 rounded-sm truncate max-w-[200px] transition-colors duration-300">
                          {currentDataset.file_path.split("/").pop()}
                        </span>
                      </div>
                    </div>

                    {chartPoints.length > 0 && (
                      <div className="bg-white border border-slate-200 p-2.5 rounded-sm transition-colors duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                            <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                            {t('Monthly Profile', 'मासिक प्रोफ़ाइल')} ({chartPoints[0].month} - {chartPoints[chartPoints.length - 1].month})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t('Observation Unit:', 'प्रेक्षण इकाई:')} {currentDataset.parameter}
                          </span>
                        </div>

                        <div className="h-28 w-full flex items-end justify-between gap-1 pt-3 pb-1 border-b border-slate-200 transition-colors duration-300">
                          {(() => {
                            const values = chartPoints.map((p) => p.value);
                            const min = Math.min(...values);
                            const max = Math.max(...values);
                            const range = max - min || 1;

                            return chartPoints.map((pt, i) => {
                              const heightPercent = Math.max(15, Math.min(100, Math.round(((pt.value - min) / range) * 85 + 15)));
                              return (
                                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-brand-navy text-white text-[9px] px-1.5 py-0.5 rounded-sm pointer-events-none transition-opacity font-mono z-10 whitespace-nowrap">
                                    {pt.month}: {pt.value}
                                  </div>
                                  <div
                                    style={{ height: `${heightPercent}%` }}
                                    className="w-full bg-[#1c5d9f] hover:bg-emerald-600 transition-all rounded-t-xs"
                                  />
                                  <span className="text-[9px] text-slate-500 font-mono mt-1">
                                    {pt.month.charAt(0)}
                                  </span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                        <TableIcon className="w-3.5 h-3.5 text-brand-navy transition-colors duration-300" />
                        {t('Sample Ingested Records Preview', 'नमूना डेटा रिकॉर्ड का पूर्वावलोकन')}
                      </div>
                      <div className="overflow-x-auto border border-slate-200 bg-white rounded-sm transition-colors duration-300">
                        <table className="w-full text-left text-[10px] border-collapse">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-mono font-semibold transition-colors duration-300">
                              {currentDataset.columns.slice(0, 8).map((col) => (
                                <th key={col} className="py-1 px-2 whitespace-nowrap">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-[9px] transition-colors duration-300">
                            {currentDataset.sample_data.slice(0, 3).map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50 transition-colors duration-300">
                                {currentDataset.columns.slice(0, 8).map((col) => {
                                  const cellVal = row[col];
                                  return (
                                    <td key={col} className="py-1 px-2 text-slate-800 whitespace-nowrap transition-colors duration-300">
                                      {cellVal !== null && cellVal !== undefined ? String(cellVal) : "--"}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {currentDataset.summary && (
                      <p className="text-[11px] text-slate-600 italic bg-white p-2 border border-slate-200 rounded-sm transition-colors duration-300">
                        &ldquo;{currentDataset.summary}&rdquo;
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Research Synthesis & Media Grid */}
        <div className="p-4 sm:p-5 flex flex-col gap-6 bg-slate-50/50">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2 transition-colors duration-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-2 transition-colors duration-300">
                <Sparkles className="w-4 h-4 text-amber-600" />
                {t('Mission Research Synthesis (Dhruv AI Core)', 'मिशन अनुसंधान विश्लेषण (ध्रुव एआई कोर)')}
              </h3>
              <span className="text-[10px] font-mono bg-blue-100 text-brand-navy px-2 py-0.5 rounded-sm font-semibold transition-colors duration-300">
                {t('Verified Grounded', 'सत्यापित तथ्य')}
              </span>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-sm space-y-3 transition-colors duration-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-sm bg-brand-navy text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide transition-colors duration-300">
                    {t('Scientific Synthesis & Findings', 'वैज्ञानिक निष्कर्ष एवं विश्लेषण')}
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed mt-1 transition-colors duration-300">
                    {expedition.research_summary}
                  </p>
                </div>
              </div>

              {expedition.objectives && expedition.objectives.length > 0 && (
                <div className="border-t border-slate-200 pt-2.5 mt-2.5 transition-colors duration-300">
                  <div className="text-[10px] font-bold text-brand-navy uppercase tracking-wider mb-1.5 transition-colors duration-300">
                    {t('Key Mission Objectives Completed:', 'मुख्य मिशन उद्देश्य पूर्ण:')}
                  </div>
                  <ul className="space-y-1">
                    {expedition.objectives.map((obj, oIdx) => (
                      <li key={oIdx} className="flex items-start gap-2 text-xs text-slate-700 transition-colors duration-300">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-slate-200 pt-2 flex flex-wrap items-center gap-1.5 text-[10px] transition-colors duration-300">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">{t('Indexed Tags:', 'इंडेक्स किए गए टैग:')}</span>
                {expedition.keywords.slice(0, 8).map((kw) => (
                  <span
                    key={kw}
                    className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm border border-slate-200 font-mono transition-colors duration-300"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2 transition-colors duration-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-2 transition-colors duration-300">
                <ImageIcon className="w-4 h-4 text-indigo-700" />
                {t('Linked Photographic Archives', 'संबद्ध फोटो अभिलेखागार')} ({linkedMedia.length})
              </h3>
              <Link
                href={`/media-gallery?region=${encodeURIComponent(expedition.region)}`}
                className="text-xs text-brand-navy hover:underline font-semibold flex items-center gap-1 transition-colors duration-300"
              >
                {t('View Gallery', 'गैलरी देखें')} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {linkedMedia.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500 italic rounded-sm text-center transition-colors duration-300">
                No photographic media records indexed for this expedition hub.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {linkedMedia.slice(0, 6).map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setActivePhoto(photo)}
                    className="group relative border border-slate-200 bg-white rounded-sm overflow-hidden cursor-pointer hover:border-brand-navy transition-all transition-colors duration-300"
                  >
                    <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative transition-colors duration-300">
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/20 transition-colors flex items-center justify-center">
                        <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                      </div>
                    </div>
                    <div className="p-1.5">
                      <div className="text-[10px] font-bold text-slate-900 truncate transition-colors duration-300">
                        {photo.title.split("-").pop()?.trim() || photo.title}
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 mt-0.5">
                        <span className="bg-slate-100 text-slate-600 px-1 py-0.2 rounded-xs transition-colors duration-300">
                          {photo.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
