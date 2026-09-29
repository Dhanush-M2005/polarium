"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6 font-sans">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-xs text-slate-400">{error?.message || "An unexpected error occurred."}</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
