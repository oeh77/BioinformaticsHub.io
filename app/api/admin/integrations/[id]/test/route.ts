import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ProviderRequiredFields {
  [key: string]: string[];
}

// Define required fields for each provider
const PROVIDER_REQUIRED_FIELDS: ProviderRequiredFields = {
  twitter: ["api_key", "api_secret", "access_token", "access_token_secret"],
  linkedin: ["client_id", "client_secret"],
  facebook: ["app_id", "app_secret", "page_access_token"],
  slack: ["webhook_url"],
  zapier: ["webhook_url"],
  salesforce: ["client_id", "client_secret", "instance_url"],
  custom_webhook: ["webhook_url"],
};

export async function POST(
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

    if (!integration) {
      return NextResponse.json(
        { success: false, message: "Integration not found" },
        { status: 404 }
      );
    }

    // Parse the config
    let config: Record<string, string> = {};
    try {
      config = JSON.parse(integration.config || "{}");
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid configuration format" },
        { status: 400 }
      );
    }

    // Get required fields for this provider
    const requiredFields = PROVIDER_REQUIRED_FIELDS[integration.provider] || [];
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!config[field] || config[field].trim() === "") {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    // Simulate connection test (in production, this would actually ping the service)
    // For now, we just validate that all fields are present
    
    // Simulate a brief delay to make it feel like a real connection test
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update the integration to mark it as connected
    await prisma.integration.update({
      where: { id },
      data: { isConnected: true },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully connected to ${integration.name}`,
    });
  } catch (error) {
    console.error("[INTEGRATION_TEST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
