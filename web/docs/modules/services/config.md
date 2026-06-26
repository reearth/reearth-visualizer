---
title: "Configuration System"
module: "services/config"
category: "module"
tags: ["configuration", "feature-flags", "services"]
last_updated: "2026-06-04"
related:
  - ../../concepts/feature-flags.md
  - ../../setup/custom-providers.md
  - ../../reference/environment-variables.md
maintainers:
  - "@platform-team"
---

# Configuration System

The configuration system manages application-wide settings, feature flags, and environment-specific configurations for Re:Earth Visualizer Web.

## Overview

The configuration module (`src/services/config/`) provides centralized configuration management with support for:

- **Feature flags** - Control feature availability at runtime
- **Authentication settings** - Auth provider configuration
- **External URL generation** - Dynamic URL construction with context
- **Password policies** - Password validation rules
- **Plugin configuration** - Extension and plugin settings

## Purpose

Centralize all configuration logic to:

- Enable/disable features without code changes
- Support different configurations across environments (dev, staging, prod)
- Provide type-safe configuration access throughout the application
- Generate context-aware external URLs for integrations

## Key Components

- **`index.ts`** - Main configuration loader and global config management
- **`appFeatureConfig.ts`** - Application feature flags and external URL generation
- **`authInfo.ts`** - Authentication provider configuration
- **`extensions.ts`** - Plugin and extension configuration
- **`passwordPolicy.ts`** - Password validation rules

**Code Reference**: `src/services/config/`

## Architecture

### Configuration Flow

```
Environment Variables (REEARTH_WEB_*)
         ↓
   /reearth_config.json (runtime config)
         ↓
   Config Loaders (loadAppFeatureConfig, etc.)
         ↓
   Global Config State
         ↓
   Application Components (via appFeature(), authInfo(), etc.)
```

### Configuration Loading

1. **Build Time**: `vite.config.ts` processes environment variables
2. **Runtime**: Config injected into `/reearth_config.json`
3. **Initialization**: Config loaders parse and validate configuration
4. **Access**: Components call getter functions to retrieve config

## App Feature Configuration

### Module: `appFeatureConfig.ts`

Controls application features and external integrations.

**Code Reference**: `src/services/config/appFeatureConfig.ts`

### Feature Flags

```typescript
export type AppFeatureConfig = {
  // UI Feature Flags
  membersManagementOnDashboard?: boolean;
  workspaceCreation?: boolean;
  workspaceManagement?: boolean;
  accountManagement?: boolean;

  // External Integration
  externalAccountManagementUrl?: string;

  // Tile Configuration
  defaultTileType?: string;
  disabledTileTypes?: string[];
};
```

#### Available Feature Flags

| Flag                            | Type     | Default | Description                           |
| ------------------------------- | -------- | ------- | ------------------------------------- |
| `membersManagementOnDashboard`  | boolean  | `true`  | Controls member management UI         |
| `workspaceCreation`             | boolean  | `true`  | Enables/disables workspace creation   |
| `workspaceManagement`           | boolean  | `true`  | Controls workspace management UI      |
| `accountManagement`             | boolean  | `true`  | Enables/disables account management   |
| `externalAccountManagementUrl`  | string   | -       | URL for external account system       |
| `defaultTileType`               | string   | varies  | Default tile type for new tiles       |
| `disabledTileTypes`             | string[] | `[]`    | Hide specific tile types from UI      |

### Key Functions

#### `loadAppFeatureConfig()`

Loads and initializes feature configuration.

**Purpose**: Parse and validate feature config from environment

**Usage**:

```typescript
import { loadAppFeatureConfig } from "@reearth/services/config/appFeatureConfig";

// Called during app initialization
loadAppFeatureConfig();
```

**Called**: Application startup (before rendering)

**Code Reference**: `src/services/config/appFeatureConfig.ts:45`

#### `appFeature()`

Returns current feature configuration.

**Purpose**: Access runtime feature flags

**Returns**: `AppFeatureConfig` object

**Usage**:

```typescript
import { appFeature } from "@reearth/services/config/appFeatureConfig";

const Component = () => {
  const features = appFeature();

  if (!features.membersManagementOnDashboard) {
    return null; // Feature disabled
  }

  return <MembersManagementUI />;
};
```

**CRITICAL**: Must only be called after `loadAppFeatureConfig()` completes (after app initialization).

