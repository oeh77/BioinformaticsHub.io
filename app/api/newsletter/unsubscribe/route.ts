import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Unsubscribe from newsletter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Email not found in our subscription list" },
        { status: 404 }
      );
    }

    await prisma.subscriber.update({
      where: { email },
      data: { status: "UNSUBSCRIBED" },
    });

    return NextResponse.json(
      { message: "Successfully unsubscribed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
