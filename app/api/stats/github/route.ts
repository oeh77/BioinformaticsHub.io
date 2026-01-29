import { NextRequest, NextResponse } from "next/server";
import { getGitHubStats } from "@/lib/external-stats";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "GitHub URL is required" },
        { status: 400 }
      );
    }

    const stats = await getGitHubStats(url);

    if (!stats) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub stats" },
        { status: 404 }
      );
    }

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("GitHub stats API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
