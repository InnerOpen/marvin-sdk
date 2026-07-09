# Changelog

All notable changes to the Marvin SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-07-09

### 🚨 BREAKING CHANGES

This release introduces schema-driven entry types, a fundamental architectural change that transforms Marvin from a Markdown-centric CMS into a flexible, schema-driven content platform.

#### Removed
- **Primary content storage via `contentMarkdown`** has been replaced with schema-driven `dataJson`
  - `contentMarkdown` is now deprecated (still available for backward compatibility)
  - Will be fully removed in v3.0.0

#### Changed
- **Entry interface updated**:
  - Added `dataJson?: Record<string, unknown>` - Schema-driven content fields
  - Deprecated `contentMarkdown?: string` - Legacy markdown content
  - Updated `metadata` documentation to clarify use for non-schema metadata only

- **EntryType interface updated**:
  - Added `schemaJson?: Record<string, unknown>` - Schema definition for this entry type

#### Added
- **New Entry class methods**:
  - `field<T>(key: string): T | undefined` - Get specific field from dataJson
  - `fields: Record<string, unknown>` - Get all fields from dataJson
  - `dataJson` getter - Access schema-driven content

- **Schema-driven content support**:
  - 13 built-in field types: text, textarea, markdown, number, boolean, select, date, datetime, asset, asset-list, resource, resource-list, json
  - Field-level validation (required, min/max, pattern, options, etc.)
  - Type-safe field access via generics

### Migration Required

See [MIGRATION-v2.md](./MIGRATION-v2.md) for detailed migration instructions.

**Quick Summary:**

**Before (v1.x):**
```typescript
const entry = await client.entries.get('my-entry');
console.log(entry.contentMarkdown);
```

**After (v2.0.0):**
```typescript
const entry = await client.entries.get('my-entry');
const content = entry.field<string>('body'); // or entry.dataJson.body
```

### Backward Compatibility

- `contentMarkdown` is deprecated but still available in v2.0.0
- The backend automatically migrated all existing content: `contentMarkdown` → `dataJson.body`
- `contentMarkdown` will be removed in v3.0.0

---

## [1.11.0-next.3] - 2026-07-08

### Changed
- Updated platform API integration
- Improved type definitions

## [1.11.0-next.2] - 2026-07-07

### Added
- Platform API support (beta)
- Enhanced authentication options

## [1.10.0] - 2026-07-06

### Added
- Initial platform API endpoints
- Entry type management
- Collection ordering support

### Fixed
- Asset upload reliability improvements
- Error handling enhancements

---

## [1.0.0] - 2026-06-01

### Added
- Initial stable release
- Publishing API client
- Entry, Collection, Resource, and Asset support
- TypeScript type definitions
- Comprehensive examples and documentation

---

[2.0.0]: https://github.com/inneropen/marvin-sdk/compare/v1.11.0-next.3...v2.0.0
[1.11.0-next.3]: https://github.com/inneropen/marvin-sdk/compare/v1.11.0-next.2...v1.11.0-next.3
[1.11.0-next.2]: https://github.com/inneropen/marvin-sdk/compare/v1.10.0...v1.11.0-next.2
[1.10.0]: https://github.com/inneropen/marvin-sdk/compare/v1.0.0...v1.10.0
[1.0.0]: https://github.com/inneropen/marvin-sdk/releases/tag/v1.0.0
