---
title: "Feature Flags"
category: "concept"
tags: ["feature-flags", "configuration", "runtime-config"]
last_updated: "2026-06-04"
related:
  - ../modules/services/config.md
  - ../setup/custom-providers.md
  - ../reference/environment-variables.md
---

# Feature Flags

Feature flags enable dynamic control of application features without code changes, supporting gradual rollouts, A/B testing, and environment-specific configurations.

## Overview

Feature flags in Re:Earth Visualizer Web allow you to:

- **Enable/disable features** at runtime per environment
- **Control UI visibility** without deploying code changes
- **Support multiple deployments** (OSS vs Enterprise) with different features
- **Gradual rollouts** by enabling features for specific users/workspaces
- **A/B testing** by toggling features for different user segments

## Core Principles

### 1. Configuration Over Code

Feature availability is controlled by configuration, not code comments or conditional compilation:

```typescript
// ✅ Good - configuration-driven
const features = appFeature();
if (features.workspaceCreation) {
  return <CreateWorkspaceButton />;
}

// ❌ Avoid - hardcoded
// return <CreateWorkspaceButton />;
```

### 2. Runtime Evaluation

Features are evaluated at runtime, allowing hot-swapping configurations:

```typescript
// Evaluated when component renders
const Component = () => {
  const { accountManagement } = appFeature();
  // ...
};
```

### 3. Safe Defaults

All feature flags have sensible defaults that work without configuration:

```typescript
const DEFAULT_CONFIG = {
  membersManagementOnDashboard: true, // Safe, common feature
  workspaceCreation: true,
  accountManagement: true,
};
```

## How It Works

### Configuration Loading Flow

```
Environment Variable
  REEARTH_WEB_APP_FEATURE_CONFIG
         ↓
   vite.config.ts
   (build time processing)
         ↓
   /reearth_config.json
   (runtime configuration)
         ↓
   loadAppFeatureConfig()
   (initialization)
         ↓
   appFeature()
   (component access)
```

### 1. Define Configuration

Set environment variable with JSON configuration:

```bash
# .env or .env.local
REEARTH_WEB_APP_FEATURE_CONFIG='{
  "membersManagementOnDashboard": false,
  "workspaceCreation": true,
  "accountManagement": false,
  "externalAccountManagementUrl": "https://platform.example.com/[USER_ALIAS]"
}'
```

### 2. Load Configuration

Configuration loaded during app initialization:

```typescript
// src/app/index.tsx
import { loadAppFeatureConfig } from "@reearth/services/config/appFeatureConfig";

// Load before app renders
loadAppFeatureConfig();

ReactDOM.render(<App />, root);
```

### 3. Access in Components

Use `appFeature()` function in React components:

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

## Available Feature Flags

### UI Feature Flags

#### `membersManagementOnDashboard`

**Type**: `boolean`

**Default**: `true`

**Purpose**: Controls member management UI visibility on dashboard

**Usage**:

```typescript
const Dashboard = () => {
  const { membersManagementOnDashboard } = appFeature();

  return (
    <div>
      {membersManagementOnDashboard && (
        <Section title="Team Members">
          <MembersList />
          <InviteMemberButton />
        </Section>
      )}
    </div>
  );
};
```

**When to disable**: Multi-tenant deployments where member management handled externally

#### `workspaceCreation`

**Type**: `boolean`

**Default**: `true`

**Purpose**: Enables/disables workspace creation functionality

**Usage**:

```typescript
const WorkspacesPage = () => {
  const { workspaceCreation } = appFeature();

  return (
    <div>
      <WorkspacesList />
      {workspaceCreation && <CreateWorkspaceButton />}
    </div>
  );
};
```

**When to disable**: Centrally managed workspaces, trial accounts

#### `workspaceManagement`

**Type**: `boolean`

**Default**: `true`

**Purpose**: Controls workspace settings and management features

**Usage**:

```typescript
const WorkspaceSettings = () => {
  const { workspaceManagement } = appFeature();

  if (!workspaceManagement) {
    return <Message>Contact admin to manage workspace</Message>;
  }

  return <WorkspaceSettingsForm />;
};
```

**When to disable**: Read-only workspace access, managed environments

#### `accountManagement`

**Type**: `boolean`

**Default**: `true`

**Purpose**: Enables/disables account management UI

**Usage**:

