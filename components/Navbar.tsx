"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Menu,
  X,
  Compass,
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { SITE_CONFIG } from "@/lib/site-config";
import { Globe } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();

  const navLinks = SITE_CONFIG.navLinks.map((link) => ({
    name: t(link.en, link.hi),
    href: link.href,
    id: link.id,
  }));

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/polar-hub") return pathname?.startsWith("/polar-hub") || pathname?.startsWith("/Polar-Hub");
    return pathname?.startsWith(href);
  };

  if (pathname?.startsWith("/Admin-Dashboard")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 border-b border-slate-200/80 shadow-xs font-sans transition-all">
      {/* 1. Official Ministry Top-Bar (Light Government UI) */}
      <div className="bg-brand-navy text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-8 py-1.5 text-[11px] tracking-wide">
          <div className="flex items-center gap-3 uppercase font-medium">
            <span className="font-bold flex items-center gap-1.5 text-amber-300 drop-shadow-xs">
              <Shield className="w-3.5 h-3.5 text-amber-300" /> {t(SITE_CONFIG.organization.emblem.en, SITE_CONFIG.organization.emblem.hi)}
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span className="text-slate-200 font-semibold">{t(SITE_CONFIG.organization.ministry.en, SITE_CONFIG.organization.ministry.hi)}</span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-slate-300 text-[10px] tracking-normal">
              {t(SITE_CONFIG.organization.centre.en, SITE_CONFIG.organization.centre.hi)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer border border-white/20"
              title="Toggle Language / भाषा बदलें"
            >
              <Globe className="w-3 h-3 text-cyan-300" />
              <span className={language === 'en' ? 'text-amber-300 font-bold' : 'text-slate-300'}>English</span>
              <span className="text-white/40">/</span>
              <span className={language === 'hi' ? 'text-amber-300 font-bold' : 'text-slate-300'}>हिन्दी</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="bg-white/95">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-8 py-2 min-h-[64px]">
          
          {/* Dynamic Logo Branding from SITE_CONFIG */}
          <Link href="/" prefetch={true} className="flex items-center group py-0.5">
            <img
              src={SITE_CONFIG.logo.src}
              alt={SITE_CONFIG.logo.alt}
              className="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              loading="eager"
            />
          </Link>

          {/* Desktop Navigation Links: Dynamic map from SITE_CONFIG */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  prefetch={true}
                  className={`px-4 py-2 rounded-sm transition-all duration-200 relative ${ active ? "bg-slate-100/90 text-brand-navy font-bold border-b-2 border-brand-navy shadow-xs" : "text-slate-700 hover:text-brand-navy hover:bg-slate-50" }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Admin Portal Button (Hidden when inside Admin Dashboard) */}
          {!pathname?.startsWith('/Admin-Dashboard') && (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href={SITE_CONFIG.adminPortal.href}
                prefetch={true}
                className="bg-brand-navy hover:bg-[#0b3b6f] text-white px-4 py-2 rounded-sm text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-xs hover:shadow-md hover:scale-[1.02]"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-300" />
                <span>{t(SITE_CONFIG.adminPortal.en, SITE_CONFIG.adminPortal.hi)}</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-700 hover:text-slate-900 focus:outline-none transition-colors duration-300"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-1 text-xs font-semibold transition-colors duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-sm text-slate-800 hover:bg-slate-100 transition-colors duration-300"
            >
              {link.name}
            </Link>
          ))}
          {!pathname?.startsWith('/Admin-Dashboard') && (
            <div className="pt-2 border-t border-slate-100">
              <Link
                href={SITE_CONFIG.adminPortal.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center bg-brand-navy text-white py-2 rounded-sm font-bold"
              >
                {t(SITE_CONFIG.adminPortal.en, SITE_CONFIG.adminPortal.hi)}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
