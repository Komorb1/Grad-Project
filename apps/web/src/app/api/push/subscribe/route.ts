import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-request";

export const runtime = "nodejs";

const SubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  device_label: z.string().trim().min(1).max(100).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const userId = await requireUserId(req);

    const body = await req.json();
    const parsed = SubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { endpoint, keys, device_label } = parsed.data;
    const userAgent = req.headers.get("user-agent");

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        user_id: userId,
        p256dh_key: keys.p256dh,
        auth_key: keys.auth,
        user_agent: userAgent,
        device_label: device_label ?? null,
        is_active: true,
        revoked_at: null,
      },
      create: {
        user_id: userId,
        endpoint,
        p256dh_key: keys.p256dh,
        auth_key: keys.auth,
        user_agent: userAgent,
        device_label: device_label ?? null,
        is_active: true,
      },
      select: {
        subscription_id: true,
        endpoint: true,
        device_label: true,
        is_active: true,
        created_at: true,
      },
    });

    return Response.json({ subscription }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "unauthenticated") {
      return Response.json({ error: "Unauthenticated" }, { status: 401 });
    }

    console.error("POST /api/push/subscribe error:", error);
    return Response.json(
      { error: "Failed to save push subscription" },
      { status: 500 }
    );
  }
}