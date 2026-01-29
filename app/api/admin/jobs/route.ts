import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - List all jobs for admin
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// POST - Create a new job
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      company,
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
      companyLogo,
      tags,
      featured = false,
      published = true,
      expiresAt,
    } = body;

    if (!title || !company || !location || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    
    // Check for existing slug and append number if needed
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.job.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const job = await prisma.job.create({
      data: {
        title,
        company,
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
        companyLogo,
        tags,
        featured,
        published,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        slug,
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}

