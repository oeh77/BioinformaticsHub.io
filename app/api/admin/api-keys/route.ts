import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKeyPair, parseScopes } from "@/lib/api-security";

// GET /api/admin/api-keys - List all API keys
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        key: true,
        scopes: true,
        requestsPerHour: true,
        requestsPerDay: true,
        ipWhitelist: true,
        isActive: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    // Parse scopes from JSON
    const formattedKeys = apiKeys.map((key) => ({
      ...key,
      scopes: parseScopes(key.scopes),
    }));

    return NextResponse.json({ apiKeys: formattedKeys });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/api-keys - Create new API key
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      scopes,
      requestsPerHour,
      requestsPerDay,
      expiresAt,
      ipWhitelist,
    } = body;

    if (!name || !scopes || !Array.isArray(scopes)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate API key pair
    const { apiKey, secretKey, secretHash } = await generateApiKeyPair();

    // Create API key in database
    const createdKey = await prisma.apiKey.create({
      data: {
        name,
        description: description || null,
        key: apiKey,
        secretHash,
        userId: session.user.id!,
        scopes: JSON.stringify(scopes),
        requestsPerHour: requestsPerHour || 1000,
        requestsPerDay: requestsPerDay || 10000,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        ipWhitelist: ipWhitelist || null,
        isActive: true,
      },
    });

    // Return the API key and secret (secret is only shown once!)
    return NextResponse.json({
      id: createdKey.id,
      apiKey: createdKey.key,
      secretKey, // This is the only time we return the plain secret
      message: "API key created successfully. Save the secret key now!",
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
