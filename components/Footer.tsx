"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

export function Footer() {
  const pathname = usePathname();

  // Hide global footer on Dhruv AI chatbot page as requested
  if (pathname === "/dhruv-ai") {
    return null;
  }
  return (
    <footer className="bg-brand-dark text-white font-sans relative">
      {/* Tricolor Accent Bar */}
      <div className="tricolor-strip" />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 py-8">
        
        {/* Top Row: Left Branding & Right Nav Links */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6">
          {/* Top Row (Left): Polarium Logo + MoES / NCPOR text */}
          <div className="flex items-center gap-4">
            <img
              src={SITE_CONFIG.logo.src}
              alt={SITE_CONFIG.logo.alt}
              className="h-10 sm:h-11 w-auto object-contain brightness-110 transition-transform hover:scale-[1.02]"
            />
            <div className="border-l border-white/20 pl-4">
              <div className="text-xs font-bold tracking-widest text-amber-300 uppercase flex items-center gap-1">
                <Shield className="w-3 h-3 text-amber-300" /> {SITE_CONFIG.organization.emblem.en}
              </div>
              <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                {SITE_CONFIG.organization.ministry.en} | {SITE_CONFIG.organization.centre.en}
              </div>
            </div>
          </div>

          {/* Top Row (Right): Simple horizontal row of links */}
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs font-semibold text-slate-200">
            <Link href="/" className="hover:text-amber-300 transition-colors">
              Home
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/knowledge-repository" className="hover:text-amber-300 transition-colors">
              Knowledge Repository
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/media-gallery" className="hover:text-amber-300 transition-colors">
              Media Gallery
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/polar-hub" className="hover:text-amber-300 transition-colors">
              Polar Hub
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/Admin-Dashboard" className="hover:text-amber-300 transition-colors">
              Admin Portal
            </Link>
          </nav>
        </div>

        {/* Bottom Row (Divider Line + Metadata) */}
        <div className="border-t border-white/15 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            &copy; 2026 Government of India. All rights reserved. POLARIUM Scientific Platform.
          </div>
          <div className="flex items-center gap-3">
            <span className="hover:text-slate-200 cursor-pointer transition-colors">
              Data Privacy Policy
            </span>
            <span className="text-white/20">|</span>
            <span className="hover:text-slate-200 cursor-pointer transition-colors">
              Accessibility Statement
            </span>
            <span className="text-white/20">|</span>
            <span className="hover:text-slate-200 cursor-pointer transition-colors">
              Terms of Use
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}

