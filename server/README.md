[![ci-server](https://github.com/reearth/reearth-visualizer/actions/workflows/ci_server.yml/badge.svg)](https://github.com/reearth/reearth-visualizer/actions/workflows/ci_server.yml) [![codecov](https://codecov.io/gh/reearth/reearth/branch/main/graph/badge.svg?flag=server)](https://codecov.io/gh/reearth/reearth)

# reearth/server

A back-end API server application for Re:Earth

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Go 1.23 or later (for local development)

### Running the Server

**macOS / Linux:**

```bash
# Start the development server with Docker
make run

# Initialize GCS bucket
make init-gcs

# Create a mock user
make mockuser
```

**Windows:**

```cmd
# Start the development server with Docker
dev.bat run

# Initialize GCS bucket
dev.bat init-gcs

# Create a mock user
dev.bat mockuser
```

The server will be available at `http://localhost:8080`

## Development Commands

### Testing

| Command                        | Description                                    |
| ------------------------------ | ---------------------------------------------- |
| `make lint`                    | Run golangci-lint in Docker container          |
| `make test`                    | Run unit tests (local, excludes e2e)           |
| `make test-docker`             | Run unit tests in Docker container             |
| `make e2e`                     | Run all e2e tests in Docker                    |
| `make e2e-test TEST_NAME=Name` | Run specific e2e test                          |
| `dev.bat lint`                 | Run golangci-lint with auto-fix (local)        |
| `dev.bat lint-docker`          | Run golangci-lint in Docker container          |
| `dev.bat test`                 | Run unit tests (local)                         |
| `dev.bat test-docker`          | Run unit tests in Docker container             |
| `dev.bat test-debug`           | Run unit tests with verbose output             |
| `dev.bat e2e`                  | Run end-to-end tests                           |

> **Note:** Docker-based commands require the development container to be running (`make run` or `dev.bat run`)

### Build & Run

| Command           | Description                            |
| ----------------- | -------------------------------------- |
| `make build`      | Build the reearth binary               |
| `make run`        | Start dev server with Docker Compose   |
| `make down`       | Stop Docker Compose services           |
| `dev.bat build`   | Build the project                      |
| `dev.bat run`     | Start dev server with Docker Compose   |
| `dev.bat down`    | Stop Docker Compose services           |
| `dev.bat dev`     | Run the application with hot reload    |
| `dev.bat run-app` | Run the application                    |

### Code Generation

| Command                | Description                           |
| ---------------------- | ------------------------------------- |
| `make generate`        | Run all code generation               |
| `make gql`             | Generate GraphQL code                 |
| `make grpc`            | Generate gRPC code                    |
| `make grpc-doc`        | Generate gRPC documentation           |
| `make schematyper`     | Generate plugin manifest schema       |
| `make deep-copy`       | Generate deep-copy code               |
| `make error-msg`       | Generate i18n error messages          |
| `dev.bat generate`     | Run all code generation               |
| `dev.bat gql`          | Generate GraphQL code                 |
| `dev.bat schematyper`  | Generate schema using schematyper     |
| `dev.bat deep-copy`    | Generate deep-copy code for Initializer |

### Development Tools

| Command               | Description                                        |
| --------------------- | -------------------------------------------------- |
| `make dev-install`    | Install dev tools (air, stringer, etc.)            |
| `make init-gcs`       | Initialize GCS bucket                              |
| `make mockuser`       | Create a mock user                                 |
| `dev.bat dev-install` | Install dev tools                                  |
| `dev.bat init`        | Initialize GCS bucket and create mock user         |
| `dev.bat init-gcs`    | Initialize GCS bucket                              |
| `dev.bat mockuser`    | Create a mock user                                 |
| `dev.bat reset`       | Reset database and GCS, reinitialize with mock data |
| `dev.bat clean`       | Clean Go cache                                     |
| `dev.bat destroy`     | ⚠️ Remove all Docker resources and data            |

## Authentication Modes

The server supports two authentication modes:

### 1. Mock User Mode (Default)

Mock authentication is enabled by default for development. No real authentication is required.

**Configuration:**

```bash
# server/.env.docker
REEARTH_MOCKAUTH=true
```

### 2. Re:Earth Accounts Mode

Uses [Re:Earth Accounts](https://github.com/reearth/reearth-accounts) for production-grade user authentication.

**Configuration:**

```bash
# server/.env.docker
REEARTH_MOCKAUTH=false
REEARTH_ACCOUNTSAPI_ENABLED=true
```

> **Note:** You need to start the `reearth-accounts` service separately. See the [reearth-accounts documentation](https://github.com/reearth/reearth-accounts) for setup instructions.

### Registering Users with Identity Provider

When using an Identity Provider (like Auth0), you need to register users via the signup API:

**Unix/Linux/macOS:**

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

**Windows (Command Prompt):**

```cmd
curl -H "Content-Type: application/json" http://localhost:8080/api/signup ^
  -d "{\"sub\": \"auth0|xxxxxxxx1234567890xxxxxx\", \"email\": \"user@example.com\", \"username\": \"example user\", \"secret\": \"@Hoge123@Hoge123\"}"
```

**Windows (PowerShell):**

```powershell
curl.exe -H "Content-Type: application/json" http://localhost:8080/api/signup `
  -d '{"sub": "auth0|xxxxxxxx1234567890xxxxxx", "email": "user@example.com", "username": "example user", "secret": "@Hoge123@Hoge123"}'
```

## Storage

Re:Earth Visualizer supports multiple storage backends:

- [Google Cloud Storage](https://cloud.google.com/storage)
- [Amazon S3](https://aws.amazon.com/s3/)
- Local File System

### Storage Configuration

Configure storage by setting environment variables in order of priority:

1. **`REEARTH_GCS_BUCKETNAME`**: Use Google Cloud Storage
2. **`REEARTH_S3_BUCKET_NAME`**: Use Amazon S3

If neither is configured, the local file system is used as the default storage backend.

Additionally, **`REEARTH_ASSETBASEURL`** is required for all storage types. Set this to the base URL for accessing stored assets.

### Testing GCS Locally

For local development, you can use [fake-gcs-server](https://github.com/fsouza/fake-gcs-server):

**Start fake-gcs-server:**

```bash
# Unix/Linux/macOS
docker compose -f ../docker-compose.dev.yml up -d reearth-gcs

# Windows
dev.bat up-gcs
```

**Initialize GCS bucket:**

```bash
# Unix/Linux/macOS
make init-gcs

# Windows
dev.bat init-gcs
```

**Set environment variable:**

```bash
# server/.env.docker
REEARTH_GCS_BUCKETNAME=test-bucket
```

> **Note:** The default bucket name is `test-bucket`. You can customize this if needed.

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
├── project.json       # Complete project data with metadata
├── assets/           # Project assets
│   ├── image1.png
│   └── model.gltf
└── plugins/          # Plugin files
    └── plugin1/
```

#### Export Data Version

The `exportDataVersion` field enables compatibility management for future format changes:

- Current version: `"1"`
- Version is embedded in `exportedInfo` section of `project.json`
- Future versions can support schema migrations and new features

**File**: `internal/adapter/gql/resolver_mutation_project.go:149`

### Import

Projects can be imported via two methods:

#### 1. Split Upload API (`POST /api/split-import`)

Handles chunked file uploads for large project files.

**Process Flow**:

1. **Chunk Upload** - Client uploads file in chunks (16MB each)
2. **Session Management** - Server tracks upload progress per file ID
3. **Temporary Project Creation** - On first chunk, creates placeholder project with status `UPLOADING`
4. **Chunk Assembly** - When all chunks received, assembles complete file
5. **Async Processing** - Spawns goroutine to process import
6. **Import Execution** - Calls `ImportProject()` with assembled data

**File**: `internal/app/file_split_uploader.go:69`

#### 2. Storage Trigger API (`POST /api/import-project`)

Triggered automatically when a project zip file is uploaded directly to storage (e.g., GCS/S3 bucket notification).

**Authentication**:

- No auth token required (triggered by storage service)
- User context extracted from filename: `{workspaceId}-{projectId}-{userId}.zip`
- Operator context automatically generated from user ID

**File**: `internal/app/file_import_common.go:95`

### ImportProject() Implementation

Core import logic that processes the extracted project data.

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

**File**: `internal/app/file_import_common.go:193`

### Error Handling

All import steps update project status on failure:

- Status: `ProjectImportStatusFailed`
- Error message logged to `importResultLog`
- Processing stops at first error

### Import Status Values

- `ProjectImportStatusNone` - Not imported
- `ProjectImportStatusUploading` - Upload in progress
- `ProjectImportStatusSuccess` - Import completed successfully
- `ProjectImportStatusFailed` - Import failed (check `importResultLog`)

### Configuration

**File Size Limit**: 500MB (enforced in `pkg/file/zip.go:114`)

**Chunk Size**: 16MB (split upload)

**Cleanup**: Stale upload sessions (>24 hours) are automatically cleaned up
