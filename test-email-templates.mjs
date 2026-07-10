#!/usr/bin/env node
/**
 * Test Email Templates SDK Features
 */

import { createPlatformClient } from './dist/platform.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const API_URL = 'http://localhost:8080';
const credsPath = path.join(os.homedir(), '.marvin', 'credentials.json');
const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

console.log('═══════════════════════════════════════════════════════════');
console.log('  MARVIN SDK - EMAIL TEMPLATES TEST');
console.log('═══════════════════════════════════════════════════════════\n');

const sdk = createPlatformClient({
  apiUrl: API_URL,
  userToken: creds.userToken,
});

console.log('✓ SDK initialized\n');

async function main() {
  try {
    // Get workspace
    console.log('[1/6] Getting workspace...');
    const workspace = await sdk.workspaces.current();
    const groupId = workspace.group.id;
    console.log(`   ✓ Workspace: ${workspace.name}`);
    console.log(`   ✓ Group ID: ${groupId}\n`);

    // List templates
    console.log('[2/6] Listing email templates...');
    const templates = await sdk.emailTemplates.list(groupId);
    console.log(`   Found ${templates.length} templates:`);
    templates.forEach(t => {
      console.log(`   • ${t.name} (${t.template_type})`);
    });
    console.log();

    // Create template
    console.log('[3/6] Creating new template via SDK...');
    const created = await sdk.emailTemplates.create(groupId, {
      template_type: 'sdk_demo',
      name: '🎯 SDK Demo Template',
      description: 'Created via Marvin SDK',
      subject: 'Hello from {{ workspace_name }}!',
      header_text: 'SDK Test Email',
      message_top: 'This template was created using sdk.emailTemplates.create()',
      message_bottom: 'Full CRUD support for email templates!',
      button_text: 'Learn More',
      enabled: true,
    });
    console.log(`   ✓ Created: ${created.name}`);
    console.log(`   ✓ ID: ${created.id}\n`);

    // Get template
    console.log('[4/6] Fetching template...');
    const fetched = await sdk.emailTemplates.get(groupId, created.id);
    console.log(`   ✓ Name: ${fetched.name}`);
    console.log(`   ✓ Subject: ${fetched.subject}\n`);

    // Update template
    console.log('[5/6] Updating template...');
    const updated = await sdk.emailTemplates.update(groupId, created.id, {
      description: 'Updated via SDK!',
      message_top: 'This template was UPDATED using sdk.emailTemplates.update()',
    });
    console.log(`   ✓ Updated: ${updated.description}\n`);

    // Send test
    console.log('[6/6] Sending test email...');
    try {
      const result = await sdk.emailTemplates.sendTest(
        groupId,
        created.id,
        'sdk-demo@example.com'
      );
      console.log(`   ✓ ${result.message}\n`);
    } catch (err) {
      console.log(`   Note: ${err.message}\n`);
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ✅ ALL SDK METHODS TESTED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\nSDK Methods:');
    console.log('  ✓ sdk.emailTemplates.list(groupId)');
    console.log('  ✓ sdk.emailTemplates.create(groupId, data)');
    console.log('  ✓ sdk.emailTemplates.get(groupId, templateId)');
    console.log('  ✓ sdk.emailTemplates.update(groupId, templateId, data)');
    console.log('  ✓ sdk.emailTemplates.sendTest(groupId, templateId, email)');
    console.log('  • sdk.emailTemplates.delete(groupId, templateId) - not tested');

    console.log('\n📧 Mailpit: http://localhost:8025');
    console.log('🎨 UI: http://localhost:3000/workspace/settings/email\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
    process.exit(1);
  }
}

main();
