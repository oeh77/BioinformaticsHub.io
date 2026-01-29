/**
 * Answers API Routes
 * 
 * POST /api/questions/[slug]/answers - Submit an answer
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// POST - Submit an answer
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const question = await prisma.question.findUnique({
      where: { slug },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    if (question.isClosed) {
      return NextResponse.json(
        { error: "Question is closed for new answers" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { body: answerBody } = body;

    if (!answerBody) {
      return NextResponse.json(
        { error: "Answer body is required" },
        { status: 400 }
      );
    }

    const answer = await prisma.answer.create({
      data: {
        questionId: question.id,
        authorId: user.id,
        body: answerBody,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, reputation: true },
        },
      },
    });

    // Award reputation for answering
    await prisma.user.update({
      where: { id: user.id },
      data: { reputation: { increment: 2 } },
    });

    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    console.error("Error creating answer:", error);
    return NextResponse.json(
      { error: "Failed to create answer" },
      { status: 500 }
    );
  }
}
