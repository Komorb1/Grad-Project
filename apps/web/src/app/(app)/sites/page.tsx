import { MapPinned, Router, ChevronRight } from "lucide-react";

export default function SitesPage() {
  const sites = [
    { id: "SITE-001", name: "Main Warehouse", location: "Istanbul", devices: 8 },
    { id: "SITE-002", name: "Office Building", location: "Kadikoy", devices: 6 },
    { id: "SITE-003", name: "Parking Area", location: "Besiktas", devices: 4 },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Sites
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Manage monitored locations connected to the system.
          </p>
        </div>

        <div className="inline-flex w-fit items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Total sites: <span className="ml-2 font-semibold text-slate-900 dark:text-white">{sites.length}</span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sites.map((site) => (
          <article
            key={site.id}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-500">
                  {site.id}
                </p>
                <h3 className="mt-2 truncate text-lg font-semibold text-slate-900 dark:text-white">
                  {site.name}
                </h3>
              </div>

              <div className="rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <MapPinned className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPinned className="h-4 w-4 shrink-0" />
                <span className="truncate">{site.location}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Router className="h-4 w-4 shrink-0" />
                <span>
                  Devices connected: <span className="font-semibold">{site.devices}</span>
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Monitoring active
              </span>

              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                View
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}