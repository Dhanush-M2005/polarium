"use client";

import React, { useState } from "react";
import { GraduationCap, BookOpen, ShieldCheck, Shield } from "lucide-react";
import { MOCK_EDUCATION_RESOURCES } from "@/lib/data";
import { EducationCard } from "@/components/EducationCard";

export default function EducationPage() {
  const [selectedAudience, setSelectedAudience] = useState<string>("ALL");

  const filtered = selectedAudience === "ALL" 
    ? MOCK_EDUCATION_RESOURCES 
    : MOCK_EDUCATION_RESOURCES.filter(e => e.audience.toUpperCase() === selectedAudience.toUpperCase() || e.audience === selectedAudience);

  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300 pb-20">
      
      {/* Official Government Hero Header */}
      <section className="bg-gradient-to-r from-brand-dark via-brand-navy to-brand-navy text-white py-10 px-4 sm:px-8 border-b-4 border-cyan-500 shadow-md">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-sm text-xs font-bold uppercase tracking-wider ">
              <Shield className="w-3.5 h-3.5 text-amber-300" /> State Emblem of India
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 rounded-sm text-xs font-bold uppercase tracking-wider font-mono">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-300" /> Polar Science Educational Portal
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Learn &amp; Explore Polar Science
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed font-medium">
            Transform scientific knowledge into engaging learning experiences for students, educators, and researchers under the National Earth Science Literacy Charter.
          </p>

          {/* Audience Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Target Audience:</span>
            {["ALL", "STUDENT", "TEACHER", "RESEARCHER"].map((audience) => (
              <button
                key={audience}
                onClick={() => setSelectedAudience(audience)}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors ${ selectedAudience === audience ? "bg-amber-400 text-brand-navy shadow-sm font-black" : "bg-white/10 text-white hover:bg-white/20 border border-white/10" }`}
              >
                {audience}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div className="bg-white border border-slate-300 text-slate-800 rounded-sm p-3.5 flex items-center justify-between text-xs shadow-2xs transition-colors duration-300">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Showing <strong>{filtered.length}</strong> curated educational modules designed for school and university earth science curricula.
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">MoES Educational Literacy</span>
        </div>

        {/* Audience Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => setSelectedAudience("STUDENT")}
            className={`cursor-pointer transition-transform ${selectedAudience === "STUDENT" ? "ring-2 ring-brand-navy rounded-xl shadow-md" : ""}`}
          >
            <EducationCard
              audienceTitle="Students"
              audienceDescription="Interactive ice core experiments, polar climate quizzes, and school curriculum learning modules."
            />
          </div>

          <div 
            onClick={() => setSelectedAudience("TEACHER")}
            className={`cursor-pointer transition-transform ${selectedAudience === "TEACHER" ? "ring-2 ring-brand-navy rounded-xl shadow-md" : ""}`}
          >
            <EducationCard
              audienceTitle="Teachers"
              audienceDescription="Classroom lesson plans, Arctic fjord dataset exercises, and high school earth science teaching materials."
            />
          </div>

          <div 
            onClick={() => setSelectedAudience("RESEARCHER")}
            className={`cursor-pointer transition-transform ${selectedAudience === "RESEARCHER" ? "ring-2 ring-brand-navy rounded-xl shadow-md" : ""}`}
          >
            <EducationCard
              audienceTitle="Researchers"
              audienceDescription="Field safety guidelines, glaciological stake measurement manuals, and polar dataset processing tutorials."
            />
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4 pt-4">
          <h2 className="text-base font-bold text-brand-navy flex items-center gap-2 transition-colors duration-300">
            <BookOpen className="w-5 h-5 text-cyan-600" />
            Available Educational Modules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((resource) => (
              <EducationCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>

      </main>

    </div>
  );
}

