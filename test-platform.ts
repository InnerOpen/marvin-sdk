/**
 * Platform API Test Script
 *
 * Tests Platform API functionality against local Marvin instance
 */

import { createPlatformClient } from './dist/platform.js';

async function testPlatformAPI() {
  console.log('🧪 Testing Platform API\n');

  // Create Platform client
  const platform = createPlatformClient({
    apiUrl: 'http://localhost:8080',
    // Session auth will use cookies - you may need to login first
    // or provide a user token
  });

  try {
    // Test 1: List entry types
    console.log('1. Testing entry types...');
    const entryTypes = await platform.entryTypes.list();
    console.log(`   ✓ Found ${entryTypes.length} entry types`);
    if (entryTypes.length > 0) {
      console.log(`   First: ${entryTypes[0].name} (${entryTypes[0].slug})`);
    }

    // Test 2: List entries
    console.log('\n2. Testing entries...');
    const entries = await platform.entries.list();
    console.log(`   ✓ Found ${entries.length} entries`);
    if (entries.length > 0) {
      console.log(`   First: ${entries[0].title} (${entries[0].slug})`);
    }

    // Test 3: List collections
    console.log('\n3. Testing collections...');
    const collections = await platform.collections.list();
    console.log(`   ✓ Found ${collections.length} collections`);
    if (collections.length > 0) {
      console.log(`   First: ${collections[0].name} (${collections[0].slug})`);
    }

    // Test 4: List resources
    console.log('\n4. Testing resources...');
    const resources = await platform.resources.list();
    console.log(`   ✓ Found ${resources.length} resources`);
    if (resources.length > 0) {
      console.log(`   First: ${resources[0].name} (${resources[0].slug})`);
    }

    // Test 5: List assets
    console.log('\n5. Testing assets...');
    const assets = await platform.assets.list();
    console.log(`   ✓ Found ${assets.length} assets`);
    if (assets.length > 0) {
      console.log(`   First: ${assets[0].name} (${assets[0].slug})`);
    }

    // Test 6: List API clients
    console.log('\n6. Testing API clients...');
    const apiClients = await platform.apiClients.list();
    console.log(`   ✓ Found ${apiClients.length} API clients`);
    if (apiClients.length > 0) {
      console.log(`   First: ${apiClients[0].name}`);
    }

    console.log('\n✅ All Platform API tests passed!');
  } catch (error) {
    console.error('\n❌ Platform API test failed:');
    console.error(error);
    process.exit(1);
  }
}

testPlatformAPI();
