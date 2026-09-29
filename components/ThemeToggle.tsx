"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="relative flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 bg-white/10 opacity-50 cursor-not-allowed transition-colors duration-300">
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center w-8 h-8 rounded-full border border-slate-400 bg-white/10 hover:bg-slate-200/50 transition-colors duration-300 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-[#36a9f7]"
      aria-label="Toggle Theme"
      title="Toggle Dark/Light Mode"
    >
      <div className="relative flex items-center justify-center w-full h-full">
        <Sun 
          className={`absolute h-4 w-4 text-amber-500 transition-all duration-500 transform ${theme === 'dark' ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100 group-hover:rotate-45'}`}
        />
        <Moon 
          className={`absolute h-4 w-4 text-blue-400 transition-all duration-500 transform ${theme === 'dark' ? 'translate-y-0 opacity-100 group-hover:-rotate-12' : '-translate-y-8 opacity-0'}`}
        />
      </div>
    </button>
  );
}
