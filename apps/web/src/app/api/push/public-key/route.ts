import { getWebPushPublicKey } from "@/lib/web-push/web-push";

export const runtime = "nodejs";

export async function GET() {
  try {
    return Response.json(
      { publicKey: getWebPushPublicKey() },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/push/public-key error:", error);
    return Response.json(
      { error: "Failed to load push public key" },
      { status: 500 }
    );
  }
}