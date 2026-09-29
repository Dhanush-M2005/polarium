import React from "react";
import Link from "next/link";
import { GraduationCap, Clock, ArrowRight } from "lucide-react";
import { EducationalResource } from "@/lib/data";

interface EducationCardProps {
  resource?: EducationalResource;
  audienceTitle?: "Students" | "Teachers" | "Researchers";
  audienceDescription?: string;
}

export function EducationCard({
  resource,
  audienceTitle,
  audienceDescription,
}: EducationCardProps) {
  if (audienceTitle) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group transition-colors duration-300">
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
            For {audienceTitle}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {audienceDescription}
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-cyan-700">
          <span>View Modules</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    );
  }

  if (!resource) return null;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between transition-colors duration-300">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 transition-colors duration-300">
            {resource.contentType}
          </span>
          <span className="font-mono text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {resource.difficulty}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 leading-snug transition-colors duration-300">
          {resource.title}
        </h3>

        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
          {resource.description}
        </p>

        <div className="flex flex-wrap gap-1 pt-1">
          {resource.topicIds.map((t) => (
            <span key={t} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100 transition-colors duration-300">
              #{t}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium text-slate-500">
          Audience: {resource.audience} ({resource.educationLevel})
        </span>
        <Link
          href={`/education?id=${resource.id}`}
          className="text-xs font-semibold text-cyan-700 hover:text-cyan-800"
        >
          Access Module
        </Link>
      </div>
    </div>
  );
}
