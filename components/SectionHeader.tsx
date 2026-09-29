import React from "react";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: LucideIcon;
  align?: "left" | "center";
}

export function SectionHeader({
  title,
  subtitle,
  badge,
  icon: Icon,
  align = "center",
}: SectionHeaderProps) {
  return (
    <div className={`space-y-2 mb-8 ${align === "center" ? "text-center" : "text-left"}`}>
      {badge && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-100 text-cyan-800 text-xs font-semibold uppercase tracking-wider ${align === "center" ? "mx-auto" : ""}`}>
          {Icon && <Icon className="w-3.5 h-3.5" />}
          <span>{badge}</span>
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 transition-colors duration-300">
        {title}
      </h2>
      {subtitle && (
        <p className={`text-slate-600 text-sm md:text-base max-w-2xl ${align === "center" ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
