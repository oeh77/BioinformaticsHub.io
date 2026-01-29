/**
 * Badges API Routes
 * 
 * GET /api/badges - List all available badges
 * POST /api/badges/award - Award badge to user (admin only)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Default badges to seed
const DEFAULT_BADGES = [
  {
    name: "Newcomer",
    description: "Welcome to the community! Posted your first question or answer.",
    icon: "🎉",
    type: "bronze",
    criteria: JSON.stringify({ firstPost: true }),
  },
  {
    name: "Curious Mind",
    description: "Asked 10 questions that received upvotes.",
    icon: "🤔",
    type: "bronze",
    criteria: JSON.stringify({ upvotedQuestions: 10 }),
  },
  {
    name: "Helpful Hand",
    description: "Provided 10 answers that were upvoted.",
    icon: "🤝",
    type: "bronze",
    criteria: JSON.stringify({ upvotedAnswers: 10 }),
  },
  {
    name: "Scholar",
    description: "Had an answer accepted on 25 different questions.",
    icon: "📚",
    type: "silver",
    criteria: JSON.stringify({ acceptedAnswers: 25 }),
  },
  {
    name: "Teacher",
    description: "Answered 50 questions with a score of 1 or more.",
    icon: "👨‍🏫",
    type: "silver",
    criteria: JSON.stringify({ scoredAnswers: 50 }),
  },
  {
    name: "Guru",
    description: "Accepted answer with score of 10 or more.",
    icon: "🧘",
    type: "gold",
    criteria: JSON.stringify({ answerScore: 10 }),
  },
  {
    name: "Illuminator",
    description: "Edited and improved 50 posts.",
    icon: "💡",
    type: "gold",
    criteria: JSON.stringify({ edits: 50 }),
  },
  {
    name: "Bioinformatics Expert",
    description: "Answered 100+ questions in bioinformatics topics with high scores.",
    icon: "🧬",
    type: "gold",
    criteria: JSON.stringify({ bioinformaticsAnswers: 100 }),
  },
  {
    name: "Pipeline Master",
    description: "Created 10 public workflows that others have forked.",
    icon: "🔧",
    type: "gold",
    criteria: JSON.stringify({ forkedWorkflows: 10 }),
  },
  {
    name: "Community Champion",
    description: "Reached 1000 reputation points.",
    icon: "🏆",
    type: "platinum",
    criteria: JSON.stringify({ reputation: 1000 }),
  },
];

// GET - List all badges
export async function GET() {
  try {
    let badges = await prisma.badge.findMany({
      orderBy: [
        { type: "asc" },
        { name: "asc" },
      ],
    });

    // Seed default badges if none exist
    if (badges.length === 0) {
      for (const badge of DEFAULT_BADGES) {
        try {
          await prisma.badge.create({
            data: badge,
          });
        } catch {
          // Badge already exists, skip
        }
      }
      badges = await prisma.badge.findMany({
        orderBy: [
          { type: "asc" },
          { name: "asc" },
        ],
      });
    }

    return NextResponse.json({ badges });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}

// POST - Award badge to user
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, badgeId } = body;

    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: "userId and badgeId are required" },
        { status: 400 }
      );
    }

    // Check if user already has this badge
    const existingBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: { userId, badgeId },
      },
    });

    if (existingBadge) {
      return NextResponse.json(
        { error: "User already has this badge" },
        { status: 409 }
      );
    }

    const userBadge = await prisma.userBadge.create({
      data: { userId, badgeId },
      include: {
        badge: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(userBadge, { status: 201 });
  } catch (error) {
    console.error("Error awarding badge:", error);
    return NextResponse.json(
      { error: "Failed to award badge" },
      { status: 500 }
    );
  }
}
