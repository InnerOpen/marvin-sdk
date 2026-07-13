# SDK TODO Items

This document tracks planned features and unimplemented endpoints in the Marvin SDK.

## Status Legend
- 🚧 **Blocked** - Waiting on backend implementation
- 📋 **Planned** - Ready to implement, not yet started
- ✅ **Completed** - Implemented and available
- ❌ **Not Planned** - Will not be implemented

---

## Backend-Blocked Features

These features require backend API endpoints that don't exist yet.

### Collections Module
**Status:** 🚧 Blocked on backend

**File:** `src/collections/collections.ts`, `src/collections/collection.ts`

```typescript
// Collections filtering/querying
// TODO: Implement this endpoint in Marvin backend
async query(options: CollectionQueryOptions): Promise<Collection[]>

// Collection assets
// TODO: Implement collection assets endpoint
async assets(): Promise<Asset[]>

// Collection metadata
// TODO: Implement collection metadata endpoint
async metadata(): Promise<Record<string, unknown>>
```

**Required Backend Endpoints:**
- `GET /api/publish/{workspace}/collections?filter=...` - Collection querying
- `GET /api/publish/{workspace}/collections/{slug}/assets` - Collection assets
- `GET /api/publish/{workspace}/collections/{slug}/metadata` - Collection metadata

**Priority:** Medium - Would enable advanced collection filtering and asset management

---

### Entries Module
**Status:** 🚧 Blocked on backend

**File:** `src/entries/entries.ts`, `src/entries/entry.ts`

```typescript
// Entry filtering/searching
// TODO: Implement this endpoint in Marvin backend
async search(query: string, options?: SearchOptions): Promise<Entry[]>

// Related entries
// TODO: Implement related entries endpoint
async related(): Promise<Entry[]>
```

**Required Backend Endpoints:**
- `GET /api/publish/{workspace}/entries?q=...` - Entry search
- `GET /api/publish/{workspace}/entries/{slug}/related` - Related entries

**Priority:** High - Search is a common feature request

---

### Resources Module
**Status:** 🚧 Blocked on backend

**File:** `src/resources/resource.ts`, `src/resources/resources.ts`

```typescript
// Resource filtering
// TODO: Implement this endpoint in Marvin backend
async query(options: ResourceQueryOptions): Promise<Resource[]>

// Resource assets
// TODO: Implement resource assets endpoint
async assets(): Promise<Asset[]>
```

**Required Backend Endpoints:**
- `GET /api/publish/{workspace}/resources?filter=...` - Resource querying
- `GET /api/publish/{workspace}/resources/{slug}/assets` - Resource assets

**Priority:** Low - Resources are less commonly used than entries/collections

---

### Workspace Module
**Status:** 🚧 Blocked on backend

**File:** `src/workspaces/workspace.ts`

```typescript
// Workspace settings/configuration
// TODO: Implement settings endpoint
async getSettings(): Promise<WorkspaceSettings>
```

**Required Backend Endpoints:**
- `GET /api/publish/{workspace}/settings` - Workspace settings

**Priority:** Medium - Useful for theme configuration, feature flags

---

## Currently Unimplemented (But API Exists)

None! All available backend endpoints are implemented in the SDK.

---

## Not Planned

### GraphQL API
**Status:** ❌ Not Planned

We've decided to focus on REST API only. GraphQL would require:
- Significant additional complexity
- Separate client implementation
- Different caching strategy

Users who need GraphQL can use standard GraphQL clients directly.

---

### Real-time Subscriptions (WebSockets)
**Status:** ❌ Not Planned for v2.x

Real-time updates via WebSockets are not planned for the current SDK version. Workarounds:
- Polling with retry logic (built-in)
- Server-Sent Events (SSE) via browser Fetch API
- Third-party WebSocket clients

May be considered for v3.0 if there's demand.

---

## How to Update This Document

When adding a TODO comment to the code:

1. **Add the TODO to code:**
   ```typescript
   // TODO: Implement feature X endpoint
   ```

2. **Document it here:**
   - Add to appropriate section
   - Mark status (🚧 Blocked, 📋 Planned, etc.)
   - List required backend endpoints if applicable
   - Set priority (High/Medium/Low)

3. **When completed:**
   - Remove TODO from code
   - Mark ✅ Completed here (or remove entry)
   - Update CHANGELOG.md

---

## Requesting Backend Features

If you need one of the blocked features:

1. **Check if the backend endpoint exists:**
   ```bash
   curl https://api.marvin.example.com/openapi.json | jq '.paths'
   ```

2. **If it exists:** Implement in SDK and remove from this list

3. **If it doesn't exist:** 
   - File an issue in `marvin` backend repo
   - Reference this TODO document
   - Include use case description

---

## Contributing

To implement a backend-blocked feature:

1. Verify backend endpoint is available
2. Implement SDK method following existing patterns
3. Add TypeScript types
4. Add JSDoc documentation
5. Update this TODO.md
6. Add to CHANGELOG.md
7. Submit PR

---

## Summary

**Total TODOs:** 9
- 🚧 Blocked: 9 (awaiting backend)
- 📋 Planned: 0
- ❌ Not Planned: 2

**All current backend API endpoints are implemented in the SDK!**
