---
title: "Layers Migration and Fallback"
category: "concept"
tags: ["layers", "migration", "fallback", "cesium", "osm-buildings", "google-photorealistic"]
last_updated: "2026-06-10"
related:
  - ./tiles-migration.md
  - ../modules/features/visualizer.md
  - ../setup/custom-providers.md
maintainers: ["Platform Team"]
---

# Layers Migration and Fallback

## Overview

The Layers Migration and Fallback system automatically processes layer configurations when scenes are loaded, ensuring graceful degradation when external services are unavailable. Unlike tiles which represent the base map imagery, layers represent data overlays like 3D buildings, terrain data, and photorealistic 3D models.

This system handles:

- **OSM Buildings Fallback** - Substituting Re:Earth buildings when Cesium Ion OSM Buildings unavailable
- **Google Photorealistic 3D Fallback** - Setting provider when requirements not met (EE only)
- **Recursive Processing** - Handling nested layer groups automatically

## Core Principles

### 1. Graceful Degradation

When external layer services are unavailable, the system automatically falls back to alternative providers:

```typescript
// Layer configured with OSM Buildings but no Cesium Ion token
{
  id: "buildings",
  type: "simple",
  data: { type: "osm-buildings" }
}

// Automatically falls back to:
{
  id: "buildings",
  type: "simple",
  data: { type: "reearth-buildings" }
}
```

### 2. Provider Selection

For layers with multiple provider options (like Google Photorealistic 3D), the system intelligently selects the best available provider:

```typescript
// Google Photorealistic without provider specified (EE environment)
{
  data: { type: "google-photorealistic" }
}

// Automatically sets provider:
{
  data: { type: "google-photorealistic", provider: "reearth" }
}
```

### 3. Recursive Processing

Layer groups can contain nested children. The system recursively processes entire layer trees:

```typescript
// Nested group structure
{
  type: "group",
  children: [
    {
      type: "group",
      children: [
        { type: "simple", data: { type: "osm-buildings" } }
      ]
    }
  ]
}

// Deeply nested layer is processed automatically
```

## Layer Types

### LayerSimple vs LayerGroup

- **LayerSimple**: Contains actual data (type: "simple")
- **LayerGroup**: Container for organizing layers (type: "group")

Only `LayerSimple` layers have a `data` property and can be migrated. `LayerGroup` layers are processed recursively to reach their children.

## How It Works

### Configuration

The migration system is configured through `LayersMigrationConfig`:

```typescript
type LayersMigrationConfig = {
  isEE: boolean;         // Whether running in EE environment
  hasAccessToken: boolean; // Whether Cesium Ion token available
};

type LayerMigrationOptions = {
  skipTypeCheck?: boolean; // Skip layer type check (for plugin API)
};
```

### Processing Flow

```text
Scene Load
    ↓
Extract Layers Array
    ↓
migrateLayers(layers, config, options)
    ↓
  Check if any layer needs migration (recursive tree scan)
    ↓
  For each layer:
    - Process current layer
    - If group, recursively process children
    ↓
  Layer-specific fallbacks:
    - OSM Buildings → Re:Earth Buildings (when no token)
    - Google Photorealistic provider → reearth (when needed, EE only)
    ↓
Return processed layers array
    ↓
Render scene with processed layers
```

## Layer Processing

### OSM Buildings Fallback

OSM Buildings from Cesium Ion require a Cesium Ion access token. When unavailable, fallback to Re:Earth Buildings:

**Trigger Condition**: `data.type === "osm-buildings"` AND no Cesium Ion token

**Fallback Action**: Change data type to `"reearth-buildings"`

**Example**:

```typescript
// Input (no Cesium Ion token)
{
  id: "city-buildings",
  type: "simple",
  data: {
    type: "osm-buildings",
    url: "https://example.com/buildings"
  }
}

// After fallback
{
  id: "city-buildings",
  type: "simple",
  data: {
    type: "reearth-buildings",
    url: "https://example.com/buildings"
  }
}
```

**Console Output**:

```text
[Layers Fallback] Layer "city-buildings": Data type "osm-buildings" → "reearth-buildings" (Cesium Ion access token required but missing)
```

**Why This Matters**: OSM Buildings provides global 3D building data from OpenStreetMap, but requires Cesium Ion access. Re:Earth Buildings provides an alternative source that works without external dependencies.

### Google Photorealistic 3D Fallback (EE Only)

Google Photorealistic 3D Tiles can use multiple providers. In EE environments, the system ensures a provider is set:

**Trigger Conditions** (EE only):

1. No provider specified, OR
2. Provider is "cesium-ion" but no token available

