import { z } from "zod";
import type { NextRequest } from "next/server";
import { AuditActionType, AuditTargetType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireDevice } from "@/lib/device-auth";
import { safeAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

const SensorTypeSchema = z.enum(["gas", "smoke", "flame", "motion", "door"]);

const DeviceSetupSchema = z.object({
  sensors: z
    .array(
      z.object({
        sensor_type: SensorTypeSchema,
        location_label: z.string().min(1).max(120).optional(),
      })
    )
    .min(1, "At least one sensor is required"),
});

type SensorRecord = {
  sensor_id: string;
  device_id: string;
  sensor_type: "gas" | "smoke" | "flame" | "motion" | "door";
  location_label: string | null;
  is_enabled: boolean;
  status: "ok" | "faulty" | "disabled";
  installed_at: Date | null;
};

export async function POST(req: NextRequest) {
  try {
    const deviceAuth = await requireDevice(req);

    const body = await req.json();
    const parsed = DeviceSetupSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const deduped = new Map<
      string,
      {
        sensor_type: "gas" | "smoke" | "flame" | "motion" | "door";
        location_label: string | null;
      }
    >();

    for (const sensor of parsed.data.sensors) {
      const normalizedLocation = sensor.location_label?.trim() || null;
      const key = `${sensor.sensor_type}::${normalizedLocation ?? ""}`;

      if (!deduped.has(key)) {
        deduped.set(key, {
          sensor_type: sensor.sensor_type,
          location_label: normalizedLocation,
        });
      }
    }

    const sensorsToSetup = Array.from(deduped.values());

    const results: SensorRecord[] = [];
    let createdCount = 0;

    for (const sensorInput of sensorsToSetup) {
      const existing = await prisma.sensor.findFirst({
        where: {
          device_id: deviceAuth.device_id,
          sensor_type: sensorInput.sensor_type,
          location_label: sensorInput.location_label,
        },
        select: {
          sensor_id: true,
          device_id: true,
          sensor_type: true,
          location_label: true,
          is_enabled: true,
          status: true,
          installed_at: true,
        },
      });

      if (existing) {
        results.push(existing);
        continue;
      }

      const created = await prisma.sensor.create({
        data: {
          device_id: deviceAuth.device_id,
          sensor_type: sensorInput.sensor_type,
          location_label: sensorInput.location_label,
          is_enabled: true,
          status: "ok",
        },
        select: {
          sensor_id: true,
          device_id: true,
          sensor_type: true,
          location_label: true,
          is_enabled: true,
          status: true,
          installed_at: true,
        },
      });

      results.push(created);
      createdCount += 1;

      await safeAuditLog({
        action_type: AuditActionType.other,
        target_type: AuditTargetType.sensor,
        target_id: created.sensor_id,
        details: {
          kind: "sensor_auto_registered",
          site_id: deviceAuth.site_id,
          device_id: deviceAuth.device_id,
          sensor_type: created.sensor_type,
          location_label: created.location_label,
        },
      });
    }

    return Response.json(
      {
        sensors: results,
        created_count: createdCount,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";

    if (msg === "device_unauthenticated") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (msg === "server_misconfigured") {
      return Response.json({ error: "Server misconfigured" }, { status: 500 });
    }

    console.error("Device setup error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}