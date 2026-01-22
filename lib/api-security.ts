import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Generate a secure API key for BioinformaticsHub.io
 * Format: bhio_live_<32-char-alphanumeric>
 */
export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(24); // 24 bytes = 32 characters in base64url
  const key = randomBytes.toString("base64url").substring(0, 32);
  return `bhio_live_${key}`;
}

/**
 * Generate a secure secret key
 * 64 characters with alphanumeric + special characters
 */
export function generateSecretKey(): string {
  const randomBytes = crypto.randomBytes(48); // 48 bytes = 64 characters in base64
  return randomBytes.toString("base64url").substring(0, 64);
}

/**
 * Hash a secret key before storing in database
 */
export async function hashSecret(secret: string): Promise<string> {
  return bcrypt.hash(secret, 10);
}

/**
 * Verify a secret key against a hash
 */
export async function verifySecret(secret: string, hash: string): Promise<boolean> {
  return bcrypt.compare(secret, hash);
}

/**
 * Generate both API key and secret together
 * Returns an object with the generated keys
 */
export async function generateApiKeyPair(): Promise<{
  apiKey: string;
  secretKey: string;
  secretHash: string;
}> {
  const apiKey = generateApiKey();
  const secretKey = generateSecretKey();
  const secretHash = await hashSecret(secretKey);

  return {
    apiKey,
    secretKey,
    secretHash,
  };
}

/**
 * Validate API key format
 */
export function validateApiKeyFormat(key: string): boolean {
  return /^bhio_live_[a-zA-Z0-9_-]{32}$/.test(key);
}

/**
 * Generate a webhook secret for HMAC signature verification
 * Format: whsec_<64-char-alphanumeric>
 */
export function generateWebhookSecret(): string {
  const randomBytes = crypto.randomBytes(48);
  const secret = randomBytes.toString("base64url").substring(0, 64);
  return `whsec_${secret}`;
}

/**
 * Generate HMAC-SHA256 signature for webhook payload
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  return hmac.digest("hex");
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Parse scopes from JSON string
 */
export function parseScopes(scopesJson: string): string[] {
  try {
    const scopes = JSON.parse(scopesJson);
    return Array.isArray(scopes) ? scopes : [];
  } catch {
    return [];
  }
}

/**
 * Check if an API key has a specific scope/permission
 */
export function hasScope(scopesJson: string, requiredScope: string): boolean {
  const scopes = parseScopes(scopesJson);
  
  // Check for wildcard permission
  if (scopes.includes("*") || scopes.includes("all")) {
    return true;
  }
  
  // Check for exact scope
  if (scopes.includes(requiredScope)) {
    return true;
  }
  
  // Check for wildcard in scope family (e.g., "tools:*" includes "tools:read")
  const [family] = requiredScope.split(":");
  if (scopes.includes(`${family}:*`)) {
    return true;
  }
  
  return false;
}

/**
 * Validate IP against whitelist (comma-separated IPs or CIDR ranges)
 */
export function isIpWhitelisted(ip: string, whitelist: string | null): boolean {
  if (!whitelist) return true; // No whitelist means all IPs allowed
  
  const allowedIps = whitelist.split(",").map((i) => i.trim());
  
  // Basic IP matching (exact match for now)
  // TODO: Add CIDR range matching for production
  return allowedIps.includes(ip) || allowedIps.includes("*");
}

/**
 * Parse events from JSON string
 */
export function parseEvents(eventsJson: string): string[] {
  try {
    const events = JSON.parse(eventsJson);
    return Array.isArray(events) ? events : [];
  } catch {
    return [];
  }
}

/**
 * Check if a webhook is subscribed to a specific event
 */
export function isSubscribedToEvent(eventsJson: string, event: string): boolean {
  const events = parseEvents(eventsJson);
  
  // Check for wildcard subscription
  if (events.includes("*") || events.includes("all")) {
    return true;
  }
  
  // Check for exact event
  if (events.includes(event)) {
    return true;
  }
  
  // Check for wildcard in event family (e.g., "tool.*" includes "tool.created")
  const [family] = event.split(".");
  if (events.includes(`${family}.*`)) {
    return true;
  }
  
  return false;
}
