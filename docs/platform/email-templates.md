# Email Templates

Manage workspace email templates via the Platform API.

## Overview

Marvin supports customizable email templates for system emails (invitations, notifications, password resets, etc.). Each workspace can override default templates with custom branding.

## Template Types

| Type | Description | Variables |
|------|-------------|-----------|
| `workspace_invitation` | Workspace invite emails | `workspace_name`, `inviter_name`, `join_url` |
| `password_reset` | Password reset emails | `user_name`, `reset_url`, `expires_at` |
| `email_verification` | Email verification | `user_name`, `verify_url` |
| `notification` | General notifications | `title`, `message`, `action_url` |

## Listing Templates

### List All Templates

```typescript
const templates = await platform.emailTemplates.list('my-workspace');

templates.forEach(template => {
  console.log(`${template.name} (${template.template_type}) - ${template.enabled ? 'Enabled' : 'Disabled'}`);
});
```

**Response:**

```typescript
[
  {
    id: 'tpl-123',
    template_type: 'workspace_invitation',
    group_id: 'ws-456',
    name: 'Workspace Invitation',
    description: 'Email sent when inviting users',
    enabled: true,
    created_at: '2026-01-01T00:00:00Z',
    update_at: '2026-07-01T00:00:00Z'
  }
]
```

## Getting a Template

```typescript
const template = await platform.emailTemplates.get('my-workspace', 'tpl-123');

console.log(`Subject: ${template.subject}`);
console.log(`Header: ${template.header_text}`);
console.log(`Message: ${template.message_top}`);
```

**Full Template Response:**

```typescript
{
  id: 'tpl-123',
  template_type: 'workspace_invitation',
  group_id: 'ws-456',
  name: 'Workspace Invitation',
  description: 'Custom branded invitation',
  enabled: true,
  subject: 'Join {{workspace_name}} on Marvin',
  header_text: 'You're Invited!',
  message_top: '{{inviter_name}} has invited you to join {{workspace_name}}.',
  message_bottom: 'Click the button below to accept.',
  button_text: 'Accept Invitation',
  custom_html: null,
  available_variables: {
    workspace_name: 'Name of the workspace',
    inviter_name: 'Name of the person who sent the invite',
    join_url: 'URL to accept the invitation'
  },
  created_at: '2026-01-01T00:00:00Z',
  update_at: '2026-07-01T00:00:00Z'
}
```

## Creating Templates

```typescript
const template = await platform.emailTemplates.create('my-workspace', {
  template_type: 'workspace_invitation',
  name: 'Custom Invitation',
  description: 'Branded workspace invitation',
  subject: 'Join {{workspace_name}} on Marvin',
  header_text: 'Welcome!',
  message_top: '{{inviter_name}} has invited you to collaborate on {{workspace_name}}.',
  message_bottom: 'We're excited to have you join our team.',
  button_text: 'Accept Invitation',
  enabled: true,
});

console.log(`Created template: ${template.id}`);
```

### Template Variables

Use double braces `{{variable_name}}` for dynamic content:

```typescript
await platform.emailTemplates.create('my-workspace', {
  template_type: 'workspace_invitation',
  subject: 'Join {{workspace_name}}',
  message_top: 'Hi! {{inviter_name}} wants you to join {{workspace_name}}.',
  button_text: 'Join Now',
});
```

### Custom HTML Templates

For advanced customization, use `custom_html`:

```typescript
await platform.emailTemplates.create('my-workspace', {
  template_type: 'workspace_invitation',
  name: 'Fully Custom',
  custom_html: `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h1 style="color: #3b82f6;">Join {{workspace_name}}</h1>
        <p>{{inviter_name}} has invited you!</p>
        <a href="{{join_url}}" style="
          background: #3b82f6;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
        ">Accept Invitation</a>
      </body>
    </html>
  `,
  enabled: true,
});
```

## Updating Templates

```typescript
await platform.emailTemplates.update('my-workspace', 'tpl-123', {
  subject: 'Updated Subject Line',
  message_top: 'Updated message content',
  enabled: true,
});
```

**Partial Updates:**

Only changed fields need to be included:

```typescript
// Just update the subject
await platform.emailTemplates.update('my-workspace', 'tpl-123', {
  subject: 'New Subject',
});

// Just enable/disable
await platform.emailTemplates.update('my-workspace', 'tpl-123', {
  enabled: false,
});
```

## Deleting Templates

```typescript
await platform.emailTemplates.delete('my-workspace', 'tpl-123');
```

!!! warning "Fallback to Default"
    Deleting a template causes the workspace to fall back to the system default template.

## Testing Templates

Send a test email to verify template rendering:

```typescript
const result = await platform.emailTemplates.sendTest(
  'my-workspace',
  'tpl-123',
  'test@example.com'
);

console.log(result.message); // "Test email sent successfully"
```

**Test Email Preview:**

The test email uses sample data for variables:

