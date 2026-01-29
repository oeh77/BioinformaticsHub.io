/**
 * Single Question API Routes
 * 
 * GET /api/questions/[slug] - Get question by slug
 * PUT /api/questions/[slug] - Update question
 * DELETE /api/questions/[slug] - Delete question
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET - Get question by slug
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    
    const question = await prisma.question.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, image: true, reputation: true },
        },
        tags: {
          include: { tag: true },
        },
        answers: {
          include: {
            author: {
              select: { id: true, name: true, image: true, reputation: true },
            },
            votes: true,
          },
          orderBy: [
            { isAccepted: "desc" },
            { upvotes: "desc" },
            { createdAt: "asc" },
          ],
        },
        votes: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Increment views
    await prisma.question.update({
      where: { id: question.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}

// PUT - Update question
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    
    const question = await prisma.question.findUnique({
      where: { slug },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.id !== question.authorId && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, body: questionBody, isClosed } = body;

    const updatedQuestion = await prisma.question.update({
      where: { id: question.id },
      data: {
        title: title ?? question.title,
        body: questionBody ?? question.body,
        isClosed: isClosed ?? question.isClosed,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

// DELETE - Delete question
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    
    const question = await prisma.question.findUnique({
      where: { slug },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.id !== question.authorId && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.question.delete({
      where: { id: question.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
