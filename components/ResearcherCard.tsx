import React from "react";
import Link from "next/link";
import { Researcher } from "@/lib/mock-data";
import { UserCheck, Award, Mail, Compass, BookOpen } from "lucide-react";

interface ResearcherCardProps {
  researcher: Researcher;
}

export function ResearcherCard({ researcher }: ResearcherCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 transition-colors duration-300">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 text-cyan-400 font-bold text-base flex items-center justify-center border-2 border-cyan-500/30 flex-shrink-0">
            {researcher.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight transition-colors duration-300">
              {researcher.name}
            </h3>
            <div className="text-xs text-cyan-700 font-semibold mt-0.5">
              {researcher.designation}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider font-mono">
              {researcher.institutionId}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-xs transition-colors duration-300">
          <div className="text-slate-500 text-[11px] font-medium">Specializations:</div>
          <div className="font-semibold text-slate-800 transition-colors duration-300">{researcher.specializations.join(", ")}</div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
          {researcher.profileSummary}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {researcher.researchDomains.map((domain: string) => (
            <span key={domain} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 transition-colors duration-300">
              {domain}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex gap-3 text-[11px]">
          <span className="flex items-center gap-1 font-medium text-slate-700 transition-colors duration-300">
            <Compass className="w-3 h-3 text-cyan-600" />
            {researcher.expeditionIds?.length || 0} Expeditions
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-700 transition-colors duration-300">
            <BookOpen className="w-3 h-3 text-cyan-600" />
            {researcher.publicationIds?.length || 0} Papers
          </span>
        </div>
        
        <Link
          href={`/researchers?id=${researcher.id}`}
          className="text-xs font-semibold text-cyan-700 hover:text-cyan-800"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
