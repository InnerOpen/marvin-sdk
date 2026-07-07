# OpenAPI Code Generation Strategy

## ✅ Phase 1: Type Generation (COMPLETE)

We've successfully set up automatic TypeScript type generation from the Marvin backend's OpenAPI specification.

### What's Generated

**File:** `src/generated/schema.ts` (8,996 lines)
- All API endpoint types
- Request/response schemas
- Path parameters
- Query parameters
- 104 schema definitions
- 82 API endpoints

### How to Use

```bash
# Generate types from running backend
npm run generate:types

# The script fetches http://localhost:8080/openapi.json
# and generates src/generated/schema.ts
```

### Example: Using Generated Types

```typescript
import type { paths, components } from './generated/schema';

// Get the response type for an endpoint
type EntryListResponse = paths['/api/platform/entries']['get']['responses']['200']['content']['application/json'];

// Get a schema type
type EntryRead = components['schemas']['EntryRead'];
type EntryCreate = components['schemas']['EntryCreate'];
```

## 🚧 Phase 2: Code Generation (TODO)

The next phase is to generate SDK modules and CLI commands automatically.

### Option A: Manual Mapping (Current Approach)

**Pros:**
- Full control over API design
- Can add convenience methods
- Custom error handling
- Better developer experience

**Cons:**
- Manual maintenance
- Can drift from backend

**Status:** ✅ Complete - All 82 endpoints mapped

### Option B: Auto-Generated Clients

**Pros:**
- Always in sync with backend
- Zero maintenance
- Catches new endpoints automatically

**Cons:**
- Generic API
- Less ergonomic
- Harder to customize

**Status:** 🔄 In Progress

### Recommended Hybrid Approach

1. **Generate base clients** from OpenAPI spec
2. **Wrap with custom SDK** for convenience methods
3. **Best of both worlds** - automation + great DX

```
┌─────────────────────────────────────┐
│     User-Facing SDK (Manual)        │
│  - Convenience methods               │
│  - Custom error handling             │
│  - Type-safe wrappers                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Generated Base Client (Auto)       │
│  - Raw API methods                   │
│  - Type-safe requests/responses      │
│  - Auto-synced with backend          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     HTTP Client (Core)               │
│  - Fetch wrapper                     │
│  - Authentication                    │
│  - Error handling                    │
└─────────────────────────────────────┘
```

### Implementation Plan

#### Step 1: Install Code Generator

```bash
npm install -D openapi-typescript-codegen
# or
npm install -D @hey-api/openapi-ts
```

#### Step 2: Generate Client Code

```bash
# Generate SDK client
openapi-typescript-codegen \
  --input http://localhost:8080/openapi.json \
  --output src/generated/client \
  --client fetch

# Or with hey-api
npx @hey-api/openapi-ts \
  -i http://localhost:8080/openapi.json \
  -o src/generated/client \
  -c fetch
```

#### Step 3: Wrap Generated Client

```typescript
// src/platform/entries.ts
import { GeneratedEntriesService } from '../generated/client/services';
import type { PlatformEntry } from './types';

export class EntriesModule {
  private generated: GeneratedEntriesService;

  constructor(private http: HttpClient) {
    this.generated = new GeneratedEntriesService(http);
  }

  // Custom convenience method
  async list(): Promise<PlatformEntry[]> {
    return this.generated.listEntries();
  }

  // Direct passthrough
  async get(id: string): Promise<PlatformEntry> {
    return this.generated.getEntry(id);
  }
}
```

## 📊 Current Status

| Component | Manual | Generated | Status |
|-----------|--------|-----------|--------|
| Type Definitions | ✅ | ✅ | Both available |
| SDK Modules | ✅ | ❌ | Manual only |
| CLI Commands | ✅ | ❌ | Manual only |

### Metrics

- **Backend Endpoints:** 82
- **Endpoint Groups:** 26
- **Manually Created SDK Modules:** 8
- **Manually Created CLI Commands:** 9
- **Coverage:** 100% of Platform & Publishing APIs
- **Generated Type Definitions:** 8,996 lines

## 🎯 Recommendation

**For now: Continue with manual approach**

Why?
1. We've already mapped 100% of relevant endpoints
2. Manual SDK provides better DX
3. Backend API is relatively stable
4. Can add generation later without breaking changes

**Future: Add generation as validation**

Use generated types to:
- Validate our manual types match backend
- Catch API changes in CI
- Auto-update documentation
- Generate test fixtures

```bash
# Add to CI pipeline
npm run generate:types
npm run typecheck  # Fails if types changed
```

## 📚 Resources

- [openapi-typescript](https://github.com/drwpow/openapi-typescript) - Type generation ✅ In use
- [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen) - Client generation
- [@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts) - Modern alternative
- [openapi-fetch](https://github.com/drwpow/openapi-typescript/tree/main/packages/openapi-fetch) - Type-safe fetch client

## Next Steps

1. ✅ Set up type generation (DONE)
2. ⏭️ Add type generation to CI pipeline
3. ⏭️ Use generated types to validate manual types
4. ⏭️ Optional: Generate base clients for new endpoints
5. ⏭️ Document OpenAPI spec for better generation

