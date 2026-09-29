"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Compass, Search, Calendar, MapPin, Users, ShieldCheck, Shield } from "lucide-react";
import { getExpeditions } from "@/lib/data";
import { ExpeditionCard } from "@/components/ExpeditionCard";

export default function ExpeditionsPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const expeditions = getExpeditions(selectedRegion);

  const filteredExpeditions = expeditions.filter((exp) => {
    return (
      exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.chiefScientist.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
              <Compass className="w-3.5 h-3.5 text-cyan-300" /> Polar Expeditions Directory
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Indian Scientific Expeditions Archive
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed font-medium">
            40+ Years of verified scientific expeditions to <strong>Antarctica</strong> (Bharati &amp; Maitri), <strong>Arctic</strong> (Himadri, Ny-Ålesund), and <strong>Himalayan Glaciers</strong> (Himansh Observatory).
          </p>

          {/* Search Controls & Region Pills */}
          <div className="pt-2 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by expedition title or chief scientist..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-sm text-xs sm:text-sm text-white placeholder-slate-300 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
              <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Region:</span>
              {["ALL", "Antarctica", "Arctic", "Himalaya"].map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors ${ selectedRegion === region ? "bg-amber-400 text-brand-navy shadow-sm font-black" : "bg-white/10 text-white hover:bg-white/20 border border-white/10" }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="bg-white border border-slate-300 text-slate-800 rounded-sm p-3.5 flex items-center justify-between text-xs shadow-2xs transition-colors duration-300">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Showing <strong>{filteredExpeditions.length}</strong> verified expedition records from Indian polar research missions.
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Source: NCPOR / MoES Registry</span>
        </div>

        {filteredExpeditions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExpeditions.map((expedition) => (
              <ExpeditionCard key={expedition.id} expedition={expedition} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-sm border border-slate-300 p-12 text-center space-y-3 transition-colors duration-300">
            <Compass className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 transition-colors duration-300">No matching expeditions found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or region filter.</p>
            <button
              onClick={() => { setSelectedRegion("ALL"); setSearchTerm(""); }}
              className="px-4 py-2 rounded-sm bg-brand-navy text-white text-xs font-bold hover:bg-[#0b3b6f]"
            >
              Reset Filters
            </button>
          </div>
        )}

      </main>

    </div>
  );
}

