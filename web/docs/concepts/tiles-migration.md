---
title: "Tiles Migration and Fallback"
category: "concept"
tags: ["tiles", "terrain", "migration", "fallback", "cesium", "google-maps"]
last_updated: "2026-06-10"
related:
  - ../modules/features/visualizer.md
  - ../setup/custom-providers.md
  - ./feature-flags.md
maintainers: ["Platform Team"]
---

# Tiles Migration and Fallback

## Overview

The Tiles Migration and Fallback system automatically processes viewer properties (tiles and terrain) when scenes are loaded, ensuring backward compatibility, graceful degradation when external services are unavailable, and compliance with third-party service requirements.

This system handles:

- **Default Application** - Applying default tile/terrain types when none specified
- **Migration** - Converting deprecated tile types to current equivalents (backward compatibility)
- **Fallback** - Substituting alternative providers when required services are unavailable
- **Compliance** - Enforcing third-party service requirements (e.g., Google Maps Terms of Service)

**Note**: This document covers tiles and terrain migration. For layer data migration (OSM Buildings, Google Photorealistic 3D, etc.), see [Layers Migration and Fallback](./layers-migration.md).

## Core Principles

### 1. Backward Compatibility

Legacy scenes continue to work without modification:

```typescript
// Old scene with deprecated tile type
{
  tiles: [{ type: "default" }]
}

// Automatically migrated to:
{
  tiles: [{ type: "cesium_ion", cesiumIonAssetId: 2 }]
}
```

### 2. Graceful Degradation

When external services are unavailable, the system automatically falls back to alternative providers:

```typescript
// Scene configured with Cesium Ion but no token available
{
  tiles: [{ type: "cesium_ion", cesiumIonAssetId: 2 }]
}

// Automatically falls back to:
{
  tiles: [{ type: "google_satellite" }]
}
```

### 3. Transparent Processing

Migrations and fallbacks happen automatically with informative console warnings:

```text
[Tiles Migration] Migrating deprecated tile type "default" to "cesium_ion" with asset ID 2
[Tiles Fallback] Cesium Ion tile (asset ID: 2) → "google_satellite" (token required but missing)
[Tiles Opacity Override] Setting opacity to 1 for Google Maps tile (Google Maps Terms of Service compliance)
```

## Key Concepts

### Migration vs Fallback

**Migration** is about backward compatibility - converting old configurations to new formats:

- Deprecated tile types → Current tile types
- Maintains original intent of the configuration

**Fallback** is about service availability - substituting when requirements aren't met:

- Cesium Ion tiles without token → Alternative providers
- Provides best-effort rendering when services unavailable

### Processing Phases

The system uses a **three-pass approach** to ensure correct processing order:

```text
Pass 1: Type Migration & Fallback
  └─ Apply defaults, migrate deprecated types, fallback unavailable services

Pass 2: Google Tiles Detection
  └─ Detect if any tiles are Google Maps tiles (after fallback)

Pass 3: Compliance Enforcement
  └─ Apply opacity overrides for Google Maps compliance
```

This order ensures that tiles which become Google tiles through fallback are correctly detected and processed.

### EE-Only Processing

Some migrations and fallbacks only apply in Enterprise Edition (EE) environments:

- **Deprecated tile migrations** - Only in EE (OSS never had these types)
- **Cesium Ion fallbacks** - Only in EE (alternative providers available)
- **Default application** - Applies in all environments

## How It Works

### Configuration

The migration system is configured through `TilesMigrationConfig`:

```typescript
type TilesMigrationConfig = {
  isEE: boolean;              // Whether running in EE environment
  defaultTileType?: string;   // Default tile type when none specified
  defaultTerrainType?: string;// Default terrain type when none specified
  hasAccessToken: boolean;    // Whether Cesium Ion token available
};
```

### Processing Flow

```text
Scene Load
    ↓
Extract ViewerProperty
    ↓
migrateViewerPropertyTiles(viewerProperty, config)
    ↓
  Pass 1: Process each tile
    - Apply defaultTileType if no type
    - Migrate deprecated types (EE only)
    - Fallback cesium_ion tiles without token (EE only)
    ↓
  Pass 2: Detect Google Maps tiles
    - Check if any tile is google_satellite or google_roadmap
    ↓
  Pass 3: Enforce compliance
    - Set opacity = 1 for all tiles if Google tiles present
    ↓
  Terrain Processing
    - Apply defaultTerrainType if no type
    - Fallback cesium terrain without token
    ↓
Return processed ViewerProperty
    ↓
Render scene with processed configuration
```

