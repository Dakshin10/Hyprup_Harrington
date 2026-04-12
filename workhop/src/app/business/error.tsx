"use client";

import Link from "next/link";

export default function BusinessError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 bg-error-bg/20 rounded-full flex items-center justify-center mx-auto">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-text-primary">Something went wrong</h2>
        <p className="text-text-muted text-sm">{error.message || "An unexpected error occurred."}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition"
          >
            Try again
          </button>
          <Link
            href="/business/dashboard"
            className="px-5 py-2 border border-white/10 text-text-secondary hover:text-text-primary rounded-xl transition"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