**Code Reference**: `src/services/config/appFeatureConfig.ts:82`

#### `generateExternalUrl()`

Generates URLs with workspace/project/user context.

**Purpose**: Create external URLs with dynamic context substitution

**Parameters**:

```typescript
type GenerateExternalUrlOptions = {
  url: string; // Template URL with placeholders
  workspace?: { alias?: string };
  project?: { alias?: string };
  me?: { alias?: string };
};
```

**Placeholders**:

- `[WORKSPACE_ALIAS]` - Replaced with workspace alias
- `[PROJECT_ALIAS]` - Replaced with project alias
- `[USER_ALIAS]` - Replaced with user alias

**Usage**:

```typescript
import { generateExternalUrl } from "@reearth/services/config/appFeatureConfig";

const managementUrl = generateExternalUrl({
  url: "https://platform.example.com/manage/[WORKSPACE_ALIAS]",
  workspace: { alias: "my-workspace" },
});
// Result: "https://platform.example.com/manage/my-workspace"
```

**Security Features**:

- Input validation for all parameters
- Character sanitization to prevent injection
- URL validation before returning

**Code Reference**: `src/services/config/appFeatureConfig.ts:105`

## Using appFeature() Safely

### CRITICAL: Runtime-Only Access

The `appFeature()` function **must only be called after configuration is loaded** to avoid stale/default values.

### ✅ Safe Usage Patterns

#### 1. Inside React Components

```typescript
const Component = () => {
  const { membersManagementOnDashboard } = appFeature();

  if (!membersManagementOnDashboard) return null;

  return <MembersUI />;
};
```

**Why safe**: Component renders after app initialization

#### 2. In React Hooks

```typescript
const useWorkspaceMenu = () => {
  const { workspaceCreation, workspaceManagement } = appFeature();

  return useMemo(
    () => buildMenu(workspaceCreation, workspaceManagement),
    [workspaceCreation, workspaceManagement],
  );
};
```

**Why safe**: Hooks execute at component runtime

#### 3. With useMemo for Performance

```typescript
const Component = () => {
  const disabled = useMemo(() => !appFeature().accountManagement, []);

  return <Button disabled={disabled} />;
};
```

**Why safe**: `useMemo` executes after component initialization

### ❌ Anti-patterns to Avoid

#### 1. Module-Level Execution

```typescript
// ❌ WRONG: Executes during module load, before config is ready
const { externalAuth0Signup } = appFeature();

const authFunction = () => {
  // May use stale feature flag values
  if (externalAuth0Signup) {
    // ...
  }
};
```

**Problem**: Module loads before `loadAppFeatureConfig()` runs

**Fix**: Call `appFeature()` inside the function:

```typescript
// ✅ Correct
const authFunction = () => {
  const { externalAuth0Signup } = appFeature(); // Called at runtime
  if (externalAuth0Signup) {
    // ...
  }
};
```

#### 2. Function Definition Level

```typescript
// ❌ WRONG: Called during function definition
const getAuthConfig = () => appFeature().authSettings;
```

**Problem**: Arrow function body may be evaluated early

**Fix**: Call inside function body explicitly:

```typescript
// ✅ Correct
const getAuthConfig = () => {
  return appFeature().authSettings;
};
```

## Configuration

### Environment Variable

Set via `REEARTH_WEB_APP_FEATURE_CONFIG` environment variable:

```bash
# .env
REEARTH_WEB_APP_FEATURE_CONFIG='{"membersManagementOnDashboard":true,"workspaceCreation":false}'
```

### Default Configuration

```typescript
const DEFAULT_APP_FEATURE_CONFIG: AppFeatureConfig = {
  membersManagementOnDashboard: true,
  workspaceCreation: true,
  workspaceManagement: true,
  accountManagement: true,
  defaultTileType: "open_street_map", // OSS default
  disabledTileTypes: [],
};
```

**Code Reference**: `src/services/config/appFeatureConfig.ts:15`

### Enterprise Edition Configuration

Enterprise Edition can override defaults:

```typescript
// src/ee/featureConfig.ts
export const getFeatureConfig = (): AppFeatureConfig => {
  return {
    defaultTileType: "google_satellite", // EE default
    externalAccountManagementUrl: "https://platform.example.com/[USER_ALIAS]",
    // ... other overrides
  };
};
```

**Code Reference**: `src/ee/featureConfig.ts`

