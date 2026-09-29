"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Download,
  MapPin,
  Search,
  Sparkles,
  X,
  Shield,
  ExternalLink,
  Compass,
  Loader2,
  Database,
  FileText,
} from "lucide-react";
import { InteractiveGlobe } from "@/components/Globe/InteractiveGlobe";
import { DhruvAILogo } from "@/components/DhruvAILogo";
import { useLanguage } from "@/context/LanguageContext";

interface SearchMatchItem {
  id: string;
  title: string;
  type: string;
  region: string;
  expedition_id: string;
  expedition_name: string;
  snippet: string;
  score: number;
  url: string;
}

const datasets = [
  { title: "43-IAE Glaciology Report", category: "Glaciology", date: "18 Sep 2026", size: "4.2 MB", href: "/polar-hub?expedition=exp-043" },
  { title: "Southern Ocean CTD Hydrography Data", category: "Oceanography", date: "11 Sep 2026", size: "18.7 MB", href: "/polar-hub?expedition=exp-025" },
  { title: "Maitri Meteorological Series (AWS)", category: "Atmospheric", date: "06 Sep 2026", size: "2.1 MB", href: "/polar-hub?expedition=exp-043" },
  { title: "IndARC Kongsfjorden Mooring Timeseries", category: "Marine Physics", date: "28 Aug 2026", size: "34.5 MB", href: "/polar-hub?expedition=exp-arc-015" },
  { title: "Himansh Cryospheric Mass Balance Series", category: "Cryosphere", date: "14 Aug 2026", size: "8.9 MB", href: "/polar-hub?expedition=exp-him-008" },
];

