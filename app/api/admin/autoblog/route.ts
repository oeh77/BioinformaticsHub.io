import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runDailyAutoBlog, getAutoBlogStatus, generatePostForCategory } from "@/lib/autoblog";

// GET - List auto-blog jobs and status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get jobs
    const jobs = await prisma.autoBlogJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    });

    // Get overall status
    const autoBlogStatus = await getAutoBlogStatus();

    // Get POST category count
    const categoryCount = await prisma.category.count({
      where: { type: "POST" }
    });

    return NextResponse.json({
      jobs,
      status: autoBlogStatus,
      categoryCount,
      enabled: process.env.AUTOBLOG_ENABLED === "true",
      autoPublish: process.env.AUTOBLOG_AUTO_PUBLISH === "true"
    });
  } catch (error) {
    console.error("Error fetching autoblog jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

// POST - Trigger manual auto-blog generation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, categoryId } = body;

    if (action === "generate-all") {
      // Run full daily generation
      const results = await runDailyAutoBlog();
      return NextResponse.json({
        message: `Generated ${results.success} posts, ${results.failed} failed`,
        results
      });
    } else if (action === "generate-single" && categoryId) {
      // Generate for a single category
      const postId = await generatePostForCategory(categoryId);
      if (postId) {
        return NextResponse.json({ message: "Post generated", postId });
      } else {
        return NextResponse.json({ error: "Failed to generate post" }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'generate-all' or 'generate-single' with categoryId" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in autoblog generation:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
