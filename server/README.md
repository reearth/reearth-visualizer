[![ci-server](https://github.com/reearth/reearth-visualizer/actions/workflows/ci_server.yml/badge.svg)](https://github.com/reearth/reearth-visualizer/actions/workflows/ci_server.yml) [![codecov](https://codecov.io/gh/reearth/reearth/branch/main/graph/badge.svg?flag=server)](https://codecov.io/gh/reearth/reearth)

# reearth/server

A back-end API server application for Re:Earth

## Data Structure

```mermaid
erDiagram
    Workspace ||--o{ Project : contains

    Project ||--|| Scene : "1:1"
    Project ||--o| ProjectMetadata : has

    Scene ||--o| Story : "1:1 (in practice)"
    Scene ||--o{ NLSLayer : contains
    Scene ||--o{ LayerStyle : contains
    Scene ||--o{ Widget : contains
    Scene ||--o{ Plugin : installed
    Scene ||--|| Property : "scene property"

    Story ||--o{ StoryPage : contains
    StoryPage ||--o{ StoryBlock : contains

    NLSLayer ||--o| SketchInfo : "optional"
    NLSLayer ||--o| Infobox : "optional"
    NLSLayerGroup ||--o{ NLSLayer : children

    SketchInfo ||--|| FeatureCollection : has
    FeatureCollection ||--o{ Feature : contains
    Feature ||--|| Geometry : has

    Infobox ||--o{ InfoboxBlock : contains

    Widget }o--|| Plugin : references
    StoryBlock }o--|| Plugin : references

    Workspace {
        WorkspaceID id
    }
    Project {
        ProjectID id
        WorkspaceID workspace
        SceneID scene
        string name
        string description
        string visibility
    }
    ProjectMetadata {
        ProjectID project
        string license
        string readme
        string[] topics
    }
    Scene {
        SceneID id
        ProjectID project
        WorkspaceID workspace
        PropertyID property
    }
    Story {
        StoryID id
        SceneID scene
        ProjectID project
    }
    StoryPage {
        PageID id
        PropertyID property
        NLSLayerID[] layers
    }
    StoryBlock {
        BlockID id
        PluginID plugin
        ExtensionID extension
        PropertyID property
    }
    NLSLayer {
        NLSLayerID id
        SceneID scene
        bool isSketch
    }
    NLSLayerGroup {
        NLSLayerID id
        NLSLayerID[] children
    }
    SketchInfo {
        map customPropertySchema
    }
    FeatureCollection {
        Feature[] features
    }
    Feature {
        FeatureID id
        string type
        map properties
    }
    Geometry {
        string type
        coordinates coordinates
    }
    LayerStyle {
        StyleID id
        SceneID scene
        string name
        map value
    }
    Widget {
        WidgetID id
        PluginID plugin
        ExtensionID extension
        PropertyID property
    }
    Plugin {
        PluginID id
        string name
        Extension[] extensions
    }
    Infobox {
        PropertyID property
    }
    InfoboxBlock {
        BlockID id
        PluginID plugin
        ExtensionID extension
        PropertyID property
    }
    Property {
        PropertyID id
        PropertySchemaID schema
    }
```

> **Note:**
> - **Project : Scene : Story = 1 : 1 : 1** in practice (code allows 1:Many for Story, but only one is used)
> - **SketchInfo** is optional per NLSLayer — not all layers have sketch/features
> - **NLSLayerGroup** is a subtype of NLSLayer that can contain child NLSLayers (hierarchical)
> - **Property** is the shared dynamic configuration system — referenced by Scene, Widget, Plugin, StoryBlock, StoryPage, Infobox, InfoboxBlock

## Architecture

The development environment runs the following containers via Docker Compose:

```mermaid
graph TB
    subgraph host["Host Machine"]
        Web["Web (Frontend)<br/>:3000"]
    end

    subgraph docker["Docker Network: reearth"]
        Visualizer["reearth-visualizer-dev<br/>(Go + Air hot reload)<br/>:8080"]
        Accounts["reearth-accounts-api<br/>(reearth/reearth-accounts-api:latest)<br/>:8090"]
        Cerbos["reearth-cerbos<br/>(cerbos/cerbos:0.40.0)<br/>:3593"]
        Mongo["reearth-mongo<br/>(mongo:7)<br/>:27017"]
        GCS["reearth-gcs<br/>(fake-gcs-server:1.52.1)<br/>:4443"]
    end

    Web -- "API requests" --> Visualizer
    Visualizer --> Mongo
    Visualizer --> GCS
    Visualizer --> Accounts
    Accounts --> Mongo
    Accounts --> Cerbos
```

| Container | Image | Port | Description |
| --- | --- | --- | --- |
| reearth-visualizer-dev | (local build) | 8080 | Visualizer API server with hot reload |
| reearth-accounts-api | reearth/reearth-accounts-api:latest | 8090 | User/workspace management API |
| reearth-cerbos | cerbos/cerbos:0.40.0 | 3593 | Authorization policy engine |
| reearth-mongo | mongo:7 | 27017 | MongoDB (shared by visualizer and accounts) |
| reearth-gcs | fsouza/fake-gcs-server:1.52.1 | 4443 | Fake GCS for local asset storage |

## Development

### Starting Services

#### Method 1: Using Docker Hub image (default)

Start all backend services with a single command:

```bash
make d-run
```

This brings up all required containers with their dependencies: **visualizer** + **accounts API** + **Cerbos** + **MongoDB** + **GCS**

This method uses the public image `reearth/reearth-accounts-api:latest` from Docker Hub.

To stop all services:

```bash
make d-down
```

To check the accounts API logs:

```bash
make d-logs-accounts
```

---

#### Method 2: Local accounts development

If you are developing `reearth-accounts` locally, you can run it from source instead of the Docker Hub image.

**Terminal 1** — Start visualizer without accounts (visualizer + mongo + gcs only):

```bash
make d-run-standalone
```

**Terminal 2** — Clone and start accounts API from source:

```bash
git clone https://github.com/reearth/reearth-accounts.git
cd reearth-accounts/server
cp .env.docker.example .env.docker
make run
```

This starts `reearth-accounts-dev` and `reearth-cerbos` and attaches them to the `reearth` Docker network.

```mermaid
graph TB
    subgraph visualizer["reearth-visualizer (Terminal 1: make d-run-standalone)"]
        V["reearth-visualizer-dev<br/>:8080"]
        Mongo["reearth-mongo<br/>:27017"]
        GCS["reearth-gcs<br/>:4443"]
    end

    subgraph accounts["reearth-accounts (Terminal 2: make run)"]
        A["reearth-accounts-dev<br/>:8090"]
        Cerbos["reearth-cerbos<br/>:3593"]
    end

    V --> Mongo
    V --> GCS
    V --> A
    A --> Mongo
    A --> Cerbos

    style visualizer fill:#e8f4fd,stroke:#1a73e8
    style accounts fill:#fef7e0,stroke:#f9ab00
```

### Initializing the Environment

After the services are running, initialize GCS and create the demo user:

```bash
make gcs-bucket
make mockuser-accounts
```

Or simply:

```bash
make setup-dev
```

### Database and Environment Reset

Reset the development environment including database and GCS:

```bash
make d-reset-data
```

This command will:

- Stop MongoDB and GCS services
- Remove all data directories
- Restart services
- Initialize GCS bucket
- Create mock user

### Complete Environment Cleanup

Remove all Docker resources and data (use with caution):

```bash
make d-destroy
```

This command will:

- Stop all Docker containers
- Remove all Docker images, volumes, and networks
- Delete all data directories
- **WARNING:** This is a destructive operation and cannot be undone

> **Note:** This command will prompt for confirmation before proceeding.

### Code Quality and Testing in Docker

Run linting and tests inside the Docker container (same environment as CI/CD):

```bash
# Run linter with auto-fix
make d-lint

# Run tests
make d-test
```

> **Note:**
>
> - These commands require the development container to be running (`make d-run`)
> - Some e2e tests may fail in Docker due to MongoDB permission constraints
> - For local e2e testing, use `make test` instead

### Quick Reference

| Command | Description |
| --- | --- |
| `make d-run` | Start all services including accounts API from Docker Hub |
| `make d-run-standalone` | Start visualizer without accounts API (mongo + gcs only) |
| `make d-down` | Stop all services |
| `make d-logs-accounts` | Follow accounts API logs |
| `make setup-dev` | Initialize GCS bucket and create mock user |
| `make d-reset-data` | Reset database and GCS, reinitialize with mock data |
| `make d-destroy` | Remove ALL Docker resources and data (destructive) |
| `make d-lint` | Run golangci-lint in Docker container |
| `make d-test` | Run tests in Docker container |

## Authentication

Authentication is handled by the shared service [Re:Earth Accounts](https://github.com/reearth/reearth-accounts).
When using `make d-run`, a pre-built `reearth/reearth-accounts-api` container from Docker Hub is started automatically.

There are two authentication modes: **Mock User** (default) and **Identity Provider (IdP)**.

### 1. Mock User Mode (Default)

Uses a demo user for local development without requiring an external IdP.
No additional configuration is needed — these are the defaults.

**web/.env**

```bash
REEARTH_WEB_AUTH_PROVIDER=mock
```

**server/.env.accounts.docker**

```bash
REEARTH_MOCK_AUTH=true
```

> If you are using [Method 2](#method-2-local-accounts-development), edit `reearth-accounts/server/.env.docker` instead.

### 2. Identity Provider (IdP) Mode

To use an IdP (e.g. Auth0), edit `server/.env.accounts.docker` with your Auth0 credentials:

```bash
REEARTH_MOCK_AUTH=false
REEARTH_AUTH0_DOMAIN=https://your-tenant.auth0.com/
REEARTH_AUTH0_AUDIENCE=https://api.your-domain.com
REEARTH_AUTH0_CLIENTID=your-auth0-client-id
REEARTH_AUTH0_CLIENTSECRET=your-auth0-client-secret
REEARTH_AUTH0_WEBCLIENTID=your-auth0-web-client-id
```

> If you are using [Method 2](#method-2-local-accounts-development), edit `reearth-accounts/server/.env.docker` instead.

Also update **web/.env**:

```bash
REEARTH_WEB_AUTH_PROVIDER=auth0
```

After starting the server, you need to register the IdP user by providing the `sub` claim:

```bash
curl -H 'Content-Type: application/json' http://localhost:8080/api/signup -d @- << EOF
{
  "sub": "auth0|xxxxxxxx1234567890xxxxxx",
  "email": "user@example.com",
  "username": "example user",
  "secret": "@Hoge123@Hoge123"
}
EOF
```

## Project Export and Import

Re:Earth provides functionality to export and import complete projects including all associated data.

### Export

Projects can be exported via the GraphQL API using the `ExportProject` mutation.

#### Export Process Flow

1. **Create temporary zip file** - A zip archive is created with project ID as filename
2. **Export project data** - Project metadata and settings
3. **Export scene data** - Scene configuration and visualization settings
4. **Export plugins** - All plugins used in the project
5. **Export assets** - Images, 3D models, and other assets
6. **Add metadata** - Export information including:
   - `host`: Current host URL
   - `project`: Project ID
   - `timestamp`: Export timestamp (RFC3339 format)
   - `exportDataVersion`: Data format version (current: `"1"`)
7. **Upload to storage** - The completed zip file is uploaded to configured storage
8. **Return path** - Returns download path: `/export/{projectId}.zip`

#### Exported Zip Structure

```
project.zip
├── project.json                        # Complete project data with metadata
├── assets/                             # Project assets
│   ├── {asset-filename-1}
│   └── {asset-filename-2}
└── plugins/                            # Plugin files
    └── {plugin-id}/
        ├── {extension-id-1}.js
        └── {extension-id-2}.js
```

#### project.json Top-Level Structure

```jsonc
{
  "scene": {                          // Scene data (built by scene/builder)
    "schemaVersion": 1,
    "id": "...",
    "publishedAt": "...",
    "property": { ... },              // Scene property
    "plugins": { ... },               // Plugin properties (keyed by plugin ID)
    "widgets": [ ... ],               // Widget configurations
    "widgetAlignSystems": { ... },    // Widget layout alignment
    "story": { ... },                 // Storytelling data (optional)
    "nlsLayers": [ ... ],             // NLS layer data
    "layerStyles": [ ... ],           // Layer style data
    "coreSupport": true,
    "enableGa": false,
    "trackingId": ""
  },
  "project": {                        // Project metadata
    "visualizer": "cesium",
    "name": "...",
    "description": "...",
    "imageUrl": "...",                 // optional
    "visibility": "public",           // optional
    "license": "...",                  // optional
    "readme": "...",                   // optional
    "topics": [ ... ]                  // optional
  },
  "plugins": [ ... ],                 // Plugin definitions
  "schemas": [ ... ],                 // Property schema definitions
  "exportedInfo": {                   // Export metadata
    "host": "https://...",
    "project": "{projectId}",
    "timestamp": "2025-01-01T00:00:00Z",
    "exportDataVersion": "1"
  }
}
```

#### Export Data Version

The `exportDataVersion` field enables compatibility management for future format changes:

- Current version: `"1"`
- Version is embedded in `exportedInfo` section of `project.json`
- Future versions can support schema migrations and new features

**File**: `internal/adapter/gql/resolver_mutation_project.go:219`

### Import

Projects can be imported via two methods:

#### Method 1: Direct Upload (`POST /api/split-import`)

Client uploads the project zip file directly to the server in chunks. Requires authentication.

**Process Flow**:

```mermaid
sequenceDiagram
    participant Client
    participant Server as Visualizer API
    Client->>Server: POST /api/split-import (chunk 0)
    Server->>Server: Save chunk, create temporary project (status: UPLOADING)
    Server-->>Client: { project_id, completed: false }
    Client->>Server: POST /api/split-import (chunk 1..N)
    Server-->>Client: { project_id, completed: false }
    Client->>Server: POST /api/split-import (final chunk)
    Server-->>Client: { project_id, completed: true }
    Server->>Server: (async) Assemble chunks → ImportProject()
```

1. **Chunk Upload** - Client uploads file in chunks (16MB each)
2. **Session Management** - Server tracks upload progress per file ID
3. **Temporary Project Creation** - On first chunk, creates placeholder project with status `UPLOADING`
4. **Chunk Assembly** - When all chunks received, assembles complete file
5. **Async Processing** - Spawns goroutine to process import
6. **Import Execution** - Calls `ImportProject()` with assembled data

**File**: `internal/app/file_split_uploader.go`

#### Method 2: Signed URL Upload (via GCS)

Client uploads the project zip file to GCS using a signed URL, then a GCS event triggers the server to process the import. This method is suitable for large files and production environments using GCP.

**Endpoints**:

| Endpoint | Auth | Description |
| --- | --- | --- |
| `POST /api/signature-url` | Required | Generates a signed upload URL for GCS |
| `POST /api/import-project` | Not required | Triggered by GCS Cloud Function event |
| `POST /api/storage-event` | Not required | Triggered by GCS Pub/Sub push subscription |

**Process Flow**:

```mermaid
sequenceDiagram
    participant Client
    participant Server as Visualizer API
    participant GCS
    participant Trigger as Cloud Function / Pub/Sub

    Client->>Server: POST /api/signature-url (workspace_id)
    Server->>Server: Create temporary project (status: UPLOADING)
    Server->>GCS: Generate signed upload URL
    Server-->>Client: { upload_url, temporary_project, expires_at }
    Client->>GCS: PUT upload_url (project zip)
    GCS->>Trigger: Storage event (object created)
    Trigger->>Server: POST /api/import-project or /api/storage-event
    Server->>GCS: Download zip file
    Server->>Server: ImportProject()
    Server->>GCS: Remove zip file
```

1. **Request Signed URL** - Client calls `POST /api/signature-url` with `workspace_id`. Server creates a temporary project and returns a GCS signed upload URL.
2. **Upload to GCS** - Client uploads the zip file directly to GCS using the signed URL.
3. **GCS Event** - GCS triggers a notification (via Cloud Function or Pub/Sub) to the server.
4. **Import Processing** - Server downloads the zip from GCS, runs `ImportProject()`, then removes the zip from GCS.

**Authentication**:

- `POST /api/signature-url` requires a valid auth token (authenticated route).
- `POST /api/import-project` and `POST /api/storage-event` do not require an auth token — they are triggered by GCS events. User context is extracted from the filename: `{workspaceId}-{projectId}-{userId}.zip`, and an operator is generated from the user ID.

**File**: `internal/app/file_signature_uploader.go`

### ImportProject() Implementation

Core import logic that processes the extracted project data.

```mermaid
flowchart TD
    Start([ImportProject called]) --> ProjectData[1. ImportProjectData<br/>Project metadata and configuration]
    ProjectData -->|fail| Fail
    ProjectData --> Assets[2. ImportAssetFiles<br/>Upload and register asset files]
    Assets -->|fail| Fail
    Assets --> Scene[3. Create Scene<br/>Create new scene for imported project]
    Scene -->|fail| Fail
    Scene --> ReplaceID[4. Replace Scene ID<br/>Replace old scene ID with new ID throughout data]
    ReplaceID -->|fail| Fail
    ReplaceID --> Plugins[5. ImportPlugins<br/>Install required plugins and schemas]
    Plugins -->|fail| Fail
    Plugins --> SceneData[6. ImportSceneData<br/>Scene configuration and layers]
    SceneData -->|fail| Fail
    SceneData --> Styles[7. ImportStyles<br/>Layer styling information]
    Styles -->|fail| Fail
    Styles --> NLSLayers[8. ImportNLSLayers<br/>New layer system data]
    NLSLayers -->|fail| Fail
    NLSLayers --> Story[9. ImportStory<br/>Storytelling configuration]
    Story -->|fail| Fail
    Story --> Success([Status: SUCCESS])
    Fail([Status: FAILED<br/>Stops at first error])
```

**Processing Order**:

1. **Project Data** - `ImportProjectData()` - Project metadata and configuration
2. **Assets** - `ImportAssetFiles()` - Upload and register asset files
3. **Scene Creation** - Create new scene for imported project
4. **ID Replacement** - Replace old scene ID with new scene ID throughout data
5. **Plugins** - `ImportPlugins()` - Install required plugins and schemas
6. **Scene Data** - `ImportSceneData()` - Scene configuration and layers
7. **Styles** - `ImportStyles()` - Layer styling information
8. **NLS Layers** - `ImportNLSLayers()` - New layer system data
9. **Story** - `ImportStory()` - Storytelling configuration
10. **Status Update** - Mark import as `SUCCESS` or `FAILED`

**Version Handling**:

The `version` parameter (from `exportDataVersion`) enables format-specific processing:

```go
func ImportProject(
    ctx context.Context,
    usecases *interfaces.Container,
    op *usecase.Operator,
    wsId accountdomain.WorkspaceID,
    pid id.ProjectID,
    importData *[]byte,
    assetsZip map[string]*zip.File,
    pluginsZip map[string]*zip.File,
    result map[string]any,
    version *string,  // Export data version for compatibility
) bool
```

**Current Implementation**:

- Version `"1"` is the current format
- Version parameter is extracted but not yet used for branching
- Future versions can implement migration logic based on version value

**Future Usage Example**:

```go
if version != nil && *version == "2" {
    // Handle version 2 format with new features
    return importV2(...)
}
// Default to version 1 processing
return importV1(...)
```

**File**: `internal/app/file_import_common.go:250`

### Plugin Export and Import

Plugins have a unique data model — JS files are stored in object storage, while parameter schemas (defined in YAML) are stored only in the database. Both must be handled during export/import.

#### Export

`ExportPlugins()` collects the following for each non-system plugin attached to the scene:

1. **JS files** — Read from storage and written to `plugins/{plugin-id}/{extension-id}.js` in the zip
2. **Plugin definitions** — Serialized to `project.json` under `plugins`
3. **Property schemas** — Read from DB and serialized to `project.json` under `schemas`

```
project.zip
└── plugins/
    └── {plugin-id}/
        ├── {extension-id-1}.js   ← from storage
        └── {extension-id-2}.js   ← from storage

project.json
├── plugins: [ ... ]              ← plugin metadata (from DB)
└── schemas: [ ... ]              ← property schemas (from DB)
```

**File**: `internal/usecase/interactor/plugin.go:65`

#### Import

`ImportPlugins()` restores plugins in two steps:

```mermaid
flowchart TD
    Start([ImportPlugins]) --> Upload[1. uploadPluginFile<br/>Upload JS files to storage]
    Upload -->|fail| Fail([Error])
    Upload --> Parse[2. Parse plugins and schemas<br/>from project.json]
    Parse --> Loop[For each plugin]
    Loop --> Schema[Save PropertySchema to DB]
    Schema --> Extension[Build Extension with schema reference]
    Extension --> Plugin[Save Plugin to DB]
    Plugin --> Next{More plugins?}
    Next -->|yes| Loop
    Next -->|no| Done([Done])
```

1. **Upload JS files** — Each `plugins/{plugin-id}/{extension-id}.js` from the zip is uploaded to storage. The old scene ID in the plugin ID is replaced with the new scene ID.
2. **Restore schemas and plugins** — For each plugin in `project.json`:
   - Parse and save each `PropertySchema` directly to the database
   - Build and save the `Plugin` entity with extensions referencing the saved schemas

**File**: `internal/usecase/interactor/plugin.go:117`

### Error Handling

All import steps update project status on failure:

- Status: `ProjectImportStatusFailed`
- Error message logged to `importResultLog`
- Processing stops at first error

### Import Status Values

- `ProjectImportStatusNone` - Not imported
- `ProjectImportStatusUploading` - Upload in progress
- `ProjectImportStatusProcessing` - Import processing
- `ProjectImportStatusSuccess` - Import completed successfully
- `ProjectImportStatusFailed` - Import failed (check `importResultLog`)

### Configuration

**File Size Limit**: 500MB (enforced in `pkg/file/zip.go:114`)

**Chunk Size**: 16MB (split upload)

**Cleanup**: Stale upload sessions (>24 hours) are automatically cleaned up
