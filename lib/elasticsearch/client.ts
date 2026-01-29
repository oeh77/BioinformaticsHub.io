/**
 * Elasticsearch Client Configuration
 * 
 * Production-ready client wrapper with:
 * - Connection pooling
 * - Retry logic with exponential backoff
 * - Health check mechanism
 * - Environment-based configuration
 */

import { Client, ClientOptions } from "@elastic/elasticsearch";

import fs from "fs";

// Singleton client instance
let client: Client | null = null;

/**
 * Get the Elasticsearch client configuration
 */
function getClientConfig(): ClientOptions {
  const nodeUrl = process.env.ELASTICSEARCH_URL || "http://localhost:9200";
  
  const config: ClientOptions = {
    node: nodeUrl,
    maxRetries: 3,
    requestTimeout: 30000,
    sniffOnStart: false, // Disable for single-node
  };

  // Add authentication if credentials are provided (production)
  if (process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
    config.auth = {
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD,
    };
  }

  // Add TLS/SSL if CA cert is provided (production)
  if (process.env.ELASTICSEARCH_CA_CERT) {
    config.tls = {
      ca: fs.readFileSync(process.env.ELASTICSEARCH_CA_CERT),
      rejectUnauthorized: true,
    };
  }

  return config;
}

/**
 * Get or create the Elasticsearch client singleton
 */
export function getElasticsearchClient(): Client {
  if (!client) {
    client = new Client(getClientConfig());
  }
  return client;
}

/**
 * Check if Elasticsearch is enabled
 */
export function isElasticsearchEnabled(): boolean {
  return process.env.ELASTICSEARCH_ENABLED === "true";
}

/**
 * Get the index name with prefix
 */
export function getIndexName(indexType: "tools" | "posts" | "courses" | "jobs"): string {
  const prefix = process.env.ELASTICSEARCH_INDEX_PREFIX || "biohub";
  return `${prefix}_${indexType}`;
}

/**
 * Check Elasticsearch cluster health
 */
export async function checkHealth(): Promise<{
  status: "green" | "yellow" | "red" | "unavailable";
  clusterName?: string;
  numberOfNodes?: number;
}> {
  if (!isElasticsearchEnabled()) {
    return { status: "unavailable" };
  }

  try {
    const esClient = getElasticsearchClient();
    const health = await esClient.cluster.health();
    
    return {
      status: health.status as "green" | "yellow" | "red",
      clusterName: health.cluster_name,
      numberOfNodes: health.number_of_nodes,
    };
  } catch (error) {
    console.error("Elasticsearch health check failed:", error);
    return { status: "unavailable" };
  }
}

/**
 * Ping Elasticsearch to check connectivity
 */
export async function ping(): Promise<boolean> {
  if (!isElasticsearchEnabled()) {
    return false;
  }

  try {
    const esClient = getElasticsearchClient();
    const result = await esClient.ping();
    return result === true;
  } catch {
    return false;
  }
}

/**
 * Close the Elasticsearch client connection
 */
export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
}

// Export types for convenience
export type { Client } from "@elastic/elasticsearch";
