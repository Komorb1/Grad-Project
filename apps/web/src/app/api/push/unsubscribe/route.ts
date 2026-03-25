import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-request";

export const runtime = "nodejs";

const UnsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const userId = await requireUserId(req);

    const body = await req.json();
    const parsed = UnsubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { endpoint } = parsed.data;

    const existing = await prisma.pushSubscription.findFirst({
      where: {
        user_id: userId,
        endpoint,
        is_active: true,
      },
      select: {
        subscription_id: true,
      },
    });

    if (!existing) {
      return Response.json({ error: "Subscription not found" }, { status: 404 });
    }

    await prisma.pushSubscription.update({
      where: {
        subscription_id: existing.subscription_id,
      },
      data: {
        is_active: false,
        revoked_at: new Date(),
      },
    });

    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "unauthenticated") {
      return Response.json({ error: "Unauthenticated" }, { status: 401 });
    }

    console.error("POST /api/push/unsubscribe error:", error);
    return Response.json(
      { error: "Failed to revoke push subscription" },
      { status: 500 }
    );
  }
}