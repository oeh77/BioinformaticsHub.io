import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Public API to fetch menu data for rendering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") || "header";

    const sections = await prisma.menuSection.findMany({
      where: { 
        location,
        isEnabled: true,
      },
      orderBy: { position: "asc" },
      include: {
        items: {
          where: { 
            parentId: null,
            isEnabled: true,
          },
          orderBy: { position: "asc" },
          include: {
            children: {
              where: { isEnabled: true },
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Error fetching menu data:", error);
    // Return empty sections on error to not break the frontend
    return NextResponse.json({ sections: [] });
  }
}
