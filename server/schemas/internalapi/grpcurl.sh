#!/bin/bash
set -euo pipefail

# =========================================================
# ReEarth Visualizer Internal API - grpcurl test script
# =========================================================
#
# Usage:
#   ./schemas/internalapi/grpcurl.sh [command] [options]
#
# Setup:
#   1. Set INTERNALAPI_TOKEN in .env.docker
#   2. make d-run-internal
#   3. Run this script from the server/ directory
#
# Examples:
#   ./schemas/internalapi/grpcurl.sh list                    # GetProjectList
#   ./schemas/internalapi/grpcurl.sh all                     # Run all tests (create -> ... -> delete)
#   ./schemas/internalapi/grpcurl.sh create                  # CreateProject
#   ./schemas/internalapi/grpcurl.sh get -p <project_id>     # GetProject
#   ./schemas/internalapi/grpcurl.sh help                    # Show this help

# ---------------------------------------------------------
# Configuration (override with environment variables)
# ---------------------------------------------------------
SERVER_ADDRESS="${SERVER_ADDRESS:-localhost:50051}"
PROTO_FILE="${PROTO_FILE:-schemas/internalapi/v1/schema.proto}"
USER_ID="${USER_ID:?USER_ID is required}"
WORKSPACE_ID="${WORKSPACE_ID:?WORKSPACE_ID is required}"
TOKEN="${TOKEN:-test-abc-123}"

SERVICE="reearth.visualizer.v1.ReEarthVisualizer"

# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------
rpc_read() {
  local method="$1"; shift
  grpcurl -plaintext \
    -H "user-id: ${USER_ID}" \
    -import-path . -proto "${PROTO_FILE}" \
    "$@" \
    "${SERVER_ADDRESS}" "${SERVICE}/${method}"
}

rpc_write() {
  local method="$1"; shift
  grpcurl -plaintext \
    -H "user-id: ${USER_ID}" \
    -H "authorization: Bearer ${TOKEN}" \
    -import-path . -proto "${PROTO_FILE}" \
    "$@" \
    "${SERVER_ADDRESS}" "${SERVICE}/${method}"
}

header() {
  echo ""
  echo "==== $1 ===="
}

# ---------------------------------------------------------
# Commands
# ---------------------------------------------------------
cmd_get_project_list() {
  header "GetProjectList"
  rpc_read GetProjectList -d "{
    \"workspace_id\": \"${WORKSPACE_ID}\",
    \"authenticated\": true
  }"
}

cmd_get_all_projects() {
  header "GetAllProjects"
  rpc_read GetAllProjects -d '{}'
}

cmd_get_project() {
  local project_id="${1:?project_id is required}"
  header "GetProject (${project_id})"
  rpc_read GetProject -d "{
    \"project_id\": \"${project_id}\"
  }"
}

cmd_validate_project_alias() {
  local alias="${1:-test-alias-check}"
  header "ValidateProjectAlias (${alias})"
  rpc_write ValidateProjectAlias -d "{
    \"workspace_id\": \"${WORKSPACE_ID}\",
    \"alias\": \"${alias}\"
  }"
}

cmd_validate_scene_alias() {
  local alias="${1:-test-scene-alias}"
  header "ValidateSceneAlias (${alias})"
  rpc_write ValidateSceneAlias -d "{
    \"alias\": \"${alias}\"
  }"
}

cmd_create_project() {
  local name="${1:-Test Project}"
  local alias="${2:-test-project-$$}"
  header "CreateProject (${name})"
  rpc_write CreateProject -d "{
    \"workspace_id\": \"${WORKSPACE_ID}\",
    \"visualizer\": \"VISUALIZER_CESIUM\",
    \"name\": \"${name}\",
    \"description\": \"Created by grpcurl test\",
    \"core_support\": true,
    \"visibility\": \"private\",
    \"project_alias\": \"${alias}\"
  }"
}

cmd_update_project() {
  local project_id="${1:?project_id is required}"
  header "UpdateProject (${project_id})"
  rpc_write UpdateProject -d "{
    \"project_id\": \"${project_id}\",
    \"name\": \"Updated Project\",
    \"description\": \"Updated by grpcurl test\",
    \"visibility\": \"public\"
  }"
}

cmd_publish_project() {
  local project_id="${1:?project_id is required}"
  local status="${2:-PUBLISHMENT_STATUS_PUBLIC}"
  header "PublishProject (${project_id}) -> ${status}"
  rpc_write PublishProject -d "{
    \"project_id\": \"${project_id}\",
    \"publishment_status\": \"${status}\"
  }"
}

cmd_update_project_metadata() {
  local project_id="${1:?project_id is required}"
  header "UpdateProjectMetadata (${project_id})"
  rpc_write UpdateProjectMetadata -d "{
    \"project_id\": \"${project_id}\",
    \"readme\": \"# Test README\",
    \"license\": \"MIT\",
    \"topics\": {\"values\": [\"test\", \"grpcurl\"]}
  }"
}

cmd_patch_star_count() {
  local project_alias="${1:?project_alias is required}"
  header "PatchStarCount (${project_alias})"
  rpc_write PatchStarCount -d "{
    \"project_alias\": \"${project_alias}\",
    \"workspace_id\": \"${WORKSPACE_ID}\"
  }"
}

cmd_export_project() {
  local project_id="${1:?project_id is required}"
  header "ExportProject (${project_id})"
  rpc_read ExportProject -d "{
    \"project_id\": \"${project_id}\"
  }"
}

