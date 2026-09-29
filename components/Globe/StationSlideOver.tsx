"use client";

import React from "react";
import Link from "next/link";
import { X, MapPin, Compass, ArrowRight, Wind, Thermometer, Radio, ShieldCheck, Mountain } from "lucide-react";
import { StationData } from "@/lib/data/station-service";

interface StationSlideOverProps {
  station: StationData | null;
  onClose: () => void;
}

export function StationSlideOver({ station, onClose }: StationSlideOverProps) {
  if (!station) return null;

  return (
    <div className="absolute inset-y-0 right-0 z-40 w-full sm:w-[420px] max-w-full bg-white shadow-2xl border-l border-[#cad5e2] flex flex-col transform transition-transform duration-300 ease-in-out transition-colors">
      {/* 1. Official Government Header */}
      <div className="bg-brand-dark text-white p-5 flex items-start justify-between border-b border-[#0b1d3a] relative">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] uppercase text-cyan-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>National Polar Station • {station.region}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
            {station.name}
          </h2>
          <div className="text-[11px] text-slate-300 font-mono">
            {station.latitude > 0 ? `${station.latitude}°N` : `${Math.abs(station.latitude)}°S`}, {" "}
            {station.longitude > 0 ? `${station.longitude}°E` : `${Math.abs(station.longitude)}°W`}
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close station panel"
          className="text-slate-300 hover:text-white p-1 rounded-sm bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-brand-dark transition-colors duration-300">
        {/* Telemetry Strip */}
        <div className="grid grid-cols-3 gap-2 bg-[#f1f5f9] p-3 rounded-sm border border-[#e2e8f0] text-center">
          <div className="border-r border-slate-200 pr-1 transition-colors duration-300">
            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-center gap-1">
              <Thermometer className="w-3 h-3 text-brand-navylight transition-colors duration-300" /> Air Temp
            </div>
            <div className="text-xs font-bold text-brand-dark mt-0.5">{station.telemetry.temp}</div>
          </div>
          <div className="border-r border-slate-200 px-1 transition-colors duration-300">
            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-center gap-1">
              <Wind className="w-3 h-3 text-brand-navylight transition-colors duration-300" /> Velocity
            </div>
            <div className="text-xs font-bold text-brand-dark mt-0.5">{station.telemetry.wind}</div>
          </div>
          <div className="pl-1">
            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-center gap-1">
              <Radio className="w-3 h-3 text-emerald-600" /> Status
            </div>
            <div className="text-xs font-bold text-emerald-700 mt-0.5">{station.telemetry.status}</div>
          </div>
        </div>

        {/* Research Summary Section */}
        <section className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-navylight transition-colors duration-300">
            <ShieldCheck className="w-4 h-4 text-brand-navylight transition-colors duration-300" />
            <span>Research Summary</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed bg-[#f8fafc] p-3 rounded-sm border border-slate-200 transition-colors duration-300">
            {station.description}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {station.researchDomains.map((domain) => (
              <span
                key={domain}
                className="text-[10px] font-medium bg-[#eaf2f9] text-brand-navylight px-2 py-0.5 rounded-sm border border-[#c6dcf0] transition-colors duration-300"
              >
                {domain}
              </span>
            ))}
          </div>
        </section>

        {/* Latest Expeditions Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 transition-colors duration-300">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-orange transition-colors duration-300">
              <Compass className="w-4 h-4 text-brand-orange transition-colors duration-300" />
              <span>Latest Expeditions</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono font-semibold ml-1">
                {station.totalExpeditions} Total
              </span>
            </div>
            <Link
              href={`/polar-hub?station=${encodeURIComponent(station.name)}`}
              className="text-[11px] font-bold text-brand-navylight hover:text-brand-navylight flex items-center gap-1 transition-colors duration-300"
            >
              View Expeditions <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {station.latestExpeditions.map((exp, idx) => (
              <Link
                key={exp.id || idx}
                href={`/polar-hub?expedition=${exp.id || "exp-043"}&station=${encodeURIComponent(station.name)}`}
                className="group block p-3 rounded-sm border border-slate-200 bg-white hover:border-brand-navylight hover:bg-slate-50 transition-all shadow-sm transition-colors duration-300"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-brand-dark text-white">
                    Expedition #{exp.number}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{exp.year}</span>
                </div>
                <div className="text-xs font-bold text-brand-dark group-hover:text-brand-navylight transition-colors line-clamp-1">
                  {exp.name}
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Lead: <strong className="text-slate-700 transition-colors duration-300">{exp.chief}</strong></span>
                  <span className="text-slate-400 text-[10px]">{exp.date}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* 3. Panel Footer Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 transition-colors duration-300">
        <Link
          href={`/polar-hub?station=${encodeURIComponent(station.name)}`}
          className="flex-1 bg-brand-navylight hover:bg-brand-navylight text-white text-xs font-bold py-2.5 px-4 rounded-sm transition-colors text-center flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Compass className="w-3.5 h-3.5" />
          View Expeditions
        </Link>
        <button
          onClick={onClose}
          className="border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-sm transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
