import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateWebhookSecret, parseEvents } from "@/lib/api-security";

// GET /api/admin/webhooks - List all webhooks
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const webhooks = await prisma.webhook.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { deliveries: true },
        },
      },
    });

    // Parse events from JSON
    const formattedWebhooks = webhooks.map((webhook) => ({
      ...webhook,
      events: parseEvents(webhook.events),
    }));

    return NextResponse.json({ webhooks: formattedWebhooks });
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/webhooks - Create new webhook
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, url, events } = body;

    if (!name || !url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Generate webhook secret
    const secret = generateWebhookSecret();

    // Create webhook in database
    const webhook = await prisma.webhook.create({
      data: {
        name,
        description: description || null,
        url,
        secret,
        events: JSON.stringify(events),
        userId: session.user.id!,
        isActive: true,
      },
    });

    return NextResponse.json({
      id: webhook.id,
      secret, // Return secret only once
      message: "Webhook created successfully. Save the secret for signature verification!",
    });
  } catch (error) {
    console.error("Error creating webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
