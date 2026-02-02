import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get AdSense settings
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.settings.findMany({
      where: {
        key: {
          startsWith: "adsense_"
        }
      }
    });
    
    // Convert array of key-value pairs to object
    const settingsObject: Record<string, unknown> = {};
    for (const setting of settings) {
      const keyWithoutPrefix = setting.key.replace("adsense_", "");
      try {
        settingsObject[keyWithoutPrefix] = JSON.parse(setting.value);
      } catch {
        settingsObject[keyWithoutPrefix] = setting.value;
      }
    }

    return NextResponse.json(settingsObject);
  } catch (error) {
    console.error("Get AdSense settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch AdSense settings" },
      { status: 500 }
    );
  }
}

// Update AdSense settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Process each setting with adsense_ prefix
    const updates = Object.entries(body).map(async ([key, value]) => {
      const prefixedKey = `adsense_${key}`;
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);
      
      return prisma.settings.upsert({
        where: { key: prefixedKey },
        update: { value: stringValue },
        create: { key: prefixedKey, value: stringValue },
      });
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update AdSense settings error:", error);
    return NextResponse.json(
      { error: "Failed to update AdSense settings" },
      { status: 500 }
    );
  }
}
