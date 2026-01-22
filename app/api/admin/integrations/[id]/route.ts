
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    const integration = await prisma.integration.findUnique({
      where: { id },
    });
    return NextResponse.json(integration);
  } catch (error) {
    console.error("[INTEGRATION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, config, isConnected, description } = body;

    const integration = await prisma.integration.update({
      where: { id },
      data: {
        name,
        description,
        config: typeof config === 'string' ? config : JSON.stringify(config),
        isConnected
      },
    });

    return NextResponse.json(integration);
  } catch (error) {
    console.error("[INTEGRATION_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.integration.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[INTEGRATION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
