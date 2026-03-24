import {
  Activity,
  Clock3,
  Cpu,
  Radio,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireCurrentUserId } from "@/lib/auth";

function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(date: Date | null): string {
  if (!date) return "N/A";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(date);
}

function formatReadingValue(value: unknown): string {
  if (value == null) return "N/A";
  return String(value);
}

export default async function ReadingsPage() {
  const userId = await requireCurrentUserId();

  const readings = await prisma.sensorReading.findMany({
    where: {
      sensor: {
        device: {
          site: {
            site_users: {
              some: {
                user_id: userId,
              },
            },
          },
        },
      },
    },
    orderBy: {
      received_at: "desc",
    },
    take: 100,
    select: {
      reading_id: true,
      value: true,
      unit: true,
      recorded_at: true,
      received_at: true,
      quality_flag: true,
      sensor: {
        select: {
          sensor_id: true,
          sensor_type: true,
          location_label: true,
          device: {
            select: {
              device_id: true,
              serial_number: true,
              site: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Sensor Readings
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Review recent readings from devices in your authorized sites.
          </p>
        </div>

        <div className="inline-flex w-fit items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Total readings:
          <span className="ml-2 font-semibold text-slate-900 dark:text-white">
            {readings.length}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Readings
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sorted by newest first across all your accessible devices.
          </p>
        </div>

        {readings.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
              No readings yet
            </h4>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              No sensor readings were found for your assigned sites.
            </p>
          </div>
        ) : (
          <>
            <div className="md:hidden">
              <div className="space-y-3 p-4">
                {readings.map((reading) => (
                  <article
                    key={reading.reading_id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {reading.sensor.device.serial_number}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {reading.sensor.device.site.name}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {formatEnumLabel(String(reading.quality_flag))}
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Radio className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {formatEnumLabel(String(reading.sensor.sensor_type))}
                          {reading.sensor.location_label
                            ? ` • ${reading.sensor.location_label}`
                            : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Activity className="h-4 w-4 shrink-0" />
                        <span>
                          Value:{" "}
                          <span className="font-medium">
                            {formatReadingValue(reading.value)} {reading.unit ?? ""}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Clock3 className="h-4 w-4 shrink-0" />
                        <span>{formatDateTime(reading.received_at)}</span>
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
                    <th className="px-5 py-3 font-medium">Device</th>
                    <th className="px-5 py-3 font-medium">Site</th>
                    <th className="px-5 py-3 font-medium">Sensor Type</th>
                    <th className="px-5 py-3 font-medium">Value</th>
                    <th className="px-5 py-3 font-medium">Quality</th>
                    <th className="px-5 py-3 font-medium">Timestamp</th>
                  </tr>
                </thead>

                <tbody>
                  {readings.map((reading) => (
                    <tr
                      key={reading.reading_id}
                      className="border-t border-slate-200 dark:border-slate-800"
                    >
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-slate-500" />
                          <span>{reading.sensor.device.serial_number}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                        {reading.sensor.device.site.name}
                      </td>

                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                        {formatEnumLabel(String(reading.sensor.sensor_type))}
                        {reading.sensor.location_label
                          ? ` • ${reading.sensor.location_label}`
                          : ""}
                      </td>

                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                        {formatReadingValue(reading.value)} {reading.unit ?? ""}
                      </td>

                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                        {formatEnumLabel(String(reading.quality_flag))}
                      </td>

                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                        {formatDateTime(reading.received_at)}
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