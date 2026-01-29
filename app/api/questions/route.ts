/**
 * Questions API Routes
 * 
 * GET /api/questions - List questions
 * POST /api/questions - Create a new question
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List questions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sort = searchParams.get("sort") || "newest";
    const tagSlug = searchParams.get("tag");
    const answered = searchParams.get("answered");

    // Build where clause
    const whereClause: Record<string, unknown> = {
      isClosed: false,
    };

    if (answered === "true") {
      whereClause.isAnswered = true;
    } else if (answered === "false") {
      whereClause.isAnswered = false;
    }

    if (tagSlug) {
      whereClause.tags = {
        some: {
          tag: { slug: tagSlug },
        },
      };
    }

    // Build order by
    type OrderBy = { createdAt: "desc" } | { views: "desc" } | { upvotes: "desc" };
    let orderBy: OrderBy = { createdAt: "desc" };
    if (sort === "popular") {
      orderBy = { views: "desc" };
    } else if (sort === "votes") {
      orderBy = { upvotes: "desc" };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: whereClause,
        include: {
          author: {
            select: { id: true, name: true, image: true, reputation: true },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: { answers: true },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.question.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      questions,
      total,
      hasMore: offset + questions.length < total,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST - Create a new question
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, body: questionBody, tags } = body;

    if (!title || !questionBody) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.question.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create or find tags
    const tagConnections = [];
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        const tagSlug = tagName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        
        const tag = await prisma.forumTag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });
        
        tagConnections.push({ tagId: tag.id });
      }
    }

    const question = await prisma.question.create({
      data: {
        slug,
        title,
        body: questionBody,
        authorId: user.id,
        tags: {
          create: tagConnections,
        },
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

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
