import React from "react";
import Link from "next/link";
import { Sparkles, MessageSquare, ArrowRight, ShieldCheck, Database, FileText, CheckCircle2 } from "lucide-react";

export function AIIntro() {
  const exampleQuestions = [
    "What research was conducted during the 22nd Antarctic Expedition?",
    "What datasets are available for Antarctic climate research?",
    "Which researchers worked on glaciology?",
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-navy-900 text-white rounded-2xl p-6 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
      
      {/* Accent Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Heading & Concept */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Future Scientific Intelligence Feature</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Ask Polar AI
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Ask questions about India's polar research and explore answers grounded in verified scientific sources, technical reports, and NCPOR datasets.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Grounded RAG System</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <Database className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>NCPOR Verified Data</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Citation Backed</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/ai"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-md transition-all border border-cyan-400/30"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Ask Polar AI</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Right Column: Sample Questions Box */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between pb-2 border-b border-slate-800">
            <span>Example Grounded Queries</span>
            <span className="text-[10px] text-cyan-400 font-mono">UI Preview</span>
          </div>

          <div className="space-y-2.5">
            {exampleQuestions.map((q, idx) => (
              <Link
                key={idx}
                href={`/ai?q=${encodeURIComponent(q)}`}
                className="group flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 transition-all text-xs text-slate-200"
              >
                <MessageSquare className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="flex-grow group-hover:text-white transition-colors">{q}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
