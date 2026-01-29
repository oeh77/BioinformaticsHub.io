import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const suggestSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  url: z.string().url(),
  categoryId: z.string().min(1),
  pricing: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = suggestSchema.parse(body);

    // Create a slug from the name
    const baseSlug = validated.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const tool = await prisma.tool.create({
      data: {
        name: validated.name,
        slug: uniqueSlug,
        description: validated.description,
        url: validated.url,
        categoryId: validated.categoryId,
        pricing: validated.pricing || "Free",
        published: false, // Pending approval
      },
    });

    return NextResponse.json(tool, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
       return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    console.error("Suggest tool error:", error);
    return NextResponse.json(
      { error: "Failed to submit suggestion" },
      { status: 500 }
    );
  }
}