cmd_get_by_alias() {
  local ws_alias="${1:?workspace_alias is required}"
  local pj_alias="${2:?project_alias is required}"
  header "GetProjectByWorkspaceAliasAndProjectAlias (${ws_alias}/${pj_alias})"
  rpc_read GetProjectByWorkspaceAliasAndProjectAlias -d "{
    \"workspace_alias\": \"${ws_alias}\",
    \"project_alias\": \"${pj_alias}\"
  }"
}

cmd_update_by_alias() {
  local ws_alias="${1:?workspace_alias is required}"
  local pj_alias="${2:?project_alias is required}"
  header "UpdateProjectByWorkspaceAliasAndProjectAlias (${ws_alias}/${pj_alias})"
  rpc_write UpdateProjectByWorkspaceAliasAndProjectAlias -d "{
    \"workspace_alias\": \"${ws_alias}\",
    \"project_alias\": \"${pj_alias}\",
    \"name\": \"Updated By Alias\"
  }"
}

cmd_delete_by_alias() {
  local ws_alias="${1:?workspace_alias is required}"
  local pj_alias="${2:?project_alias is required}"
  header "DeleteProjectByWorkspaceAliasAndProjectAlias (${ws_alias}/${pj_alias})"
  rpc_write DeleteProjectByWorkspaceAliasAndProjectAlias -d "{
    \"workspace_alias\": \"${ws_alias}\",
    \"project_alias\": \"${pj_alias}\"
  }"
}

cmd_delete_project() {
  local project_id="${1:?project_id is required}"
  header "DeleteProject (${project_id})"
  rpc_write DeleteProject -d "{
    \"project_id\": \"${project_id}\"
  }"
}

# ---------------------------------------------------------
# "all" - run full lifecycle test
# ---------------------------------------------------------
cmd_all() {
  echo "Running full API lifecycle test..."
  local alias="grpcurl-test-$$"

  cmd_get_project_list
  cmd_get_all_projects

  # Create
  local create_out
  create_out=$(cmd_create_project "Lifecycle Test" "${alias}")
  echo "${create_out}"
  local project_id
  project_id=$(echo "${create_out}" | grep '"id"' | head -1 | sed 's/.*: "//;s/".*//')

  if [ -z "${project_id}" ]; then
    echo "ERROR: Failed to extract project_id from CreateProject response"
    exit 1
  fi
  echo ""
  echo ">> Created project: ${project_id} (alias: ${alias})"

  cmd_get_project "${project_id}"
  cmd_validate_project_alias "${alias}-check"
  cmd_validate_scene_alias "${alias}-scene"
  cmd_update_project "${project_id}"
  cmd_publish_project "${project_id}"
  cmd_update_project_metadata "${project_id}"
  cmd_patch_star_count "${alias}"
  cmd_export_project "${project_id}"
  cmd_delete_project "${project_id}"

  echo ""
  echo "==== All tests completed ===="
}

# ---------------------------------------------------------
# Usage
# ---------------------------------------------------------
usage() {
  cat <<'EOF'
Usage: ./schemas/internalapi/grpcurl.sh <command> [args]

Required environment variables:
  USER_ID        User ID
  WORKSPACE_ID   Workspace ID
  TOKEN          API token (default: test-abc-123)

Commands:
  all                              Run full lifecycle test (create -> ... -> delete)

  list                             GetProjectList
  all-projects                     GetAllProjects
  get         <project_id>         GetProject
  create      [name] [alias]       CreateProject
  update      <project_id>         UpdateProject
  publish     <project_id> [status] PublishProject
  metadata    <project_id>         UpdateProjectMetadata
  star        <project_alias>      PatchStarCount
  export      <project_id>         ExportProject
  delete      <project_id>         DeleteProject

  validate-alias  [alias]          ValidateProjectAlias
  validate-scene  [alias]          ValidateSceneAlias

  get-by-alias    <ws_alias> <pj_alias>    GetProjectByWorkspaceAliasAndProjectAlias
  update-by-alias <ws_alias> <pj_alias>    UpdateProjectByWorkspaceAliasAndProjectAlias
  delete-by-alias <ws_alias> <pj_alias>    DeleteProjectByWorkspaceAliasAndProjectAlias

  help                             Show this help
EOF
}

# ---------------------------------------------------------
# Main
# ---------------------------------------------------------
command="${1:-help}"
shift || true

case "${command}" in
  all)              cmd_all "$@" ;;
  list)             cmd_get_project_list "$@" ;;
  all-projects)     cmd_get_all_projects "$@" ;;
  get)              cmd_get_project "$@" ;;
  create)           cmd_create_project "$@" ;;
  update)           cmd_update_project "$@" ;;
  publish)          cmd_publish_project "$@" ;;
  metadata)         cmd_update_project_metadata "$@" ;;
  star)             cmd_patch_star_count "$@" ;;
  export)           cmd_export_project "$@" ;;
  delete)           cmd_delete_project "$@" ;;
  validate-alias)   cmd_validate_project_alias "$@" ;;
  validate-scene)   cmd_validate_scene_alias "$@" ;;
  get-by-alias)     cmd_get_by_alias "$@" ;;
  update-by-alias)  cmd_update_by_alias "$@" ;;
  delete-by-alias)  cmd_delete_by_alias "$@" ;;
  help|--help|-h)   usage ;;
  *)
    echo "Unknown command: ${command}"
    usage
    exit 1
    ;;
esac
