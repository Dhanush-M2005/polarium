"use client";

import React, { useState } from "react";
import { Users, Search, ShieldCheck, Shield } from "lucide-react";
import { MOCK_RESEARCHERS } from "@/lib/mock-data";
import { ResearcherCard } from "@/components/ResearcherCard";

export default function ResearchersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = MOCK_RESEARCHERS.filter((r) => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.specializations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
    r.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.institutionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300 pb-20">
      
      {/* Official Government Hero Header */}
      <section className="bg-gradient-to-r from-brand-dark via-brand-navy to-brand-navy text-white py-10 px-4 sm:px-8 border-b-4 border-cyan-500 shadow-md">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-sm text-xs font-bold uppercase tracking-wider ">
              <Shield className="w-3.5 h-3.5 text-amber-300" /> State Emblem of India
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 rounded-sm text-xs font-bold uppercase tracking-wider font-mono">
              <Users className="w-3.5 h-3.5 text-cyan-300" /> Polar Scientists Directory
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Researchers &amp; Lead Expert Profiles
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed font-medium">
            Directory of veteran Indian polar scientists, chief expedition leaders, paleoclimatologists, glaciologists, and oceanographers leading NCPOR research initiatives.
          </p>

          <div className="pt-2">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by researcher name, designation or specialization..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-sm text-xs sm:text-sm text-white placeholder-slate-300 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div className="bg-white border border-slate-300 text-slate-800 rounded-sm p-3.5 flex items-center justify-between text-xs shadow-2xs transition-colors duration-300">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Showing <strong>{filtered.length}</strong> scientist profiles and chief expedition leaders.
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">National Polar Directory</span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((researcher) => (
            <ResearcherCard key={researcher.id} researcher={researcher} />
          ))}
        </div>

      </main>

    </div>
  );
}

