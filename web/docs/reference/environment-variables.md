---
title: "Environment Variables Reference"
category: "reference"
tags: ["configuration", "environment", "setup"]
last_updated: "2026-06-04"
related:
  - ../setup/1password-setup.md
  - ../setup/custom-providers.md
  - ../modules/services/config.md
---

# Environment Variables Reference

Complete reference for all environment variables used in Re:Earth Visualizer Web.

## Configuration Files

### `.env`

Main environment configuration file (not tracked in git).

**Source**: Copy from `.env.example`

**Usage**: Traditional environment variable setup

### `.env.op`

1Password secret references (not tracked in git).

**Source**: Create based on `.env.example`

**Usage**: Used with `yarn start:op` for secure secret management

**Format**:

```bash
VARIABLE_NAME=op://Vault/Item/field
```

**See**: [1Password Setup Guide](../setup/1password-setup.md)

### `.env.local`

Local overrides (not tracked in git, optional).

**Priority**: Highest - overrides all other env files

**Usage**: Personal development settings

**Common use cases**:

- Different API endpoints
- Mock authentication
- Debug flags
- Feature flags for testing

### `.env.example`

Template file (tracked in git).

**Purpose**: Documents all available environment variables

**Usage**: Copy to `.env` or reference for `.env.op`

## Core Variables

### `REEARTH_WEB_API`

API endpoint URL.

**Type**: `string` (URL)

**Required**: Yes

**Example**:

```bash
REEARTH_WEB_API=https://api.example.com
```

**Default**: None

**Description**: Base URL for Re:Earth backend API

### `REEARTH_WEB_AUTH_PROVIDER`

Authentication provider to use.

**Type**: `"auth0" | "cognito" | "mock"`

**Required**: Yes

**Example**:

```bash
REEARTH_WEB_AUTH_PROVIDER=auth0
```

**Options**:

- `auth0` - Use Auth0 authentication
- `cognito` - Use AWS Cognito
- `mock` - Use mock auth for development

**See**: [Authentication](../concepts/authentication.md)

## Authentication Variables

### Auth0 Configuration

#### `REEARTH_WEB_AUTH0_DOMAIN`

Auth0 tenant domain.

**Type**: `string`

**Required**: When `AUTH_PROVIDER=auth0`

**Example**:

```bash
REEARTH_WEB_AUTH0_DOMAIN=example.auth0.com
```

#### `REEARTH_WEB_AUTH0_CLIENT_ID`

Auth0 application client ID.

**Type**: `string` (sensitive)

**Required**: When `AUTH_PROVIDER=auth0`

**Example**:

```bash
REEARTH_WEB_AUTH0_CLIENT_ID=abc123def456
```

**Security**: Store in 1Password

#### `REEARTH_WEB_AUTH0_AUDIENCE`

Auth0 API audience identifier.

**Type**: `string`

**Required**: When `AUTH_PROVIDER=auth0`

**Example**:

```bash
REEARTH_WEB_AUTH0_AUDIENCE=https://api.example.com
```

### AWS Cognito Configuration

#### `REEARTH_WEB_COGNITO_REGION`

AWS region for Cognito.

**Type**: `string`

**Required**: When `AUTH_PROVIDER=cognito`

**Example**:

```bash
REEARTH_WEB_COGNITO_REGION=us-east-1
```

#### `REEARTH_WEB_COGNITO_USER_POOL_ID`

Cognito User Pool ID.

**Type**: `string`

**Required**: When `AUTH_PROVIDER=cognito`

**Example**:

```bash
REEARTH_WEB_COGNITO_USER_POOL_ID=us-east-1_abc123
```

#### `REEARTH_WEB_COGNITO_CLIENT_ID`

Cognito App Client ID.

**Type**: `string` (sensitive)

**Required**: When `AUTH_PROVIDER=cognito`

**Example**:

```bash
REEARTH_WEB_COGNITO_CLIENT_ID=abc123def456
```

**Security**: Store in 1Password

## 3D Rendering Variables

### `REEARTH_WEB_CESIUM_ION_TOKEN`

Cesium Ion access token for premium assets.

**Type**: `string` (sensitive)

**Required**: No (optional for enhanced features)

**Example**:

```bash
REEARTH_WEB_CESIUM_ION_TOKEN=your_token_here
```

**Description**: Enables access to Cesium Ion hosted assets like terrain and imagery

**Get token**: <https://ion.cesium.com/>

**Security**: Store in 1Password

## Feature Configuration

### `REEARTH_WEB_CUSTOM_PROVIDERS`

Custom tile and terrain providers configuration.

**Type**: `string` (JSON)

**Required**: No

**Example**:

```bash
REEARTH_WEB_CUSTOM_PROVIDERS='{"imagery":{"providers":[{"id":"open_street_map","url":"https://tiles.example.com/{z}/{x}/{y}.png"}]}}'
```

**Description**: Override default tile and terrain provider URLs

**See**: [Custom Providers Guide](../setup/custom-providers.md)

### `REEARTH_WEB_APP_FEATURE_CONFIG`

Application feature flags configuration.

**Type**: `string` (JSON)

**Required**: No

**Example**:

```bash
REEARTH_WEB_APP_FEATURE_CONFIG='{"membersManagementOnDashboard":true,"workspaceCreation":false}'
```

**Description**: Control feature availability

**See**: [Feature Flags](../concepts/feature-flags.md)

## Development Variables

### `REEARTH_WEB_ENABLE_GQL_PLAYGROUND`

Enable GraphQL Playground.

**Type**: `boolean`

**Required**: No

**Default**: `false`

**Example**:

