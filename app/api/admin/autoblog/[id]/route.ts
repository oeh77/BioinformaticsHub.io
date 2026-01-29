import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single job details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    const job = await prisma.autoBlogJob.findUnique({
      where: { id }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // If job has a postId, fetch the post details
    let post = null;
    if (job.postId) {
      post = await prisma.post.findUnique({
        where: { id: job.postId },
        include: {
          category: { select: { name: true, slug: true } }
        }
      });
    }

    return NextResponse.json({ job, post });
  } catch (error) {
    console.error("Error fetching autoblog job:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

// DELETE - Delete a job
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.autoBlogJob.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Job deleted" });
  } catch (error) {
    console.error("Error deleting autoblog job:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
