import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/jobs/[slug] - Get a single job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const job = await prisma.job.findUnique({
      where: { slug },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if expired
    if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This job has expired" }, { status: 410 });
    }

    if (!job.published) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("Job fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch job" },
      { status: 500 }
    );
  }
}
