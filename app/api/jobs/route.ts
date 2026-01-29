import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/jobs - List jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const location = searchParams.get("location");
    const locationType = searchParams.get("locationType");
    const employmentType = searchParams.get("employmentType");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Prisma.JobWhereInput = {
      published: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    };

    if (query) {
      where.AND = [
        {
          OR: [
            { title: { contains: query } },
            { company: { contains: query } },
            { description: { contains: query } },
            { tags: { contains: query } },
          ],
        },
      ];
    }

    if (location) {
      where.location = { contains: location };
    }

    if (locationType) {
      where.locationType = locationType;
    }

    if (employmentType) {
      where.employmentType = employmentType;
    }

    if (featured === "true") {
      where.featured = true;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: [
          { featured: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      total,
      limit,
      offset,
      hasMore: offset + jobs.length < total,
    });
  } catch (error: unknown) {
    console.error("Jobs fetch error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch jobs";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a job (admin only for now, could add paid job posting later)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      company,
      companyLogo,
      location,
      locationType,
      employmentType,
      salaryMin,
      salaryMax,
      salaryCurrency,
      description,
      requirements,
      benefits,
      applicationUrl,
      applicationEmail,
      tags,
      featured,
      expiresAt,
    } = body;

    if (!title || !company || !location || !description) {
      return NextResponse.json(
        { error: "Title, company, location, and description are required" },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const job = await prisma.job.create({
      data: {
        title,
        slug,
        company,
        companyLogo,
        location,
        locationType: locationType || "Remote",
        employmentType: employmentType || "Full-time",
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        salaryCurrency: salaryCurrency || "USD",
        description,
        requirements,
        benefits,
        applicationUrl,
        applicationEmail,
        tags,
        featured: featured || false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error: unknown) {
    console.error("Job create error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create job";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
