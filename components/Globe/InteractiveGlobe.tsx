"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

const GlobeInner = dynamic(() => import("./GlobeInner"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-[520px] overflow-hidden border border-[#cad5e2] bg-[#07111c] shadow-md rounded-sm flex items-center justify-center">
      <div className="text-center space-y-3 z-10">
        <div className="inline-flex items-center gap-2 border border-[#51718b] bg-white/10 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.16em] text-cyan-300 shadow-md rounded-sm">
          <MapPin size={13} className="text-brand-orange animate-bounce transition-colors duration-300" />
          <span>INITIALIZING 3D POLAR GIS ENGINE</span>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Loading Maitri, Bharati, Himadri &amp; Himansh Geospatial Telemetry...
        </p>
      </div>

      {/* Subtle grid lines background placeholder */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(42,92,126,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(42,92,126,.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  ),
});

export function InteractiveGlobe() {
  return <GlobeInner />;
}
