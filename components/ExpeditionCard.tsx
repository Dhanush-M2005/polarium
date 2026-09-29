import React from "react";
import Link from "next/link";
import { Compass, Calendar, MapPin, Users, ArrowUpRight, ShieldAlert } from "lucide-react";
import { Expedition } from "@/lib/mock-data";

interface ExpeditionCardProps {
  expedition: Expedition;
}

export function ExpeditionCard({ expedition }: ExpeditionCardProps) {
  const getRegionBadgeClass = (region: string) => {
    switch (region) {
      case "Antarctica":
        return "bg-cyan-50 text-cyan-800 border-cyan-200/80 shadow-xs";
      case "Arctic":
        return "bg-blue-50 text-blue-800 border-blue-200/80 shadow-xs";
      case "Himalaya":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-xs";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 shadow-xs";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group transition-colors">
      
      {/* Header Bar */}
      <div className="p-5 pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getRegionBadgeClass(expedition.region)}`}>
            {expedition.region}
          </span>
          <span className="text-[11px] font-mono font-semibold text-slate-500 flex items-center gap-1 bg-slate-100/70 px-2 py-0.5 rounded-sm">
            <Calendar className="w-3 h-3 text-brand-navy transition-colors duration-300" />
            {expedition.year}
          </span>
        </div>

        <h3 className="text-base font-extrabold text-brand-navy group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
          {expedition.name}
        </h3>
        
        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-cyan-600" />
          <span>{expedition.polarRegion}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 pt-3 space-y-3 flex-grow">
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
          {expedition.description}
        </p>

        <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100 text-[11px] space-y-0.5">
          <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Chief Scientist:</div>
          <div className="font-bold text-brand-navy transition-colors duration-300">{expedition.chiefScientist}</div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1 font-semibold text-slate-700 transition-colors duration-300">
            <Users className="w-3.5 h-3.5 text-cyan-600" />
            {expedition.participatingResearchers?.length || 0} Researchers
          </span>
          <span className="bg-blue-50 text-brand-navy border border-blue-100 px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors duration-300">
            {expedition.datasets?.length || 0} Datasets
          </span>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between transition-colors duration-300">
        <span className="text-[10px] text-amber-700 font-mono font-bold flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          Official MoES Record
        </span>

        <Link
          href={`/polar-hub?expedition=${expedition.id}`}
          className="text-xs font-bold text-brand-navy group-hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          Explore Expedition
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

    </div>
  );
}

