"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Map, MapPin, Compass, Globe, ExternalLink, ShieldCheck, Layers, Radio } from "lucide-react";
import { MOCK_STATIONS, ResearchStation } from "@/lib/mock-data";

export function MapPreview() {
  const [selectedStation, setSelectedStation] = useState<ResearchStation>(MOCK_STATIONS[0]);
  const [activeRegion, setActiveRegion] = useState<"ALL" | "Antarctica" | "Arctic" | "Himalaya">("ALL");

  const filteredStations = activeRegion === "ALL" 
    ? MOCK_STATIONS 
    : MOCK_STATIONS.filter(s => s.region === activeRegion);

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      
      {/* Top Map Control Header */}
      <div className="bg-slate-950 p-4 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 text-xs font-mono mb-2 border border-cyan-800/40">
            <Globe className="w-3.5 h-3.5" />
            Polar GIS & Spatial Network Preview
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            India's Polar Research Locations & Observatories
          </h3>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Visualizing Maitri, Bharati, Himadri, and Himansh field stations across 3 polar domains.
          </p>
        </div>

        {/* Region Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
          {(["ALL", "Antarctica", "Arctic", "Himalaya"] as const).map((reg) => (
            <button
              key={reg}
              onClick={() => setActiveRegion(reg)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${ activeRegion === reg ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-800" }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visual GIS Map Representation */}
      <div className="relative min-h-[380px] md:min-h-[440px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 flex flex-col justify-between overflow-hidden">
        
        {/* Decorative Grid Overlay representing GIS Coordinates */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        {/* Map Header Overlay */}
        <div className="relative z-10 flex justify-between items-center text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-md border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>GIS Map Layer: Vector Grid</span>
          </div>
          <div className="hidden sm:block text-slate-500">
            Lat/Long Network: 70°S to 78°N
          </div>
        </div>

        {/* Interactive Station Markers on Map Canvas */}
        <div className="relative z-10 my-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredStations.map((station) => {
            const isSelected = selectedStation.id === station.id;
            return (
              <div
                key={station.id}
                onClick={() => setSelectedStation(station)}
                className={`cursor-pointer rounded-xl p-4 transition-all border ${ isSelected ? "bg-slate-800/90 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-950/50" : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80" }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                    {station.region}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <MapPin className={`w-4 h-4 ${isSelected ? "text-cyan-400" : "text-slate-400"}`} />
                  <h4 className="font-bold text-white text-sm">{station.name}</h4>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {station.country}
                </p>

                <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80 flex justify-between">
                  <span>{station.stationType}</span>
                  <span>{station.latitude}°N / {station.longitude}°E</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Station Details Drawer Box */}
        {selectedStation && (
          <div className="relative z-10 bg-slate-950/90 rounded-xl p-4 sm:p-5 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="font-bold text-cyan-300 text-sm">{selectedStation.name}</span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-slate-300 text-xs font-medium">{selectedStation.stationType}</span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-emerald-400 text-xs font-mono">{selectedStation.status}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedStation.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedStation.researchDomains.map((domain: string) => (
                  <span key={domain} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {domain}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/map"
              className="w-full md:w-auto px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
            >
              <Compass className="w-4 h-4" />
              Explore Interactive Map
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
