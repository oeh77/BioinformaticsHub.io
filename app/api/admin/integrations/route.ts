
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const integrations = await prisma.integration.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(integrations);
  } catch (error) {
    console.error("[INTEGRATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, provider, category, description, image, config, isConnected } = body;

    const integration = await prisma.integration.create({
      data: {
        name,
        provider,
        category,
        description,
        image,
        config: typeof config === 'string' ? config : JSON.stringify(config),
        isConnected
      },
    });

    return NextResponse.json(integration);
  } catch (error) {
    console.error("[INTEGRATIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
