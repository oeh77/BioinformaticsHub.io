import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiAuth } from "@/lib/api-auth-middleware";

// GET /api/v1/courses - List all courses
export const GET = withApiAuth(
  async (req: Request, context, apiKey) => {
    try {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
      const level = url.searchParams.get("level");
      const provider = url.searchParams.get("provider");
      const search = url.searchParams.get("search");

      const skip = (page - 1) * limit;

      // Build query
      const where: any = { published: true };
      if (level) where.level = level;
      if (provider) where.provider = provider;
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
        ];
      }

      // Execute query
      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.course.count({ where }),
      ]);

      return NextResponse.json({
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching courses:", error);
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: 500 }
      );
    }
  },
  { requiredScope: "courses:read" }
);

// POST /api/v1/courses - Create a new course
export const POST = withApiAuth(
  async (req: Request, context, apiKey) => {
    try {
      const body = await req.json();
      const {
        title,
        slug,
        provider,
        level,
        description,
        url,
        image,
        categoryId,
      } = body;

      if (!title || !slug || !provider || !level || !description || !categoryId) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const course = await prisma.course.create({
        data: {
          title,
          slug,
          provider,
          level,
          description,
          url: url || null,
          image: image || null,
          categoryId,
          published: true,
        },
        include: {
          category: true,
        },
      });

      return NextResponse.json({ course }, { status: 201 });
    } catch (error: any) {
      console.error("Error creating course:", error);

      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A course with this slug already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create course" },
        { status: 500 }
      );
    }
  },
  { requiredScope: "courses:write" }
);
