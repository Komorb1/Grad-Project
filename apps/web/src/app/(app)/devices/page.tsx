import { Router, Activity, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

const devices = [
  {
    id: "DEV-001",
    serial: "SN-AX12",
    site: "Main Warehouse",
    status: "online" as const,
    lastSeen: "2 min ago",
  },
  {
    id: "DEV-002",
    serial: "SN-BX88",
    site: "Office Building",
    status: "warning" as const,
    lastSeen: "5 min ago",
  },
  {
    id: "DEV-003",
    serial: "SN-CZ41",
    site: "Parking Area",
    status: "offline" as const,
    lastSeen: "20 min ago",
  },
];

export default function DevicesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Devices
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            View all registered hardware units and their current status.
          </p>
        </div>

        <div className="inline-flex w-fit items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Total devices:
          <span className="ml-2 font-semibold text-slate-900 dark:text-white">
            {devices.length}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Registered Devices
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor field devices, connectivity, and last activity.
          </p>
        </div>

        <div className="md:hidden">
          <div className="space-y-3 p-4">
            {devices.map((device) => (
              <article
                key={device.id}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {device.id}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {device.serial}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <StatusBadge status={device.status} />
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Router className="h-4 w-4 shrink-0" />
                    <span className="truncate">{device.site}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Activity className="h-4 w-4 shrink-0" />
                    <span>Last seen: {device.lastSeen}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
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
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-600 dark:bg-slate-950/40 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Device ID</th>
                <th className="px-5 py-3 font-medium">Serial Number</th>
                <th className="px-5 py-3 font-medium">Site</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Last Seen</th>
              </tr>
            </thead>

            <tbody>
              {devices.map((device) => (
                <tr
                  key={device.id}
                  className="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                    {device.id}
                  </td>
                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                    {device.serial}
                  </td>
                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                    {device.site}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={device.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                    {device.lastSeen}
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