## Tile Processing

### Default Application

When a tile has no type specified, the default is applied:

```typescript
// Input
{
  tiles: [
    { id: "1" }  // No type specified
  ]
}

// With config.defaultTileType = "google_satellite"
{
  tiles: [
    { id: "1", type: "google_satellite" }
  ]
}
```

**Use Case**: Ensuring all tiles have explicit types, supporting different defaults per deployment (OSS vs EE).

### Deprecated Tile Migration (EE Only)

Legacy tile types are automatically migrated to Cesium Ion equivalents:

```typescript
// Deprecated type mapping
{
  "default":        → cesium_ion (asset ID: 2)
  "default_label":  → cesium_ion (asset ID: 3)
  "default_road":   → cesium_ion (asset ID: 4)
  "black_marble":   → cesium_ion (asset ID: 3812)
}
```

**Example**:

```typescript
// Input (legacy scene)
{
  tiles: [{ type: "default_label", opacity: 0.8 }]
}

// After migration
{
  tiles: [{
    type: "cesium_ion",
    cesiumIonAssetId: 3,
    opacity: 0.8
  }]
}
```

**Console Output**:

```text
[Tiles Migration] Migrating deprecated tile type "default_label" to "cesium_ion" with asset ID 3 (backward compatibility, EE environment)
```

### Cesium Ion Fallback (EE Only)

When Cesium Ion tiles require a token but none is available, fallback to alternative providers:

```typescript
// Fallback mapping
{
  Asset ID 2    → google_satellite
  Asset ID 3    → google_satellite
  Asset ID 4    → google_roadmap
  Asset ID 3812 → nasa_black_marble
}
```

**Example**:

```typescript
// Input (no Cesium Ion token)
{
  tiles: [{
    type: "cesium_ion",
    cesiumIonAssetId: 2
  }]
}

// After fallback
{
  tiles: [{ type: "google_satellite" }]
}
```

**Console Output**:

```text
[Tiles Fallback] Cesium Ion tile (asset ID: 2) → "google_satellite" (Cesium Ion access token required but missing)
```

### Google Maps Compliance

Google Maps Terms of Service require that their tiles cannot be blended with other map sources. The system enforces this by:

1. **Detection**: Check if any tile is `google_satellite` or `google_roadmap`
2. **Enforcement**: Set `opacity = 1` for all tiles when Google tiles present

**Example**:

```typescript
// Input (Google tile with custom opacity)
{
  tiles: [
    { type: "google_satellite", opacity: 0.7 },
    { type: "open_street_map", opacity: 0.5 }
  ]
}

// After compliance enforcement
{
  tiles: [
    { type: "google_satellite", opacity: 1 },    // Override
    { type: "open_street_map", opacity: 1 }      // Override (Google tiles present)
  ]
}
```

**Console Output**:

```text
[Tiles Opacity Override] Setting opacity to 1 for Google Maps tile (Google Maps Terms of Service compliance)
[Tiles Opacity Override] Setting opacity to 1 for tile (Google Maps tiles present) (Google Maps Terms of Service compliance)
```

**Why This Matters**: Google Maps licensing requires that their tiles are displayed without modification or blending. This automatic enforcement prevents license violations.

## Terrain Processing

### Default Application

Apply default terrain type when none specified:

```typescript
// Input
{
  terrain: { enabled: true }  // No type
}

// With config.defaultTerrainType = "reearth_terrain"
{
  terrain: { enabled: true, type: "reearth_terrain" }
}
```

### Cesium Terrain Fallback

Cesium World Terrain requires a token. When unavailable, fallback to Re:Earth terrain:

```typescript
// Input (no Cesium Ion token)
{
  terrain: { type: "cesium", enabled: true }
}

// After fallback
{
  terrain: { type: "reearth_terrain", enabled: true }
}
```

**Console Output**:

```text
[Terrain Fallback] Terrain type "cesium" → "reearth_terrain" (Cesium Ion access token required but missing)
```

**Important**: Custom Cesium Ion terrain (`type: "cesiumion"`) is **not** automatically fallen back - if the user chose a custom Ion asset and provides no token, terrain simply won't load (expected behavior).

## Implementation Details

### Code Location

**Primary Implementation**: `src/app/features/Visualizer/utils/tilesMigration.ts`

**Key Functions**:

