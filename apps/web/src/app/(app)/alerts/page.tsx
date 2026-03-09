import { BellRing, Clock3, MapPinned, TriangleAlert } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

const alerts = [
  {
    id: "ALERT-101",
    site: "Main Warehouse",
    type: "Smoke Detected",
    severity: "critical" as const,
    time: "2026-03-09 14:20",
  },
  {
    id: "ALERT-102",
    site: "Office Building",
    type: "Motion Detected",
    severity: "warning" as const,
    time: "2026-03-09 13:05",
  },
  {
    id: "ALERT-103",
    site: "Parking Area",
    type: "Heartbeat Restored",
    severity: "online" as const,
    time: "2026-03-09 12:10",
  },
];

export default function AlertsPage() {
  const criticalCount = alerts.filter((alert) => alert.severity === "critical").length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Alerts
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Review emergency events and system-triggered warnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex w-fit items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Total alerts:
            <span className="ml-2 font-semibold text-slate-900 dark:text-white">
              {alerts.length}
            </span>
          </div>

          <div className="inline-flex w-fit items-center rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            Critical:
            <span className="ml-2 font-semibold">{criticalCount}</span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {alerts.map((alert) => {
          const accentStyles =
            alert.severity === "critical"
              ? "border-l-red-500"
              : alert.severity === "warning"
              ? "border-l-amber-500"
              : "border-l-emerald-500";

          const iconStyles =
            alert.severity === "critical"
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : alert.severity === "warning"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

          return (
            <article
              key={alert.id}
              className={[
                "rounded-2xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-5",
                accentStyles,
              ].join(" ")}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <div
                      className={[
                        "mt-0.5 rounded-xl p-2",
                        iconStyles,
                      ].join(" ")}
                    >
                      {alert.severity === "critical" ? (
                        <TriangleAlert className="h-5 w-5" />
                      ) : (
                        <BellRing className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-500">
                        {alert.id}
                      </p>

                      <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                        {alert.type}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPinned className="h-4 w-4 shrink-0" />
                      <span className="truncate">{alert.site}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Clock3 className="h-4 w-4 shrink-0" />
                      <span>{alert.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-start sm:justify-end">
                  <StatusBadge status={alert.severity} />
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}