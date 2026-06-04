---
title: "Custom Providers Configuration"
category: "setup"
tags: ["configuration", "providers", "tiles", "terrain", "cesium"]
last_updated: "2026-06-04"
related:
  - ../modules/services/config.md
  - ../concepts/3d-rendering.md
  - ../reference/environment-variables.md
---

# Custom Providers Configuration

## Overview

Re:Earth Visualizer supports custom providers that allow you to override imagery, terrain, and layer provider data per deployment environment. This feature enables integration with private tile servers, custom terrain data, or specialized geospatial services.

**Important**: Custom providers configuration is **only for provider data** (URLs, credentials, settings). It does not control which provider options appear in the UI. UI option visibility is controlled by the backend `manifest.yml`.

### Architecture

**Backend (Server):**

- Defines the **complete list** of all available provider types in `server/pkg/builtin/manifest.yml`
- Controls which provider types are visible in the UI via manifest choices
- Validates that saved provider selections match defined types
- Ensures data integrity across all environments

**Frontend (Per Environment):**

- **Overrides** specific provider data (URLs, credentials, settings)
- Does **not** control which providers are visible in the UI
- Allows different deployments to use different data sources without backend changes

### Key Benefits

✅ **Environment Flexibility**: Different environments can use different data sources (URLs, credentials)
✅ **Configuration-Only Changes**: URL changes don't require code modifications or redeployment
✅ **Centralized Control**: Provider types and UI visibility managed in backend manifest
✅ **Secure Configuration**: Can use 1Password or environment variables for sensitive data

## How It Works

**Backend Controls UI Options:**

- The backend `manifest.yml` defines which provider types exist and which are visible in the UI
- To show/hide provider options, modify the `choices` in `manifest.yml` or use `appFeature().disabledTileTypes`
- This ensures consistent UI across all environments

**Frontend Provides Data:**

- Custom providers configuration only overrides the data for existing provider types
- You can change URLs, credentials, and settings per environment
- You cannot add new provider types or hide providers via configuration
- Providers not mentioned in the configuration use default values from the backend

**Example Flow:**

1. Backend defines visible providers: `google_satellite`, `open_street_map`, `cesium_ion`, `url`
2. Production config overrides: `open_street_map` URL to point to production tile server
3. Staging config overrides: `open_street_map` URL to point to staging tile server
4. Users in both environments see the same 4 options, but they fetch from different URLs

## Use Cases

### Private Tile Servers

Organizations with private map tile infrastructure can configure Re:Earth to use their internal tile servers instead of default public URLs.

### Custom Terrain Data

Projects requiring specialized terrain data can configure custom terrain providers with environment-specific URLs.

### Air-Gapped Deployments

Environments without internet access can configure Re:Earth to use locally hosted tile and terrain services by overriding provider URLs.

### Regional Data Compliance

Organizations with data sovereignty requirements can ensure all geospatial data comes from approved, region-specific sources by overriding provider URLs.

### Multi-Tenant Deployments

Different customers or tenants can use different data sources without maintaining separate codebases by configuring tenant-specific provider URLs.

## Configuration

Custom providers are configured using the `REEARTH_WEB_CUSTOM_PROVIDERS` environment variable.

### Environment Variable

**Variable Name**: `REEARTH_WEB_CUSTOM_PROVIDERS`

**Format**: JSON string

**Example**:

```bash
REEARTH_WEB_CUSTOM_PROVIDERS='{"imagery":{"providers":[{"id":"open_street_map","url":"https://tiles.example.com/{z}/{x}/{y}.png"}]}}'
```

### How It Works

1. **Define the Configuration**: Set `REEARTH_WEB_CUSTOM_PROVIDERS` in your `.env`, `.env.local`, or `.env.op` file
2. **Development Loading**: Configuration is loaded via vite.config.ts when starting the dev server
3. **Runtime Injection**: The configuration is injected into `/reearth_config.json`
4. **Editor Integration**: Custom providers are passed to Editor options
5. **Core Library**: @reearth/core receives the configuration and applies the data overrides

### Key Features

- **Multiple Overrides**: Each category (imagery, terrain, layers) supports multiple override configurations
- **Secure Storage**: Can be stored in 1Password for sensitive configurations (see [1Password CLI Integration](1password-setup.md))
- **Local Overrides**: Use `.env.local` to test custom configurations locally

### Configuration Format

The configuration uses a JSON structure with three main categories: `imagery`, `terrain`, and `layers`.

**For all categories:**

- **`providers`** array: Override specific preset providers by matching their `id`. Any provider ID not in this array uses default backend values.

**Important**:

- You can only override **existing** providers defined in `server/pkg/builtin/manifest.yml`
- You cannot hide providers via this configuration (use backend manifest or `appFeature().disabledTileTypes` instead)
- You cannot add entirely new provider types (must be defined in backend manifest first)

