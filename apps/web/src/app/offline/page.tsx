"use client";

import Link from "next/link";
import { WifiOff, RefreshCcw, ShieldAlert } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 shadow-lg shadow-red-950/30">
              <WifiOff className="h-8 w-8" />
            </div>

            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1 text-xs font-medium text-slate-300">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              Connection lost
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              You are offline
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              SEAS could not reach the server. Live alerts, device status, and
              site updates may be temporarily unavailable until your connection
              is restored.
            </p>

            <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                <RefreshCcw className="h-4 w-4" />
                Try again
              </button>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
              >
                Return to dashboard
              </Link>
            </div>

            <div className="mt-8 w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left">
              <h2 className="text-sm font-semibold text-white">
                While offline
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>• Live emergency events may not refresh.</li>
                <li>• Device connectivity and readings may be outdated.</li>
                <li>• Reconnect to continue real-time monitoring.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}