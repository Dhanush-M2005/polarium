import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, Compass, BookOpen, FlaskConical, ArrowLeft, Mail, Globe, Award, ShieldCheck } from "lucide-react";
import { 
  getResearcherById, 
  getInstitutionById, 
  getExpeditionById, 
  getProjectById, 
  getPublicationById 
} from "@/lib/data";

export default function ResearcherDetailPage({ params }: { params: { id: string } }) {
  const researcher = getResearcherById(params.id);

  if (!researcher) {
    notFound();
  }

  const institution = getInstitutionById(researcher.institutionId);
  const expeditions = researcher.expeditionIds.map(eid => getExpeditionById(eid)).filter(Boolean);
  const projects = researcher.projectIds.map(pid => getProjectById(pid)).filter(Boolean);
  const publications = researcher.publicationIds.map(pubId => getPublicationById(pubId)).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <Link href="/researchers" className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-800">
        <ArrowLeft className="w-4 h-4" />
        Back to Researchers Directory
      </Link>

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-cyan-950 text-cyan-400 font-bold text-2xl flex items-center justify-center border-4 border-cyan-500/30 flex-shrink-0 shadow-lg">
            {researcher.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {researcher.name}
            </h1>
            <div className="text-cyan-400 font-semibold text-sm">
              {researcher.designation} • {researcher.department}
            </div>
            {institution && (
              <div className="text-xs text-slate-400 font-medium">
                {institution.name} ({institution.location})
              </div>
            )}
          </div>
        </div>

        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed border-t border-slate-800 pt-4">
          {researcher.profileSummary}
        </p>

        <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-2 font-mono">
          {researcher.orcid && (
            <span className="bg-slate-800 px-3 py-1 rounded text-cyan-300 border border-slate-700">
              ORCID: {researcher.orcid}
            </span>
          )}
          {researcher.email && (
            <span className="flex items-center gap-1.5 text-slate-400">
              <Mail className="w-3.5 h-3.5" />
              {researcher.email}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Specializations, Projects & Publications */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 transition-colors duration-300">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 transition-colors duration-300">
              <Award className="w-5 h-5 text-cyan-600" />
              Domain Expertise & Specializations
            </h3>
            <div className="flex flex-wrap gap-2">
              {researcher.specializations.map((spec) => (
                <span key={spec} className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-1 rounded-lg text-xs font-semibold">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Research Projects */}
          {projects.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 transition-colors duration-300">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 transition-colors duration-300">
                <FlaskConical className="w-5 h-5 text-cyan-600" />
                Led Research Projects ({projects.length})
              </h3>
              <div className="space-y-3">
                {projects.map((proj) => proj && (
                  <Link key={proj.id} href={`/research/${proj.id}`} className="block p-4 bg-slate-50 rounded-xl hover:bg-cyan-50 border border-slate-200 transition-colors">
                    <div className="font-bold text-slate-900 text-sm transition-colors duration-300">{proj.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{proj.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Peer-Reviewed Publications */}
          {publications.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 transition-colors duration-300">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 transition-colors duration-300">
                <BookOpen className="w-5 h-5 text-cyan-600" />
                Selected Publications ({publications.length})
              </h3>
              <div className="space-y-3">
                {publications.map((pub) => pub && (
                  <Link key={pub.id} href={`/publications/${pub.id}`} className="block p-4 bg-slate-50 rounded-xl hover:bg-cyan-50 border border-slate-200 transition-colors">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-mono mb-1">
                      <span>{pub.journal} ({pub.year})</span>
                      <span className="text-cyan-700">DOI: {pub.doi}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm transition-colors duration-300">{pub.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Expeditions Participated */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 transition-colors duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Expedition Operations ({expeditions.length})
            </h3>
            <div className="space-y-3">
              {expeditions.map((exp) => exp && (
                <Link key={exp.id} href={`/expeditions/${exp.id}`} className="block p-3.5 bg-slate-50 rounded-xl hover:bg-cyan-50 border border-slate-200 transition-colors">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                    {exp.region}
                  </span>
                  <div className="font-bold text-slate-900 text-xs mt-1.5 transition-colors duration-300">{exp.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Season: {exp.year}</div>
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
