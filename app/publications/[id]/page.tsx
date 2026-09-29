import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, BookOpen, Users, Database, Compass, ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { 
  getPublicationById, 
  getResearcherById, 
  getExpeditionById, 
  getProjectById,
  getDatasetById 
} from "@/lib/data";

export default function PublicationDetailPage({ params }: { params: { id: string } }) {
  const pub = getPublicationById(params.id);

  if (!pub) {
    notFound();
  }

  const authors = pub.authorIds.map(aid => getResearcherById(aid)).filter(Boolean);
  const expeditions = pub.expeditionIds.map(eid => getExpeditionById(eid)).filter(Boolean);
  const projects = pub.projectIds.map(pid => getProjectById(pid)).filter(Boolean);
  const datasets = pub.datasetIds.map(did => getDatasetById(did)).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <Link href="/publications" className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-800">
        <ArrowLeft className="w-4 h-4" />
        Back to Publications Catalog
      </Link>

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
            {pub.publicationType} • {pub.year}
          </span>
          <span className="text-xs font-mono text-cyan-400 bg-slate-800 px-3 py-1 rounded border border-slate-700">
            DOI: {pub.doi}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {pub.title}
        </h1>

        <div className="text-sm text-cyan-200 font-semibold italic">
          {pub.authors.join(", ")}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Published in: <strong className="text-white">{pub.journal}</strong> ({pub.publishedDate})
        </div>

        <div className="pt-2 flex items-center gap-4 text-xs text-slate-300 border-t border-slate-800">
          <span className="flex items-center gap-1 text-slate-400">
            Citations: <strong className="text-cyan-400 font-mono">{pub.citationCount}</strong>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            Domain: <strong className="text-white">{pub.researchDomain}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Abstract & Keywords */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 transition-colors duration-300">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 transition-colors duration-300">
              <FileText className="w-5 h-5 text-cyan-600" />
              Publication Abstract
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed transition-colors duration-300">
              {pub.abstract}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {pub.keywords.map((kw) => (
                <span key={kw} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 transition-colors duration-300">
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          {datasets.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 transition-colors duration-300">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 transition-colors duration-300">
                <Database className="w-5 h-5 text-cyan-600" />
                Referenced Datasets ({datasets.length})
              </h3>
              <div className="space-y-3">
                {datasets.map((ds) => ds && (
                  <Link key={ds.id} href={`/datasets/${ds.id}`} className="block p-4 bg-slate-50 rounded-xl hover:bg-cyan-50 border border-slate-200 transition-colors">
                    <div className="font-bold text-slate-900 text-sm transition-colors duration-300">{ds.title}</div>
                    <div className="text-xs text-slate-500 mt-1">DOI: {ds.doi}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Authors & Expeditions */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 transition-colors duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registered Authors
            </h3>
            <div className="space-y-2">
              {authors.map((a) => a && (
                <Link key={a.id} href={`/researchers/${a.id}`} className="block p-3 bg-slate-50 rounded-lg hover:bg-cyan-50 text-xs font-semibold text-slate-900 transition-colors duration-300">
                  {a.name} ({a.designation})
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 transition-colors duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Associated Expeditions
            </h3>
            <div className="space-y-2">
              {expeditions.map((exp) => exp && (
                <Link key={exp.id} href={`/expeditions/${exp.id}`} className="block p-3 bg-slate-50 rounded-lg hover:bg-cyan-50 text-xs font-semibold text-slate-900 transition-colors duration-300">
                  {exp.name} ({exp.year})
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
