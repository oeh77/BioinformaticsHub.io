/**
 * Elasticsearch Module - Main Export
 * 
 * Provides a unified interface for all Elasticsearch operations
 */

// Client
export { 
  getElasticsearchClient, 
  isElasticsearchEnabled, 
  getIndexName,
  checkHealth,
  ping,
  closeConnection 
} from "./client";

// Indexing
export {
  createIndex,
  deleteIndex,
  recreateIndex,
  createAllIndices,
  indexDocument,
  deleteDocument,
  bulkIndex,
  syncTools,
  syncPosts,
  syncCourses,
  syncAll,
} from "./indexing";

// Search
export {
  searchTools,
  searchPosts,
  autocomplete,
  globalSearch,
  type SearchOptions,
  type SearchResult,
  type AutocompleteResult,
} from "./search";

// Mappings
export { 
  toolsMapping, 
  postsMapping, 
  coursesMapping,
  indexMappings 
} from "./mappings";
