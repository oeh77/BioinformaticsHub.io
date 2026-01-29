/**
 * SEO Settings API
 * 
 * GET/POST endpoints for managing SEO configuration
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get SEO settings from database (stored as JSON in Settings table)
    const settings = await prisma.settings.findUnique({
      where: { key: "seo" },
    });

    if (!settings) {
      return NextResponse.json({});
    }

    return NextResponse.json(JSON.parse(settings.value));
  } catch (error) {
    console.error("Failed to get SEO settings:", error);
    return NextResponse.json(
      { error: "Failed to load SEO settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Upsert SEO settings
    await prisma.settings.upsert({
      where: { key: "seo" },
      update: {
        value: JSON.stringify(body),
      },
      create: {
        key: "seo",
        value: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save SEO settings:", error);
    return NextResponse.json(
      { error: "Failed to save SEO settings" },
      { status: 500 }
    );
  }
}