**Fallback Action**: Set provider to `"reearth"`

**Example 1: No Provider Specified**

```typescript
// Input (EE environment, no provider)
{
  id: "photorealistic",
  type: "simple",
  data: {
    type: "google-photorealistic"
  }
}

// After fallback
{
  id: "photorealistic",
  type: "simple",
  data: {
    type: "google-photorealistic",
    provider: "reearth"
  }
}
```

**Console Output**:

```text
[Layers Fallback] Layer "photorealistic": Setting google-photorealistic provider to "reearth" (provider not specified, EE environment)
```

**Example 2: Cesium Ion Provider Without Token**

```typescript
// Input (EE environment, cesium-ion provider but no token)
{
  id: "photorealistic",
  type: "simple",
  data: {
    type: "google-photorealistic",
    provider: "cesium-ion"
  }
}

// After fallback
{
  id: "photorealistic",
  type: "simple",
  data: {
    type: "google-photorealistic",
    provider: "reearth"
  }
}
```

**Console Output**:

```text
[Layers Fallback] Layer "photorealistic": Setting google-photorealistic provider to "reearth" (Cesium Ion access token required but missing, EE environment)
```

**Important Notes**:

- This fallback **only applies in EE environments** (`config.isEE === true`)
- In non-EE environments, google-photorealistic layers are not modified
- If provider is already "reearth", no change is made

### Recursive Group Processing

Layer groups can be nested arbitrarily deep. The system processes the entire tree:

**Example**:

```typescript
// Input
const layers = [
  {
    id: "group-1",
    type: "group",
    children: [
      {
        id: "group-2",
        type: "group",
        children: [
          {
            id: "buildings-deep",
            type: "simple",
            data: { type: "osm-buildings" }
          }
        ]
      },
      {
        id: "buildings-shallow",
        type: "simple",
        data: { type: "osm-buildings" }
      }
    ]
  }
];

// After processing (no token)
// Both deeply and shallow nested osm-buildings layers are migrated to reearth-buildings
```

**Why Recursion**: Layers can be organized in complex hierarchies. Recursive processing ensures all layers are correctly migrated regardless of nesting depth.

## Implementation Details

### Code Location

**Primary Implementation**: `src/app/features/Visualizer/utils/layersMigration.ts`

**Key Functions**:

```typescript
// Main entry point
export function migrateLayers(
  layers: Layer[] | undefined,
  config: LayersMigrationConfig,
  options?: LayerMigrationOptions
): Layer[] | undefined

// Single layer migration (also exported for plugin API)
export function migrateLayer(
  layer: Layer,
  config: LayersMigrationConfig,
  options?: LayerMigrationOptions
): Layer

// Internal helpers (exported for testing)
export const __testing__ = {
  needsLayerMigration,
  migrateLayer,
  migrateLayerRecursive,
  checkLayerTreeNeedsMigration
};
```

### Integration Point

The migration is invoked when loading layers in the Visualizer:

**Code Reference**: `src/app/features/Visualizer/Crust/Plugins/hooks/useLayers.ts`

```typescript
const processedLayers = migrateLayers(rawLayers, {
  isEE: config.featureCollection === "ee",
  hasAccessToken: !!config.cesiumIonAccessToken
});
```

### Plugin API Support

The `migrateLayer` function is exported separately for use in the plugin API, allowing plugins to apply the same fallback logic to layers they create:

```typescript
import { migrateLayer } from "@reearth/app/features/Visualizer/utils/layersMigration";

// Plugin can migrate a single layer
const processedLayer = migrateLayer(customLayer, config, { skipTypeCheck: true });
```

**Note**: `skipTypeCheck: true` allows plugins to migrate layers even if they're not strictly "simple" type layers.

## Common Patterns

### Pattern 1: Environment-Specific Processing

Handle EE vs OSS environments:

```typescript
// EE environment - both fallbacks active
const config: LayersMigrationConfig = {
  isEE: true,
  hasAccessToken: false
};
// Result: OSM buildings AND google-photorealistic are fallen back

// OSS environment - only OSM buildings fallback
const config: LayersMigrationConfig = {
  isEE: false,
  hasAccessToken: false
};
// Result: Only OSM buildings fallen back, google-photorealistic unchanged
```

### Pattern 2: Conditional Token Availability

Handle environments where token may or may not be available:

```typescript
const config: LayersMigrationConfig = {
  isEE: true,
  hasAccessToken: !!cesiumIonAccessToken
};

// With token: osm-buildings and cesium-ion provider are kept
// Without token: both are fallen back to alternatives
```

### Pattern 3: Mixed Layer Processing

Process scenes with mix of layer types:

