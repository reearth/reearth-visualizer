---
title: "Workbench Release Strategy"
last_updated: "2026-10-05"
related:
  - ../architecture/overview.md
  - ../reference/commands.md
maintainer: "Platform Team"
---

## Overview

The Workbench is a standalone, editor-less viewer for local plugin development. This guide documents the release strategy that ensures version alignment with the main application while providing flexibility during active development.

## Architecture

### Build Isolation

The Workbench has complete build isolation from the main application:

```text
Main Application              Workbench
├─ vite.config.ts            ├─ vite.workbench.config.ts
├─ index.html                ├─ workbench.html
├─ dist/                     ├─ dist-workbench/
└─ Release: v1.0.0           └─ Artifact in v1.0.0
```

**Key Configuration Differences** (`vite.workbench.config.ts:30`):

| Config | Main App | Workbench |
| ------ | -------- | --------- |
| `base` | `/` | `./` (relative paths) |
| `outDir` | `dist` | `dist-workbench` |
| `entry` | `index.html` | `workbench.html` |
| Server plugins | config, serverHeaders | None (runtime only) |

### Shared Core Components

The Workbench shares critical dependencies with the main application:

- **`@reearth/core`** (`package.json:136`) - Core 3D engine and visualization
- **Plugin API** (`src/app/features/Visualizer/Crust/Plugins/pluginAPI/constaint.ts:1`) - Plugin runtime interface
- **UI Components** - Shared React components

**Critical Constraint**: Version alignment is required to ensure plugin compatibility between Workbench development and main application runtime.

## Release Strategy

### Two-Track Release System

#### 1. Nightly Builds (Development Phase)

**Purpose**: Rapid iteration during active development

**Trigger**: Automatic on push to `main` branch

**Workflow**: `.github/workflows/build_workbench.yml` (modified for nightly)

**Output**:

- Tag: `workbench-nightly` (updated in place)
- Release: Marked as `prerelease: true`
- Artifact: `reearth-viz-workbench_nightly.tar.gz`
- Frequency: On changes to `web/**` (excluding docs) pushed to main

**Use Case**:

```bash
# CLI downloads nightly for active development
reearth-cli workbench --version nightly
```

#### 2. Stable Releases (Aligned with Main App)

**Purpose**: Production-ready releases with guaranteed version compatibility

**Trigger**: Automatic during main application release

**Workflow**: `.github/workflows/release.yml` (enhanced with Workbench build)

**Output**:

- Tag: Same as main app (e.g., `v1.0.0`)
- Release: Same GitHub Release as main app
- Artifacts in release:
  - `reearth-web_v1.0.0.tar.gz` (main app)
  - `reearth-viz-workbench_v1.0.0.tar.gz` (Workbench)

**Version Alignment**:

```text
Main App v1.0.0
  ├─ @reearth/core: 0.0.7-alpha.79
  ├─ Plugin API: 2.1.0
  └─ Workbench v1.0.0 (same dependencies)
```

### Implementation Design

#### Nightly Workflow

```yaml
# .github/workflows/build_workbench.yml
name: Build Workbench Nightly

on:
  push:
    branches: [main]
    paths:
      - 'web/**'
  workflow_dispatch:

jobs:
  build-nightly:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - name: Build workbench
        run: yarn build:workbench
        env:
          REEARTH_WORKBENCH_VERSION: nightly

      - name: Create archive
        run: |
          cd dist-workbench
          tar -czf ../reearth-viz-workbench_nightly.tar.gz .

      - name: Release nightly
        uses: ncipollo/release-action@v1
        with:
          tag: workbench-nightly
          name: "Workbench Nightly"
          prerelease: true
          makeLatest: false
          allowUpdates: true
          artifacts: reearth-viz-workbench_nightly.tar.gz
```

#### Stable Release Integration

**Important**: This does NOT modify the existing release process. It only adds a new job that runs after the main app release completes and attaches workbench artifacts to the same release.