export default function Page() {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [showTooltip, setShowTooltip] = useState(true);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const router = useRouter();

  // Global Vector Search States
  const [searchResults, setSearchResults] = useState<SearchMatchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced vector search call
  useEffect(() => {
    const q = search.trim();
    if (!q || q.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/search?q=${encodeURIComponent(q)}&limit=3`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setSearchResults(data.results);
            setSearchOpen(true);
          } else {
            setSearchResults([]);
          }
        }
      } catch (err) {
        console.error("Vector search connection notice:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-white focus:text-brand-dark focus:z-50 transition-colors duration-300">
        Skip to main content
      </a>

      {/* HERO BANNER: Ultra-Premium Polar Knowledge Platform Hero */}
      <section className="bg-gradient-to-r from-brand-dark via-brand-navy to-brand-navy text-white py-10 px-5 sm:px-8 border-b border-slate-800 shadow-md relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-[1440px] flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          
          {/* Hero Titles & Badges */}
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-sm text-xs font-bold uppercase tracking-wider ">
                <Shield className="w-3.5 h-3.5 text-amber-300" /> {t('State Emblem of India', 'भारत का राज्य प्रतीक')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 rounded-sm text-xs font-bold uppercase tracking-wider font-mono">
                {t('40+ Years of Polar Expeditions', 'ध्रुवीय अभियानों के 40+ वर्ष')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
              {t('National Polar Data & Relational Knowledge Graph', 'राष्ट्रीय ध्रुवीय डेटा एवं ज्ञान नेटवर्क पोर्टल')}
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {t(
                "Ingesting, vector-linking, and serving scientific datasets, peer-reviewed publications, and photo archives across India's polar stations: Bharati, Maitri, Himadri, and Himansh.",
                "भारती, मैत्री, हिमाद्रि एवं हिमांश: भारत के ध्रुवीय अनुसंधान केंद्रों के वैज्ञानिक डेटासेट, शोध पत्र पत्रिकाओं एवं चित्र अभिलेखागार प्रदान करना।"
              )}
            </p>
          </div>

          {/* Integrated Vector Search Engine Input */}
          <div ref={searchContainerRef} className="w-full max-w-[560px] relative">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {t('Vector Knowledge Search Engine (Dhruv AI)', 'वेक्टर ज्ञान खोज इंजन (ध्रुव एआई)')}
            </div>
            
            <form
              className="flex h-12 w-full border-2 border-white/20 rounded-sm overflow-hidden bg-white/10 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30 transition-all shadow-lg"
              onSubmit={handleSearchSubmit}
              role="search"
            >
              <div className="flex flex-1 items-center bg-white px-3.5 text-slate-800 transition-colors duration-300">
                {isSearching ? (
                  <Loader2 size={18} className="mr-2.5 shrink-0 text-brand-navy animate-spin transition-colors duration-300" />
                ) : (
                  <Search size={18} className="mr-2.5 shrink-0 text-brand-navy transition-colors duration-300" />
                )}
                <input
                  id="hero-global-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setSearchOpen(true);
                  }}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400 font-semibold transition-colors duration-300"
                  placeholder={t(
                    'Search 40 years of Indian Polar Research, Expeditions, and Media...',
                    '40 वर्षों के भारतीय ध्रुवीय अनुसंधान, अभियानों और मीडिया में खोजें...'
                  )}
                />
              </div>
              <button
                type="submit"
                className="bg-brand-navy hover:bg-[#0b3b6f] px-6 text-xs sm:text-sm font-bold text-white transition-colors border-l border-white/10 flex items-center gap-1"
              >
                {t('Search', 'खोजें')}
              </button>
            </form>

            {/* Absolute Dropdown for Top Vector Matches */}
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 shadow-2xl rounded-sm z-50 overflow-hidden divide-y divide-slate-100 text-slate-900 animate-fade-in transition-colors duration-300">
                <div className="bg-brand-navy text-white px-3.5 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Sparkles size={11} className="text-amber-300" />
                    {t('Top Vector Knowledge Matches (384-dim Embeddings)', 'शीर्ष वेक्टर ज्ञान परिणाम (384-आयामी एमबेरडिंग्स्)')}
                  </span>
                  <span className="font-mono text-cyan-300 font-semibold">{t('Live Knowledge Graph', 'प्रत्यक्ष ज्ञान नेटवर्क')}</span>
                </div>

                {searchResults.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={() => setSearchOpen(false)}
                    className="block p-3 hover:bg-blue-50/70 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider ${ item.type.includes("Expedition") ? "bg-brand-navy text-white" : item.type.includes("Dataset") ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800" }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 group-hover:text-emerald-700 transition-colors font-semibold">
                        {t('Cosine Sim:', 'समानता गुणांक:')} {item.score}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-brand-navy transition-colors mt-1">
                      {item.title}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.snippet}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main id="main-content" className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8">
        
        {/* 1. 3D INTERACTIVE GIS GLOBE SECTION (Integrated UI Container) */}
        <section aria-labelledby="map-title" className="relative">
          <h1 id="map-title" className="sr-only">
            3D Interactive GIS Globe: Live Tracking of Maitri, Bharati, Himadri &amp; Himansh Stations
          </h1>

          {/* Dedicated 3D Globe Instrument */}
          <InteractiveGlobe />
        </section>

        {/* 2. REPOSITORY & MEDIA ARCHIVES GRID */}
        <section className="mt-9 grid gap-7 lg:grid-cols-[3fr_2fr]">
          
          {/* Datasets Table */}
          <div id="datasets" className="border border-slate-200 bg-white rounded-sm shadow-sm transition-colors duration-300">
            <div className="flex items-end justify-between border-b border-slate-200 px-5 py-5 transition-colors duration-300">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-orange transition-colors duration-300">
                  {t('Knowledge Repository', 'ज्ञान भण्डार')}
                </div>
                <h2 className="text-xl font-bold text-brand-dark transition-colors duration-300">{t('Recently Added Datasets', 'हाल ही में जोड़े गए डेटासेट')}</h2>
              </div>
              <Link
                href="/polar-hub"
                className="hidden items-center gap-1 text-xs font-bold text-brand-navylight hover:text-brand-navylight sm:flex transition-colors"
              >
                {t('View all in Polar Hub', 'ध्रुवीय हब में सभी देखें')} <ArrowRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200 transition-colors duration-300">
                  <tr>
                    <th className="px-5 py-3 font-bold">{t('Dataset', 'डेटासेट')}</th>
                    <th className="px-4 py-3 font-bold">{t('Date', 'दिनांक')}</th>
                    <th className="px-4 py-3 font-bold">{t('Category', 'श्रेणी')}</th>
                    <th className="px-4 py-3 font-bold">{t('Action', 'कार्रवाई')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 transition-colors duration-300">
                  {datasets.map((dataset) => (
                    <tr key={dataset.title} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <Link href={dataset.href} className="font-semibold text-[#243b5a] hover:text-brand-navylight transition-colors block">
                          {dataset.title}
                        </Link>
                        <div className="mt-1 text-[11px] text-slate-400 font-mono">
                          Format · {dataset.size}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500 font-mono">{dataset.date}</td>
                      <td className="px-4 py-4">
                        <span className="border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700 rounded-sm transition-colors duration-300">
                          {dataset.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={dataset.href}
                          aria-label={`Inspect ${dataset.title}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-navylight hover:text-brand-orange transition-colors"
                        >
                          <Download size={15} /> {t('Open in Hub', 'हब में खोलें')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Media Archives Dissemination */}
          <div id="media" className="border border-slate-200 bg-white rounded-sm shadow-sm flex flex-col justify-between transition-colors duration-300">
            <div>
              <div className="border-b border-slate-200 px-5 py-5 flex items-end justify-between transition-colors duration-300">
                <div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-orange transition-colors duration-300">
                    {t('Media Archives', 'मीडिया अभिलेखागार')}
                  </div>
                  <h2 className="text-xl font-bold text-brand-dark transition-colors duration-300">{t('Latest Media Dissemination', 'नवीनतम मीडिया प्रकाशन')}</h2>
                </div>
                <Link href="/media-gallery" className="text-xs font-bold text-brand-navylight hover:text-brand-navylight flex items-center gap-1 transition-colors">
                  {t('View all', 'सभी देखें')} <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <article className="group relative overflow-hidden bg-slate-100 rounded-sm border border-slate-200 shadow-sm transition-colors duration-300">
                  <img
                    src="/antarctic-vessel.png"
                    alt="Icebreaker vessel in the Southern Ocean"
                    className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent p-3 pt-10 text-xs font-semibold text-white">
                    {t('Icebreaker Vessel in Southern Ocean', 'दक्षिण महासागर में बर्फ़ तोड़ने वाला जहाज़')}
                  </div>
                </article>

                <article className="group relative overflow-hidden bg-slate-100 rounded-sm border border-slate-200 shadow-sm transition-colors duration-300">
                  <img
                    src="/antarctic-station.png"
                    alt="Indian polar research station in Antarctica"
                    className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent p-3 pt-10 text-xs font-semibold text-white">
                    {t('Life at Bharati Station', 'भारती स्टेशन पर जीवन')}
                  </div>
                </article>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between transition-colors duration-300">
              <span>{t('National Centre for Polar and Ocean Research', 'राष्ट्रीय ध्रुवीय एवं महासागर अनुसंधान केंद्र')}</span>
              <Link href="/media-gallery" className="text-brand-navylight font-bold hover:underline transition-colors duration-300">
                {t('View 120+ Photos & Video Logs →', '120+ चित्र एवं वीडियो रिकॉर्ड देखें →')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 4. FLOATING AI ASSISTANT ACTION ("Ask Dhruv AI") */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <div
          className={`relative border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-brand-dark shadow-xl rounded-sm transition-all ${ showTooltip ? "" : "hidden" }`}
        >
          {t('Ask Dhruv AI (Polar Assistant)', 'ध्रुव एआई से पूछें (ध्रुवीय सहायक)')}
          <button
            onClick={() => setShowTooltip(false)}
            aria-label="Dismiss Ask Dhruv AI tooltip"
            className="ml-3 text-slate-400 hover:text-slate-700 transition-colors duration-300"
          >
            <X size={13} />
          </button>
          <span className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-r border-t border-slate-200 bg-white transition-colors duration-300" />
        </div>

        <Link
          href="/dhruv-ai"
          aria-label="Open Dhruv AI assistant"
          className="transition-transform hover:scale-110 active:scale-95 duration-200 block cursor-pointer"
        >
          <DhruvAILogo className="size-14 sm:size-15 drop-shadow-2xl" />
        </Link>
      </div>
    </div>
  );
}