```typescript
// Main entry point
export function migrateViewerPropertyTiles(
  viewerProperty: ViewerProperty | undefined,
  config: TilesMigrationConfig
): ViewerProperty | undefined

// Internal helpers (exported for testing)
export const __testing__ = {
  TILE_TYPE_MIGRATION_MAP,
  CESIUM_ION_ASSET_ID_FALLBACK_MAP,
  needsTileMigration,
  migrateTile,
  migrateTerrain
};
```

### Migration Maps

```typescript
// Deprecated tile type → Cesium Ion migration
const TILE_TYPE_MIGRATION_MAP = {
  default: { type: "cesium_ion", cesiumIonAssetId: 2 },
  default_label: { type: "cesium_ion", cesiumIonAssetId: 3 },
  default_road: { type: "cesium_ion", cesiumIonAssetId: 4 },
  black_marble: { type: "cesium_ion", cesiumIonAssetId: 3812 }
};

// Cesium Ion asset ID → Fallback provider
const CESIUM_ION_ASSET_ID_FALLBACK_MAP = {
  "2": "google_satellite",
  "3": "google_satellite",
  "4": "google_roadmap",
  "3812": "nasa_black_marble"
};
```

### Integration Point

The migration is invoked when loading viewer properties in the Visualizer:

```typescript
// src/app/features/Visualizer/hooks/useViewerProperty.ts
const processedProperty = migrateViewerPropertyTiles(viewerProperty, {
  isEE: config.featureCollection === "ee",
  defaultTileType: config.defaultTileType,
  defaultTerrainType: config.defaultTerrainType,
  hasAccessToken: !!config.cesiumIonAccessToken
});
```

## Frontend Integration

### Property Field Decorations

The UI layer enforces Google Maps compliance through property field decorations:

**Code Reference**: `src/app/features/Editor/Map/InspectorPanel/hooks/usePropertyDecorations.tsx:78-115`

```typescript
// Disable opacity field for Google Maps tiles
if (schemaId === "tile_opacity" && schemaGroup === "tiles") {
  const tileType = allFields.find(f => f.id === "tile_type")?.value;
  const isCurrentTileGoogle =
    tileType === "google_satellite" || tileType === "google_roadmap";

  const hasGoogleTileInList = allListItemsFields?.some(itemFields => {
    const itemType = itemFields.find(f => f.id === "tile_type")?.value;
    return itemType === "google_satellite" || itemType === "google_roadmap";
  });

  if (isCurrentTileGoogle) {
    decorations.disabled = true;
    decorations.overrideValue = 1;
    decorations.titleAdornment = (
      <Tooltip text="Disabled: Opacity adjustments are not available for Google Maps tile..." />
    );
  } else if (hasGoogleTileInList) {
    decorations.disabled = true;
    decorations.overrideValue = 1;
    decorations.titleAdornment = (
      <Tooltip text="Disabled: Opacity adjustments are not available when Google Maps tiles are present..." />
    );
  }
}
```

This ensures users cannot set opacity values that would violate compliance, with clear explanations.

## Common Patterns

### Pattern 1: Environment-Specific Defaults

Configure different defaults for OSS vs EE deployments:

```typescript
// OSS deployment - Open source tiles
const config: TilesMigrationConfig = {
  isEE: false,
  defaultTileType: "open_street_map",
  defaultTerrainType: "reearth_terrain",
  hasAccessToken: false
};

// EE deployment - Premium tiles
const config: TilesMigrationConfig = {
  isEE: true,
  defaultTileType: "google_satellite",
  defaultTerrainType: "cesium",
  hasAccessToken: !!process.env.CESIUM_ION_TOKEN
};
```

### Pattern 2: Conditional Token Availability

Handle environments where Cesium Ion token may be optional:

```typescript
const config: TilesMigrationConfig = {
  isEE: true,
  hasAccessToken: !!cesiumIonAccessToken,
  // Fallbacks will activate automatically if token missing
};
```

### Pattern 3: Testing Both Paths

Test migration with and without token availability:

```typescript
describe("Cesium Ion fallback", () => {
  it("keeps cesium_ion when token available", () => {
    const result = migrateViewerPropertyTiles(viewerProperty, {
      isEE: true,
      hasAccessToken: true  // Token available
    });
    expect(result.tiles[0].type).toBe("cesium_ion");
  });

  it("falls back to google_satellite when no token", () => {
    const result = migrateViewerPropertyTiles(viewerProperty, {
      isEE: true,
      hasAccessToken: false  // No token
    });
    expect(result.tiles[0].type).toBe("google_satellite");
  });
});
```

