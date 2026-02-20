import { z } from "zod";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-request";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ deviceId: string }>;
};

const UpdateDeviceStatusSchema = z.object({
  status: z.enum(["online", "offline", "maintenance"]),
});

function isOwnerOrAdmin(role: string): boolean {
  return role === "owner" || role === "admin";
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const userId = await requireUserId(req);
    const { deviceId } = await ctx.params;

    const body = await req.json();
    const parsed = UpdateDeviceStatusSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const device = await prisma.device.findUnique({
      where: { device_id: deviceId },
      select: { site_id: true },
    });

    if (!device) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    // RBAC: owner/admin only (based on SiteUser for the device's site)
    const membership = await prisma.siteUser.findUnique({
      where: { site_id_user_id: { site_id: device.site_id, user_id: userId } },
      select: { role: true },
    });

    if (!membership || !isOwnerOrAdmin(membership.role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.device.update({
      where: { device_id: deviceId },
      data: { status: parsed.data.status },
      select: { device_id: true, status: true },
    });

    return Response.json({ device: updated }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "unauthenticated") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update device status error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}