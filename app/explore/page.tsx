import React from "react";
import Link from "next/link";
import { Layers, Search, Filter, ShieldCheck, Compass, Database, FlaskConical, FileText, Users, MapPin } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { KnowledgeCard } from "@/components/KnowledgeCard";
import { MOCK_STATS } from "@/lib/mock-data";

export default function ExplorePage() {
  const exploreCards = [
    {
      title: "Expeditions",
      description: "Explore India's polar expeditions and their scientific activities across Antarctica, Arctic & Himalayas.",
      href: "/expeditions",
      icon: Compass,
      countBadge: "40+ Expeditions",
    },
    {
      title: "Datasets",
      description: "Discover research datasets, ice core isotopic logs, and NetCDF oceanographic metadata.",
      href: "/datasets",
      icon: Database,
      countBadge: "450+ Datasets",
    },
    {
      title: "Research",
      description: "Explore ongoing & completed scientific projects and paleoclimate research programs.",
      href: "/research",
      icon: FlaskConical,
      countBadge: "80+ Projects",
    },
    {
      title: "Publications",
      description: "Find peer-reviewed publications, expedition scientific reports, and NCPOR technical bulletins.",
      href: "/publications",
      icon: FileText,
      countBadge: "1,200+ Reports",
    },
    {
      title: "Researchers",
      description: "Discover researchers, polar scientists, and their specific domain areas of expertise.",
      href: "/researchers",
      icon: Users,
      countBadge: "600+ Scientists",
    },
    {
      title: "Locations",
      description: "Explore polar research stations including Maitri, Bharati, Himadri, and Himansh.",
      href: "/map",
      icon: MapPin,
      countBadge: "4 Observatories",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
          <Layers className="w-3.5 h-3.5" />
          <span>Knowledge Discovery Engine</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          Explore Polar Knowledge Base
        </h1>

        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          Comprehensive scientific index of Indian polar expeditions, datasets, research projects, publications, and scientist profiles managed under NCPOR programs.
        </p>

        <div className="pt-2">
          <SearchBar placeholder="Search across all polar knowledge domains..." />
        </div>
      </div>

      {/* Official Index Notice */}
      <div className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl p-4 flex items-center gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
        <div>
          <strong>Official Scientific Index:</strong> The repository catalogs verified expeditions, ice core datasets, polar oceanography profiles, and peer-reviewed literature across Indian polar stations.
        </div>
      </div>

      {/* Grid Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exploreCards.map((card) => (
          <KnowledgeCard
            key={card.title}
            title={card.title}
            description={card.description}
            href={card.href}
            icon={card.icon}
            countBadge={card.countBadge}
          />
        ))}
      </div>

      {/* Knowledge Statistics Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 transition-colors duration-300">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Knowledge Base Index Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-lg transition-colors duration-300">
            <div className="text-xl font-bold text-slate-900 transition-colors duration-300">{MOCK_STATS.totalExpeditions}</div>
            <div className="text-xs text-slate-500">Field Operations</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg transition-colors duration-300">
            <div className="text-xl font-bold text-slate-900 transition-colors duration-300">{MOCK_STATS.datasetsCount}</div>
            <div className="text-xs text-slate-500">Open Datasets</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg transition-colors duration-300">
            <div className="text-xl font-bold text-slate-900 transition-colors duration-300">{MOCK_STATS.publicationsCount}</div>
            <div className="text-xs text-slate-500">Citations Cataloged</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg transition-colors duration-300">
            <div className="text-xl font-bold text-slate-900 transition-colors duration-300">{MOCK_STATS.researchersCount}</div>
            <div className="text-xs text-slate-500">Registered Authors</div>
          </div>
        </div>
      </div>

    </div>
  );
}
