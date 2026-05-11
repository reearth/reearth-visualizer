# ReEarth Visualizer Internal API - grpcurl Test Script

The proto schema is sourced from
[`github.com/reearth/reearth-proto`](https://github.com/reearth/reearth-proto)
via the Go module cache. Make sure `go mod download` has been run for the
`server` module (any `go build`/`go test` does this) so the proto file is
available locally.

## Setup

```bash
# 1. Start internal API server
make d-run-internal

# 2. Stop
make d-down-internal
```

## Usage

Run from the `server/` directory:

```bash
USER_ID=<user-id> WORKSPACE_ID=<workspace-id> ./tools/internalapi/grpcurl.sh <command> [args]
```

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `USER_ID` | Yes | - | User ID |
| `WORKSPACE_ID` | Yes | - | Workspace ID |
| `TOKEN` | No | `test-abc-123` | API token (must match `INTERNALAPI_TOKEN`) |
| `SERVER_ADDRESS` | No | `localhost:50051` | gRPC server address |
| `PROTO_DIR` | No | `$(go list -m -f '{{.Dir}}' github.com/reearth/reearth-proto)` | Proto import root |
| `PROTO_FILE` | No | `visualizer/v1/visualizer.proto` | Proto file relative to `PROTO_DIR` |

### Commands

```bash
# Run all API lifecycle test (create -> update -> ... -> delete)
./tools/internalapi/grpcurl.sh all

# Read operations (no token required)
./tools/internalapi/grpcurl.sh list                              # GetProjectList
./tools/internalapi/grpcurl.sh all-projects                      # GetAllProjects
./tools/internalapi/grpcurl.sh get <project_id>                  # GetProject
./tools/internalapi/grpcurl.sh export <project_id>               # ExportProject
./tools/internalapi/grpcurl.sh get-by-alias <ws_alias> <pj_alias>  # GetProjectByWorkspaceAliasAndProjectAlias

# Write operations (token required)
./tools/internalapi/grpcurl.sh create [name] [alias]             # CreateProject
./tools/internalapi/grpcurl.sh update <project_id>               # UpdateProject
./tools/internalapi/grpcurl.sh publish <project_id> [status]     # PublishProject
./tools/internalapi/grpcurl.sh metadata <project_id>             # UpdateProjectMetadata
./tools/internalapi/grpcurl.sh star <project_alias>              # PatchStarCount
./tools/internalapi/grpcurl.sh delete <project_id>               # DeleteProject
./tools/internalapi/grpcurl.sh validate-alias [alias]            # ValidateProjectAlias
./tools/internalapi/grpcurl.sh validate-scene [alias]            # ValidateSceneAlias
./tools/internalapi/grpcurl.sh update-by-alias <ws_alias> <pj_alias>   # UpdateProjectByWorkspaceAliasAndProjectAlias
./tools/internalapi/grpcurl.sh delete-by-alias <ws_alias> <pj_alias>   # DeleteProjectByWorkspaceAliasAndProjectAlias

# Help
./tools/internalapi/grpcurl.sh help
```

### Example

```bash
export USER_ID=01kjvjwb2zqxzgvz5g2236k9g3
export WORKSPACE_ID=01kjvjwb32sex1zrng12bj8bts

# Full lifecycle test
./tools/internalapi/grpcurl.sh all

# Individual commands
./tools/internalapi/grpcurl.sh list
./tools/internalapi/grpcurl.sh create "My Project" "my-project"
./tools/internalapi/grpcurl.sh get 01kmf5cj3qsvggrr6mfjrwkzy5
./tools/internalapi/grpcurl.sh delete 01kmf5cj3qsvggrr6mfjrwkzy5
```
