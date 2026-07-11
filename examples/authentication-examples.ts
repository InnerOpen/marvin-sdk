/**
 * Marvin SDK Authentication Examples
 *
 * Demonstrates the three entry points and their authentication strategies
 */

// ============================================================================
// Example 1: Publishing API (Read-Only)
// ============================================================================

import { createMarvinClient } from '@inneropen/marvin-sdk/publish';

export async function publishingApiExample() {
  // From environment: MARVIN_SITE_CLIENT_TOKEN
  const marvin = createMarvinClient();

  // Read-only operations
  const workspace = await marvin.getWorkspace();
  const entries = await workspace.entries.list();
  const about = await marvin.entry('about');

  console.log('Published entries:', entries.length);
  console.log('About page:', about.title);
}

// ============================================================================
// Example 2: Platform API - Programmatic (Server/CLI)
// ============================================================================

import { createPlatformClient } from '@inneropen/marvin-sdk/platform';

export async function platformApiProgrammatic() {
  // From environment: MARVIN_USER_TOKEN
  const platform = createPlatformClient();

  // Or with explicit token
  const platformExplicit = createPlatformClient({
    userToken: process.env.MY_USER_TOKEN
  });

  // Full CRUD operations
  const newEntry = await platform.entries.create({
    title: 'New Blog Post',
    content: 'This is the content...',
    collection_id: 1
  });

  await platform.entries.update(newEntry.id, {
    title: 'Updated Title'
  });

  const collections = await platform.collections.list();
  console.log('Total collections:', collections.length);
}

// ============================================================================
// Example 3: Platform API - Browser (Admin UI)
// ============================================================================

export async function platformApiBrowser() {
  // In browser after user login
  const platform = createPlatformClient({
    credentials: 'include' // Use session cookies
  });

  // User is already authenticated via session
  const currentUser = await platform.user.getProfile();
  const workspaces = await platform.workspaces.list();

  console.log('Current user:', currentUser.email);
  console.log('User workspaces:', workspaces.length);
}

// ============================================================================
// Example 4: Auth API - Public Registration/Login
// ============================================================================

import { createAuthClient } from '@inneropen/marvin-sdk';

export async function authApiExample() {
  const auth = createAuthClient({
    apiUrl: 'https://marvin.example.com'
  });

  // Register new user (no auth required)
  await auth.register({
    email: 'newuser@example.com',
    password: 'secure-password',
    first_name: 'New',
    last_name: 'User'
  });

  // Login and get token
  const { access_token } = await auth.login({
    email: 'newuser@example.com',
    password: 'secure-password'
  });

  console.log('Login successful, token:', access_token);

  // Password reset flow
  await auth.forgotPassword({
    email: 'newuser@example.com'
  });
}

// ============================================================================
// Example 5: Complete Auth Flow
// ============================================================================

export async function completeAuthFlow() {
  // Step 1: Register
  const auth = createAuthClient({
    apiUrl: process.env.MARVIN_API_URL || 'http://localhost:8080'
  });

  await auth.register({
    email: 'admin@example.com',
    password: 'secure-password',
    first_name: 'Admin',
    last_name: 'User'
  });

  // Step 2: Login
  const { access_token } = await auth.login({
    email: 'admin@example.com',
    password: 'secure-password'
  });

  // Step 3: Use token for platform operations
  const platform = createPlatformClient({
    userToken: access_token
  });

  const profile = await platform.user.getProfile();
  console.log('Logged in as:', profile.email);

  // Step 4: Create content
  const entry = await platform.entries.create({
    title: 'My First Post',
    content: 'Hello from the SDK!'
  });

  console.log('Created entry:', entry.id);
}

// ============================================================================
// Example 6: Mixed Usage - Frontend + Backend
// ============================================================================

/**
 * Frontend Component (Next.js/Astro/etc)
 * Uses Publishing API for read-only content
 */
export async function frontendComponent() {
  const marvin = createMarvinClient({
    siteClientToken: process.env.MARVIN_SITE_CLIENT_TOKEN
  });

  const posts = await marvin.collection('blog-posts');
  const entries = await posts.entries();

  return entries; // Safe to expose in frontend
}

/**
 * Backend API Route
 * Uses Platform API for admin operations
 */
export async function backendApiRoute() {
  const platform = createPlatformClient({
    userToken: process.env.MARVIN_USER_TOKEN
  });

  // Admin operations
  await platform.entries.create({
    title: 'Server-generated post',
    content: 'Created by backend'
  });

  // Never expose platform client or user tokens to frontend!
}

// ============================================================================
// Example 7: Environment Variable Summary
// ============================================================================

/**
 * Publishing API Environment:
 * - MARVIN_API_URL=https://marvin.example.com
 * - MARVIN_SITE_CLIENT_TOKEN=site_client_abc123
 * - MARVIN_WORKSPACE_SLUG=my-workspace
 *
 * Platform API Environment:
 * - MARVIN_API_URL=https://marvin.example.com
 * - MARVIN_USER_TOKEN=user_token_xyz789
 *
 * Security Notes:
 * - Site client tokens: Safe for frontend (read-only)
 * - User tokens: Backend only (full CRUD access)
 * - Session cookies: Browser only (after login)
 */