## Best Practices

### Do's ✅

1. **Always pass accurate config**:

   ```typescript
   const config: TilesMigrationConfig = {
     isEE: featureCollection === "ee",  // ✅ Accurate
     hasAccessToken: !!token,           // ✅ Check actual token
     defaultTileType: getDefaultTile()  // ✅ Environment-specific
   };
   ```

2. **Let the system handle immutability**:

   ```typescript
   // ✅ Migration returns new object, original unchanged
   const processed = migrateViewerPropertyTiles(original, config);
   ```

3. **Monitor console warnings**:
   - Warnings indicate automatic corrections applied
   - Useful for understanding scene processing
   - Helps identify legacy scenes needing manual updates

4. **Test all environments**:
   ```typescript
   // Test OSS, EE with token, EE without token
   ```

### Don'ts ❌

1. **Don't skip migration**:

   ```typescript
   // ❌ Wrong - bypass migration
   renderScene(rawViewerProperty);

   // ✅ Correct - always migrate
   const processed = migrateViewerPropertyTiles(rawViewerProperty, config);
   renderScene(processed);
   ```

2. **Don't modify returned objects**:

   ```typescript
   // ❌ Wrong - mutation
   const processed = migrateViewerPropertyTiles(vp, config);
   processed.tiles[0].opacity = 0.5;  // Breaks immutability

   // ✅ Correct - create new object
   const customized = {
     ...processed,
     tiles: processed.tiles.map(t => ({ ...t, opacity: 1 }))
   };
   ```

3. **Don't assume migration doesn't run**:

   ```typescript
   // ❌ Wrong - assume input = output
   const tiles = viewerProperty.tiles;
   const processed = migrateViewerPropertyTiles(viewerProperty, config);
   // tiles !== processed.tiles (might be different)

   // ✅ Correct - always use returned value
   const processed = migrateViewerPropertyTiles(viewerProperty, config);
   const tiles = processed?.tiles;
   ```

4. **Don't hardcode tile types without considering migration**:
   ```typescript
   // ❌ Wrong - creates tiles that might need migration
   const newTile = { type: "default" };  // Deprecated

   // ✅ Correct - use current types
   const newTile = { type: "cesium_ion", cesiumIonAssetId: 2 };
   ```

## Testing Strategies

### Unit Tests

**Test File**: `src/app/features/Visualizer/utils/tilesMigration.test.ts`

Key test categories:

```typescript
describe("tilesMigration", () => {
  describe("Default Application", () => {
    it("applies defaultTileType when no type specified");
    it("applies defaultTerrainType when no type specified");
    it("preserves existing types");
  });

  describe("Deprecated Tile Migration (EE)", () => {
    it("migrates default → cesium_ion (asset 2)");
    it("migrates default_label → cesium_ion (asset 3)");
    it("migrates default_road → cesium_ion (asset 4)");
    it("migrates black_marble → cesium_ion (asset 3812)");
    it("preserves other properties during migration");
  });

  describe("Cesium Ion Fallback (EE)", () => {
    it("falls back cesium_ion asset 2 → google_satellite");
    it("falls back cesium_ion asset 3 → google_satellite");
    it("falls back cesium_ion asset 4 → google_roadmap");
    it("falls back cesium_ion asset 3812 → nasa_black_marble");
    it("keeps cesium_ion when token available");
  });

  describe("Google Maps Compliance", () => {
    it("sets opacity to 1 for google_satellite");
    it("sets opacity to 1 for google_roadmap");
    it("sets opacity to 1 for all tiles when Google tiles present");
    it("preserves opacity when no Google tiles");
  });

  describe("Terrain Fallback", () => {
    it("falls back cesium → reearth_terrain when no token");
    it("keeps cesium when token available");
    it("does not fallback cesiumion (custom assets)");
  });
});
```

### Integration Tests

Test the full flow from scene load to render:

```typescript
describe("Scene loading with migration", () => {
  it("loads legacy scene and applies all migrations", async () => {
    const legacyScene = {
      property: {
        tiles: [{ type: "default", opacity: 0.5 }],
        terrain: { type: "cesium" }
      }
    };

    // Without token
    const config = { isEE: true, hasAccessToken: false };

    const loaded = await loadScene(legacyScene, config);

    // Expect: default → cesium_ion → google_satellite
    expect(loaded.property.tiles[0].type).toBe("google_satellite");
    expect(loaded.property.tiles[0].opacity).toBe(1);  // Compliance

    // Expect: cesium → reearth_terrain
    expect(loaded.property.terrain.type).toBe("reearth_terrain");
  });
});
```

