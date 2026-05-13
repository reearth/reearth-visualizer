# 1Password CLI Setup Guide

## Overview

This project supports using 1Password CLI to manage environment variables securely, eliminating the need to store secrets in `.env` files on disk.

**Important:** Only `.env.example` is tracked in git. You will create `.env.op` locally based on `.env.example` - it will not be committed.

## Prerequisites

1. **1Password Account**: Team or personal account with appropriate vault access
2. **1Password CLI**: Install from <https://developer.1password.com/docs/cli/get-started/>
3. **1Password Desktop App**: Required for biometric unlock

## Installation

### macOS

```bash
brew install --cask 1password/tap/1password-cli
```

### Linux

```bash
curl -sS https://downloads.1password.com/linux/keys/1password.asc | \
  sudo gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] https://downloads.1password.com/linux/debian/$(dpkg --print-architecture) stable main" | \
  sudo tee /etc/apt/sources.list.d/1password.list
sudo apt update && sudo apt install 1password-cli
```

### Windows

Download from <https://1password.com/downloads/command-line/>

## Setup Instructions

### 1. Sign in to 1Password CLI

```bash
# Sign in (one-time setup)
op account add

# Verify connection
op account list
```

### 2. Set Up Biometric Unlock (Recommended)

```bash
# Enable biometric unlock
op biometric unlock
```

This allows `op run` to access secrets without password prompts during development.

### 3. Create 1Password Item with Environment Variables

Reference `.env.example` for all required fields.

**Manual Setup Steps:**

1. Open 1Password Desktop App
2. Navigate to your team vault (or create a new vault if you have permissions)
3. Create a new item:
   - **Title**: Choose a descriptive name (e.g., `Re:Earth Visualizer Dev`)
   - **Type**: Password or Secure Note
   - **Vault**: Use your team's designated vault

4. Add fields for each variable in `.env.example`:
   - Use the field names from `.env.example` (without the `REEARTH_WEB_` prefix)
   - Example: `REEARTH_WEB_AUTH0_DOMAIN` → field name `auth0_domain`
   - Set sensitive fields like `auth0_client_id` and `cesium_ion_token` as password type
   - See `.env.example` for complete list and descriptions

5. Save the item

### 4. Create .env.op File

Create a new `.env.op` file (not tracked in git) with 1Password secret references:

```bash
# Example: If your vault is "Engineering" and item is "Re:Earth Visualizer Dev"
REEARTH_WEB_AUTH0_DOMAIN=op://Engineering/Re:Earth Visualizer Dev/auth0_domain
REEARTH_WEB_AUTH0_AUDIENCE=op://Engineering/Re:Earth Visualizer Dev/auth0_audience
REEARTH_WEB_AUTH0_CLIENT_ID=op://Engineering/Re:Earth Visualizer Dev/auth0_client_id
# ... update all other variables similarly
```

**Secret Reference Format:**

```text
op://vault-name/item-name/field-name
```

### 5. Test Setup

Start the development server to verify 1Password integration:

```bash
yarn start:op
```

If the dev server starts successfully and you can access <http://localhost:3000>, your 1Password integration is working correctly.

If you see errors, check:

- Vault name matches exactly (case-sensitive)
- Item name matches exactly
- Field names match exactly
- You have access permissions to the vault
- You're signed in to 1Password CLI (`op account list`)

## Daily Usage

### Starting Development Server

```bash
# With 1Password
yarn start:op

# Traditional method (still works if .env exists)
yarn start
```

The first time you run `yarn start:op`, you may be prompted to authenticate via:

- Biometric unlock (if configured)
- 1Password Desktop App
- Master password

**Note:** Environment variables are only used during development server startup. Build and test processes don't require them.

### Local Overrides with .env.local (Optional)

Vite automatically loads `.env.local` (if it exists) to override any variables for your local environment. This works with both `.env` and `.env.op` approaches.

**Common use cases:**

