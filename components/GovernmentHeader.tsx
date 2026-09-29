"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Search, ChevronDown, Database, Image as ImageIcon, Compass, Sparkles, LayoutDashboard, Map as MapIcon, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface GovernmentHeaderProps {
  activeTab?: "home" | "repository" | "media" | "expeditions" | "polarlab" | "admin" | "map";
}

export function GovernmentHeader({ activeTab }: GovernmentHeaderProps) {
  const [search, setSearch] = useState("");
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const navLinks = [
    { name: "Home", href: "/", id: "home" },
    { name: "Knowledge Repository", href: "/knowledge-repository", id: "repository" },
    { name: "Media Gallery", href: "/media-gallery", id: "media" },
    { name: "Polar Hub", href: "/polar-hub", id: "polarhub" },
  ];

  const currentTab = activeTab || (pathname?.startsWith("/knowledge-repository") ? "repository" : pathname?.startsWith("/media-gallery") ? "media" : pathname?.startsWith("/polar-hub") ? "polarhub" : undefined);

  return (
    <header className="border-b border-slate-200 bg-white transition-colors duration-300">
      {/* 1. Official Ministry Top-Bar */}
      <div className="bg-brand-navy text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-8 py-2 text-[11px] tracking-wide">
          <div className="flex items-center gap-3 sm:gap-4 uppercase font-medium">
            <span className="font-semibold flex items-center gap-1.5 text-amber-300">
              <Shield className="w-3.5 h-3.5" /> State Emblem of India
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span className="text-slate-200">Ministry of Earth Sciences</span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-slate-300 text-[10px]">National Centre for Polar and Ocean Research (NCPOR)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-300">English / हिन्दी</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* 2. Secondary Branding & Search Header */}
      <div className="border-b border-slate-200 bg-white transition-colors duration-300">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 sm:px-8 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group py-0.5">
              <img
                src="/polarium-logo.png"
                alt="POLARIUM Logo"
                className="h-12 sm:h-14 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </Link>
          </div>

          {/* Quick Search */}
          <form
            className="flex h-10 w-full max-w-[580px] border border-slate-300 rounded-sm overflow-hidden focus-within:border-brand-navy focus-within:ring-1 focus-within:ring-brand-navy transition-all transition-colors duration-300"
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <div className="flex flex-1 items-center bg-slate-50 px-3 text-slate-400 transition-colors duration-300">
              <Search size={16} className="mr-2 shrink-0 text-slate-500" />
              <input
                id="gov-header-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 font-medium transition-colors duration-300"
                placeholder="Search Expeditions, Glaciology Reports, Sensor Telemetry..."
              />
            </div>
            <button
              type="submit"
              className="bg-brand-navy hover:bg-[#0b3b6f] px-5 text-xs font-bold text-white transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* 3. Navigation Links */}
      <nav aria-label="Portal navigation" className="bg-slate-100 border-b border-slate-200 transition-colors duration-300">
        <div className="mx-auto flex max-w-[1440px] items-center gap-1 sm:gap-2 px-4 sm:px-8 text-xs font-semibold overflow-x-auto scrollbar-none">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id || pathname === link.href;
            return (
              <Link
                key={link.id}
                href={link.href}
                className={`px-3 py-3 border-b-2 whitespace-nowrap transition-colors ${ isActive ? "border-brand-navy text-brand-navy bg-white font-bold" : "border-transparent text-slate-700 hover:text-brand-navy hover:bg-slate-200/60" }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="ml-auto flex items-center gap-3 py-2 pl-4">
            <Link
              href="/Admin-Dashboard"
              className="bg-brand-navy hover:bg-[#0b3b6f] text-white px-3 py-1.5 rounded-sm text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
