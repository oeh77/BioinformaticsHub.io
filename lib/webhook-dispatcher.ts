import { prisma } from "@/lib/prisma";
import { generateWebhookSignature, parseEvents, isSubscribedToEvent } from "@/lib/api-security";

/**
 * Deliver a webhook to an endpoint
 */
export async function deliverWebhook(
  webhookId: string,
  event: string,
  payload: any
): Promise<boolean> {
  try {
    // Get webhook details
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || !webhook.isActive) {
      console.log(`Webhook ${webhookId} not found or inactive`);
      return false;
    }

    // Check if webhook is subscribed to this event
    if (!isSubscribedToEvent(webhook.events, event)) {
      console.log(`Webhook ${webhookId} not subscribed to event ${event}`);
      return false;
    }

    // Prepare payload
    const fullPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    const payloadString = JSON.stringify(fullPayload);

    // Generate signature
    const signature = generateWebhookSignature(payloadString, webhook.secret);

    // Send webhook with retry logic
    const result = await sendWebhookWithRetry(
      webhook.url,
      payloadString,
      signature,
      3 // max retries
    );

    // Log delivery
    await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event,
        payload: payloadString,
        statusCode: result.statusCode || null,
        response: result.response || null,
        error: result.error || null,
        attemptCount: result.attempts,
        succeeded: result.success,
      },
    });

    return result.success;
  } catch (error) {
    console.error("Error delivering webhook:", error);
    return false;
  }
}

/**
 * Send webhook with retry logic (exponential backoff)
 */
async function sendWebhookWithRetry(
  url: string,
  payload: string,
  signature: string,
  maxRetries: number
): Promise<{
  success: boolean;
  statusCode?: number;
  response?: string;
  error?: string;
  attempts: number;
}> {
  let attempts = 0;
  let lastError: string | null = null;

  for (let i = 0; i < maxRetries; i++) {
    attempts++;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "User-Agent": "BioinformaticsHub-Webhook/1.0",
        },
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const responseText = await response.text().catch(() => "");

      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          response: responseText.substring(0, 1000), // Limit response size
          attempts,
        };
      }

      lastError = `HTTP {response.status}: ${responseText.substring(0, 200)}`;

      // Don't retry 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        return {
          success: false,
          statusCode: response.status,
          error: lastError,
          attempts,
        };
      }

      // Retry 5xx errors with exponential backoff
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error: any) {
      lastError = error.message || "Network error";

      // Retry on network errors
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    success: false,
    error: lastError || "Failed after retries",
    attempts,
  };
}

/**
 * Trigger webhooks for a specific event
 * This should be called whenever an event occurs in the system
 */
export async function triggerWebhooks(event: string, payload: any) {
  try {
    // Find all active webhooks subscribed to this event
    const webhooks = await prisma.webhook.findMany({
      where: {
        isActive: true,
      },
    });

    // Filter webhooks subscribed to this event
    const subscribedWebhooks = webhooks.filter((webhook) =>
      isSubscribedToEvent(webhook.events, event)
    );

    console.log(
      `Triggering ${subscribedWebhooks.length} webhooks for event: ${event}`
    );

    // Deliver webhooks in parallel (with a limit)
    const deliveryPromises = subscribedWebhooks.map((webhook) =>
      deliverWebhook(webhook.id, event, payload)
    );

    await Promise.allSettled(deliveryPromises);
  } catch (error) {
    console.error("Error triggering webhooks:", error);
  }
}

/**
 * Helper functions to trigger specific events
 */
export const webhookEvents = {
  toolCreated: (tool: any) => triggerWebhooks("tool.created", tool),
  toolUpdated: (tool: any) => triggerWebhooks("tool.updated", tool),
  toolDeleted: (toolId: string) => triggerWebhooks("tool.deleted", { id: toolId }),

  courseCreated: (course: any) => triggerWebhooks("course.created", course),
  courseUpdated: (course: any) => triggerWebhooks("course.updated", course),
  courseDeleted: (courseId: string) => triggerWebhooks("course.deleted", { id: courseId }),

  postCreated: (post: any) => triggerWebhooks("post.created", post),
  postPublished: (post: any) => triggerWebhooks("post.published", post),

  subscriberNew: (subscriber: any) => triggerWebhooks("subscriber.new", subscriber),
  subscriberUnsubscribed: (email: string) =>
    triggerWebhooks("subscriber.unsubscribed", { email }),
};
