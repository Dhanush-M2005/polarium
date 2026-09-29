import React from "react";
import Link from "next/link";
import { Share2, FileText, MessageSquare, Video, ArrowRight } from "lucide-react";
import { OutreachContent } from "@/lib/data/types";

interface OutreachCardProps {
  content?: OutreachContent;
  typeTitle?: "Articles" | "Social Media" | "Video Scripts";
  typeDescription?: string;
}

export function OutreachCard({
  content,
  typeTitle,
  typeDescription,
}: OutreachCardProps) {
  const getIcon = (type?: string) => {
    switch (type) {
      case "ARTICLE":
      case "Articles":
        return FileText;
      case "X_POST":
      case "SOCIAL_POST":
      case "Social Media":
        return MessageSquare;
      case "VIDEO_SCRIPT":
      case "Video Scripts":
        return Video;
      default:
        return Share2;
    }
  };

  if (typeTitle) {
    const Icon = getIcon(typeTitle);
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group transition-colors duration-300">
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
            {typeTitle}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {typeDescription}
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-700">
          <span>Generate Content</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    );
  }

  if (!content) return null;

  const Icon = getIcon(content.contentType);

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 transition-colors duration-300">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200 transition-colors duration-300">
            <Icon className="w-3 h-3 text-cyan-600" />
            {content.contentType}
          </span>
          <span className="font-mono text-emerald-600 font-medium">
            {content.reviewStatus}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 leading-snug transition-colors duration-300">
          {content.title}
        </h3>

        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
          Target Platform: {content.platform}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500">
          Audience: {content.audience}
        </span>
        <Link
          href={`/outreach?id=${content.id}`}
          className="text-xs font-semibold text-cyan-700 hover:text-cyan-800"
        >
          View Content
        </Link>
      </div>
    </div>
  );
}