```typescript
const layers = [
  { type: "simple", data: { type: "geojson" } },        // Not migrated
  { type: "simple", data: { type: "osm-buildings" } },  // Migrated if no token
  { type: "simple", data: { type: "3dtiles" } },        // Not migrated
  { type: "group", children: [...] }                     // Recursively processed
];

const result = migrateLayers(layers, config);
// Only layers needing migration are modified
```

### Pattern 4: Plugin API Usage

Plugins creating layers can use migration:

```typescript
// In plugin
const newLayer = {
  id: "plugin-buildings",
  type: "custom",
  data: { type: "osm-buildings" }
};

// Apply same fallback logic as core
const processed = migrateLayer(newLayer, config, {
  skipTypeCheck: true  // Allow non-standard layer types
});
```

## Best Practices

### Do's ✅

1. **Always migrate layers after loading**:

   ```typescript
   const rawLayers = await loadLayers();
   const processed = migrateLayers(rawLayers, config); // ✅ Always migrate
   renderLayers(processed);
   ```

2. **Use accurate config**:

   ```typescript
   const config = {
     isEE: featureCollection === "ee",  // ✅ Check actual environment
     hasAccessToken: !!token            // ✅ Check actual token
   };
   ```

3. **Let system handle recursion**:

   ```typescript
   // ✅ Correct - migrateLayers handles all nesting
   const processed = migrateLayers(layerTree, config);

   // ❌ Wrong - manual recursion not needed
   const processed = layers.map(l => {
     if (l.type === "group") {
       return { ...l, children: migrateLayers(l.children, config) };
     }
     return migrateLayer(l, config);
   });
   ```

4. **Monitor console warnings**:
   - Warnings indicate automatic fallbacks applied
   - Useful for understanding layer processing
   - Helps identify layers needing alternative configuration

### Don'ts ❌

1. **Don't skip migration**:

   ```typescript
   // ❌ Wrong - bypass migration
   renderLayers(rawLayers);

   // ✅ Correct - always migrate
   const processed = migrateLayers(rawLayers, config);
   renderLayers(processed);
   ```

2. **Don't modify returned layers**:

   ```typescript
   // ❌ Wrong - mutation
   const processed = migrateLayers(layers, config);
   processed[0].data.type = "custom";  // Breaks immutability

   // ✅ Correct - create new object
   const customized = processed.map((layer, i) => i === 0
     ? { ...layer, data: { ...layer.data, type: "custom" } }
     : layer
   );
   ```

3. **Don't assume migration changes layers**:

   ```typescript
   // ❌ Wrong - assume new array always returned
   const original = [...layers];
   const processed = migrateLayers(layers, config);
   // processed might === layers (same reference) if no migration needed

   // ✅ Correct - use returned value
   const processed = migrateLayers(layers, config);
   const finalLayers = processed ?? layers;
   ```

4. **Don't hardcode fallback types**:

   ```typescript
   // ❌ Wrong - manual fallback
   const layer = { data: { type: hasToken ? "osm-buildings" : "reearth-buildings" } };

   // ✅ Correct - let migration system handle it
   const layer = { data: { type: "osm-buildings" } };
   const processed = migrateLayer(layer, config);
   ```

## Testing Strategies

### Unit Tests

**Test File**: `src/app/features/Visualizer/utils/layersMigration.test.ts`

Key test categories:

```typescript
describe("layersMigration", () => {
  describe("OSM Buildings Fallback", () => {
    it("migrates osm-buildings → reearth-buildings when no token");
    it("keeps osm-buildings when token available");
    it("preserves all layer properties during migration");
  });

  describe("Google Photorealistic Fallback (EE)", () => {
    it("sets provider to reearth when no provider in EE");
    it("sets provider to reearth for cesium-ion without token in EE");
    it("keeps cesium-ion provider when token available");
    it("does not modify in non-EE environment");
    it("does not modify when provider already reearth");
  });

  describe("Recursive Processing", () => {
    it("migrates nested layers in groups");
    it("migrates deeply nested layers");
    it("handles empty children arrays");
  });

  describe("Mixed Layers", () => {
    it("handles layers with and without migration");
    it("handles both fallback types together");
  });
});
```

### Integration Tests

Test the full flow from scene load to render:

```typescript
describe("Scene loading with layer migration", () => {
  it("loads scene and applies layer fallbacks", async () => {
    const scene = {
      layers: [
        { type: "simple", data: { type: "osm-buildings" } },
        { type: "simple", data: { type: "google-photorealistic" } }
      ]
    };

    // Without token, EE environment
    const config = { isEE: true, hasAccessToken: false };

    const loaded = await loadScene(scene, config);

    // Expect both fallbacks applied
    expect(loaded.layers[0].data.type).toBe("reearth-buildings");
    expect(loaded.layers[1].data.provider).toBe("reearth");
  });
});
```

