import { TriangleAlert, Router, MapPinned, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import InstallPWAButton from "@/components/install-pwa-button";
import { prisma } from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";

type UiEventStatus = "critical" | "warning" | "online";

function mapSeverityToUiStatus(
  severity: "low" | "medium" | "high" | "critical"
): UiEventStatus {
  if (severity === "critical") return "critical";
  if (severity === "medium" || severity === "high") return "warning";
  return "online";
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(date);
}

function getSystemHealth(
  totalDevices: number,
  offlineDevices: number,
  maintenanceDevices: number
): string {
  if (totalDevices === 0) return "No Devices";

  const affectedDevices = offlineDevices + maintenanceDevices;

  if (affectedDevices === 0) return "Stable";
  if (affectedDevices <= Math.ceil(totalDevices * 0.2)) return "Degraded";
  return "Critical";
}

export default async function DashboardPage() {
  const userId = await requireCurrentUserId();

  const [
    totalSites,
    totalDevices,
    offlineDevices,
    maintenanceDevices,
    activeAlerts,
    recentAlerts,
  ] = await Promise.all([
    prisma.site.count({
      where: {
        site_users: {
          some: {
            user_id: userId,
          },
        },
      },
    }),

    prisma.device.count({
      where: {
        site: {
          site_users: {
            some: {
              user_id: userId,
            },
          },
        },
      },
    }),

    prisma.device.count({
      where: {
        status: "offline",
        site: {
          site_users: {
            some: {
              user_id: userId,
            },
          },
        },
      },
    }),

    prisma.device.count({
      where: {
        status: "maintenance",
        site: {
          site_users: {
            some: {
              user_id: userId,
            },
          },
        },
      },
    }),

    prisma.emergencyEvent.count({
      where: {
        status: {
          in: ["new", "acknowledged"],
        },
        site: {
          site_users: {
            some: {
              user_id: userId,
            },
          },
        },
      },
    }),

    prisma.emergencyEvent.findMany({
      where: {
        site: {
          site_users: {
            some: {
              user_id: userId,
            },
          },
        },
      },
      include: {
        site: {
          select: {
            name: true,
          },
        },
        device: {
          select: {
            serial_number: true,
          },
        },
      },
      orderBy: {
        started_at: "desc",
      },
      take: 5,
    }),
  ]);

  const systemHealth = getSystemHealth(
    totalDevices,
    offlineDevices,
    maintenanceDevices
  );

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
          value={totalSites}
          description="Connected monitored locations"
          icon={<MapPinned className="h-5 w-5" />}
        />
        <StatCard
          title="Total Devices"
          value={totalDevices}
          description="Registered field devices"
          icon={<Router className="h-5 w-5" />}
        />
        <StatCard
          title="Active Alerts"
          value={activeAlerts}
          description="Currently open emergency events"
          icon={<TriangleAlert className="h-5 w-5" />}
        />
        <StatCard
          title="System Health"
          value={systemHealth}
          description="Derived from current device status"
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

        {recentAlerts.length === 0 ? (
          <div className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
            No recent events found for your assigned sites.
          </div>
        ) : (
          <>
            <div className="md:hidden">
              <div className="space-y-3 p-4">
                {recentAlerts.map((alert) => (
                  <article
                    key={alert.event_id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {alert.event_id}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {alert.site.name}
                        </p>
                      </div>

                      <StatusBadge status={mapSeverityToUiStatus(alert.severity)} />
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">
                          Device:
                        </span>{" "}
                        <span className="text-slate-700 dark:text-slate-300">
                          {alert.device?.serial_number ?? "N/A"}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-slate-400">
                          Time:
                        </span>{" "}
                        <span className="text-slate-700 dark:text-slate-300">
                          {formatDateTime(alert.started_at)}
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
                      key={alert.event_id}
                      className="border-t border-slate-200 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                        {alert.event_id}
                      </td>

                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                        {alert.site.name}
                      </td>

                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                        {alert.device?.serial_number ?? "N/A"}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={mapSeverityToUiStatus(alert.severity)} />
                      </td>

                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                        {formatDateTime(alert.started_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}