```typescript
const UserMenu = () => {
  const { accountManagement } = appFeature();

  return (
    <Menu>
      <MenuItem>Profile</MenuItem>
      {accountManagement && <MenuItem>Account Settings</MenuItem>}
      <MenuItem>Logout</MenuItem>
    </Menu>
  );
};
```

**When to disable**: External account management systems (SSO, enterprise portals)

### External Integration Flags

#### `externalAccountManagementUrl`

**Type**: `string | undefined`

**Default**: `undefined`

**Purpose**: URL for external account management system

**Placeholders**:

- `[WORKSPACE_ALIAS]` - Current workspace alias
- `[PROJECT_ALIAS]` - Current project alias
- `[USER_ALIAS]` - Current user alias

**Usage**:

```typescript
const AccountSettings = ({ workspace, user }) => {
  const { externalAccountManagementUrl } = appFeature();

  if (externalAccountManagementUrl) {
    const url = generateExternalUrl({
      url: externalAccountManagementUrl,
      workspace: { alias: workspace.alias },
      me: { alias: user.alias },
    });

    return <ExternalLink href={url}>Manage Account</ExternalLink>;
  }

  return <InternalAccountSettings />;
};
```

**When to use**: Integration with enterprise identity management

### Tile Configuration Flags

#### `defaultTileType`

**Type**: `string`

**Default**: `"open_street_map"` (OSS) or `"google_satellite"` (EE)

**Purpose**: Default tile type for new map tiles

**Usage**:

```typescript
const TileCreator = () => {
  const { defaultTileType } = appFeature();
  const [tileType, setTileType] = useState(defaultTileType);

  return <TileTypeSelector value={tileType} onChange={setTileType} />;
};
```

**When to configure**: Different defaults for different deployments

#### `disabledTileTypes`

**Type**: `string[]`

**Default**: `[]`

**Purpose**: Hide specific tile types from UI

**Usage**:

```typescript
const TileSelector = () => {
  const { disabledTileTypes = [] } = appFeature();

  const availableTiles = ALL_TILE_TYPES.filter(
    tile => !disabledTileTypes.includes(tile.id),
  );

  return <TileDropdown tiles={availableTiles} />;
};
```

**When to use**: Restrict tile options per deployment

## Implementation Patterns

### Pattern 1: Conditional Rendering

Most common pattern - show/hide UI elements:

```typescript
const Component = () => {
  const { featureName } = appFeature();

  return (
    <div>
      <CommonUI />
      {featureName && <OptionalFeature />}
    </div>
  );
};
```

### Pattern 2: Feature Routing

Route to different components based on feature:

```typescript
const AccountRoute = () => {
  const { externalAccountManagementUrl } = appFeature();

  if (externalAccountManagementUrl) {
    return <Navigate to={externalAccountManagementUrl} />;
  }

  return <InternalAccountPage />;
};
```

### Pattern 3: Menu Configuration

Build menus dynamically based on features:

```typescript
const Navigation = () => {
  const {
    workspaceCreation,
    workspaceManagement,
    accountManagement,
  } = appFeature();

  const menuItems = [
    { label: "Home", path: "/" },
    workspaceCreation && { label: "New Workspace", path: "/new" },
    workspaceManagement && { label: "Settings", path: "/settings" },
    accountManagement && { label: "Account", path: "/account" },
  ].filter(Boolean);

  return <Menu items={menuItems} />;
};
```

### Pattern 4: Permission Checking

Combine with permissions for access control:

```typescript
const ProtectedFeature = () => {
  const { workspaceManagement } = appFeature();
  const hasPermission = usePermission("workspace:write");

  if (!workspaceManagement || !hasPermission) {
    return <AccessDenied />;
  }

  return <WorkspaceSettings />;
};
```

## Best Practices

### ✅ Do's

1. **Call appFeature() at runtime**:

   ```typescript
   const Component = () => {
     const features = appFeature(); // ✅ Inside component
     // ...
   };
   ```

2. **Provide fallback UI**:

   ```typescript
   {
     features.newFeature ? (
       <NewFeatureUI />
     ) : (
       <Message>Feature not available</Message>
     );
   }
   ```

3. **Use useMemo for expensive checks**:

   ```typescript
   const isEnabled = useMemo(() => appFeature().feature, []);
   ```

4. **Document feature flags**:
   ```typescript
   // Feature flag: workspaceCreation
   // Controls whether users can create new workspaces
   {
     features.workspaceCreation && <CreateButton />;
   }
   ```

### ❌ Don'ts

