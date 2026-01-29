import { NextRequest, NextResponse } from "next/server";
import { getPyPIDownloads } from "@/lib/external-stats";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const packageName = searchParams.get("package");

    if (!packageName) {
      return NextResponse.json(
        { error: "Package name is required" },
        { status: 400 }
      );
    }

    const stats = await getPyPIDownloads(packageName);

    if (!stats) {
      return NextResponse.json(
        { error: "Failed to fetch PyPI stats" },
        { status: 404 }
      );
    }

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("PyPI stats API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