#### Structure

**Minimal Configuration** (most common use case):

```json
{
  "imagery": {
    "providers": [
      {
        "id": "string (required)",
        "url": "string (required)"
      }
    ]
  },
  "terrain": {
    "providers": [
      {
        "id": "string (required)",
        "url": "string (required)"
      }
    ]
  },
  "layers": {
    "providers": [
      {
        "id": "string (required)",
        "url": "string (required)",
        "options": {} // optional
      }
    ]
  }
}
```

**Full Configuration** (with optional fields):

```json
{
  "imagery": {
    "providers": [
      {
        "id": "string (required)",
        "url": "string (required)",
        "credit": "string (optional)",
        "maximumLevel": "number (optional, default: 18)",
        "minimumLevel": "number (optional, default: 0)"
      }
    ]
  },
  "terrain": {
    "providers": [
      {
        "id": "string (required)",
        "url": "string (required)",
        "requestVertexNormals": "boolean (optional, default: false)",
        "requestWaterMask": "boolean (optional, default: false)",
        "credit": "string (optional)"
      }
    ]
  },
  "layers": {
    "providers": [
      {
        "id": "string (required)",
        "url": "string (required)",
        "options": {} // optional
      }
    ]
  }
}
```

#### Configuration Options

**Imagery Providers**:

- **`id`** (required): Provider ID matching the backend definition in manifest.yml
- **`url`** (required): Environment-specific URL template with placeholders like `{z}/{x}/{y}` for XYZ tiles or `{z}/{x}/{reverseY}` for TMS
- **`credit`** (optional): Attribution text (e.g., "© OpenStreetMap")
- **`maximumLevel`** (optional): Maximum zoom level (default: 18)
- **`minimumLevel`** (optional): Minimum zoom level (default: 0)

**Note**: Provider names and labels are defined in the backend manifest (`server/pkg/builtin/manifest.yml`) and cannot be overridden per environment.

**Terrain Providers**:

- **`id`** (required): Provider ID matching the backend definition in manifest.yml
- **`url`** (required): Environment-specific base URL to terrain tile service
- **`requestVertexNormals`** (optional): Enable vertex normals for better lighting (default: false)
- **`requestWaterMask`** (optional): Enable water mask for water rendering (default: false)
- **`credit`** (optional): Attribution text

**Layer Providers**:

- **`id`** (required): Layer provider ID matching the backend definition
- **`url`** (required): Environment-specific URL to the layer data source
- **`options`** (optional): Layer-specific configuration options (e.g., API keys)

#### URL Template Placeholders

**Imagery URL templates** support the following placeholders:

- **`{z}`**: Zoom level
- **`{x}`**: Tile X coordinate
- **`{y}`**: Tile Y coordinate (for XYZ/Slippy map tiles)
- **`{reverseY}`**: Inverted Y coordinate (for TMS tiles)

**Examples**:

- XYZ tiles: `https://example.com/{z}/{x}/{y}.png`
- TMS tiles: `https://example.com/{z}/{x}/{reverseY}.png`

**Terrain URLs** should point to the base directory:

- Example: `https://terrain.example.com/`

#### Provider Override

**How it works:**

- **`providers` array**: Override specific preset providers by matching their `id`
  - Any provider with an `id` matching a preset will replace that preset's data configuration
  - You can override: URL, zoom levels, credits, and other settings
  - Preset providers not listed here use their default backend configuration
  - Example: Override "open_street_map" to point to your environment-specific tile server

**Available Provider IDs:**

All available provider IDs are defined in `server/pkg/builtin/manifest.yml`. Current provider IDs include:

- `google_satellite`, `google_roadmap` - Google Maps tiles (EE only)
- `nasa_black_marble` - NASA Black Marble
- `open_street_map` - OpenStreetMap
- `japan_gsi_standard` - Japan GSI Standard Map
- `cesium_ion` - Cesium Ion tiles (requires access token)
- `url` - Custom URL input
- `default`, `default_label`, `default_road`, `black_marble` - **Deprecated** (legacy tile types)

**Notes**:

- To control which providers are visible in the UI, modify the backend `manifest.yml` or use `appFeature().disabledTileTypes` configuration. Custom providers configuration only overrides data, not visibility.
- Default values for new tiles are controlled by `appFeature().defaultTileType` (separate from custom providers)

#### Example: Override Specific Provider

Override the OpenStreetMap provider to use custom tiles:

```json
{
  "imagery": {
    "providers": [
      {
        "id": "open_street_map",
        "url": "https://custom-tiles.example.com/{z}/{x}/{y}.png"
      }
    ]
  }
}
```

**Result**: The "open_street_map" provider uses the custom URL. Display name "OpenStreetMap" comes from backend manifest. Zoom levels and other settings use backend defaults.

