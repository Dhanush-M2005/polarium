"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FlaskConical, CheckCircle2, ArrowRight } from "lucide-react";
import { getProjects } from "@/lib/data";

export default function ResearchPage() {
  const [activeDomain, setActiveDomain] = useState<string>("ALL");

  const researchProjects = getProjects(activeDomain);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Scientific Initiatives & Programs</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          Polar Research Initiatives
        </h1>

        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          National research projects funded under the Ministry of Earth Sciences (MoES) PAC-Polar scheme, advancing global climate understanding.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          {["ALL", "Antarctica", "Arctic", "Himalaya", "Oceanography", "Glaciology"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveDomain(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${ activeDomain === tab ? "bg-cyan-600 text-white shadow-sm" : "bg-slate-800 text-slate-300 hover:bg-slate-700" }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {researchProjects.map((proj) => (
          <div key={proj.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between transition-colors duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                  {proj.researchDomain}
                </span>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  {proj.status} ({proj.startDate.slice(0, 4)} - {proj.endDate.slice(0, 4)})
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-snug transition-colors duration-300">
                {proj.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {proj.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                {proj.disciplines.join(", ")}
              </span>
              <Link 
                href={`/research/${proj.id}`}
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
              >
                View Project Details
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
