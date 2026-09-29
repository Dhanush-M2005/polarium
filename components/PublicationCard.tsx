import React from "react";
import Link from "next/link";
import { Publication } from "@/lib/mock-data";
import { FileText, Award, ExternalLink, BookOpen } from "lucide-react";

interface PublicationCardProps {
  publication: Publication;
}

export function PublicationCard({ publication }: PublicationCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between transition-colors duration-300">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-100">
            {publication.publicationType}
          </span>
          <span className="text-xs font-mono text-slate-500">
            {publication.year}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-cyan-700 transition-colors">
          {publication.title}
        </h3>

        <div className="text-xs font-medium text-slate-700 italic transition-colors duration-300">
          {publication.authors.join(", ")}
        </div>

        <div className="text-xs text-slate-500 font-mono">
          {publication.journal}
        </div>

        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed pt-1">
          {publication.abstract}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] font-mono text-slate-400">
          Citations: <strong className="text-slate-700 transition-colors duration-300">{publication.citationCount}</strong>
        </span>
        <Link
          href={`/publications?id=${publication.id}`}
          className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Read Abstract & Metadata
        </Link>
      </div>
    </div>
  );
}