## Performance Implications

### Processing Overhead

- **Minimal cost**: O(n) where n = total layers (including nested)
- **Single tree traversal**: Each layer processed once
- **Short-circuit optimization**: Returns early if no migration needed

```typescript
// Early return when no processing needed
const needsProcessing = layers.some(layer =>
  checkLayerTreeNeedsMigration(layer, config, options)
);
if (!needsProcessing) return layers;  // Return original reference
```

### Memory Usage

- **Copy-on-write**: Only creates new objects when changes needed
- **Structural sharing**: Unchanged layers retain original references
- **Recursive copying**: Only modified branches are copied in layer tree

### Optimization Tips

1. **Reuse config objects**:

   ```typescript
   // ✅ Good - reuse config
   const config = buildConfig();
   scenes.forEach(scene =>
     migrateLayers(scene.layers, config)
   );
   ```

2. **Avoid unnecessary calls**:

   ```typescript
   // ✅ Good - cache result
   const processedLayers = useMemo(
     () => migrateLayers(layers, config),
     [layers, config]
   );
   ```

## Troubleshooting

### Issue: "OSM Buildings layer not rendering"

**Symptoms**: Black buildings or no buildings visible, console error about Cesium Ion

**Diagnosis**:

1. Check console for migration warnings
2. Verify layer was fallen back to reearth-buildings
3. Check if Re:Earth buildings service is available

**Solution**:

```typescript
// Check if fallback occurred
console.log("Original:", originalLayers);
console.log("Processed:", processedLayers);

// If fallback occurred but still not rendering:
// - Verify reearth-buildings service is configured
// - Check network tab for failed building tile requests
// - Ensure layer is visible and enabled
```

### Issue: "Google Photorealistic layer not loading (EE)"

**Symptoms**: No 3D photorealistic tiles, console warnings about provider

**Diagnosis**: Provider fallback to reearth but service not configured

**Solution**:

This is expected behavior when:

1. No Cesium Ion token provided, OR
2. No provider specified

The layer falls back to reearth provider. Ensure Re:Earth photorealistic service is configured, or provide Cesium Ion token to use cesium-ion provider.

### Issue: "Nested layers not being migrated"

**Symptoms**: Top-level layers migrated but child layers not

**Diagnosis**: Likely using `migrateLayer` instead of `migrateLayers`

**Solution**:

```typescript
// ❌ Wrong - only processes single layer
const processed = layers.map(layer => migrateLayer(layer, config));

// ✅ Correct - handles recursion automatically
const processed = migrateLayers(layers, config);
```

### Issue: "Layer fallback not happening in OSS"

**Symptoms**: Google photorealistic provider not set in open source deployment

**Diagnosis**: This is expected - google-photorealistic fallback is EE-only

**Solution**:

```typescript
// Check config
console.log("Is EE:", config.isEE);

// If OSS (isEE: false):
// - google-photorealistic fallback does not apply
// - Only OSM buildings fallback applies
// - This is intentional design
```

## Related Documentation

- [Tiles Migration and Fallback](./tiles-migration.md) - Tiles and terrain migration system
- [Visualizer Module](../modules/features/visualizer.md) - 3D visualization features
- [Custom Providers Setup](../setup/custom-providers.md) - Configuring tile and terrain providers
- [3D Rendering](./3d-rendering.md) - Cesium integration and rendering

## External Resources

- [Cesium OSM Buildings](https://cesium.com/platform/cesium-ion/content/cesium-osm-buildings/) - Cesium Ion OSM Buildings
- [Google Photorealistic 3D Tiles](https://developers.google.com/maps/documentation/tile/3d-tiles) - Google 3D Tiles documentation
- [Cesium Ion Documentation](https://cesium.com/ion/) - Cesium Ion service

## Code References

- `src/app/features/Visualizer/utils/layersMigration.ts:1-212` - Main implementation
- `src/app/features/Visualizer/utils/layersMigration.test.ts:1-777` - Comprehensive tests
- `src/app/features/Visualizer/Crust/Plugins/hooks/useLayers.ts` - Integration usage

## Changelog

### 2026-06-10 - Initial Documentation

- Created comprehensive layers migration documentation
- Documented OSM buildings and Google photorealistic fallbacks
- Added examples, patterns, and troubleshooting guide
- Documented recursive processing and plugin API usage

---

**Last Updated**: 2026-06-10
**Maintained By**: Platform Team
