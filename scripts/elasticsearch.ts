#!/usr/bin/env npx tsx
/**
 * Elasticsearch Management CLI
 * 
 * Usage:
 *   npx tsx scripts/elasticsearch.ts <command>
 * 
 * Commands:
 *   health     - Check cluster health
 *   create     - Create all indices
 *   sync       - Sync all data from database
 *   reindex    - Delete and recreate indices, then sync
 *   delete     - Delete all indices
 */

import { 
  checkHealth, 
  ping, 
  createAllIndices, 
  syncAll,
  deleteIndex,
  recreateIndex,
  isElasticsearchEnabled 
} from "../lib/elasticsearch";

const command = process.argv[2];

async function main() {
  console.log("🔍 Elasticsearch Management CLI\n");

  if (!isElasticsearchEnabled()) {
    console.log("❌ Elasticsearch is not enabled. Set ELASTICSEARCH_ENABLED=true in .env");
    process.exit(1);
  }

  // Check connectivity first
  const isConnected = await ping();
  if (!isConnected) {
    console.log("❌ Cannot connect to Elasticsearch at", process.env.ELASTICSEARCH_URL);
    console.log("   Make sure Elasticsearch is running:");
    console.log("   npm run es:up");
    process.exit(1);
  }

  switch (command) {
    case "health":
      console.log("Checking cluster health...\n");
      const health = await checkHealth();
      console.log("Cluster Name:", health.clusterName);
      console.log("Status:", health.status === "green" ? "🟢" : health.status === "yellow" ? "🟡" : "🔴", health.status);
      console.log("Nodes:", health.numberOfNodes);
      break;

    case "create":
      console.log("Creating indices...\n");
      await createAllIndices();
      console.log("\n✅ Indices created!");
      break;

    case "sync":
      console.log("Syncing data to Elasticsearch...\n");
      await syncAll();
      break;

    case "reindex":
      console.log("Reindexing (delete + create + sync)...\n");
      const indexTypes = ["tools", "posts", "courses"] as const;
      for (const indexType of indexTypes) {
        await recreateIndex(indexType);
      }
      await syncAll();
      break;

    case "delete":
      console.log("Deleting all indices...\n");
      const indicesToDelete = ["tools", "posts", "courses"] as const;
      for (const indexType of indicesToDelete) {
        await deleteIndex(indexType);
      }
      console.log("\n✅ All indices deleted!");
      break;

    default:
      console.log("Usage: npx tsx scripts/elasticsearch.ts <command>\n");
      console.log("Commands:");
      console.log("  health   - Check cluster health");
      console.log("  create   - Create all indices");
      console.log("  sync     - Sync all data from database to Elasticsearch");
      console.log("  reindex  - Delete and recreate indices, then sync");
      console.log("  delete   - Delete all indices");
      console.log("\nFirst, start Elasticsearch with: npm run es:up");
      break;
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
