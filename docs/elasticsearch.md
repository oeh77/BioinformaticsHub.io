# Elasticsearch Integration

BioinformaticsHub uses Elasticsearch for high-performance full-text search with features like:

- **Fuzzy matching** - Typo-tolerant search
- **Scientific synonyms** - "RNA-seq" matches "rnaseq", "NGS" matches "next-generation sequencing"
- **Autocomplete** - Fast typeahead suggestions
- **Faceted search** - Filter by category, pricing, etc.
- **Highlighting** - Show matched terms in results

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App                            │
├─────────────────────────────────────────────────────────────┤
│  /api/search  ──► Elasticsearch (if enabled)                │
│       │                    │                                │
│       └──► Prisma DB  ◄────┘  (fallback if ES unavailable)  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  lib/elasticsearch/                                         │
│  ├── client.ts      - Connection & health checks            │
│  ├── mappings.ts    - Index schemas with custom analyzers   │
│  ├── indexing.ts    - CRUD & bulk sync operations           │
│  ├── search.ts      - Search queries & autocomplete         │
│  └── index.ts       - Unified exports                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Start Elasticsearch

```bash
# Start Elasticsearch and Kibana with Docker
npm run es:up

# Wait for it to be healthy (takes ~30 seconds)
npm run es:health
```

### 2. Create Indices and Sync Data

```bash
# Create indices and sync all data from the database
npm run es:sync
```

### 3. Test Search

The search API now uses Elasticsearch:
- `GET /api/search?q=blast` - Search all content
- `GET /api/search?q=rna&mode=autocomplete` - Autocomplete suggestions

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run es:up` | Start Elasticsearch + Kibana containers |
| `npm run es:down` | Stop Elasticsearch containers |
| `npm run es:health` | Check cluster health |
| `npm run es:create` | Create all indices |
| `npm run es:sync` | Sync database to Elasticsearch |
| `npm run es:reindex` | Delete, recreate, and sync all indices |

## Environment Variables

Add these to your `.env` file:

```env
# Elasticsearch Configuration
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_INDEX_PREFIX=biohub
ELASTICSEARCH_ENABLED=true

# For production with security (optional)
# ELASTICSEARCH_USERNAME=elastic
# ELASTICSEARCH_PASSWORD=your_password
```

## Index Mappings

### Tools Index (`biohub_tools`)
- Full-text search on: `name`, `description`, `content`
- Facets: `category`, `pricing`
- Autocomplete on: `name`

### Posts Index (`biohub_posts`)
- Full-text search on: `title`, `excerpt`, `content`
- Facets: `category`
- Autocomplete on: `title`

### Courses Index (`biohub_courses`)
- Full-text search on: `title`, `description`
- Facets: `category`, `level`, `provider`
- Autocomplete on: `title`

## Custom Analyzers

### Scientific Analyzer
Includes synonyms for common bioinformatics terms:
- `ngs` ↔ `next-generation sequencing`
- `rna-seq` ↔ `rnaseq` ↔ `rna sequencing`
- `blast` ↔ `basic local alignment search`
- `gatk` ↔ `genome analysis toolkit`
- `ml` ↔ `machine learning`

### Autocomplete Analyzer
Uses edge n-grams (2-20 chars) for prefix matching.

## Graceful Fallback

If Elasticsearch is unavailable:
1. The app continues to work using Prisma database search
2. No crashes - just less powerful search
3. Console logs indicate which engine is being used

## Kibana (Optional)

Access Kibana at http://localhost:5601 for:
- Dev Tools console for testing queries
- Index management
- Cluster monitoring

## Production Considerations

1. **Enable Security**: Set `xpack.security.enabled=true` in docker-compose
2. **Increase Replicas**: Change `number_of_replicas: 1` for redundancy
3. **Separate Cluster**: Use managed Elasticsearch (AWS OpenSearch, Elastic Cloud)
4. **Index Lifecycle**: Set up ILM for old data management
