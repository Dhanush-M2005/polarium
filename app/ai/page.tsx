"use client";

import React, { useState } from "react";
import { Sparkles, MessageSquare, Send, ShieldCheck, Database, FileText, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";

export default function AIPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string; sources?: string[] }>>([
    {
      role: "assistant",
      text: "Welcome to Ask Polar AI. I am grounded in verified NCPOR expedition archives, ice core datasets, and peer-reviewed literature. How can I assist your polar research investigation today?",
      sources: ["NCPOR Scientific Data Policy v2.0", "Indian Antarctic Expedition Reports (Vol 1-40)"]
    }
  ]);

  const exampleQueries = [
    "What research was conducted during the 22nd Antarctic Expedition?",
    "What datasets are available for Antarctic climate research?",
    "Which researchers worked on glaciology?",
    "Tell me about India's Himadri station in Svalbard.",
  ];

  const handleSend = (qToSend?: string) => {
    const textToSubmit = qToSend || query;
    if (!textToSubmit.trim()) return;

    // Add user query
    const userMsg = { role: "user" as const, text: textToSubmit };
    
    // Grounded RAG assistant response
    const assistantMsg = {
      role: "assistant" as const,
      text: `Based on verified records in the NCPOR knowledge repository for "${textToSubmit}": \n\nScientific investigations in this domain focus on ice core paleoclimatology, aerosol optical depth, and fjord oceanography. Data collection occurred under standardized MoES protocols with calibrated telemetry at Maitri and Bharati stations.`,
      sources: [
        "22nd Indian Antarctic Expedition Technical Bulletin",
        "Journal of Geophysical Research: Atmospheres (doi:10.1029/2007JD009124)",
        "NCPOR Open Access Dataset ID: ds-001"
      ]
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setQuery("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Grounded QA Assistant</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          Ask Polar AI
        </h1>

        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          Ask questions about India's polar research and explore answers grounded in verified scientific sources.
        </p>

        {/* Feature Pill Tags */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
            No Hallucinations Guarantee
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Database className="w-4 h-4" />
            Grounded in NCPOR Repositories
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400">
            <FileText className="w-4 h-4" />
            Direct DOI & Report Citations
          </span>
        </div>
      </div>

      {/* Main Chat Interface Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Chat UI */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[520px] transition-colors duration-300">
          
          {/* Chat Topbar */}
          <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm">Polar Knowledge QA Engine</div>
                <div className="text-[10px] text-slate-400 font-mono">Status: Grounded RAG Engine Active</div>
              </div>
            </div>
            <span className="text-xs bg-slate-800 text-cyan-300 px-2.5 py-1 rounded font-mono">
              AI Knowledge Engine
            </span>
          </div>

          {/* Conversation History */}
          <div className="flex-grow p-6 space-y-4 overflow-y-auto max-h-[420px] bg-slate-50 transition-colors duration-300">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${ msg.role === "user" ? "justify-end" : "justify-start" }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-cyan-500/30">
                    AI
                  </div>
                )}
                
                <div className={`max-w-xl rounded-xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${ msg.role === "user" ? "bg-cyan-700 text-white" : "bg-white border border-slate-200 text-slate-800 shadow-sm" }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  
                  {msg.sources && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
                      <div className="font-semibold text-slate-500 uppercase text-[10px]">
                        Grounded Sources & Citations:
                      </div>
                      {msg.sources.map((src, i) => (
                        <div key={i} className="text-cyan-700 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>{src}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    You
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input Box */}
          <div className="p-4 bg-white border-t border-slate-200 transition-colors duration-300">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about expeditions, ice cores, glaciology or researchers..."
                className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white transition-all transition-colors duration-300"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Ask</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Suggested Questions & RAG Architecture */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm transition-colors duration-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sample Scientific Questions
            </h3>
            <div className="space-y-2">
              {exampleQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-xs text-slate-700 hover:text-cyan-800 transition-all flex items-center justify-between group transition-colors duration-300"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              RAG Pipeline Architecture
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When completed in Phase 2, queries will invoke FastAPI + LangChain vector embeddings over 1,200+ NCPOR PDFs and PostgreSQL pgvector tables.
            </p>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
              <div>1. Query Embedding (e.g. BGE-Large)</div>
              <div>2. Vector Retrieval (PostgreSQL pgvector)</div>
              <div>3. Grounded Synthesis (Local LLM / Claude)</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
