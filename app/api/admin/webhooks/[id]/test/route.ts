import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deliverWebhook } from "@/lib/webhook-dispatcher";

// POST /api/admin/webhooks/[id]/test - Send test webhook
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const webhook = await prisma.webhook.findUnique({
      where: { id },
    });

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    // Send test payload
    const testPayload = {
      event: "webhook.test",
      data: {
        message: "This is a test webhook from BioinformaticsHub.io",
        timestamp: new Date().toISOString(),
        webhookId: webhook.id,
        webhookName: webhook.name,
      },
    };

    await deliverWebhook(webhook.id, "webhook.test", testPayload);

    return NextResponse.json({ success: true, message: "Test webhook sent" });
  } catch (error) {
    console.error("Error sending test webhook:", error);
    return NextResponse.json({ error: "Failed to send test webhook" }, { status: 500 });
  }
}
