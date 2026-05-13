# Custom Providers Configuration

## Overview

Re:Earth Visualizer supports custom providers that allow you to override default imagery, terrain, and layer providers. This feature enables integration with private tile servers, custom terrain data, or specialized geospatial services.

## Features

Custom providers can override the following:

- **Imagery Tile Providers**: Override preset tile providers with custom URLs (supports multiple overrides)
- **Terrain Providers**: Override preset terrain providers with custom data sources (supports multiple overrides)
- **Layer Sources**: Configure custom layer sources (currently supports: `google-photorealistic-3d-tiles`)

**Important**: This configuration allows you to **override** or **remove** preset providers only. You cannot add entirely new provider types. The available provider IDs are defined in `server/pkg/builtin/manifest.yml`.

## Use Cases

### Private Tile Servers

Organizations with private map tile infrastructure can configure Re:Earth to use their internal tile servers instead of public providers.

### Custom Terrain Data

Projects requiring specialized terrain data (high-resolution DEMs, bathymetry, etc.) can configure custom terrain providers.

### Air-Gapped Deployments

Environments without internet access can configure Re:Earth to use locally hosted tile and terrain services.

### Regional Data Compliance

Organizations with data sovereignty requirements can ensure all geospatial data comes from approved, region-specific sources.

## Configuration

Custom providers are configured using the `REEARTH_WEB_CUSTOM_DATA_SOURCES` environment variable.

### Environment Variable

**Variable Name**: `REEARTH_WEB_CUSTOM_DATA_SOURCES`

**Format**: JSON string

**Example**:

```bash
REEARTH_WEB_CUSTOM_DATA_SOURCES='{ ... }'
```

### How It Works

1. **Define the Configuration**: Set `REEARTH_WEB_CUSTOM_DATA_SOURCES` in your `.env`, `.env.local`, or `.env.op` file
2. **Development Loading**: Configuration is loaded via vite.config.ts when starting the dev server
3. **Runtime Injection**: The configuration is injected into `/reearth_config.json`
4. **Editor Integration**: Custom providers are passed to Editor options
5. **Core Library**: @reearth/core receives the configuration and applies the overrides

### Key Features

- **Multiple Overrides**: Each category (imagery, terrain, layers) supports multiple override configurations
- **Secure Storage**: Can be stored in 1Password for sensitive configurations (see [1Password CLI Integration](1password-setup.md))
- **Local Overrides**: Use `.env.local` to test custom configurations locally

### Configuration Format

The configuration uses a JSON structure with three main categories: `imagery`, `terrain`, and `layers`.

**For `imagery` and `terrain` categories:**

- **`providers`** array: Override specific preset providers by matching their `id`. Any provider ID not in this array remains unchanged.
- **`remove`** array: Remove specific preset providers by listing their `id`. These providers will not be available to users.

**Important**: You can only override or remove **preset** providers. Adding entirely new provider types is not supported. All provider IDs must match those defined in `server/pkg/builtin/manifest.yml`.

**For `layers` category:**

- Simple array of layer configurations (no override/remove logic).

#### Structure

```json
{
  "imagery": {
    "providers": [
      {
        "id": "string",
        "name": "string (optional)",
        "nameJa": "string (optional)",
        "url": "string",
        "credit": "string (optional)",
        "maximumLevel": "number (optional, default: 18)",
        "minimumLevel": "number (optional, default: 0)"
      }
    ],
    "remove": ["string (optional)"]
  },
  "terrain": {
    "providers": [
      {
        "id": "string",
        "name": "string (optional)",
        "nameJa": "string (optional)",
        "url": "string",
        "requestVertexNormals": "boolean (optional, default: false)",
        "requestWaterMask": "boolean (optional, default: false)",
        "credit": "string (optional)"
      }
    ],
    "remove": ["string (optional)"]
  },
  "layers": [
    {
      "type": "google-photorealistic-3d-tiles",
      "url": "string",
      "options": {}
    }
  ]
}
```

