"use client";

import React, { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4 bg-white p-8 rounded-xl border border-slate-200 shadow-sm transition-colors duration-300">
        <h2 className="text-lg font-bold text-slate-900 transition-colors duration-300">An Error Occurred</h2>
        <p className="text-xs text-slate-600">{error?.message || "Unable to render page content."}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
        >
          Reset View
        </button>
      </div>
    </div>
  );
}
