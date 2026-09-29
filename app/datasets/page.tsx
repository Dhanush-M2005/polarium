"use client";

import React, { useState } from "react";
import { Database, Search, ShieldCheck, Shield } from "lucide-react";
import { getDatasets } from "@/lib/data";
import { DatasetCard } from "@/components/DatasetCard";

export default function DatasetsPage() {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const datasets = getDatasets(selectedDiscipline);

  const filteredDatasets = datasets.filter((ds) => {
    return (
      ds.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ds.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ds.publisher.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Database className="w-3.5 h-3.5 text-cyan-300" /> Scientific Datasets Catalog
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Polar Research Datasets &amp; Sensor Telemetry
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed font-medium">
            Open-access repositories of meteorological AWS time-series, ice core stable isotopes (δ18O), oceanographic CTD profiles, and high-altitude Himalayan glaciology grids.
          </p>

          {/* Search Controls & Discipline Pills */}
          <div className="pt-2 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by dataset title, DOI or investigator..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-sm text-xs sm:text-sm text-white placeholder-slate-300 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
              <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Discipline:</span>
              {["ALL", "Atmospheric Science", "Glaciology", "Oceanography", "Geology"].map((disc) => (
                <button
                  key={disc}
                  onClick={() => setSelectedDiscipline(disc)}
                  className={`px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors ${ selectedDiscipline === disc ? "bg-amber-400 text-brand-navy shadow-sm font-black" : "bg-white/10 text-white hover:bg-white/20 border border-white/10" }`}
                >
                  {disc}
                </button>
              ))}
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
              Showing <strong>{filteredDatasets.length}</strong> open scientific dataset records adhering to NetCDF4 and FAIR data standards.
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">FAIR Data Compliant</span>
        </div>

        {/* Datasets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map((dataset) => (
            <DatasetCard key={dataset.id} dataset={dataset} />
          ))}
        </div>

      </main>

    </div>
  );
}

