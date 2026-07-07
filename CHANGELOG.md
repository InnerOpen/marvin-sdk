# Changelog

## [1.3.0] - 2026-07-07

### ✨ Added
- **Workspace Members Module** - Full CRUD operations for managing workspace members
  - `workspaceMembers.list(workspaceId)` - List all members of a workspace
  - `workspaceMembers.get(workspaceId, userId)` - Get specific member details
  - `workspaceMembers.add(workspaceId, data)` - Add user to workspace with role
  - `workspaceMembers.updateRole(workspaceId, userId, data)` - Update member role
  - `workspaceMembers.remove(workspaceId, userId)` - Remove user from workspace

- **API Client Preview Endpoint** - `apiClients.preview(id)` to view token metadata without revealing full token

### 🔧 Changed
- **OpenAPI Type Integration** - Platform API types now generated from OpenAPI spec
  - All types in `src/platform/types.ts` now re-export from `src/generated/schema.ts`
  - Automatic type sync with backend via `npm run generate:types`
  - Better type safety and reduced maintenance
  
### 📦 Dependencies
- Added `openapi-typescript` dev dependency for type generation

### 🎯 Coverage
- Platform API: 18/18 endpoints (100%)
- Publishing API: 11/11 endpoints (100%)

## [1.2.0] - 2026-07-06

### ✨ Added
- Platform API module with full CRUD operations
- Entry Types module (read-only)
- API Clients module for managing publishing tokens

### 🎯 Initial release of dual-API architecture
- Publishing API (read-only, site token)
- Platform API (CRUD, user token)

## [1.0.0] - 2025-09-03

### 🎉 Initial Release
- Publishing API client
- TypeScript SDK for Marvin CMS
- Support for entries, collections, resources, assets