#### Configuration Options

**Imagery Providers**:

- **`id`** (required): Unique identifier for this provider
- **`name`** (optional): Display name for this provider
- **`nameJa`** (optional): Japanese display name for this provider
- **`url`** (required): URL template with placeholders like `{z}/{x}/{y}` for XYZ tiles or `{z}/{x}/{reverseY}` for TMS
- **`credit`** (optional): Attribution text (e.g., "© OpenStreetMap")
- **`maximumLevel`** (optional): Maximum zoom level (default: 18)
- **`minimumLevel`** (optional): Minimum zoom level (default: 0)

**Terrain Providers**:

- **`id`** (required): Unique identifier for this provider
- **`name`** (optional): Display name for this provider
- **`nameJa`** (optional): Japanese display name for this provider
- **`url`** (required): Base URL to terrain tile service
- **`requestVertexNormals`** (optional): Enable vertex normals for better lighting (default: false)
- **`requestWaterMask`** (optional): Enable water mask for water rendering (default: false)
- **`credit`** (optional): Attribution text

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

#### Provider Override and Remove

**How it works:**

- **`providers` array**: Override specific preset providers by matching their `id`
  - Any provider with an `id` matching a preset will replace that preset
  - Preset providers not listed here remain unchanged
  - Example: Override "default" to point to your custom tile server
  - **Note**: You can only override existing preset provider IDs, not create new ones

- **`remove` array**: Remove preset providers by listing their `id`
  - These providers will be hidden from users
  - Example: Remove "black_marble" and "japan_gsi_standard" from available options

**Preset Provider IDs** can be found in `server/pkg/builtin/manifest.yml`.

**Important Limitation**: You cannot add entirely new provider types. All provider IDs in the `providers` array must match preset IDs defined in the manifest. To use custom tile URLs, override an existing provider (like "default") or use the preset "url" provider type.

**Note**: The `layers` category currently only supports one layer type: `google-photorealistic-3d-tiles`.

#### Example: Override Specific Provider

Override the default provider to use custom tiles:

```json
{
  "imagery": {
    "providers": [
      {
        "id": "default",
        "name": "Custom Default Tiles",
        "nameJa": "カスタムデフォルトタイル",
        "url": "https://custom-tiles.example.com/{z}/{x}/{y}.png",
        "credit": "© Custom Tiles",
        "maximumLevel": 18
      }
    ]
  }
}
```

**Result**: The "default" provider now points to custom tiles. Other defaults (open_street_map, black_marble, url, etc.) remain available.

#### Example: Override and Remove

Override one provider and remove unwanted ones:

```json
{
  "imagery": {
    "providers": [
      {
        "id": "default",
        "name": "Internal Tiles",
        "nameJa": "内部タイル",
        "url": "https://tiles.internal.com/{z}/{x}/{y}.png",
        "credit": "© Internal Tiles"
      }
    ],
    "remove": ["black_marble", "japan_gsi_standard"]
  }
}
```

**Result**:

- "default" provider uses custom tiles
- "black_marble" and "japan_gsi_standard" are hidden
- Other defaults (open_street_map, url, etc.) remain available

#### Example: Terrain Configuration

Configure custom terrain provider:

```json
{
  "terrain": {
    "providers": [
      {
        "id": "cesium",
        "name": "Custom Cesium Terrain",
        "nameJa": "カスタムCesium地形",
        "url": "https://custom-terrain.example.com/",
        "requestVertexNormals": true,
        "requestWaterMask": false,
        "credit": "© Custom Terrain Provider"
      }
    ]
  }
}
```

**Result**: The "cesium" terrain provider now points to custom terrain data.

#### Example: Layer Override

Configure custom Google Photorealistic 3D Tiles:

