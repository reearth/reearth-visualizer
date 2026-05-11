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
USER_ID=<user-id> WORKSPACE_ID=<workspace-id> ./tools/grpcurl.sh <command> [args]
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
./tools/grpcurl.sh all

# Read operations (no token required)
./tools/grpcurl.sh list                              # GetProjectList
./tools/grpcurl.sh all-projects                      # GetAllProjects
./tools/grpcurl.sh get <project_id>                  # GetProject
./tools/grpcurl.sh export <project_id>               # ExportProject
./tools/grpcurl.sh get-by-alias <ws_alias> <pj_alias>  # GetProjectByWorkspaceAliasAndProjectAlias

# Write operations (token required)
./tools/grpcurl.sh create [name] [alias]             # CreateProject
./tools/grpcurl.sh update <project_id>               # UpdateProject
./tools/grpcurl.sh publish <project_id> [status]     # PublishProject
./tools/grpcurl.sh metadata <project_id>             # UpdateProjectMetadata
./tools/grpcurl.sh star <project_alias>              # PatchStarCount
./tools/grpcurl.sh delete <project_id>               # DeleteProject
./tools/grpcurl.sh validate-alias [alias]            # ValidateProjectAlias
./tools/grpcurl.sh validate-scene [alias]            # ValidateSceneAlias
./tools/grpcurl.sh update-by-alias <ws_alias> <pj_alias>   # UpdateProjectByWorkspaceAliasAndProjectAlias
./tools/grpcurl.sh delete-by-alias <ws_alias> <pj_alias>   # DeleteProjectByWorkspaceAliasAndProjectAlias

# Help
./tools/grpcurl.sh help
```

### Example

```bash
export USER_ID=01kjvjwb2zqxzgvz5g2236k9g3
export WORKSPACE_ID=01kjvjwb32sex1zrng12bj8bts

# Full lifecycle test
./tools/grpcurl.sh all

# Individual commands
./tools/grpcurl.sh list
./tools/grpcurl.sh create "My Project" "my-project"
./tools/grpcurl.sh get 01kmf5cj3qsvggrr6mfjrwkzy5
./tools/grpcurl.sh delete 01kmf5cj3qsvggrr6mfjrwkzy5
```
