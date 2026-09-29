import React from "react";
import Link from "next/link";
import { Dataset } from "@/lib/data";
import { Database, FileCode, Download, Tag, ShieldCheck } from "lucide-react";

interface DatasetCardProps {
  dataset: Dataset;
}

export function DatasetCard({ dataset }: DatasetCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group transition-colors">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-brand-navy border border-blue-200/80 uppercase tracking-wider transition-colors duration-300">
            <Tag className="w-3 h-3 text-cyan-600" />
            {dataset.researchDomain || (dataset.disciplines && dataset.disciplines[0]) || "Polar Data"}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 transition-colors duration-300">
            {dataset.formats ? dataset.formats.join(", ") : "NetCDF4"} • {dataset.size}
          </span>
        </div>

        <h3 className="text-base font-extrabold text-brand-navy leading-snug group-hover:text-blue-700 transition-colors">
          {dataset.title}
        </h3>

        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
          {dataset.abstract || dataset.description}
        </p>

        <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50/80 p-3 rounded-lg border border-slate-100 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold uppercase text-[9px]">DOI:</span>
            <span className="text-brand-navy font-bold transition-colors duration-300">{dataset.doi || "10.6084/m9.figshare.ncpor"}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="text-slate-400 font-bold uppercase text-[9px]">Coverage:</span>
            <span className="font-semibold">{dataset.coverageStart} to {dataset.coverageEnd}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="text-slate-400 font-bold uppercase text-[9px]">Publisher:</span>
            <span className="truncate max-w-[180px] font-semibold text-slate-800 transition-colors duration-300">{dataset.publisher}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[10px] text-amber-700 font-mono font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          Access: {dataset.accessLevel || "Open Data"}
        </span>
        <Link
          href={`/polar-hub?expedition=${dataset.id}`}
          className="px-3.5 py-1.5 rounded-sm bg-brand-navy hover:bg-[#0b3b6f] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-amber-300" />
          Open Dataset
        </Link>
      </div>
    </div>
  );
}

