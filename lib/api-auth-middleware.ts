import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateApiKeyFormat,
  verifySecret,
  hasScope,
  isIpWhitelisted,
} from "@/lib/api-security";

interface ApiAuthResult {
  success: boolean;
  error?: string;
  statusCode?: number;
  apiKey?: {
    id: string;
    userId: string;
    scopes: string;
    requestsPerHour: number;
    requestsPerDay: number;
  };
}

/**
 * Authenticate API request using Bearer token
 * Expects: Authorization: Bearer <api_key>:<secret_key>
 */
export async function authenticateApiRequest(req: Request): Promise<ApiAuthResult> {
  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        error: "Missing or invalid Authorization header",
        statusCode: 401,
      };
    }

    // Parse API key and secret
    const token = authHeader.substring(7); // Remove "Bearer "
    const [apiKey, secretKey] = token.split(":");

    if (!apiKey || !secretKey) {
      return {
        success: false,
        error: "Invalid token format. Use: Bearer <api_key>:<secret_key>",
        statusCode: 401,
      };
    }

    // Validate API key format
    if (!validateApiKeyFormat(apiKey)) {
      return {
        success: false,
        error: "Invalid API key format",
        statusCode: 401,
      };
    }

    // Find API key in database
    const dbApiKey = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      select: {
        id: true,
        secretHash: true,
        userId: true,
        scopes: true,
        requestsPerHour: true,
        requestsPerDay: true,
        isActive: true,
        expiresAt: true,
        ipWhitelist: true,
      },
    });

    if (!dbApiKey) {
      return {
        success: false,
        error: "Invalid API key",
        statusCode: 401,
      };
    }

    // Check if API key is active
    if (!dbApiKey.isActive) {
      return {
        success: false,
        error: "API key is inactive",
        statusCode: 403,
      };
    }

    // Check expiration
    if (dbApiKey.expiresAt && new Date(dbApiKey.expiresAt) < new Date()) {
      return {
        success: false,
        error: "API key has expired",
        statusCode: 403,
      };
    }

    // Verify secret key
    const secretValid = await verifySecret(secretKey, dbApiKey.secretHash);
    if (!secretValid) {
      return {
        success: false,
        error: "Invalid secret key",
        statusCode: 401,
      };
    }

    // Check IP whitelist
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!isIpWhitelisted(clientIp, dbApiKey.ipWhitelist)) {
      return {
        success: false,
        error: "IP address not whitelisted",
        statusCode: 403,
      };
    }

    // Check rate limits
    const rateLimitResult = await checkRateLimit(dbApiKey.id, dbApiKey.requestsPerHour, dbApiKey.requestsPerDay);
    if (!rateLimitResult.success) {
      return {
        success: false,
        error: rateLimitResult.error,
        statusCode: 429,
      };
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: dbApiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      success: true,
      apiKey: {
        id: dbApiKey.id,
        userId: dbApiKey.userId,
        scopes: dbApiKey.scopes,
        requestsPerHour: dbApiKey.requestsPerHour,
        requestsPerDay: dbApiKey.requestsPerDay,
      },
    };
  } catch (error) {
    console.error("API authentication error:", error);
    return {
      success: false,
      error: "Internal server error",
      statusCode: 500,
    };
  }
}

/**
 * Check if API key has exceeded rate limits
 */
async function checkRateLimit(
  apiKeyId: string,
  requestsPerHour: number,
  requestsPerDay: number
): Promise<{ success: boolean; error?: string }> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Count requests in the last hour
  const hourlyCount = await prisma.apiKeyUsage.count({
    where: {
      apiKeyId,
      timestamp: { gte: oneHourAgo },
    },
  });

  if (hourlyCount >= requestsPerHour) {
    return {
      success: false,
      error: `Rate limit exceeded: ${requestsPerHour} requests per hour`,
    };
  }

  // Count requests in the last day
  const dailyCount = await prisma.apiKeyUsage.count({
    where: {
      apiKeyId,
      timestamp: { gte: oneDayAgo },
    },
  });

  if (dailyCount >= requestsPerDay) {
    return {
      success: false,
      error: `Rate limit exceeded: ${requestsPerDay} requests per day`,
    };
  }

  return { success: true };
}

/**
 * Log API key usage
 */
export async function logApiUsage(
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  req: Request
) {
  try {
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || null;

    await prisma.apiKeyUsage.create({
      data: {
        apiKeyId,
        endpoint,
        method,
        statusCode,
        ipAddress: clientIp,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log API usage:", error);
  }
}

/**
 * Middleware wrapper for API routes that require authentication
 */
export function withApiAuth(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (req: Request, context: any, apiKey: NonNullable<ApiAuthResult['apiKey']>) => Promise<NextResponse>,
  options?: {
    requiredScope?: string;
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: Request, context: any) => {
    // Authenticate the request
    const authResult = await authenticateApiRequest(req);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 }
      );
    }

    // Check required scope if specified
    if (options?.requiredScope) {
      if (!hasScope(authResult.apiKey!.scopes, options.requiredScope)) {
        return NextResponse.json(
          { error: `Missing required scope: ${options.requiredScope}` },
          { status: 403 }
        );
      }
    }

    // Extract endpoint and method for logging
    const url = new URL(req.url);
    const endpoint = url.pathname;
    const method = req.method;

    try {
      // Call the actual handler
      const response = await handler(req, context, authResult.apiKey!);

      // Log the API usage
      await logApiUsage(
        authResult.apiKey!.id,
        endpoint,
        method,
        response.status,
        req
      );

      return response;
    } catch (error) {
      // Log failed request
      await logApiUsage(authResult.apiKey!.id, endpoint, method, 500, req);
      throw error;
    }
  };
}