```yaml
# .github/workflows/release.yml
# Add this new job - do NOT modify existing release job
jobs:
  # ... existing release job (unchanged) ...

  build-workbench:
    needs: release  # Runs AFTER main app release completes
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: web
    steps:
      - uses: actions/checkout@v7
        with:
          ref: v${{ needs.release.outputs.version }}

      - name: Install dependencies
        run: yarn install --immutable

      - name: Build workbench
        run: yarn build:workbench
        env:
          REEARTH_WORKBENCH_VERSION: v${{ needs.release.outputs.version }}
          REEARTH_WORKBENCH_COMMIT: ${{ needs.release.outputs.sha }}

      - name: Create archive
        run: |
          cd dist-workbench
          tar -czf ../reearth-viz-workbench_v${{ needs.release.outputs.version }}.tar.gz .
          cd ..
          sha256sum reearth-viz-workbench_v${{ needs.release.outputs.version }}.tar.gz > \
            reearth-viz-workbench_v${{ needs.release.outputs.version }}.tar.gz.sha256

      - name: Add to release
        uses: ncipollo/release-action@v1
        with:
          tag: v${{ needs.release.outputs.version }}
          artifacts: |
            web/reearth-viz-workbench_v${{ needs.release.outputs.version }}.tar.gz
            web/reearth-viz-workbench_v${{ needs.release.outputs.version }}.tar.gz.sha256
          allowUpdates: true
```

## Manifest Structure

### Generated Manifest

The manifest (`dist-workbench/workbench-manifest.json`) is generated by `bin/generate-workbench-manifest.js:1`:

```json
{
  "version": "v1.0.0",
  "pluginApiVersion": "2.1.0",
  "commit": "abc123def456"
}
```

**Fields**:

- `version`: Workbench version
  - Stable releases: Matches main app version (e.g., `v1.0.0`)
  - Nightly builds: Always `nightly`
- `pluginApiVersion`: From `constaint.ts:1` - Used for plugin compatibility checks
- `commit`: Git SHA for traceability

**Note**: Since workbench is released as an artifact in main app releases, the `version` field directly indicates compatibility - no separate compatibility field needed.

### Manifest Generation

**Script**: `web/bin/generate-workbench-manifest.js`

**Inputs** (priority order):

1. `REEARTH_WORKBENCH_VERSION` env var (CI)
2. `GITHUB_REF_NAME` (for tagged builds)
3. `package.json` version (fallback for local builds)

**Plugin API Version**:

Extracted from source: `src/app/features/Visualizer/Crust/Plugins/pluginAPI/constaint.ts:1`

```typescript
export const REEATH_PLUGIN_API_VERSION = "2.1.0";
```

## CLI Integration Guide

### Download URLs

#### Latest Stable

```text
GET https://api.github.com/repos/reearth/reearth-visualizer/releases/latest

Filter assets: name matches "reearth-viz-workbench_*.tar.gz"
Download: asset.browser_download_url
```

#### Nightly

```text
GET https://api.github.com/repos/reearth/reearth-visualizer/releases/tags/workbench-nightly

Filter assets: name is "reearth-viz-workbench_nightly.tar.gz"
Download: asset.browser_download_url
```

#### Specific Version

```text
https://github.com/reearth/reearth-visualizer/releases/download/v1.0.0/reearth-viz-workbench_v1.0.0.tar.gz
```

### Caching Strategy

**Recommended cache structure**:

```text
~/.reearth-cli/workbench/
├── nightly/
│   ├── workbench.html
│   ├── workbench-manifest.json
│   └── static/
├── v1.0.0/
│   ├── workbench.html
│   ├── workbench-manifest.json
│   └── static/
└── current -> v1.0.0  (symlink to active version)
```

### Version Selection Logic

```javascript
async function selectWorkbenchVersion(options) {
  if (options.version === 'nightly') {
    return downloadNightly();
  }

  if (options.version) {
    // Specific version requested
    return downloadVersion(options.version);
  }

  // Default: latest stable (not prerelease)
  const releases = await fetchReleases();
  const stable = releases.find(r =>
    !r.prerelease &&
    r.assets.some(a => a.name.includes('workbench'))
  );

  return downloadVersion(stable.tag_name);
}
```

### Checksum Verification

**Always verify downloads**:

```bash
# Download checksum file
wget https://github.com/reearth/reearth-visualizer/releases/download/v1.0.0/reearth-viz-workbench_v1.0.0.tar.gz.sha256

# Verify
sha256sum -c reearth-viz-workbench_v1.0.0.tar.gz.sha256
# Expected output: reearth-viz-workbench_v1.0.0.tar.gz: OK
```

## Release Checklist

### Pre-Release (Development Phase)

