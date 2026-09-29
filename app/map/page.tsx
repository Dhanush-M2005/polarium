"use client";

import React, { useState } from "react";
import { Map, MapPin, Compass, Globe, Radio, ShieldAlert, Layers, ShieldCheck, Thermometer, Wind, Eye, Shield } from "lucide-react";
import { MOCK_STATIONS, ResearchStation } from "@/lib/mock-data";

export default function MapPage() {
  const [selectedStation, setSelectedStation] = useState<ResearchStation>(MOCK_STATIONS[0]);
  const [activeDomain, setActiveDomain] = useState<"ALL" | "Antarctica" | "Arctic" | "Himalaya">("ALL");

  const filteredStations = activeDomain === "ALL" 
    ? MOCK_STATIONS 
    : MOCK_STATIONS.filter(s => s.region === activeDomain);

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
              <Map className="w-3.5 h-3.5 text-cyan-300" /> Polar Spatial Network &amp; GIS
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Polar Research Observatories &amp; GIS Map
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed font-medium">
            Spatial GIS interface showing India's active stations: <strong>Maitri</strong> &amp; <strong>Bharati</strong> (Antarctica), <strong>Himadri</strong> (Arctic, Svalbard), and <strong>Himansh</strong> (Himalayas).
          </p>

          {/* Domain Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Domain Filter:</span>
            {(["ALL", "Antarctica", "Arctic", "Himalaya"] as const).map((domain) => (
              <button
                key={domain}
                onClick={() => setActiveDomain(domain)}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors ${ activeDomain === domain ? "bg-amber-400 text-brand-navy shadow-sm font-black" : "bg-white/10 text-white hover:bg-white/20 border border-white/10" }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* GIS System Status Banner */}
        <div className="bg-white border border-slate-300 text-slate-800 rounded-sm p-3.5 flex items-center justify-between text-xs shadow-2xs transition-colors duration-300">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Polar Spatial Network:</strong> Visualizing spatial coordinates, station infrastructure, and sensor telemetry across Antarctica, Arctic, and Himalayas.
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Live Satellite Relay</span>
        </div>

        {/* Map Shell Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Station List */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider transition-colors duration-300">
              Observatories ({filteredStations.length})
            </h2>
            <div className="space-y-3">
              {filteredStations.map((station) => {
                const isSelected = selectedStation.id === station.id;
                return (
                  <div
                    key={station.id}
                    onClick={() => setSelectedStation(station)}
                    className={`cursor-pointer rounded-sm p-4 transition-all border ${ isSelected ? "bg-white border-brand-navy shadow-md ring-2 ring-brand-navy/20" : "bg-white border-slate-200 hover:border-slate-300 shadow-xs" }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs bg-blue-50 text-brand-navy border border-blue-200/60 transition-colors duration-300">
                        {station.region}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {station.status}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-brand-navy text-base transition-colors duration-300">{station.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{station.country}</p>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[11px] font-mono text-slate-500 font-semibold">
                      <span>{station.stationType}</span>
                      <span>{station.latitude}°N / {station.longitude}°E</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right GIS Canvas & Station Info */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Visual Vector Canvas Box */}
            <div className="bg-brand-dark rounded-sm border border-slate-800 p-6 text-white min-h-[380px] flex flex-col justify-between relative overflow-hidden shadow-lg">
              
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Station Coordinates: {selectedStation.latitude}°, {selectedStation.longitude}°</span>
                </div>
                <div className="bg-white/10 px-2.5 py-1 rounded-xs text-[11px] text-amber-300 font-bold border border-white/10">
                  {selectedStation.stationType}
                </div>
              </div>

              {/* Station Central Display Pin */}
              <div className="relative z-10 my-auto text-center space-y-3 py-8">
                <div className="w-16 h-16 rounded-full bg-brand-navy border-2 border-cyan-400 text-cyan-300 flex items-center justify-center mx-auto shadow-xl">
                  <MapPin className="w-8 h-8 animate-bounce text-amber-400" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">{selectedStation.name}</h2>
                <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto font-medium">{selectedStation.country}</p>
              </div>

              {/* Simulated Live Station Environmental Telemetry */}
              <div className="relative z-10 grid grid-cols-3 gap-3 bg-black/40 p-3 rounded-sm border border-white/10 text-xs text-slate-200 font-mono">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Air Temp (AWS)</div>
                    <div className="font-bold text-white">-18.4°C</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Wind Velocity</div>
                    <div className="font-bold text-white">24 knots (SE)</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Telemetry Status</div>
                    <div className="font-bold text-emerald-400">Satellite Link OK</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Station Metadata Details */}
            <div className="bg-white rounded-sm border border-slate-300 p-6 space-y-4 shadow-xs transition-colors duration-300">
              <h3 className="text-base font-bold text-brand-navy flex items-center gap-2 transition-colors duration-300">
                <Compass className="w-5 h-5 text-cyan-600" />
                Facility Details &amp; Research Scope
              </h3>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium transition-colors duration-300">
                {selectedStation.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-slate-50 p-3 rounded-sm border border-slate-200 transition-colors duration-300">
                  <div className="text-slate-400 font-bold uppercase text-[9px] mb-1">Station Capacity:</div>
                  <div className="text-slate-900 font-semibold transition-colors duration-300">
                    Summer: <strong className="text-brand-navy transition-colors duration-300">{selectedStation.summerCapacity} Scientists</strong> | Winter: <strong className="text-brand-navy transition-colors duration-300">{selectedStation.winterCapacity} Scientists</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-sm border border-slate-200 transition-colors duration-300">
                  <div className="text-slate-400 font-bold uppercase text-[9px] mb-1">Key Research Domains:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedStation.researchDomains.map((domain: string) => (
                      <span key={domain} className="bg-white text-brand-navy px-2 py-0.5 rounded-xs border border-slate-200 text-[10px] font-bold transition-colors duration-300">
                        {domain}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