## Usage Examples

### Basic Usage

```typescript
import { appFeature } from "@reearth/services/config/appFeatureConfig";

const Dashboard = () => {
  const features = appFeature();

  return (
    <div>
      {features.workspaceCreation && <CreateWorkspaceButton />}
      {features.membersManagementOnDashboard && <MembersPanel />}
    </div>
  );
};
```

### External URL Generation

```typescript
import { generateExternalUrl, appFeature } from "@reearth/services/config/appFeatureConfig";

const AccountSettings = ({ workspace, user }) => {
  const { externalAccountManagementUrl } = appFeature();

  if (!externalAccountManagementUrl) {
    return <InternalAccountSettings />;
  }

  const externalUrl = generateExternalUrl({
    url: externalAccountManagementUrl,
    workspace: { alias: workspace.alias },
    me: { alias: user.alias },
  });

  return <ExternalLink href={externalUrl}>Manage Account</ExternalLink>;
};
```

### Feature Flag with Default Behavior

```typescript
const TileSelector = () => {
  const { defaultTileType, disabledTileTypes = [] } = appFeature();

  const availableTiles = ALL_TILE_TYPES.filter(
    tile => !disabledTileTypes.includes(tile.id),
  );

  const [selectedTile, setSelectedTile] = useState(defaultTileType);

  return <TileDropdown tiles={availableTiles} selected={selectedTile} />;
};
```

## Testing

### Unit Tests

Location: `src/services/config/__tests__/`

**Test scenarios**:

- Configuration loading from environment
- Default values applied correctly
- External URL generation with various inputs
- Input validation and sanitization
- Feature flag evaluation

**Example**:

```typescript
import { loadAppFeatureConfig, appFeature } from "../appFeatureConfig";

describe("appFeatureConfig", () => {
  beforeEach(() => {
    loadAppFeatureConfig();
  });

  it("should return default configuration", () => {
    const config = appFeature();
    expect(config.membersManagementOnDashboard).toBe(true);
  });

  it("should generate external URL with workspace context", () => {
    const url = generateExternalUrl({
      url: "https://example.com/[WORKSPACE_ALIAS]",
      workspace: { alias: "my-workspace" },
    });
    expect(url).toBe("https://example.com/my-workspace");
  });
});
```

## Common Issues

### Issue: "Feature flag not reflecting environment configuration"

**Symptoms**: Feature appears enabled/disabled despite environment variable

**Cause**: `appFeature()` called before `loadAppFeatureConfig()`

**Solution**:

1. Ensure `loadAppFeatureConfig()` called during app initialization
2. Call `appFeature()` only inside React components/hooks (not at module level)
3. Verify environment variable format is correct JSON

**Code to check**: `src/app/index.tsx` - verify config loaded before render

### Issue: "External URL contains [PLACEHOLDER]"

**Symptoms**: Generated URL includes literal placeholder text

**Cause**: Context object missing required field

**Solution**:

```typescript
// ❌ Wrong - missing alias
generateExternalUrl({
  url: "https://example.com/[WORKSPACE_ALIAS]",
  workspace: {}, // No alias field
});

// ✅ Correct
generateExternalUrl({
  url: "https://example.com/[WORKSPACE_ALIAS]",
  workspace: { alias: "my-workspace" },
});
```

## Security Considerations

### URL Generation Security

- All inputs are validated and sanitized
- Character whitelist prevents injection attacks
- Invalid characters replaced with safe alternatives
- URLs validated before returning

### Feature Flag Security

- Feature flags control UI visibility only
- Backend must enforce permissions independently
- Don't rely on feature flags for security
- Use for UX/feature gating only

## Related Documentation

- [Feature Flags Concept](../../concepts/feature-flags.md)
- [Environment Variables](../../reference/environment-variables.md)
- [Custom Providers](../../setup/custom-providers.md)
- [Authentication Module](./auth.md)

## Code References

- `src/services/config/appFeatureConfig.ts` - Main implementation
- `src/services/config/index.ts` - Configuration loader
- `src/ee/featureConfig.ts` - Enterprise Edition overrides
- `src/app/index.tsx` - Configuration initialization

## Changelog

### 2026-06-04 - Documentation Created

- Migrated from CLAUDE.md to modular structure
- Added detailed API documentation
- Added security and best practices sections

---

**Last Updated**: 2026-06-04
**Maintained By**: Platform Team
