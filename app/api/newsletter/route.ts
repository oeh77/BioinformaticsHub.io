import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
});

// Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validatedData = subscribeSchema.safeParse(body);
    
    if (!validatedData.success) {
      const errorMessage = validatedData.error.issues?.[0]?.message || "Invalid email";
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const { email, name } = validatedData.data;

    // Check if already subscribed
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      if (existingSubscriber.status === "SUBSCRIBED") {
        return NextResponse.json(
          { message: "You're already subscribed!", alreadySubscribed: true },
          { status: 200 }
        );
      } else {
        // Re-subscribe
        await prisma.subscriber.update({
          where: { email },
          data: { status: "SUBSCRIBED" },
        });
        return NextResponse.json(
          { message: "Welcome back! You've been re-subscribed." },
          { status: 200 }
        );
      }
    }

    // Create new subscriber
    await prisma.subscriber.create({
      data: {
        email,
        name: name || null,
        status: "SUBSCRIBED",
      },
    });

    return NextResponse.json(
      { message: "Successfully subscribed!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}

// Get all subscribers (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check for admin authentication via header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: subscribers.length,
      subscribed: subscribers.filter(s => s.status === "SUBSCRIBED").length,
      unsubscribed: subscribers.filter(s => s.status === "UNSUBSCRIBED").length,
    };

    return NextResponse.json({ subscribers, stats });
  } catch (error) {
    console.error("Get subscribers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}
