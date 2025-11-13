[![ci-server](https://github.com/reearth/reearth-visualizer/actions/workflows/ci_server.yml/badge.svg)](https://github.com/reearth/reearth-visualizer/actions/workflows/ci_server.yml) [![codecov](https://codecov.io/gh/reearth/reearth/branch/main/graph/badge.svg?flag=server)](https://codecov.io/gh/reearth/reearth)

# reearth/server

A back-end API server application for Re:Earth

## 🛠️ Useful Development Commands

### Database and Environment Reset

Reset the development environment including database and GCS:

**Unix/Linux/macOS:**

```bash
make reset
```

**Windows:**

```cmd
dev.bat reset
```

This command will:

- Stop MongoDB and GCS services
- Remove all data directories
- Restart services
- Initialize GCS bucket
- Create mock user

### Complete Environment Cleanup

Remove all Docker resources and data (use with caution):

**Unix/Linux/macOS:**

```bash
make destroy
```

**Windows:**

```cmd
dev.bat destroy
```

This command will:

- Stop all Docker containers
- Remove all Docker images, volumes, and networks
- Delete all data directories
- **⚠️ WARNING:** This is a destructive operation and cannot be undone

> **Note:** This command will prompt for confirmation before proceeding.

### Code Quality and Testing in Docker

Run linting and tests inside the Docker container (same environment as CI/CD):

**Unix/Linux/macOS:**

```bash
# Run linter with auto-fix
make lint-docker

# Run tests
make test-docker
```

**Windows:**

```cmd
# Run linter with auto-fix
dev.bat lint-docker

# Run tests
dev.bat test-docker
```

> **Note:**
>
> - These commands require the development container to be running (`make run` or `dev.bat run`)
> - Some e2e tests may fail in Docker due to MongoDB permission constraints
> - For local e2e testing, use `make test` or `dev.bat test` instead

### Quick Reference

| Command                                    | Description                                         |
| ------------------------------------------ | --------------------------------------------------- |
| `make reset` / `dev.bat reset`             | Reset database and GCS, reinitialize with mock data |
| `make destroy` / `dev.bat destroy`         | ⚠️ Remove ALL Docker resources and data (destructive) |
| `make lint-docker` / `dev.bat lint-docker` | Run golangci-lint in Docker container               |
| `make test-docker` / `dev.bat test-docker` | Run tests in Docker container                       |

## 🔐 Authentication Modes

The backend server can be launched in the following authentication modes:

### 1. Mock User Mode (Default)

Launches in mock user mode.  
This flag takes precedence, so any Auth0 configuration will be ignored.

**Change: web/.env**

```bash
REEARTH_WEB_AUTH_PROVIDER=mock
```

**Change: server/.env.docker**

```bash
REEARTH_MOCKAUTH=true
```

### 2. Re:Earth Accounts Mode

Uses [Re:Earth Accounts](https://github.com/reearth/reearth-accounts) for user authentication and verification.  
You need to start the `reearth-accounts` service separately.

**Change: web/.env**

```bash
REEARTH_WEB_AUTH_PROVIDER=auth0
```

**Change: server/.env.docker**

```bash
REEARTH_MOCKAUTH=false
REEARTH_ACCOUNTSAPI_ENABLED=true
```

### 3. Auth0 Direct Access Mode (Deprecated)

Directly connects to Auth0 using the configured credentials.  
🚨 This mode is deprecated and will be phased out in the future as the system transitions to [Re:Earth Accounts](https://github.com/reearth/reearth-accounts).

**Change: web/.env**

```bash
REEARTH_WEB_AUTH_PROVIDER=auth0
```

**Change: server/.env.docker**

```bash
REEARTH_MOCKAUTH=false
REEARTH_ACCOUNTSAPI_ENABLED=false

REEARTH_AUTH0_DOMAIN=
REEARTH_AUTH0_AUDIENCE=
REEARTH_AUTH0_CLIENTID=
REEARTH_AUTH0_CLIENTSECRET=
```

### 📢 When using an Identity Provider

You need to add the Identity Provider user to Re:Earth

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

Visualizer is compatible with the following storage interfaces:

- [Google Cloud Storage](https://cloud.google.com/storage)
- [Amazon S3](https://aws.amazon.com/s3/)
- Local File System

### Storage Configuration

To use these storage interfaces, you need to set the following environment variables in order of priority: 1. `REEARTH_GCS_BUCKETNAME`: Set this to use Google Cloud Storage. 2. `REEARTH_S3_BUCKET_NAME`: Set this to use Amazon S3.

If neither `REEARTH_GCS_BUCKETNAME` nor `REEARTH_S3_BUCKET_NAME` is configured, the local file system will be used as the default storage interface.

Additionally, `REEARTH_ASSETBASEURL` is a required environment variable that is used across all storage types. This should be set to the base URL for accessing your stored assets.

### Testing GCS Locally

1. Start the fake-gcs-server ([fake-gcs-server](https://github.com/fsouza/fake-gcs-server)):

   ```bash
   make up-gcs
   ```

2. Create a bucket:

   **Using Make/dev.bat (Recommended):**

   ```bash
   # Unix/Linux/macOS
   make init-gcs

   # Windows
   dev.bat init-gcs
   ```

   **Manual Creation (Advanced):**

   If you need to create a bucket with a custom name or project ID:

   <details>
   <summary>Unix/Linux/macOS</summary>

   ```shell
   curl -X POST http://localhost:4443/storage/v1/b\?project\=your-project-id \
       -H "Content-Type: application/json" \
       -d '{
             "name": "test-bucket"
           }'
   ```

   </details>

   <details>
   <summary>Windows (Command Prompt)</summary>

   ```cmd
   curl -X POST "http://localhost:4443/storage/v1/b?project=your-project-id" ^
       -H "Content-Type: application/json" ^
       -d "{\"name\": \"test-bucket\"}"
   ```

   </details>

   <details>
   <summary>Windows (PowerShell)</summary>

   ```powershell
   curl.exe -X POST "http://localhost:4443/storage/v1/b?project=your-project-id" `
       -H "Content-Type: application/json" `
       -d '{"name": "test-bucket"}'
   ```

   </details>

3. Set `REEARTH_GCS_BUCKETNAME` to `test-bucket`

> **Note:** The default bucket name is `test-bucket`. You can use a different name if needed.

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