**With optional settings:**

```json
{
  "imagery": {
    "providers": [
      {
        "id": "open_street_map",
        "url": "https://tiles.production.com/{z}/{x}/{y}.png",
        "credit": "© Production Tiles 2024",
        "maximumLevel": 20
      }
    ]
  }
}
```

**Result**: Same as above, but with custom attribution and higher max zoom level.

#### Example: Multiple Overrides

Override multiple providers:

```json
{
  "imagery": {
    "providers": [
      {
        "id": "google_satellite",
        "url": "https://tiles.internal.com/{z}/{x}/{y}.png"
      },
      {
        "id": "open_street_map",
        "url": "https://osm.internal.com/{z}/{x}/{y}.png"
      }
    ]
  }
}
```

**Result**: Both providers use custom URLs. Other providers use backend defaults.

#### Example: Terrain Configuration

Configure custom terrain provider:

```json
{
  "terrain": {
    "providers": [
      {
        "id": "cesium",
        "url": "https://custom-terrain.example.com/"
      }
    ]
  }
}
```

**Result**: The "cesium" terrain provider uses the custom URL.

**With additional settings:**

```json
{
  "terrain": {
    "providers": [
      {
        "id": "cesium",
        "url": "https://custom-terrain.example.com/",
        "requestVertexNormals": true,
        "requestWaterMask": false,
        "credit": "© Custom Terrain Provider"
      }
    ]
  }
}
```

#### Example: Layer Override

Configure custom Google Photorealistic 3D Tiles:

```json
{
  "layers": {
    "providers": [
      {
        "id": "google-photorealistic-3d-tiles",
        "url": "https://tile.googleapis.com/v1/3dtiles/root.json",
        "options": {
          "apiKey": "your-google-api-key"
        }
      }
    ]
  }
}
```

**Note**: Currently only `google-photorealistic-3d-tiles` is supported.

#### Example: Multi-Environment Setup

Configure different data sources for different environments:

**Production Environment:**

```json
{
  "imagery": {
    "providers": [
      {
        "id": "open_street_map",
        "url": "https://tiles.production.com/{z}/{x}/{y}.png"
      }
    ]
  }
}
```

**Staging Environment:**

```json
{
  "imagery": {
    "providers": [
      {
        "id": "open_street_map",
        "url": "https://tiles.staging.com/{z}/{x}/{y}.png"
      }
    ]
  }
}
```

**Internal Deployment:**

```json
{
  "imagery": {
    "providers": [
      {
        "id": "open_street_map",
        "url": "https://tiles.internal.company.com/{z}/{x}/{y}.png"
      },
      {
        "id": "google_satellite",
        "url": "https://satellite.internal.company.com/{z}/{x}/{y}.png"
      }
    ]
  }
}
```

**Result**: All environments see the same provider options (controlled by backend), but fetch from different URLs.

#### Example: Complete Configuration

Configure all three categories:

```json
{
  "imagery": {
    "providers": [
      {
        "id": "google_satellite",
        "url": "https://basemap.internal.com/{z}/{x}/{y}.png",
        "credit": "© Internal Tiles 2024",
        "maximumLevel": 20
      },
      {
        "id": "open_street_map",
        "url": "https://osm.internal.com/{z}/{x}/{y}.png"
      }
    ]
  },
  "terrain": {
    "providers": [
      {
        "id": "cesium",
        "url": "https://terrain.internal.com/",
        "requestVertexNormals": true
      }
    ]
  },
  "layers": {
    "providers": [
      {
        "id": "google-photorealistic-3d-tiles",
        "url": "https://tile.googleapis.com/v1/3dtiles/root.json",
        "options": {
          "apiKey": "your-google-api-key"
        }
      }
    ]
  }
}
```

## Controlling UI Option Visibility

Custom providers configuration does **not** control which options appear in the UI. To control visibility:

### Option 1: Backend Manifest (Recommended)

Edit `server/pkg/builtin/manifest.yml` to add or remove provider choices:

```yaml
- id: tile_type
  type: string
  title: Tile type
  defaultValue: google_satellite
  choices:
    - key: google_satellite
      label: Google Satellite
    - key: open_street_map
      label: OpenStreetMap
    - key: cesium_ion
      label: Cesium Ion
    - key: url
      label: URL
    # Remove unwanted options by not including them in choices
```

**Note**: The `defaultValue` shown in manifest.yml is overridden by `appFeature().defaultTileType` on the frontend. See "Default Tile Type" section below.

### Option 2: Frontend Feature Flag

Use `appFeature().disabledTileTypes` to filter options dynamically:

```typescript
// In src/services/config/appFeatureConfig.ts
export type AppFeatureConfig = {
  disabledTileTypes?: string[];
  // ... other features
};

// Example configuration
{
  "disabledTileTypes": ["black_marble", "japan_gsi_standard"]
}
```