```
Subject: Join Example Workspace on Marvin
From: Marvin <noreply@marvin.example.com>
To: test@example.com

Welcome!

John Doe has invited you to collaborate on Example Workspace.

We're excited to have you join our team.

[Accept Invitation] (button links to join_url)
```

## Available Variables

### Workspace Invitation

| Variable | Description | Example |
|----------|-------------|---------|
| `{{workspace_name}}` | Workspace name | "My Blog" |
| `{{inviter_name}}` | Inviter's full name | "Jane Doe" |
| `{{join_url}}` | Invitation acceptance URL | "https://..." |

### Password Reset

| Variable | Description | Example |
|----------|-------------|---------|
| `{{user_name}}` | User's full name | "John Doe" |
| `{{reset_url}}` | Password reset URL | "https://..." |
| `{{expires_at}}` | Expiration timestamp | "2026-07-11 12:00 UTC" |

### Email Verification

| Variable | Description | Example |
|----------|-------------|---------|
| `{{user_name}}` | User's full name | "John Doe" |
| `{{verify_url}}` | Verification URL | "https://..." |

## Examples

### Create Branded Invitation Template

```typescript
async function setupBrandedInvitation(workspaceSlug: string) {
  const template = await platform.emailTemplates.create(workspaceSlug, {
    template_type: 'workspace_invitation',
    name: 'Branded Invitation',
    description: 'Company-branded workspace invitation',
    subject: '🎉 Join {{workspace_name}}',
    header_text: 'You're Invited!',
    message_top: `
      {{inviter_name}} has invited you to join **{{workspace_name}}** on Marvin.
      
      This workspace is where our team collaborates on content and projects.
    `,
    message_bottom: `
      If you have any questions, reach out to {{inviter_name}} directly.
      
      Looking forward to working together!
    `,
    button_text: 'Accept Invitation',
    enabled: true,
  });
  
  // Test it
  await platform.emailTemplates.sendTest(
    workspaceSlug,
    template.id,
    'team@example.com'
  );
  
  console.log('Template created and tested!');
}
```

### Bulk Update Templates

```typescript
async function updateAllTemplatesBranding(workspaceSlug: string) {
  const templates = await platform.emailTemplates.list(workspaceSlug);
  
  for (const template of templates) {
    await platform.emailTemplates.update(workspaceSlug, template.id, {
      message_bottom: `
        Best regards,
        The ${workspaceSlug} Team
      `,
    });
  }
  
  console.log(`Updated ${templates.length} templates`);
}
```

### Preview Template Variables

```typescript
async function previewTemplate(workspaceSlug: string, templateId: string) {
  const template = await platform.emailTemplates.get(workspaceSlug, templateId);
  
  console.log('Subject:', template.subject);
  console.log('\nAvailable Variables:');
  
  Object.entries(template.available_variables || {}).forEach(([key, desc]) => {
    console.log(`  {{${key}}} - ${desc}`);
  });
  
  console.log('\nMessage:');
  console.log(template.message_top);
  console.log(template.message_bottom);
}
```

### Clone Template Across Workspaces

```typescript
async function cloneTemplate(
  sourceWorkspace: string,
  targetWorkspace: string,
  templateId: string
) {
  // Get source template
  const source = await platform.emailTemplates.get(sourceWorkspace, templateId);
  
  // Create in target workspace
  const cloned = await platform.emailTemplates.create(targetWorkspace, {
    template_type: source.template_type,
    name: source.name,
    description: source.description,
    subject: source.subject,
    header_text: source.header_text,
    message_top: source.message_top,
    message_bottom: source.message_bottom,
    button_text: source.button_text,
    custom_html: source.custom_html,
    enabled: source.enabled,
  });
  
  console.log(`Cloned template to ${targetWorkspace}`);
  return cloned;
}
```

## Best Practices

### 1. Test Before Enabling

Always test templates before enabling them:

```typescript
// Create disabled
const template = await platform.emailTemplates.create('my-workspace', {
  /* ... */,
  enabled: false, // Start disabled
});

// Test
await platform.emailTemplates.sendTest('my-workspace', template.id, 'test@example.com');

// Enable after verification
await platform.emailTemplates.update('my-workspace', template.id, {
  enabled: true,
});
```

### 2. Use Markdown for Formatting

Message fields support Markdown:

```typescript
message_top: `
  # Welcome to {{workspace_name}}!
  
  **{{inviter_name}}** has invited you to join our team.
  
  ## What's Next?
  
  - Click the button below to accept
  - Complete your profile
  - Start collaborating!
`
```

### 3. Keep Subject Lines Short

```typescript
// ✅ Good: Clear and concise
subject: 'Join {{workspace_name}}'

// ❌ Bad: Too long
subject: 'You have been invited to join {{workspace_name}} on the Marvin CMS platform'
```

### 4. Include Call-to-Action

```typescript
button_text: 'Accept Invitation', // Clear action
message_bottom: 'Click above to get started!',
```

## Next Steps

- [Platform Overview](overview.md) - Platform API basics
- [Webhooks](webhooks.md) - Webhook configuration
- [Workspaces](workspaces.md) - Workspace management
