import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Database, Download, FileCode, Tag, ArrowLeft, ShieldCheck, Globe, Calendar, UserCheck, Layers } from "lucide-react";
import { 
  getDatasetById, 
  getDatasetVersions, 
  getResearcherById, 
  getExpeditionById, 
  getProjectById 
} from "@/lib/data";

export default function DatasetDetailPage({ params }: { params: { id: string } }) {
  const dataset = getDatasetById(params.id);

  if (!dataset) {
    notFound();
  }

  const versions = getDatasetVersions(dataset.id);
  const creators = dataset.creatorIds.map(cid => getResearcherById(cid)).filter(Boolean);
  const expeditions = dataset.expeditionIds.map(eid => getExpeditionById(eid)).filter(Boolean);
  const projects = dataset.projectIds.map(pid => getProjectById(pid)).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <Link href="/datasets" className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-800">
        <ArrowLeft className="w-4 h-4" />
        Back to Dataset Catalog
      </Link>

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
            {dataset.datasetType} • {dataset.researchDomain}
          </span>
          <span className="text-xs font-mono text-cyan-400 bg-slate-800 px-3 py-1 rounded border border-slate-700">
            DOI: {dataset.doi || "N/A"}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {dataset.title}
        </h1>

        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          {dataset.abstract}
        </p>

        <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300 border-t border-slate-800">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <ShieldCheck className="w-4 h-4" />
            Access Level: {dataset.accessLevel}
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <Layers className="w-4 h-4 text-cyan-400" />
            Current Version: {dataset.version}
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <FileCode className="w-4 h-4 text-slate-400" />
            Formats: {dataset.formats.join(", ")} ({dataset.size})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Metadata & Spatial/Temporal Coverage */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 transition-colors duration-300">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 transition-colors duration-300">
              <Database className="w-5 h-5 text-cyan-600" />
              Dataset Description & Methodology
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed transition-colors duration-300">
              {dataset.description}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {dataset.keywords.map((kw) => (
                <span key={kw} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 transition-colors duration-300">
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          {/* Version History Table */}
          {versions.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 transition-colors duration-300">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 transition-colors duration-300">
                <Layers className="w-5 h-5 text-cyan-600" />
                Dataset Version History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700 transition-colors duration-300">
                  <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200 transition-colors duration-300">
                    <tr>
                      <th className="p-3">Version</th>
                      <th className="p-3">Release Date</th>
                      <th className="p-3">Changes</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 transition-colors duration-300">
                    {versions.map((ver) => (
                      <tr key={ver.id}>
                        <td className="p-3 font-mono font-bold text-cyan-700">{ver.version}</td>
                        <td className="p-3 font-mono">{ver.releaseDate}</td>
                        <td className="p-3">{ver.changeSummary}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${ ver.status === "CURRENT" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600" }`}>
                            {ver.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Associated Expeditions & Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {expeditions.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 transition-colors duration-300">
                <h4 className="text-xs font-bold text-slate-900 uppercase transition-colors duration-300">Associated Expedition</h4>
                {expeditions.map((exp) => exp && (
                  <Link key={exp.id} href={`/expeditions/${exp.id}`} className="block p-3 bg-slate-50 rounded-lg hover:bg-cyan-50 text-xs font-semibold text-slate-900 transition-colors duration-300">
                    {exp.name} ({exp.year})
                  </Link>
                ))}
              </div>
            )}

            {projects.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 transition-colors duration-300">
                <h4 className="text-xs font-bold text-slate-900 uppercase transition-colors duration-300">Associated Project</h4>
                {projects.map((proj) => proj && (
                  <Link key={proj.id} href={`/research/${proj.id}`} className="block p-3 bg-slate-50 rounded-lg hover:bg-cyan-50 text-xs font-semibold text-slate-900 transition-colors duration-300">
                    {proj.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Creators & Coverage */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 transition-colors duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Principal Investigators / Creators
            </h3>
            <div className="space-y-3">
              {creators.map((c) => c && (
                <Link key={c.id} href={`/researchers/${c.id}`} className="block p-3 bg-slate-50 rounded-xl hover:bg-cyan-50 border border-slate-200 transition-colors">
                  <div className="font-bold text-slate-900 text-xs transition-colors duration-300">{c.name}</div>
                  <div className="text-[11px] text-cyan-700">{c.designation}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Spatial & Temporal Coverage
            </h3>
            <div className="text-xs space-y-2 text-slate-300 font-mono">
              <div>
                <span className="text-slate-500">Temporal Range:</span>
                <div className="text-white font-bold">{dataset.coverageStart} to {dataset.coverageEnd}</div>
              </div>
              {dataset.spatialCoverage && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500">Spatial Bounds:</span>
                  <div className="text-white text-[11px] mt-0.5">
                    Lat: {dataset.spatialCoverage.minLat}° to {dataset.spatialCoverage.maxLat}°<br/>
                    Lng: {dataset.spatialCoverage.minLng}° to {dataset.spatialCoverage.maxLng}°
                  </div>
                  <div className="text-slate-400 text-[10px] italic mt-1">{dataset.spatialCoverage.description}</div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