- [ ] Verify nightly builds are working
- [ ] Test nightly with latest plugin API changes
- [ ] Update plugin API version in `constaint.ts:1` if changed

### Release Process (Production)

**Automated** - Workbench is built and released automatically when main app releases:

1. Main app release triggers and completes normally (`.github/workflows/release.yml` - **unchanged**)
2. New `build-workbench` job runs after main app release completes
3. Workbench artifacts **added to the existing release** (not a new release)
4. Version numbers automatically aligned

**Key Point**: The main app release process remains completely unchanged. Workbench is simply an additional artifact attached to the same release.

### Post-Release Verification

- [ ] Verify both artifacts exist in release:
  - `reearth-web_v1.0.0.tar.gz`
  - `reearth-viz-workbench_v1.0.0.tar.gz`
- [ ] Download and verify checksum
- [ ] Extract and check `workbench-manifest.json`
- [ ] Test workbench functionality:

  ```bash
  cd workbench_v1.0.0
  python3 -m http.server 8080
  # Visit http://localhost:8080/workbench.html
  ```

- [ ] Verify plugin API version matches main app

## Troubleshooting

### Version Mismatch Errors

**Symptom**: Plugins work in Workbench but fail in main app (or vice versa)

**Cause**: Using mismatched versions

**Solution**:

```bash
# Check versions
cat ~/.reearth-cli/workbench/current/workbench-manifest.json

# Force update to latest stable
reearth-cli workbench --update
```

### Nightly Build Failed

**Check**:

1. GitHub Actions workflow status
2. Recent commits to `web/` directory
3. Build logs in Actions tab

**Common causes**:

- TypeScript compilation errors
- Missing dependencies
- Vite configuration issues

### Stable Release Missing Workbench

**Check**:

1. Was `build-workbench` job executed?
2. Check job logs for errors
3. Verify workflow dependencies configured correctly

**Recovery**:

Re-run the failed `build-workbench` job from the release workflow in GitHub Actions UI. The nightly workflow only publishes to `workbench-nightly` and cannot create stable releases.

## Migration from Old Approach

### Before (Independent Releases)

```text
GitHub Releases:
├─ workbench-v2.3.4  (independent)
├─ v1.0.0            (main app)
├─ workbench-v2.3.3
└─ v0.9.0
```

**Problems**:

- Version confusion (which workbench for which app?)
- Potential incompatibility
- Release list clutter

### After (Aligned Releases)

```text
GitHub Releases:
├─ workbench-nightly (prerelease, updated frequently)
├─ v1.0.0
│   ├─ reearth-web_v1.0.0.tar.gz
│   └─ reearth-viz-workbench_v1.0.0.tar.gz
└─ v0.9.0
    ├─ reearth-web_v0.9.0.tar.gz
    └─ reearth-viz-workbench_v0.9.0.tar.gz
```

**Benefits**:

- Clear version alignment
- Guaranteed compatibility
- Clean release list
- Flexibility during development (nightly)

## Best Practices

### For Workbench Development

1. **Use nightly during active development**

   ```bash
   reearth-cli workbench --version nightly
   ```

2. **Test against stable before main app release**

   Build both locally and verify compatibility

3. **Update plugin API version** in `constaint.ts` when making breaking changes

### For CLI Implementation

1. **Default to stable** - Users should get stable version unless explicitly requesting nightly

2. **Cache aggressively** - Workbench changes infrequently once stable

3. **Verify checksums** - Always verify downloads for security

4. **Read manifest** - Use manifest for compatibility checks and version display

### For Release Management

1. **Stable releases are automatic** - No manual intervention needed

2. **Nightly is for development** - Not for production use

3. **Monitor build status** - Ensure nightly builds succeed

4. **Test plugin compatibility** - When plugin API changes, test in both workbench and main app

## Related Documentation

- [Commands Reference](../reference/commands.md) - Build commands including `yarn build:workbench`
- [Architecture Overview](../architecture/overview.md) - System architecture context
- [Plugin System](../modules/features/plugin-system.md) - Plugin architecture and API

## Changelog

### 2026-10-05 - Release Strategy Redesign

- Moved from independent releases to aligned releases
- Added nightly build system for development
- Updated workflows for automatic workbench inclusion
- Enhanced manifest with compatibility information

---

**Last Updated**: 2026-10-05
**Maintained By**: Platform Team
**Questions?** Open an issue or contact the platform team