This filters options in the UI without modifying the backend manifest.

### Option 3: Default Tile Type

Control what tile type is selected by default when creating new tiles using `appFeature().defaultTileType`:

**Open Source Version** (`src/services/config/appFeatureConfig.ts`):

```typescript
const DEFAULT_APP_FEATURE_CONFIG: AppFeatureConfig = {
  // ... other config
  defaultTileType: "open_street_map"
};
```

**Enterprise Edition** (`src/ee/featureConfig.ts`):

```typescript
export const getFeatureConfig = (): AppFeatureConfig => {
  return {
    // ... other config
    defaultTileType: "google_satellite"
  };
};
```

**How it works:**

- When users create a new tile without explicitly setting tile_type, the frontend displays the `defaultTileType` value
- Database stores empty fields array (`fields: []`)
- Only stores actual values when user explicitly changes them
- Different deployments (OSS vs EE) can have different defaults

**Note**: This is separate from custom providers - it controls the default value shown in the UI, not data source URLs.

## Technical Architecture

### Configuration Flow

```text
Environment Variable (REEARTH_WEB_CUSTOM_PROVIDERS)
         ↓
   vite.config.ts (dev server)
         ↓
   /reearth_config.json (runtime config)
         ↓
   services/config (config loading)
         ↓
   Editor Options
         ↓
   @reearth/core (3D engine applies data overrides)
```

### Integration with Core Library

**Backend to Frontend Flow:**

1. **Backend**: All provider types defined in `server/pkg/builtin/manifest.yml`
2. **Database**: Users save provider selections (validated against backend types)
3. **Frontend Config**: Environment-specific `customProviders` loaded from `reearth_config.json`
4. **Runtime Override**: Frontend applies data overrides before passing to core library
5. **Core Library**: `@reearth/core` receives final provider configuration with custom URLs

**Core Library Integration:**

Custom providers are passed through Editor options to the `@reearth/core` library, which handles:

- **Provider Initialization**: Creating imagery and terrain providers from the configuration
- **Layer Resolution**: Resolving layer data sources based on ID
- **Data Override Application**: Replacing preset provider URLs and settings with custom values
- **URL Resolution**: Resolving tile URLs with custom templates ({z}/{x}/{y}, {reverseY})
- **Error Handling**: Fallback to defaults if custom sources fail
- **Caching**: Caching tile and terrain data according to provider settings

**Example Override Process:**

1. Backend defines provider ID: `open_street_map` with default URL
2. User selects: `tile_type: "open_street_map"` (passes validation ✓)
3. Frontend loads config: `{"imagery": {"providers": [{"id": "open_street_map", "url": "https://custom.com/{z}/{x}/{y}.png"}]}}`
4. Core library creates tile provider with custom URL
5. Map displays tiles from custom server

## Related Features

Custom providers works alongside other configuration features:

### Feature Comparison

| Feature                 | Purpose                         | Scope                    | Configuration Location                        |
| ----------------------- | ------------------------------- | ------------------------ | --------------------------------------------- |
| **Custom Providers**    | Override data source URLs       | Per environment          | `REEARTH_WEB_CUSTOM_PROVIDERS` env var        |
| **Default Tile Type**   | Set default tile for new tiles  | OSS vs EE                | `appFeatureConfig.ts` / `ee/featureConfig.ts` |
| **Disabled Tile Types** | Hide tile options from UI       | OSS vs EE                | `appFeatureConfig.ts` / `ee/featureConfig.ts` |
| **Manifest Choices**    | Define all available tile types | Global (all deployments) | `server/pkg/builtin/manifest.yml`             |

### Example: Complete Configuration

**Scenario**: Internal deployment wanting to use private tile servers

1. **Backend Manifest** (defines all options):

   ```yaml
   choices:
     - key: google_satellite
     - key: open_street_map
     - key: cesium_ion
   ```

2. **Frontend Config** (OSS sets default):

   ```typescript
   defaultTileType: "open_street_map";
   disabledTileTypes: ["cesium_ion"]; // Hide Cesium Ion option
   ```

3. **Environment Config** (override data URLs):
   ```bash
   REEARTH_WEB_CUSTOM_PROVIDERS='{"imagery":{"providers":[{"id":"open_street_map","url":"https://internal-tiles.company.com/{z}/{x}/{y}.png"}]}}'
   ```

**Result**:

- Users see: "Google Satellite", "OpenStreetMap" (Cesium Ion hidden)
- New tiles default to: "OpenStreetMap"
- OpenStreetMap fetches from: Internal tile server
- Google Satellite fetches from: Default URL

## Support and Resources

### Related Documentation

- [Environment Variables Setup](../README.md#environment-configuration)
- [1Password CLI Integration](1password-setup.md)
- [Configuration System](../modules/services/config.md)
