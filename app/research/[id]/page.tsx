import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FlaskConical, Calendar, Users, Database, BookOpen, Compass, ArrowLeft, ShieldCheck } from "lucide-react";
import { 
  getProjectById, 
  getResearcherById, 
  getExpeditionById, 
  getDatasetById, 
  getPublicationById 
} from "@/lib/data";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = getProjectById(params.id);

  if (!project) {
    notFound();
  }

  const pi = getResearcherById(project.principalInvestigatorId);
  const researchers = project.researcherIds.map(rid => getResearcherById(rid)).filter(Boolean);
  const expeditions = project.expeditionIds.map(eid => getExpeditionById(eid)).filter(Boolean);
  const datasets = project.datasetIds.map(did => getDatasetById(did)).filter(Boolean);
  const publications = project.publicationIds.map(pubId => getPublicationById(pubId)).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <Link href="/research" className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-800">
        <ArrowLeft className="w-4 h-4" />
        Back to Research Projects
      </Link>

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
            {project.researchDomain}
          </span>
          <span className="text-xs font-mono text-emerald-400 bg-slate-800 px-3 py-1 rounded border border-slate-700">
            Status: {project.status} ({project.startDate} to {project.endDate})
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {project.title}
        </h1>

        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          {project.description}
        </p>

        {pi && (
          <div className="pt-2 flex items-center gap-2 text-xs text-slate-300 border-t border-slate-800">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Principal Investigator:</span>
            <Link href={`/researchers/${pi.id}`} className="font-bold text-white hover:text-cyan-300 underline">
              {pi.name}
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Objectives & Generated Assets */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 transition-colors duration-300">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 transition-colors duration-300">
              <FlaskConical className="w-5 h-5 text-cyan-600" />
              Project Objectives
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 transition-colors duration-300">
              {project.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 transition-colors duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 mt-1.5 flex-shrink-0"></span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {datasets.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 transition-colors duration-300">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 transition-colors duration-300">
                <Database className="w-5 h-5 text-cyan-600" />
                Generated Datasets ({datasets.length})
              </h3>
              <div className="space-y-3">
                {datasets.map((ds) => ds && (
                  <Link key={ds.id} href={`/datasets/${ds.id}`} className="block p-4 bg-slate-50 rounded-xl hover:bg-cyan-50 border border-slate-200 transition-colors">
                    <div className="font-bold text-slate-900 text-sm transition-colors duration-300">{ds.title}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{ds.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {publications.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 transition-colors duration-300">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 transition-colors duration-300">
                <BookOpen className="w-5 h-5 text-cyan-600" />
                Resulting Publications ({publications.length})
              </h3>
              <div className="space-y-3">
                {publications.map((pub) => pub && (
                  <Link key={pub.id} href={`/publications/${pub.id}`} className="block p-4 bg-slate-50 rounded-xl hover:bg-cyan-50 border border-slate-200 transition-colors">
                    <div className="font-bold text-slate-900 text-sm transition-colors duration-300">{pub.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{pub.journal} ({pub.year})</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Associated Expeditions & Researchers */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 transition-colors duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Field Expeditions ({expeditions.length})
            </h3>
            <div className="space-y-2">
              {expeditions.map((exp) => exp && (
                <Link key={exp.id} href={`/expeditions/${exp.id}`} className="block p-3 bg-slate-50 rounded-lg hover:bg-cyan-50 text-xs font-semibold text-slate-900 transition-colors duration-300">
                  {exp.name} ({exp.year})
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 transition-colors duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Participating Scientists ({researchers.length})
            </h3>
            <div className="space-y-2">
              {researchers.map((r) => r && (
                <Link key={r.id} href={`/researchers/${r.id}`} className="block p-3 bg-slate-50 rounded-lg hover:bg-cyan-50 text-xs font-semibold text-slate-900 transition-colors duration-300">
                  {r.name} ({r.designation})
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
