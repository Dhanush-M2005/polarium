"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAllMedia, getAllExpeditions, MediaSpoke } from "@/lib/data/knowledge-graph";
import { GovernmentHeader } from "@/components/GovernmentHeader";
import {
  Image as ImageIcon,
  Filter,
  Search,
  MapPin,
  Compass,
  Download,
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function MediaGalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent flex items-center justify-center p-8 text-slate-600 font-mono text-xs transition-colors duration-300">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-brand-navy transition-colors duration-300" /> Loading Media Gallery...
        </div>
      }
    >
      <MediaGalleryContent />
    </Suspense>
  );
}

function formatCategoryName(cat?: string, isHindi: boolean = false): string {
  if (!cat) return isHindi ? 'अवर्गीकृत' : 'Uncategorized';
  const raw = cat.trim().toLowerCase();
  if (raw === 'knowledge_media') return isHindi ? 'अभियान अभिलेखागार' : 'Expedition Archives';
  if (raw === 'scraped') return isHindi ? 'अनुसंधान फोटोग्राफी' : 'Research Photography';
  if (raw === 'jpgs' || raw === 'jpg' || raw === 'png') return isHindi ? 'क्षेत्रीय दस्तावेज़ीकरण' : 'Field Documentation';
  if (raw === 'field work' || raw === 'fieldwork') return isHindi ? 'क्षेत्रीय कार्य एवं यात्राएं' : 'Fieldwork & Traverses';
  if (raw === 'iceberg' || raw === 'icebergs' || raw === 'glacier') return isHindi ? 'हिमनद एवं हिमशैल' : 'Glaciers & Icebergs';
  if (raw === 'stations' || raw === 'station') return isHindi ? 'ध्रुवीय वेधशालाएं एवं स्टेशन' : 'Polar Observatories & Stations';
  if (raw === 'auroras' || raw === 'aurora') return isHindi ? 'ऑरोरा एवं वायुमंडल' : 'Auroras & Atmosphere';
  if (raw === 'sunset' || raw === 'sunrise') return isHindi ? 'ध्रुवीय आकाश एवं क्षितिज' : 'Polar Sky & Horizons';
  if (raw === 'penguins' || raw === 'penguin') return isHindi ? 'पेंगुइन' : 'Penguins';
  if (raw === 'skua') return isHindi ? 'स्कुआ (ध्रुवीय पक्षी)' : 'Skua';
  
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function MediaGalleryContent() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const initialRegion = searchParams.get("region") || "All";

  const allMedia = useMemo(() => getAllMedia(), []);
  const allExpeditions = useMemo(() => getAllExpeditions(), []);

  // Filter States
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"confidence" | "title">("confidence");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 20;

  // Lightbox Modal State
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // 1. Region & Search matching media items (before category filter)
  const regionAndSearchFilteredMedia = useMemo(() => {
    return allMedia.filter((photo) => {
      // Region filter
      const matchRegion =
        selectedRegion === "All" ||
        photo.region.toLowerCase() === selectedRegion.toLowerCase() ||
        (selectedRegion === "Himalaya" && photo.region.toLowerCase().includes("himalay"));

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        photo.title.toLowerCase().includes(q) ||
        photo.caption.toLowerCase().includes(q) ||
        photo.expedition_name.toLowerCase().includes(q) ||
        formatCategoryName(photo.category, language === 'hi').toLowerCase().includes(q);

      return matchRegion && matchQuery;
    });
  }, [allMedia, selectedRegion, searchQuery, language]);

  // 2. Compute available categories dynamically with counts > 0 for the active Region/Search
  const availableCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    regionAndSearchFilteredMedia.forEach((m) => {
      const catLabel = formatCategoryName(m.category, language === 'hi');
      counts[catLabel] = (counts[catLabel] || 0) + 1;
    });

    const catList = Object.keys(counts)
      .filter((cat) => counts[cat] > 0) // Exclude any category with 0 images!
      .sort((a, b) => counts[b] - counts[a]); // Sort by count descending

    return [
      { id: "All", label: t("All Categories", "सभी श्रेणियां"), count: regionAndSearchFilteredMedia.length },
      ...catList.map((cat) => ({ id: cat, label: cat, count: counts[cat] })),
    ];
  }, [regionAndSearchFilteredMedia, language, t]);

  // 3. Reset selectedCategory if it no longer exists in availableCategories for active region
  React.useEffect(() => {
    if (
      selectedCategory !== "All" &&
      !availableCategories.some((c) => c.id === selectedCategory)
    ) {
      setSelectedCategory("All");
    }
  }, [availableCategories, selectedCategory]);

  // Reset page when any filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegion, selectedCategory, searchQuery, sortBy]);

  // 4. Final Filtered & Sorted Media List
  const filteredMedia = useMemo(() => {
    return regionAndSearchFilteredMedia
      .filter((photo) => {
        if (selectedCategory === "All") return true;
        return formatCategoryName(photo.category, language === 'hi') === selectedCategory;
      })
      .sort((a, b) => {
        if (sortBy === "confidence") {
          return b.match_confidence - a.match_confidence;
        }
        return a.title.localeCompare(b.title);
      });
  }, [regionAndSearchFilteredMedia, selectedCategory, sortBy, language]);

  const totalPages = Math.max(1, Math.ceil(filteredMedia.length / ITEMS_PER_PAGE));

  const paginatedMedia = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMedia.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMedia, currentPage]);

  // Active photo object for Lightbox
  const activePhoto: MediaSpoke | null =
    activePhotoIndex !== null && filteredMedia[activePhotoIndex]
      ? filteredMedia[activePhotoIndex]
      : null;

  const handleNextPhoto = () => {
    if (activePhotoIndex !== null && activePhotoIndex < filteredMedia.length - 1) {
      setActivePhotoIndex(activePhotoIndex + 1);
    } else {
      setActivePhotoIndex(0);
    }
  };

  const handlePrevPhoto = () => {
    if (activePhotoIndex !== null && activePhotoIndex > 0) {
      setActivePhotoIndex(activePhotoIndex - 1);
    } else {
      setActivePhotoIndex(filteredMedia.length - 1);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col transition-colors duration-300">
      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 sm:px-8 py-6">
        
        {/* Breadcrumb & Title */}
        <div className="mb-6 border-b border-slate-200 pb-4 transition-colors duration-300">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <Link href="/" className="hover:text-brand-navy transition-colors duration-300">{t('National Portal', 'राष्ट्रीय पोर्टल')}</Link>
            <span>/</span>
            <Link href="/knowledge-repository" className="hover:text-brand-navy transition-colors duration-300">{t('Knowledge Repository', 'ज्ञान भण्डार')}</Link>
            <span>/</span>
            <span className="text-brand-navy font-semibold transition-colors duration-300">{t('Media Gallery & Photographic Archives', 'मीडिया गैलरी एवं फोटो अभिलेखागार')}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-navy transition-colors duration-300">
                {t('National Polar Photographic Archives', 'राष्ट्रीय ध्रुवीय फोटो अभिलेखागार')}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                {t(
                  'Official NCPOR photo repository indexed and related across Indian Scientific Expeditions (Antarctica, Arctic, Himalayas).',
                  'एनसीपीओआर का आधिकारिक फोटो संग्रह जो भारतीय वैज्ञानिक अभियानों (अंटार्कटिका, आर्कटिक, हिमालय) से सम्बद्ध है।'
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-mono font-bold bg-brand-navy text-white rounded-sm">
                {t(`${filteredMedia.length} of ${allMedia.length} Assets`, `${allMedia.length} में से ${filteredMedia.length} फोटो सामग्री`)}
              </span>
              <Link
                href="/knowledge-repository"
                className="px-3 py-1 text-xs font-semibold bg-white text-brand-navy border border-slate-300 hover:border-brand-navy rounded-sm transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-brand-navy transition-colors duration-300" />
                {t('View Expedition Hubs', 'अभियान हब देखें')}
              </Link>
            </div>
          </div>
        </div>

        {/* HIGH-PRECISION GOVERNMENT FILTER TOOLBAR */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 mb-6 space-y-3 transition-colors duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* 1. Region Filter Dropdown (Required by specification) */}
            <div className="flex items-center gap-2">
              <label htmlFor="region-filter" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1 transition-colors duration-300">
                <MapPin className="w-3.5 h-3.5 text-brand-navy transition-colors duration-300" />
                {t('Region:', 'क्षेत्र:')}
              </label>
              <select
                id="region-filter"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-sm px-3 py-1.5 text-brand-navy outline-none focus:border-brand-navy cursor-pointer transition-colors duration-300"
              >
                <option value="All">{t('All Regions (Global Polar)', 'सभी क्षेत्र (वैश्विक ध्रुवीय)')}</option>
                <option value="Antarctica">{t('Antarctica (Larsemann Hills & Schirmacher Oasis)', 'अंटार्कटिका (लार्समैन हिल्स एवं शिर्माचर ओएसिस)')}</option>
                <option value="Arctic">{t('Arctic (Svalbard & Kongsfjorden)', 'आर्कटिक (स्वालबार्ड एवं कांग्सफ्योर्डन)')}</option>
                <option value="Himalaya">{t('Himalayan Cryosphere (Chandra & Spiti)', 'हिमालयी हिमनद (चंद्रा एवं स्पीति)')}</option>
                <option value="Southern Ocean">{t('Southern Ocean', 'दक्षिण महासागर')}</option>
              </select>
            </div>

            {/* 2. Search Input */}
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('Search caption, station, wildlife...', 'कैप्शन, स्टेशन या वन्यजीव खोजें...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-sm bg-slate-50 outline-none focus:border-brand-navy transition-colors duration-300"
                />
              </div>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-sm px-2.5 py-1.5 text-slate-700 outline-none focus:border-brand-navy transition-colors duration-300"
              >
                <option value="confidence">{t('Sort by Vector Confidence', 'वेक्टर सटीकता अनुसार क्रमित करें')}</option>
                <option value="title">{t('Sort Alphabetically', 'वर्णमाला अनुसार क्रमित करें')}</option>
              </select>
            </div>

          </div>

          {/* Category Tabs (Only categories with >0 images for active region/search) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              {t('Category:', 'श्रेणी:')}
            </span>
            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-xs rounded-sm transition-all whitespace-nowrap ${ selectedCategory === cat.id ? "bg-brand-navy text-white font-bold shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200" }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* UNIFORM ASPECT-RATIO PHOTO GRID */}
        {filteredMedia.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-sm p-12 text-center space-y-3 transition-colors duration-300">
            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 transition-colors duration-300">{t('No media records found', 'कोई मीडिया रिकॉर्ड नहीं मिला')}</h3>
            <p className="text-xs text-slate-500">
              {t('No photos match your filter combination. Try resetting the region or search term.', 'आपके फ़िल्टर के अनुकूल कोई फोटो नहीं मिली। क्षेत्र या कीवर्ड पुनः सेट करें।')}
            </p>
            <button
              onClick={() => {
                setSelectedRegion("All");
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="px-4 py-1.5 text-xs font-semibold bg-brand-navy text-white rounded-sm"
            >
              {t('Reset Filters', 'फ़िल्टर पुनः सेट करें')}
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedMedia.map((photo, index) => {
                const cleanTitle = photo.title.split("-").pop()?.trim() || photo.title;
                const actualIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;

                return (
                  <div
                    key={photo.id}
                    onClick={() => setActivePhotoIndex(actualIndex)}
                    className="bg-white border border-slate-200 hover:border-brand-navy rounded-sm overflow-hidden transition-all duration-150 group cursor-pointer flex flex-col h-full shadow-xs transition-colors duration-300"
                  >
                    {/* Image container - Fixed 4:3 Aspect Ratio for all images */}
                    <div className="relative bg-slate-100 overflow-hidden aspect-[4/3] w-full shrink-0 transition-colors duration-300">
                      <img
                        src={photo.url}
                        alt={photo.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                      />

                      {/* Top Overlay Badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="bg-brand-navy/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider ">
                          {photo.region}
                        </span>
                      </div>

                      {/* Hover Enlarge Cue */}
                      <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/25 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-brand-navy text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm flex items-center gap-1 transition-colors duration-300">
                          <Maximize2 className="w-3 h-3" /> {t('Inspect Asset', 'चित्र जांचें')}
                        </div>
                      </div>
                    </div>

                    {/* Caption & Metadata Footer */}
                    <div className="p-3 flex flex-col justify-between flex-1">
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-brand-navy transition-colors leading-snug line-clamp-2">
                          {cleanTitle}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                          <span className="font-semibold bg-slate-100 text-brand-navy px-1.5 py-0.5 rounded-xs transition-colors duration-300">
                            {formatCategoryName(photo.category, language === 'hi')}
                          </span>
                          <span className="font-mono text-emerald-700 font-semibold" title="Vector Cosine Match">
                            {photo.match_confidence}
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 truncate max-w-[160px]">
                            {photo.expedition_name.replace("Indian Scientific Expedition to ", "")}
                          </span>
                          <Link
                            href={`/knowledge-repository?expedition=${photo.expedition_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-brand-navy hover:underline font-semibold flex items-center gap-0.5 shrink-0 transition-colors duration-300"
                          >
                            {t('Hub', 'हब')} <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls Bar */}
            {filteredMedia.length > 0 && (
              <div className="mt-8 p-4 border border-slate-200 bg-white rounded-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs transition-colors duration-300">
                <div className="text-slate-600 font-medium">
                  Showing <span className="font-bold text-brand-navy transition-colors duration-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                  <span className="font-bold text-brand-navy transition-colors duration-300">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredMedia.length)}
                  </span>{" "}
                  of <span className="font-bold text-brand-navy transition-colors duration-300">{filteredMedia.length}</span> Photographic Assets
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
        )}

      </main>

      {/* FULL LIGHTBOX PREVIEW MODAL */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-3 sm:p-6"
          onClick={() => setActivePhotoIndex(null)}
        >
          <div
            className="bg-white border-2 border-brand-navy rounded-sm max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="bg-brand-navy text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>NCPOR Polar Archive Asset: {activePhoto.id.toUpperCase()}</span>
                <span className="text-slate-400">|</span>
                <span className="text-blue-200">
                  {activePhotoIndex !== null ? activePhotoIndex + 1 : 1} of {filteredMedia.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPhoto}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActivePhotoIndex(null)}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-sm transition-colors ml-2"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Photo Container */}
            <div className="bg-slate-950 flex-1 min-h-[300px] max-h-[65vh] flex items-center justify-center overflow-hidden p-2 relative select-none">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="max-h-[62vh] max-w-full object-contain"
              />

              {/* Prev / Next floating arrows */}
              <button
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-brand-navy text-white rounded-full transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-brand-navy text-white rounded-full transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Metadata Footer */}
            <div className="p-4 bg-white text-xs border-t border-slate-200 space-y-2 transition-colors duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-brand-navy transition-colors duration-300">{activePhoto.title}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-700 transition-colors duration-300">Category: {formatCategoryName(activePhoto.category)}</span>
                    <span>•</span>
                    <span className="text-brand-navy font-semibold transition-colors duration-300">Region: {activePhoto.region}</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-700">Vector Confidence: {activePhoto.match_confidence}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/knowledge-repository?expedition=${activePhoto.expedition_id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-brand-navy text-brand-navy hover:bg-blue-50 font-semibold rounded-sm transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Open Expedition Hub
                  </Link>

                  <a
                    href={activePhoto.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-navy hover:bg-[#0b3b6f] text-white font-semibold rounded-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </a>
                </div>
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