## Performance Implications

### Processing Overhead

- **Minimal cost**: O(n) where n = number of tiles
- **Single pass**: Each tile processed once per phase
- **Short-circuit optimization**: Returns early if no processing needed

```typescript
// Early return when no processing needed
if (!tilesNeedProcessing && !terrainNeedsProcessing) {
  return viewerProperty;  // Return original reference
}
```

### Memory Usage

- **Copy-on-write**: Only creates new objects when changes needed
- **Structural sharing**: Unchanged tiles retain original references
- **No accumulation**: Processing happens once on scene load

### Optimization Tips

1. **Reuse config objects**:

   ```typescript
   // ✅ Good - reuse config
   const config = buildConfig();
   scenes.forEach(scene =>
     migrateViewerPropertyTiles(scene.property, config)
   );
   ```

2. **Avoid unnecessary calls**:
   ```typescript
   // ✅ Good - cache result
   const processed = useMemo(
     () => migrateViewerPropertyTiles(viewerProperty, config),
     [viewerProperty, config]
   );
   ```

## Troubleshooting

### Issue: "Tiles not loading after scene load"

**Symptoms**: Black screen, missing tiles, console errors about tile providers

**Diagnosis**:

1. Check console for migration warnings
2. Verify Cesium Ion token if using `cesium_ion` tiles
3. Check network tab for failed tile requests

**Solution**:

```typescript
// Check if tiles were migrated
console.log("Original:", originalProperty);
console.log("Processed:", processedProperty);

// Verify token availability
console.log("Has token:", config.hasAccessToken);

// If fallback occurred but tiles still not loading:
// - Check that fallback provider is configured correctly
// - Verify API keys for Google Maps, etc.
```

### Issue: "Opacity changes not applying"

**Symptoms**: Opacity slider disabled, value always shows 1

**Diagnosis**: Google Maps tiles present in scene

**Solution**:

This is expected behavior for Google Maps compliance. The opacity field is automatically:

- Disabled in the UI
- Overridden to value 1
- Shown with informative tooltip

To change opacity:

1. Remove Google Maps tiles from scene, OR
2. Accept that opacity must be 1 when Google tiles present

### Issue: "Legacy tiles showing wrong imagery"

**Symptoms**: Tiles migrated but showing different imagery than before

**Diagnosis**: This is expected - deprecated tiles are migrated to current equivalents

**Resolution**:

1. Check console for migration warnings
2. Verify the migration mapping is correct
3. If different imagery is not acceptable, update scene to use specific tile provider instead of deprecated type

### Issue: "Migration not happening in OSS environment"

**Symptoms**: Deprecated tiles not migrated in open source deployment

**Diagnosis**: Most migrations are EE-only

**Solution**:

```typescript
// Check config
console.log("Is EE:", config.isEE);

// If OSS (isEE: false):
// - Deprecated tile migrations don't apply
// - Cesium Ion fallbacks don't apply
// - Only default application and Google compliance apply
```

## Related Documentation

- [Layers Migration and Fallback](./layers-migration.md) - Layers migration system (OSM buildings, Google photorealistic)
- [Visualizer Module](../modules/features/visualizer.md) - 3D visualization features
- [Custom Providers Setup](../setup/custom-providers.md) - Configuring tile and terrain providers
- [Feature Flags](./feature-flags.md) - Configuration system for features
- [3D Rendering](./3d-rendering.md) - Cesium integration and rendering

## External Resources

- [Cesium Ion Documentation](https://cesium.com/ion/) - Cesium Ion tile service
- [Google Maps Platform Terms](https://cloud.google.com/maps-platform/terms) - Google Maps licensing
- [OpenStreetMap Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) - OSM tile policy

## Code References

- `src/app/features/Visualizer/utils/tilesMigration.ts` - Main implementation
- `src/app/features/Visualizer/utils/tilesMigration.test.ts` - Comprehensive tests
- `src/app/features/Editor/Map/InspectorPanel/hooks/usePropertyDecorations.tsx` - UI enforcement
- `src/services/i18n/translations/en.yml` - User-facing messages

## Changelog

### 2026-06-10 - Initial Documentation

- Created comprehensive tiles migration documentation
- Documented all migration types, fallbacks, and compliance rules
- Added examples, patterns, and troubleshooting guide

---

**Last Updated**: 2026-06-10
**Maintained By**: Platform Team
