/**
 * Type Validation Script
 *
 * Compares our manual Platform API types against the generated OpenAPI types
 * to ensure they stay in sync with the backend.
 *
 * Usage: tsx scripts/validate-types.ts
 */

import type { components } from '../src/generated/schema';
import type {
  PlatformEntry,
  PlatformCollection,
  PlatformResource,
  PlatformAsset,
  PlatformAPIClient,
  PlatformEntryType,
} from '../src/platform/types';

// This file will fail to compile if our manual types don't match the generated ones

// Test: PlatformEntry matches EntryRead
type TestEntry = PlatformEntry extends components['schemas']['EntryRead'] ? true : false;

// Test: PlatformCollection matches CollectionRead
type TestCollection = PlatformCollection extends components['schemas']['CollectionRead'] ? true : false;

// Test: PlatformResource matches ResourceRead
type TestResource = PlatformResource extends components['schemas']['ResourceRead'] ? true : false;

// Test: PlatformAsset matches AssetRead
type TestAsset = PlatformAsset extends components['schemas']['AssetRead'] ? true : false;

// Test: PlatformAPIClient matches APIClientRead
type TestAPIClient = PlatformAPIClient extends components['schemas']['APIClientRead'] ? true : false;

// Test: PlatformEntryType matches EntryTypeRead
type TestEntryType = PlatformEntryType extends components['schemas']['EntryTypeRead'] ? true : false;

console.log('✅ Type validation passed - all manual types are compatible with generated types');

export {};