```bash
# .env.local - Personal overrides (create this file if needed)
REEARTH_WEB_API=http://localhost:9000/api  # Different port
REEARTH_WEB_AUTH_PROVIDER=mock             # Use mock auth
REEARTH_WEB_ENABLE_GQL_PLAYGROUND=true     # Enable playground
```

**How it works:**

- **With `yarn start`**: Vite loads `.env` then `.env.local`
- **With `yarn start:op`**: 1Password injects secrets from `.env.op` into process.env, then Vite loads `.env.local` and merges them

**Priority order:**

1. `.env.local` (highest - always wins)
2. `.env.op` or `.env` (base configuration)
3. Default values (lowest)

**Important:** After changing `.env.local`, restart the dev server (`Ctrl+C` then `yarn start:op` again) for changes to take effect.

**Note:** `.env.local` is optional - only create it if you need local overrides.

## Migration from .env

### Step 1: Backup Current .env

```bash
cp .env .env.backup
```

### Step 2: Complete 1Password Setup

Follow "Setup Instructions" above.

### Step 3: Test 1Password Integration

```bash
yarn start:op
```

If the dev server starts successfully, your 1Password integration is working.

### Step 4: Remove .env (Optional)

Once confident:

```bash
rm .env .env.backup
```

You can always recreate `.env` from `.env.example` if needed.

## Team Rollout Strategy

### Phase 1: Optional Adoption

- `.env.op` template available in the repository
- Developers can opt-in when ready
- `.env` files still work for those not using 1Password

### Phase 2: Encouraged Migration

- New team members start with 1Password
- Existing developers migrate at their own pace
- Team provides support during migration

### Phase 3: Full Migration (Future)

- CI/CD uses 1Password Service Accounts
- `.env` files deprecated but still supported for local dev

## Troubleshooting

### "executable file not found in $PATH"

Install 1Password CLI (see Installation section above).

Verify installation:

```bash
which op
op --version
```

### "401 Unauthorized" or "You are not currently signed in"

Sign in to 1Password:

```bash
op signin
```

Or add a new account:

```bash
op account add
```

Enable biometric unlock (optional but recommended):

```bash
op biometric unlock
```

### "item not found" or "vault not found"

Verify your vault and item names:

```bash
# List available vaults
op vault list

# List items in a vault
op item list --vault "VaultName"

# Get specific item details
op item get "ItemName" --vault "VaultName" --format=json
```

Update `.env.op` with the exact vault and item names (case-sensitive).

### Secrets Not Loading / Vite Not Reading Secrets

1. Verify 1Password injects secrets correctly:

   ```bash
   op run --env-file=.env.op -- env | grep REEARTH_WEB_
   ```

2. Check that secret references in `.env.op` are formatted correctly:

   ```text
   op://VaultName/ItemName/FieldName
   ```

3. Ensure field names in 1Password match exactly (case-sensitive)

4. Verify you have access permissions to the vault

### Permission Denied / Access Denied

Contact your 1Password team admin to:

- Grant you access to the required vault
- Verify you have read permissions for the item
- Check if vault sharing settings are correct

## CI/CD Integration (Future)

For GitHub Actions, use 1Password Service Accounts:

```yaml
- uses: 1password/load-secrets-action@v1
  with:
    export-env: true
  env:
    REEARTH_WEB_AUTH0_DOMAIN: op://VaultName/ItemName/auth0_domain
    REEARTH_WEB_AUTH0_AUDIENCE: op://VaultName/ItemName/auth0_audience
    # ... other secrets
```

## Security Benefits

1. **No Secrets on Disk**: `.env.op` contains only references, not actual secrets
2. **Centralized Management**: Update secrets in 1Password once, available everywhere
3. **Audit Trail**: 1Password logs all secret access for security monitoring
4. **Granular Access**: Team admins control who can access which secrets
5. **Easy Rotation**: Rotate secrets without updating files or coordinating with team

## Reference

- [1Password CLI Documentation](<https://developer.1password.com/docs/cli/>)
- [1Password Secret References](<https://developer.1password.com/docs/cli/secrets-reference-syntax/>)
- [1Password Service Accounts](<https://developer.1password.com/docs/service-accounts/>)
