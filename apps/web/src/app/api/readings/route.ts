import { z } from "zod";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDevice } from "@/lib/device-auth";

export const runtime = "nodejs";

const ReadingSchema = z.object({
  sensor_id: z.string().uuid(),
  value: z.union([z.number(), z.string()]).transform((v) => String(v)),
  unit: z.string().min(1).max(32).optional(),
  recorded_at: z.string().datetime().optional(), // optional device timestamp
  quality_flag: z.enum(["ok", "suspect"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const device = await requireDevice(req);

    const body = await req.json();
    const parsed = ReadingSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sensor_id, value, unit, recorded_at, quality_flag } = parsed.data;

    // Ensure sensor belongs to authenticated device (anti-spoof)
    const sensor = await prisma.sensor.findUnique({
      where: { sensor_id },
      select: { sensor_id: true, device_id: true },
    });

    if (!sensor) {
      return Response.json({ error: "Sensor not found" }, { status: 404 });
    }

    if (sensor.device_id !== device.device_id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const reading = await prisma.sensorReading.create({
      data: {
        sensor_id,
        value, // Prisma Decimal accepts string
        unit: unit ?? null,
        recorded_at: recorded_at ? new Date(recorded_at) : null,
        quality_flag: quality_flag ?? "ok",
      },
      select: {
        reading_id: true,
        sensor_id: true,
        value: true,
        unit: true,
        recorded_at: true,
        received_at: true,
        quality_flag: true,
      },
    });

    // Optional but useful: mark device as seen
    await prisma.device.update({
      where: { device_id: device.device_id },
      data: { last_seen_at: new Date(), status: "online" },
    });

    return Response.json({ reading }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";

    if (msg === "device_unauthenticated") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Reading ingestion error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}