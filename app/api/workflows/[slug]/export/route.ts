/**
 * Workflow Export API
 * 
 * POST /api/workflows/[slug]/export - Export workflow to CWL/Nextflow/Snakemake
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exportWorkflow } from "@/lib/workflow/export";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { slug } = await params;
    
    const workflow = await prisma.workflow.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true } },
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Check access for private workflows
    if (!workflow.isPublic) {
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      
      if (user?.id !== workflow.authorId && user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json();
    const { format } = body;

    if (!format || !["cwl", "nextflow", "snakemake"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Use 'cwl', 'nextflow', or 'snakemake'" },
        { status: 400 }
      );
    }

    const nodes = JSON.parse(workflow.nodes);
    const edges = JSON.parse(workflow.edges);

    const exported = exportWorkflow(format, nodes, edges, {
      name: workflow.name,
      description: workflow.description || undefined,
      version: "1.0.0",
      author: workflow.author.name || "BioinformaticsHub.io",
    });

    // Record the export
    await prisma.workflowExport.create({
      data: {
        workflowId: workflow.id,
        format,
        code: exported.content,
        version: "1.0.0",
      },
    });

    return NextResponse.json({
      format,
      filename: exported.filename,
      mimeType: exported.mimeType,
      content: exported.content,
    });
  } catch (error) {
    console.error("Error exporting workflow:", error);
    return NextResponse.json(
      { error: "Failed to export workflow" },
      { status: 500 }
    );
  }
}
