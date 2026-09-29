import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";

interface KnowledgeCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  countBadge?: string;
}

export function KnowledgeCard({
  title,
  description,
  href,
  icon: Icon,
  countBadge,
}: KnowledgeCardProps) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-500/50 transition-all flex flex-col justify-between transition-colors duration-300"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-slate-100 group-hover:bg-cyan-50 text-cyan-700 group-hover:text-cyan-800 flex items-center justify-center transition-colors border border-slate-200/60">
            <Icon className="w-6 h-6 stroke-[1.8]" />
          </div>
          {countBadge && (
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 transition-colors duration-300">
              {countBadge}
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition-colors mb-1.5 flex items-center gap-1.5">
          {title}
        </h3>
        
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {description}
        </p>
      </div>

      <div className="flex items-center text-xs font-semibold text-cyan-700 group-hover:text-cyan-800 pt-2 border-t border-slate-100">
        <span>Explore Section</span>
        <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
