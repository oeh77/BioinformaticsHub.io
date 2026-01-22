import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/api-keys/[id] - Update API key
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { isActive, name, description, scopes, requestsPerHour, requestsPerDay } = body;

    const updateData: any = {};
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (scopes) updateData.scopes = JSON.stringify(scopes);
    if (requestsPerHour) updateData.requestsPerHour = requestsPerHour;
    if (requestsPerDay) updateData.requestsPerDay = requestsPerDay;

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, apiKey });
  } catch (error) {
    console.error("Error updating API key:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/api-keys/[id] - Delete API key
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await prisma.apiKey.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
