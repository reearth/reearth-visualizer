# ReEarth Visualizer Internal API - grpcurl Test Script

## Setup

```bash
# 1. Start internal API server
make d-run-internal

# 3. Stop
make d-down-internal
```

## Usage

Run from the `server/` directory:

```bash
USER_ID=<user-id> WORKSPACE_ID=<workspace-id> ./schemas/internalapi/grpcurl.sh <command> [args]
```

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `USER_ID` | Yes | - | User ID |
| `WORKSPACE_ID` | Yes | - | Workspace ID |
| `TOKEN` | No | `test-abc-123` | API token (must match `INTERNALAPI_TOKEN`) |
| `SERVER_ADDRESS` | No | `localhost:50051` | gRPC server address |
| `PROTO_FILE` | No | `schemas/internalapi/v1/schema.proto` | Proto file path |

### Commands

```bash
# Run all API lifecycle test (create -> update -> ... -> delete)
./schemas/internalapi/grpcurl.sh all

# Read operations (no token required)
./schemas/internalapi/grpcurl.sh list                              # GetProjectList
./schemas/internalapi/grpcurl.sh all-projects                      # GetAllProjects
./schemas/internalapi/grpcurl.sh get <project_id>                  # GetProject
./schemas/internalapi/grpcurl.sh export <project_id>               # ExportProject
./schemas/internalapi/grpcurl.sh get-by-alias <ws_alias> <pj_alias>  # GetProjectByWorkspaceAliasAndProjectAlias

# Write operations (token required)
./schemas/internalapi/grpcurl.sh create [name] [alias]             # CreateProject
./schemas/internalapi/grpcurl.sh update <project_id>               # UpdateProject
./schemas/internalapi/grpcurl.sh publish <project_id> [status]     # PublishProject
./schemas/internalapi/grpcurl.sh metadata <project_id>             # UpdateProjectMetadata
./schemas/internalapi/grpcurl.sh star <project_alias>              # PatchStarCount
./schemas/internalapi/grpcurl.sh delete <project_id>               # DeleteProject
./schemas/internalapi/grpcurl.sh validate-alias [alias]            # ValidateProjectAlias
./schemas/internalapi/grpcurl.sh validate-scene [alias]            # ValidateSceneAlias
./schemas/internalapi/grpcurl.sh update-by-alias <ws_alias> <pj_alias>   # UpdateProjectByWorkspaceAliasAndProjectAlias
./schemas/internalapi/grpcurl.sh delete-by-alias <ws_alias> <pj_alias>   # DeleteProjectByWorkspaceAliasAndProjectAlias

# Help
./schemas/internalapi/grpcurl.sh help
```

### Example

```bash
export USER_ID=01kjvjwb2zqxzgvz5g2236k9g3
export WORKSPACE_ID=01kjvjwb32sex1zrng12bj8bts

# Full lifecycle test
./schemas/internalapi/grpcurl.sh all

# Individual commands
./schemas/internalapi/grpcurl.sh list
./schemas/internalapi/grpcurl.sh create "My Project" "my-project"
./schemas/internalapi/grpcurl.sh get 01kmf5cj3qsvggrr6mfjrwkzy5
./schemas/internalapi/grpcurl.sh delete 01kmf5cj3qsvggrr6mfjrwkzy5
```