```bash
REEARTH_WEB_ENABLE_GQL_PLAYGROUND=true
```

**Description**: Enables GraphQL Playground for API exploration

**When to use**: Development and staging environments only

### `REEARTH_WEB_LOG_LEVEL`

Logging level.

**Type**: `"debug" | "info" | "warn" | "error"`

**Required**: No

**Default**: `"info"`

**Example**:

```bash
REEARTH_WEB_LOG_LEVEL=debug
```

**Options**:

- `debug` - Verbose logging
- `info` - Standard logging
- `warn` - Warnings only
- `error` - Errors only

### `REEARTH_WEB_MOCK_DATA`

Enable mock data for development.

**Type**: `boolean`

**Required**: No

**Default**: `false`

**Example**:

```bash
REEARTH_WEB_MOCK_DATA=true
```

**Description**: Use mock data instead of real API calls

**When to use**: Development without backend

## Integration Variables

### `REEARTH_WEB_SENTRY_DSN`

Sentry error tracking DSN.

**Type**: `string` (URL, sensitive)

**Required**: No

**Example**:

```bash
REEARTH_WEB_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
```

**Description**: Enables error tracking with Sentry

**Security**: Store in 1Password for production

## Environment-Specific Examples

### Development Environment

```bash
# .env or .env.local
REEARTH_WEB_API=http://localhost:9000/api
REEARTH_WEB_AUTH_PROVIDER=mock
REEARTH_WEB_ENABLE_GQL_PLAYGROUND=true
REEARTH_WEB_LOG_LEVEL=debug
```

### Staging Environment

```bash
# Typically via CI/CD or 1Password
REEARTH_WEB_API=https://staging-api.example.com
REEARTH_WEB_AUTH_PROVIDER=auth0
REEARTH_WEB_AUTH0_DOMAIN=staging.auth0.com
REEARTH_WEB_AUTH0_CLIENT_ID=staging_client_id
REEARTH_WEB_AUTH0_AUDIENCE=https://staging-api.example.com
REEARTH_WEB_CESIUM_ION_TOKEN=staging_token
REEARTH_WEB_LOG_LEVEL=info
```

### Production Environment

```bash
# Securely managed via 1Password or secrets management
REEARTH_WEB_API=https://api.reearth.io
REEARTH_WEB_AUTH_PROVIDER=auth0
REEARTH_WEB_AUTH0_DOMAIN=reearth.auth0.com
REEARTH_WEB_AUTH0_CLIENT_ID=production_client_id
REEARTH_WEB_AUTH0_AUDIENCE=https://api.reearth.io
REEARTH_WEB_CESIUM_ION_TOKEN=production_token
REEARTH_WEB_SENTRY_DSN=https://...@sentry.io/...
REEARTH_WEB_LOG_LEVEL=warn
```

## Variable Loading Priority

Vite loads environment variables in this order (highest priority first):

1. **`.env.local`** - Local overrides (highest priority)
2. **`.env.op`** (via `yarn start:op`) or **`.env`** - Environment config
3. **`process.env`** - System environment variables
4. **Default values** - Hardcoded defaults in code

**Example**: If same variable in multiple files:

```bash
# .env
REEARTH_WEB_LOG_LEVEL=info

# .env.local
REEARTH_WEB_LOG_LEVEL=debug

# Result: debug (local override wins)
```

## Security Best Practices

### Sensitive Variables

Mark as sensitive (never commit):

- Auth tokens and secrets (`*_CLIENT_ID`, `*_TOKEN`, `*_DSN`)
- API keys
- Private URLs with credentials

**Solution**: Use 1Password or environment-specific secrets management

### Public Variables

Safe to commit in `.env.example`:

- API endpoint structures (without credentials)
- Feature flags
- Non-sensitive configuration

### 1Password Integration

For sensitive variables:

```bash
# .env.op (safe to create, not committed)
REEARTH_WEB_AUTH0_CLIENT_ID=op://Engineering/ReEarth/auth0_client_id
REEARTH_WEB_CESIUM_ION_TOKEN=op://Engineering/ReEarth/cesium_token
```

**See**: [1Password Setup](../setup/1password-setup.md)

## Validation

### Required Variables Check

The application validates required variables at startup:

```typescript
// Throws error if missing required variables
if (!import.meta.env.REEARTH_WEB_API) {
  throw new Error("REEARTH_WEB_API is required");
}
```

### Type Validation

Some variables are validated for correct format:

- URLs must be valid HTTP(S) URLs
- Enums must match allowed values
- JSON variables must be valid JSON

## Troubleshooting

### Variables Not Loading

**Check**:

1. File name is exactly `.env` or `.env.local`
2. Variables are prefixed with `REEARTH_WEB_`
3. No spaces around `=`
4. No quotes unless value contains spaces
5. Restart dev server after changes

**Solution**:

```bash
# Stop dev server (Ctrl+C)
# Verify env file
cat .env

# Restart
yarn start
```

### 1Password Variables Not Loading

**See**: [1Password Troubleshooting](../setup/1password-setup.md#troubleshooting)

### Variable Value Seems Wrong

**Check priority**:

```bash
# Check if overridden in .env.local
cat .env.local

# Check system environment
env | grep REEARTH_WEB_
```

## Related Documentation

- [1Password Setup](../setup/1password-setup.md)
- [Custom Providers](../setup/custom-providers.md)
- [Configuration Module](../modules/services/config.md)
- [Feature Flags](../concepts/feature-flags.md)

## Code References

- `vite.config.ts` - Environment variable loading
- `src/services/config/index.ts` - Configuration initialization
- `.env.example` - Template with all variables

---

**Last Updated**: 2026-06-04
