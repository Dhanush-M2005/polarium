"use client";

import React, { useState } from "react";
import { Search, Compass, Globe, Snowflake, Mountain, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (term: string) => void;
  showQuickTags?: boolean;
}

export function SearchBar({
  placeholder = "Search expeditions, datasets, researchers, publications...",
  onSearch,
  showQuickTags = true,
}: SearchBarProps) {
  const [term, setTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(term);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center bg-white rounded-xl shadow-xl border border-slate-200 focus-within:border-cyan-600 focus-within:ring-4 focus-within:ring-cyan-500/20 transition-all overflow-hidden transition-colors duration-300">
          <div className="pl-4 pr-2 text-slate-400">
            <Search className="w-5 h-5 group-focus-within:text-cyan-600 transition-colors" />
          </div>
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full py-4 pr-32 text-slate-800 placeholder-slate-400 text-sm md:text-base bg-transparent border-none focus:outline-none focus:ring-0 transition-colors duration-300"
          />
          <div className="absolute right-2 top-1.5 bottom-1.5 flex items-center">
            <button
              type="submit"
              className="h-full px-5 bg-cyan-700 hover:bg-cyan-800 text-white font-medium text-xs md:text-sm rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              Search
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {showQuickTags && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300 pt-1">
          <span className="text-slate-400 font-medium">Quick Discovery:</span>
          <Link
            href="/expeditions?region=Antarctica"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900/60 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 transition-colors"
          >
            <Snowflake className="w-3 h-3 text-cyan-300" />
            Antarctica
          </Link>
          <Link
            href="/expeditions?region=Arctic"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900/60 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 transition-colors"
          >
            <Globe className="w-3 h-3 text-cyan-300" />
            Arctic
          </Link>
          <Link
            href="/expeditions?region=Himalaya"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-900/60 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 transition-colors"
          >
            <Mountain className="w-3 h-3 text-cyan-300" />
            Himalaya
          </Link>
        </div>
      )}
    </div>
  );
}
