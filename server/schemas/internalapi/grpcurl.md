# ReEarthVisualizer gRPC Commands

## Basic Configuration

```bash
# Server address and proto file settings
SERVER_ADDRESS="localhost:50051" # Change to your actual server address
PROTO_FILE="schemas/internalapi/v1/schema.proto"  # Specify the path to your proto file
USER_ID="???User-ID???" # Change to your actual user ID
```

## 1. GetProjectList - Retrieve Project List

```bash
# Basic list retrieval
grpcurl -plaintext \
  -H "user-id: ${USER_ID}" \
  -d '{
    "workspace_id": "???Workspace-ID???",
    "authenticated": true
  }' \
  -import-path . \
  -proto ${PROTO_FILE} \
  ${SERVER_ADDRESS} \
  reearth.visualizer.v1.ReEarthVisualizer/GetProjectList

# With keyword search and sorting
grpcurl -plaintext \
  -H "user-id: ${USER_ID}" \
  -d '{
    "workspace_id": "???Workspace-ID???",
    "authenticated": true,
    "keyword": "test",
    "sort": {
      "field": "UPDATEDAT",
      "direction": "DESC"
    },
    "pagination": {
      "limit": 10,
      "offset": 0
    }
  }' \
  -import-path . \
  -proto ${PROTO_FILE} \
  ${SERVER_ADDRESS} \
  reearth.visualizer.v1.ReEarthVisualizer/GetProjectList
```

## 2. GetProject - Retrieve Specific Project

```bash
grpcurl -plaintext \
  -H "user-id: ${USER_ID}" \
  -d '{
    "project_id": "???project-ID???"
  }' \
  -import-path . \
  -proto ${PROTO_FILE} \
  ${SERVER_ADDRESS} \
  reearth.visualizer.v1.ReEarthVisualizer/GetProject
```

## 3. GetProjectByAlias - Retrieve Project by Alias

```bash
grpcurl -plaintext \
  -H "user-id: ${USER_ID}" \
  -d '{
    "alias": "my-project-alias"
  }' \
  -import-path . \
  -proto ${PROTO_FILE} \
  ${SERVER_ADDRESS} \
  reearth.visualizer.v1.ReEarthVisualizer/GetProjectByAlias
```

## 4. ValidateProjectAlias - Validate Project Alias

```bash
grpcurl -plaintext \
  -H "user-id: ${USER_ID}" \
  -d '{
    "project_id": "???project-ID???",
    "alias": "new-project-alias"
  }' \
  -import-path . \
  -proto ${PROTO_FILE} \
  ${SERVER_ADDRESS} \
  reearth.visualizer.v1.ReEarthVisualizer/ValidateProjectAlias
```

## 5. CreateProject - Create Project

```bash
grpcurl -plaintext \
  -H "user-id: ${USER_ID}" \
  -d '{
    "workspace_id": "???Workspace-ID???",
    "visualizer": "VISUALIZER_CESIUM",
    "name": "New Project",
    "description": "Project description",
    "core_support": true,
    "visibility": "private",
    "project_alias": "new-project",
    "readme": "# About This Project\n\nThis project is...",
    "license": "MIT",
    "topics": "visualization, 3D, mapping"
  }' \
  -import-path . \
  -proto ${PROTO_FILE} \
  ${SERVER_ADDRESS} \
  reearth.visualizer.v1.ReEarthVisualizer/CreateProject
```

## 6. UpdateProject - Update Project

```bash
grpcurl -plaintext \
  -H "user-id: ${USER_ID}" \
  -d '{
    "project_id": "???project-ID???",
    "name": "Updated Project Name",
    "description": "Updated description",
    "starred": true,
    "visibility": "public",
    "project_alias": "updated-alias"
  }' \
  -import-path . \
  -proto ${PROTO_FILE} \
  ${SERVER_ADDRESS} \
  reearth.visualizer.v1.ReEarthVisualizer/UpdateProject
```

## 7. PublishProject - Publish Project

```bash
# Publish project
grpcurl -plaintext \
  -H "user-id: ${USER_ID}" \
  -d '{
    "project_id": "???project-ID???",
    "alias": "published-project",
    "publishment_status": "PUBLISHMENT_STATUS_PUBLIC"
  }' \
  -import-path . \
  -proto ${PROTO_FILE} \
  ${SERVER_ADDRESS} \
  reearth.visualizer.v1.ReEarthVisualizer/PublishProject

# Unpublish project
grpcurl -plaintext \
  -H "user-id: ${USER_ID}" \
  -d '{
    "project_id": "???project-ID???",
    "publishment_status": "PUBLISHMENT_STATUS_PRIVATE"
  }' \
  -import-path . \
  -proto ${PROTO_FILE} \
  ${SERVER_ADDRESS} \
  reearth.visualizer.v1.ReEarthVisualizer/PublishProject
```

## 8. UpdateProjectMetadata - Update Project Metadata

```bash
grpcurl -plaintext \
  -H "user-id: ${USER_ID}" \
  -d '{
    "project_id": "???project-ID???",
    "readme": "# Updated README\n\nThis is new content.",
    "license": "Apache-2.0",
    "topics": "3D, visualization, GIS, mapping"
  }' \
  -import-path . \
  -proto ${PROTO_FILE} \
  ${SERVER_ADDRESS} \
  reearth.visualizer.v1.ReEarthVisualizer/UpdateProjectMetadata
```

## 9. DeleteProject - Delete Project

```bash
grpcurl -plaintext \
  -H "user-id: ${USER_ID}" \
  -d '{
    "project_id": "???project-ID???"
  }' \
  -import-path . \
  -proto ${PROTO_FILE} \
  ${SERVER_ADDRESS} \
  reearth.visualizer.v1.ReEarthVisualizer/DeleteProject
```

## 10. ExportProject - Export Project

```bash
grpcurl -plaintext \
  -H "user-id: ${USER_ID}" \
  -d '{
    "project_id": "???project-ID???"
  }' \
  -import-path . \
  -proto ${PROTO_FILE} \
  ${SERVER_ADDRESS} \
  reearth.visualizer.v1.ReEarthVisualizer/ExportProject
```
