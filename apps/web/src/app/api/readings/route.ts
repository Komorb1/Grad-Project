import { z } from "zod";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDevice } from "@/lib/device-auth";
import { evaluateReadingForEvent } from "@/lib/events/evaluate-reading";
import { createAlertNotificationsForEvent } from "@/lib/alerts/create-alert-notifications";

export const runtime = "nodejs";

const ReadingSchema = z.object({
  sensor_id: z.string().uuid(),
  value: z.union([z.number(), z.string()]).transform((v) => String(v)),
  unit: z.string().min(1).max(32).optional(),
  recorded_at: z.string().datetime().optional(),
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

    const sensor = await prisma.sensor.findUnique({
      where: { sensor_id },
      select: {
        sensor_id: true,
        device_id: true,
        sensor_type: true,
        location_label: true,
        device: {
          select: {
            device_id: true,
            site_id: true,
            serial_number: true,
          },
        },
      },
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
        value,
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

    await prisma.device.update({
      where: { device_id: device.device_id },
      data: { last_seen_at: new Date(), status: "online" },
    });

    let createdEvent = null;
    let createdNotifications = 0;

    const eventDraft = evaluateReadingForEvent({
      sensorType: sensor.sensor_type,
      rawValue: value,
    });

    if (eventDraft) {
      const cooldownStart = new Date(Date.now() - 5 * 60 * 1000);

      const existingOpenEvent = await prisma.emergencyEvent.findFirst({
        where: {
          site_id: sensor.device.site_id,
          sensor_id: sensor.sensor_id,
          event_type: eventDraft.event_type,
          status: {
            in: ["new", "acknowledged"],
          },
          started_at: {
            gte: cooldownStart,
          },
        },
        select: {
          event_id: true,
        },
        orderBy: {
          started_at: "desc",
        },
      });

      const event =
        existingOpenEvent ??
        (await prisma.emergencyEvent.create({
          data: {
            site_id: sensor.device.site_id,
            device_id: sensor.device.device_id,
            sensor_id: sensor.sensor_id,
            event_type: eventDraft.event_type,
            severity: eventDraft.severity,
            status: "new",
            title: eventDraft.title,
            description: eventDraft.description,
            started_at: recorded_at ? new Date(recorded_at) : new Date(),
          },
          select: {
            event_id: true,
            site_id: true,
          },
        }));

      await prisma.sensorReading.update({
        where: { reading_id: reading.reading_id },
        data: {
          event_id: event.event_id,
        },
      });

      if (!existingOpenEvent) {
        const notificationResult = await createAlertNotificationsForEvent({
          eventId: event.event_id,
          siteId: sensor.device.site_id,
        });

        createdNotifications = notificationResult.created;
      }

      createdEvent = event;
    }

    return Response.json(
      {
        reading,
        event: createdEvent,
        notifications_created: createdNotifications,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";

    if (msg === "device_unauthenticated") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Reading ingestion error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}