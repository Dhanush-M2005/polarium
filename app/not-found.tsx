import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 text-cyan-400 flex items-center justify-center">
        <Compass className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 transition-colors duration-300">404 - Page Not Found</h2>
      <p className="text-sm text-slate-600 max-w-sm">
        The requested polar scientific record or page path could not be found.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
      >
        Return to Home Page
      </Link>
    </div>
  );
}