1. **Don't call at module level**:

   ```typescript
   // ❌ Wrong - called before config loads
   const { feature } = appFeature();

   const Component = () => {
     // Uses stale value
   };
   ```

2. **Don't use for security**:

   ```typescript
   // ❌ Wrong - frontend flags not secure
   if (features.adminAccess) {
     deleteAllData(); // Backend must validate!
   }
   ```

3. **Don't create too many flags**:

   ```typescript
   // ❌ Over-engineering
   if (features.showButton && features.buttonEnabled && features.buttonVisible) {
     // Too granular
   }
   ```

4. **Don't forget to clean up**:
   ```typescript
   // ❌ Remove flags when feature fully rolled out
   {
     features.experimentalFeature && <NewUI />;
   }
   // After full rollout, replace with just <NewUI />
   ```

## Testing with Feature Flags

### Unit Tests

Mock feature flags in tests:

```typescript
import { appFeature } from "@reearth/services/config/appFeatureConfig";

jest.mock("@reearth/services/config/appFeatureConfig");

describe("Component", () => {
  it("shows feature when enabled", () => {
    (appFeature as jest.Mock).mockReturnValue({
      workspaceCreation: true,
    });

    render(<Component />);
    expect(screen.getByText("Create Workspace")).toBeInTheDocument();
  });

  it("hides feature when disabled", () => {
    (appFeature as jest.Mock).mockReturnValue({
      workspaceCreation: false,
    });

    render(<Component />);
    expect(screen.queryByText("Create Workspace")).not.toBeInTheDocument();
  });
});
```

### Integration Tests

Test both enabled and disabled states:

```typescript
describe("Workspace Management", () => {
  describe("with workspaceCreation enabled", () => {
    beforeEach(() => {
      // Set feature flag
      setFeatureConfig({ workspaceCreation: true });
    });

    it("allows creating workspaces", () => {
      // Test creation flow
    });
  });

  describe("with workspaceCreation disabled", () => {
    beforeEach(() => {
      setFeatureConfig({ workspaceCreation: false });
    });

    it("does not show create button", () => {
      // Test UI correctly hides feature
    });
  });
});
```

## Environment-Specific Configurations

### Development

```bash
# .env.local - Enable all features for development
REEARTH_WEB_APP_FEATURE_CONFIG='{
  "membersManagementOnDashboard": true,
  "workspaceCreation": true,
  "workspaceManagement": true,
  "accountManagement": true
}'
```

### Staging

```bash
# Staging - Test external integrations
REEARTH_WEB_APP_FEATURE_CONFIG='{
  "externalAccountManagementUrl": "https://staging-platform.example.com/[USER_ALIAS]",
  "accountManagement": false
}'
```

### Production (Open Source)

```bash
# OSS - Community features
REEARTH_WEB_APP_FEATURE_CONFIG='{
  "defaultTileType": "open_street_map",
  "disabledTileTypes": []
}'
```

### Production (Enterprise)

```bash
# Enterprise - Premium features
REEARTH_WEB_APP_FEATURE_CONFIG='{
  "defaultTileType": "google_satellite",
  "externalAccountManagementUrl": "https://platform.example.com/[WORKSPACE_ALIAS]/users/[USER_ALIAS]",
  "membersManagementOnDashboard": false
}'
```

## Troubleshooting

### Feature Not Reflecting Configuration

**Problem**: Feature appears enabled despite config saying disabled

**Causes**:

1. `appFeature()` called before `loadAppFeatureConfig()`
2. Component using module-level variable instead of runtime call
3. Environment variable not loaded correctly

**Solution**:

```typescript
// ✅ Correct - runtime call
const Component = () => {
  const { feature } = appFeature();
  // ...
};
```

### Configuration Not Loading

**Problem**: All features using defaults

**Check**:

1. Environment variable format is valid JSON
2. Variable name is `REEARTH_WEB_APP_FEATURE_CONFIG`
3. Dev server restarted after changing `.env`

**Debug**:

```typescript
// Log config at startup
console.log("Feature config:", appFeature());
```

## Related Documentation

- [Configuration Module](../modules/services/config.md)
- [Environment Variables](../reference/environment-variables.md)
- [Custom Providers](../setup/custom-providers.md)

## Code References

- `src/services/config/appFeatureConfig.ts` - Feature flag implementation
- `src/services/config/index.ts` - Configuration loader
- `src/ee/featureConfig.ts` - Enterprise Edition overrides

---

**Last Updated**: 2026-06-04
**Maintained By**: Platform Team
