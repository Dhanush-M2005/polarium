import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Compass, Calendar, MapPin, Users, Database, FileText, FlaskConical, ArrowLeft, ShieldCheck, Tag } from "lucide-react";
import { 
  getExpeditionById, 
  getResearcherById, 
  getProjectById, 
  getDatasetById, 
  getPublicationById,
  getReportById
} from "@/lib/data";

export default function ExpeditionDetailPage({ params }: { params: { id: string } }) {
  const expedition = getExpeditionById(params.id);

  if (!expedition) {
    notFound();
  }

  const chiefScientist = expedition.chiefScientistId ? getResearcherById(expedition.chiefScientistId) : null;
  const projects = expedition.projects.map(pid => getProjectById(pid)).filter(Boolean);
  const datasets = expedition.datasets.map(did => getDatasetById(did)).filter(Boolean);
  const publications = expedition.publications.map(pubId => getPublicationById(pubId)).filter(Boolean);
  const reports = expedition.reports.map(rid => getReportById(rid)).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button */}
      <Link href="/expeditions" className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-800">
        <ArrowLeft className="w-4 h-4" />
        Back to All Expeditions
      </Link>

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
            {expedition.region} • {expedition.polarRegion}
          </span>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Season: {expedition.year} ({expedition.startDate} to {expedition.endDate})
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          {expedition.name}
        </h1>

        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          {expedition.description}
        </p>

        <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300 border-t border-slate-800">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
            Status: {expedition.status}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            Chief Scientist: <strong className="text-white">{expedition.chiefScientist}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 Cols: Objectives & Connected Entities */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Scientific Objectives */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 transition-colors duration-300">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 transition-colors duration-300">
              <Compass className="w-5 h-5 text-cyan-600" />
              Key Scientific Objectives
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 transition-colors duration-300">
              {expedition.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 transition-colors duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 mt-1.5 flex-shrink-0"></span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Associated Projects */}
          {projects.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 transition-colors duration-300">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 transition-colors duration-300">
                <FlaskConical className="w-5 h-5 text-cyan-600" />
                Associated Research Projects ({projects.length})
              </h3>
              <div className="space-y-3">
                {projects.map((proj) => proj && (
                  <Link 
                    key={proj.id} 
                    href={`/research/${proj.id}`}
                    className="block p-4 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 transition-all transition-colors duration-300"
                  >
                    <div className="text-xs font-semibold text-cyan-700">{proj.researchDomain}</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5 transition-colors duration-300">{proj.title}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{proj.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Associated Datasets */}
          {datasets.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 transition-colors duration-300">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 transition-colors duration-300">
                <Database className="w-5 h-5 text-cyan-600" />
                Generated Datasets ({datasets.length})
              </h3>
              <div className="space-y-3">
                {datasets.map((ds) => ds && (
                  <Link 
                    key={ds.id} 
                    href={`/datasets/${ds.id}`}
                    className="block p-4 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 transition-all transition-colors duration-300"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 transition-colors duration-300">{ds.researchDomain || (ds.disciplines && ds.disciplines[0]) || "Polar Data"}</span>
                      <span className="font-mono text-cyan-700">DOI: {ds.doi}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm mt-1 transition-colors duration-300">{ds.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{ds.abstract || ds.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right 4 Cols: Chief Scientist Profile & Metadata */}
        <div className="lg:col-span-4 space-y-6">
          
          {chiefScientist && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 transition-colors duration-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Chief Scientist Profile
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-cyan-400 font-bold flex items-center justify-center border-2 border-cyan-500/30">
                  {chiefScientist.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm transition-colors duration-300">{chiefScientist.name}</div>
                  <div className="text-xs text-cyan-700 font-semibold">{chiefScientist.designation}</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {chiefScientist.profileSummary}
              </p>
              <Link 
                href={`/researchers/${chiefScientist.id}`}
                className="block text-center w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                View Full Scientist Profile
              </Link>
            </div>
          )}

          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Expedition Data Metadata
            </h3>
            <div className="text-xs space-y-2 text-slate-300 font-mono">
              <div className="flex justify-between">
                <span>Expedition ID:</span>
                <span className="text-cyan-300">{expedition.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Number:</span>
                <span>{expedition.expeditionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Verified:</span>
                <span>{expedition.lastUpdated}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
