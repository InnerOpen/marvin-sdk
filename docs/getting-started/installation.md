# Installation

## Requirements

- Node.js >= 18.0.0
- TypeScript >= 5.0.0

## Package Manager

Install the SDK using your preferred package manager:

=== "npm"

    ```bash
    npm install @inneropen/marvin-sdk
    ```

=== "yarn"

    ```bash
    yarn add @inneropen/marvin-sdk
    ```

=== "pnpm"

    ```bash
    pnpm add @inneropen/marvin-sdk
    ```

## Environment Setup

Create a `.env` file in your project root:

```env
MARVIN_API_URL=https://marvin.example.com
MARVIN_SITE_CLIENT_TOKEN=your-token-here
MARVIN_WORKSPACE_SLUG=your-workspace
```

### Getting a Site Client Token

1. Log into Marvin
2. Go to **Settings → Publishing → Site Clients**
3. Create a new client
4. Copy the token

!!! warning "Security Notice"
    Always use **site client tokens**, never user tokens. Keep tokens secure and never expose them in browser code.

## TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "types": ["node"],
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## Verification

Test your installation:

```typescript
import { createMarvinClient } from '@inneropen/marvin-sdk';

const marvin = createMarvinClient();
await marvin.initialize();

console.log('Connected to:', marvin.site?.title);
```

## Next Steps

- [Quick Start Guide](quickstart.md)
- [Configuration Options](configuration.md)
- [Core Concepts](../concepts/architecture.md)
