import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-request";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ siteId: string }>;
};

const UpdateStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const userId = await requireUserId(req);
    const { siteId } = await ctx.params;

    const body = await req.json();
    const parsed = UpdateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const membership = await prisma.siteUser.findUnique({
      where: { site_id_user_id: { site_id: siteId, user_id: userId } },
      select: { role: true },
    });

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.site.update({
      where: { site_id: siteId },
      data: { status: parsed.data.status },
      select: { site_id: true, status: true },
    });

    return Response.json({ site: updated }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "unauthenticated") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update site status error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}