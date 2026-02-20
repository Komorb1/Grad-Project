import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-request";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ siteId: string }>;
};

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const userId = await requireUserId(req);
    const { siteId } = await ctx.params;

    const membership = await prisma.siteUser.findUnique({
      where: { site_id_user_id: { site_id: siteId, user_id: userId } },
      select: { role: true },
    });

    if (!membership || membership.role !== "owner") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.site.delete({ where: { site_id: siteId } });

    return Response.json({ message: "Site deleted" }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "unauthenticated") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete site error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}