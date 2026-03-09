import { TriangleAlert, Router, MapPinned, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import InstallPWAButton from "@/components/install-pwa-button";

const recentAlerts = [
  {
    id: "ALT-001",
    site: "Main Warehouse",
    device: "Smoke Sensor A1",
    status: "critical" as const,
    time: "2026-03-09 14:20",
  },
  {
    id: "ALT-002",
    site: "Office Building",
    device: "Motion Sensor B3",
    status: "warning" as const,
    time: "2026-03-09 13:05",
  },
  {
    id: "ALT-003",
    site: "Parking Area",
    device: "Gate Device C2",
    status: "online" as const,
    time: "2026-03-09 12:10",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Dashboard
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Overview of sites, devices, and emergency activity.
          </p>
        </div>

        <div className="w-full lg:w-auto lg:max-w-sm">
          <InstallPWAButton />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Sites"
          value={8}
          description="Connected monitored locations"
          icon={<MapPinned className="h-5 w-5" />}
        />
        <StatCard
          title="Total Devices"
          value={24}
          description="Registered field devices"
          icon={<Router className="h-5 w-5" />}
        />
        <StatCard
          title="Active Alerts"
          value={3}
          description="Currently open emergency events"
          icon={<TriangleAlert className="h-5 w-5" />}
        />
        <StatCard
          title="System Health"
          value="Stable"
          description="Most devices reporting normally"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Events
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Latest device activity and alert status updates.
          </p>
        </div>

        <div className="md:hidden">
          <div className="space-y-3 p-4">
            {recentAlerts.map((alert) => (
              <article
                key={alert.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {alert.id}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {alert.site}
                    </p>
                  </div>

                  <StatusBadge status={alert.status} />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Device:
                    </span>{" "}
                    <span className="text-slate-700 dark:text-slate-300">
                      {alert.device}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Time:
                    </span>{" "}
                    <span className="text-slate-700 dark:text-slate-300">
                      {alert.time}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600 dark:bg-slate-950/40 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Alert ID</th>
                <th className="px-5 py-3 font-medium">Site</th>
                <th className="px-5 py-3 font-medium">Device</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Time</th>
              </tr>
            </thead>

            <tbody>
              {recentAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                    {alert.id}
                  </td>

                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                    {alert.site}
                  </td>

                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                    {alert.device}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={alert.status} />
                  </td>

                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                    {alert.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}