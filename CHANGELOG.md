# [1.11.0-next.2](https://github.com/inneropen/marvin-sdk/compare/v1.11.0-next.1...v1.11.0-next.2) (2026-07-08)


### Features

* Add event log module to Platform SDK ([afde468](https://github.com/inneropen/marvin-sdk/commit/afde46841038a68f0cca6d7373050cf0f6078c65))

# [1.11.0-next.1](https://github.com/inneropen/marvin-sdk/compare/v1.10.6...v1.11.0-next.1) (2026-07-08)


### Bug Fixes

* Add npm-production environment to release workflow ([183a27d](https://github.com/inneropen/marvin-sdk/commit/183a27d8f031f510be2710bad86ebad9f4f65232))
* Update Node.js version to 22.14 in release workflow ([48aa4c1](https://github.com/inneropen/marvin-sdk/commit/48aa4c1b6d9bc981a65788642a6da0bc06ac1e3a))


### Features

* Add semantic-release automation ([744b57e](https://github.com/inneropen/marvin-sdk/commit/744b57e75bad1fa606bb2ca0b97b5dfce1e23e2c))

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
