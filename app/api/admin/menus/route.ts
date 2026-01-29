import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch menu sections and items
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") || "header";

    const sections = await prisma.menuSection.findMany({
      where: { location },
      orderBy: { position: "asc" },
      include: {
        items: {
          where: { parentId: null }, // Only top-level items
          orderBy: { position: "asc" },
          include: {
            children: {
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Error fetching menu data:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu data" },
      { status: 500 }
    );
  }
}
