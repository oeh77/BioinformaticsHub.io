import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH - Update suggestion status
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, adminNotes } = body;

    if (status && !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const updateData: { status?: string; adminNotes?: string } = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const suggestion = await prisma.toolSuggestion.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Error updating suggestion:", error);
    return NextResponse.json(
      { error: "Failed to update suggestion" },
      { status: 500 }
    );
  }
}

// DELETE - Delete suggestion
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.toolSuggestion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting suggestion:", error);
    return NextResponse.json(
      { error: "Failed to delete suggestion" },
      { status: 500 }
    );
  }
}