```json
{
  "layers": [
    {
      "type": "google-photorealistic-3d-tiles",
      "url": "https://tile.googleapis.com/v1/3dtiles/root.json",
      "options": {
        "apiKey": "your-google-api-key"
      }
    }
  ]
}
```

**Note**: Currently only `google-photorealistic-3d-tiles` is supported. More layer types will be added in future releases.

#### Example: Complete Configuration

Configure all three categories:

```json
{
  "imagery": {
    "providers": [
      {
        "id": "default",
        "name": "Internal Basemap",
        "nameJa": "内部ベースマップ",
        "url": "https://basemap.internal.com/{z}/{x}/{y}.png",
        "credit": "© Internal Tiles",
        "maximumLevel": 18
      },
      {
        "id": "open_street_map",
        "name": "Custom OSM",
        "nameJa": "カスタムOSM",
        "url": "https://osm.internal.com/{z}/{x}/{y}.png",
        "credit": "© OpenStreetMap Contributors"
      }
    ],
    "remove": ["black_marble", "japan_gsi_standard"]
  },
  "terrain": {
    "providers": [
      {
        "id": "cesium",
        "name": "High Resolution Terrain",
        "nameJa": "高解像度地形",
        "url": "https://terrain.internal.com/",
        "requestVertexNormals": true,
        "credit": "© Internal Terrain Data"
      }
    ]
  },
  "layers": [
    {
      "type": "google-photorealistic-3d-tiles",
      "url": "https://tile.googleapis.com/v1/3dtiles/root.json",
      "options": {
        "apiKey": "your-google-api-key"
      }
    }
  ]
}
```

**Result**:

- **Imagery**: "default" and "open_street_map" use custom URLs; "black_marble" and "japan_gsi_standard" removed; "url" and other defaults remain available
- **Terrain**: "cesium" uses custom terrain data; other terrain providers remain available
- **Layers**: Custom Google 3D Tiles configuration

## Technical Architecture

### Configuration Flow

```text
Environment Variable (REEARTH_WEB_CUSTOM_DATA_SOURCES)
         ↓
   vite.config.ts (dev server)
         ↓
   /reearth_config.json (runtime config)
         ↓
   services/config (config loading)
         ↓
   Editor Options
         ↓
   @reearth/core (3D engine)
```

### Integration with Core Library

Custom providers are passed through Editor options to the `@reearth/core` library, which handles:

- **Provider Initialization**: Creating imagery and terrain providers from the configuration
- **Layer Resolution**: Resolving layer data sources based on type
- **Error Handling**: Fallback to defaults if custom sources fail
- **Caching**: Caching tile and terrain data according to provider settings

## Support and Resources

### Related Documentation

- [Environment Variables Setup](../README.md#environment-configuration)
- [1Password CLI Integration](1password-setup.md)
- [Configuration System](../CLAUDE.md#configuration-system)

## Implementation Status

This feature is currently under development.

### Designed ✓

- [x] Configuration format and structure (JSON with three categories)
- [x] Override by ID logic: match provider ID and replace
- [x] Remove array: hide specific default providers
- [x] Imagery provider options (id, name, nameJa, url, credit, maximumLevel, minimumLevel)
- [x] Terrain provider options (id, name, nameJa, url, requestVertexNormals, requestWaterMask, credit)
- [x] Layer support (google-photorealistic-3d-tiles)
- [x] Multiple providers per category
- [x] Internationalization support (Japanese names)
- [x] Environment variable configuration (REEARTH_WEB_CUSTOM_DATA_SOURCES)

### To Be Implemented

- [ ] Configuration loading in services/config
- [ ] Validation and error handling
- [ ] Integration with Editor options
- [ ] Pass configuration to @reearth/core library
- [ ] URL template processing for imagery
- [ ] Terrain provider initialization
- [ ] Override by ID matching logic
- [ ] Remove provider filtering logic
- [ ] Fallback behavior when custom sources fail
- [ ] Unit tests and integration tests
