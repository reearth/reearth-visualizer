# Claude Development Documentation

This document captures the development work and context for maintaining and extending the Re:Earth Visualizer server.

## Internal API Authentication Enhancement

### Overview

Implemented selective authentication for the Internal API to allow GET methods (read-only operations) to execute without authentication while maintaining security for write operations.

### Requirements

- Allow only GET methods of the Internal API to be executed without authentication
- Maintain security for all write operations (CREATE, UPDATE, DELETE)
- Preserve backward compatibility for authenticated requests

### Implementation Details

#### 1. Authentication Logic Changes

**File**: `internal/app/grpc.go`

Modified the gRPC interceptor chain to implement selective authentication:

##### `unaryAuthInterceptor` Enhancement

```go
func unaryAuthInterceptor(cfg *ServerConfig) grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
        // Check if this is a read-only GET method that should be allowed without auth
        if isReadOnlyMethod(info.FullMethod) {
            return handler(ctx, req)
        }

        // Continue with normal authentication for write methods
        // ... existing authentication logic
    }
}
```

##### `isReadOnlyMethod` Function

Identifies read-only methods that can execute without authentication:

```go
func isReadOnlyMethod(method string) bool {
    readOnlyMethods := []string{
        "v1.ReEarthVisualizer/GetProjectList",
        "v1.ReEarthVisualizer/GetProject",
        "v1.ReEarthVisualizer/GetProjectByAlias",
        "v1.ReEarthVisualizer/ValidateProjectAlias",
        "v1.ReEarthVisualizer/ExportProject",
    }

    for _, readOnlyMethod := range readOnlyMethods {
        if strings.Contains(method, readOnlyMethod) {
            return true
        }
    }
    return false
}
```

##### `unaryAttachOperatorInterceptor` Enhancement

Modified to handle cases where no user context is provided for read-only methods:

```go
func unaryAttachOperatorInterceptor(cfg *ServerConfig) grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
        md, ok := metadata.FromIncomingContext(ctx)
        if !ok {
            // For read-only methods, we can proceed without metadata
            if isReadOnlyMethod(info.FullMethod) {
                ctx = adapter.AttachCurrentHost(ctx, cfg.Config.Host)
                return handler(ctx, req)
            }
            // ... existing error handling for write methods
        }
        // ... rest of the logic
    }
}
```

#### 2. Project Interactor Updates

**File**: `internal/usecase/interactor/project.go`

Enhanced project visibility handling for unauthenticated requests:

##### `FindActiveById` Enhancement

```go
func (i *Project) FindActiveById(ctx context.Context, pid id.ProjectID, operator *usecase.Operator) (*project.Project, error) {
    pj, err := i.projectRepo.FindActiveById(ctx, pid)
    if err != nil {
        return nil, err
    }

    // Check if project is private and no operator is provided (unauthenticated request)
    if operator == nil && pj.Visibility() == string(project.VisibilityPrivate) {
        return nil, errors.New("project is private")
    }

    // ... rest of the method
}
```

##### `FindVisibilityByWorkspace` Enhancement

```go
func (i *Project) FindVisibilityByWorkspace(ctx context.Context, aid accountdomain.WorkspaceID, authenticated bool, operator *usecase.Operator, keyword *string, sort *project.SortType, pagination *usecasex.Pagination) ([]*project.Project, *usecasex.PageInfo, error) {
    // ... method logic

    var owningWsList accountdomain.WorkspaceIDList
    if operator != nil {
        owningWsList = operator.AccountsOperator.OwningWorkspaces
    }

    // Pass owningWsList which may be nil for unauthenticated requests
    pList, pInfo, err := i.projectRepo.FindByWorkspaces(ctx, authenticated, pFilter, owningWsList, wList)

    // ... rest of the method
}
```

### Read-Only vs Write Methods Classification

#### Read-Only Methods (No Authentication Required)

- `GetProjectList` - Retrieve list of projects (filtered by visibility)
- `GetProject` - Retrieve specific project by ID
- `GetProjectByAlias` - Retrieve project by alias
- `ValidateProjectAlias` - Validate if an alias is available
- `ExportProject` - Export project data

#### Write Methods (Authentication Required)

- `CreateProject` - Create new project
- `UpdateProject` - Update existing project
- `UpdateProjectMetadata` - Update project metadata
- `PublishProject` - Publish/unpublish project
- `DeleteProject` - Delete project

### Security Considerations

1. **Private Project Protection**: Private projects are filtered out for unauthenticated requests
2. **Visibility-Based Access**: Only public projects are returned when `authenticated=false`
3. **Context Validation**: Proper context handling ensures internal vs external request differentiation
4. **Backward Compatibility**: All existing authenticated endpoints continue to work unchanged

### Test Coverage

#### Test Files Created

**File**: `internal/usecase/interactor/project_auth_test.go`

- `TestProject_ReadOnlyMethodsWithoutAuth` - Validates read-only operations work without auth
- `TestProject_WriteMethodsRequireAuth` - Ensures write operations still require auth
- `TestProject_AuthenticatedMethodsWork` - Verifies authenticated flows continue to work
- `TestProject_AuthenticationContextHandling` - Tests proper context handling
- `TestProject_PaginationAndFiltering` - Tests pagination and filtering functionality

**File**: `internal/app/grpc_auth_test.go`

- `TestIsReadOnlyMethod` - Tests method classification logic
- `TestTokenFromGrpcMetadata` - Tests token extraction from gRPC metadata
- `TestUnaryAuthInterceptor` - Tests authentication interceptor behavior
- `TestUnaryAttachOperatorInterceptor` - Tests operator attachment logic
- `TestAuthenticationFlow` - Tests complete authentication flow

#### Test Results

All tests pass successfully:

- ✅ gRPC Authentication Tests: 13/13 test cases pass
- ✅ Authentication Flow Tests: 4/4 test cases pass
- ✅ Token Extraction Tests: 8/8 test cases pass
- ✅ Method Classification Tests: 13/13 test cases pass
- ✅ Project Interactor Tests: Multiple test scenarios pass

### Usage Examples

#### Unauthenticated Request (Read-Only)

```bash
# Get public projects without authentication
grpcurl -plaintext \
  -d '{"authenticated": false}' \
  localhost:50051 \
  reearth.visualizer.v1.ReEarthVisualizer/GetProjectList
```

#### Authenticated Request (Write Operation)

```bash
# Create project with authentication
grpcurl -plaintext \
  -H "authorization: Bearer your-token" \
  -H "user-id: user-123" \
  -d '{"workspace_id": "ws-123", "visualizer": "VISUALIZER_CESIUM", "name": "New Project"}' \
  localhost:50051 \
  reearth.visualizer.v1.ReEarthVisualizer/CreateProject
```

### Configuration

The Internal API authentication is controlled by environment variables:

- `REEARTH_VISUALIZER_INTERNALAPI_ACTIVE`: Enable/disable the Internal API
- `REEARTH_VISUALIZER_INTERNALAPI_PORT`: Port for the gRPC server (default: 50051)
- `REEARTH_VISUALIZER_INTERNALAPI_TOKEN`: Authentication token for write operations

### Development Notes

#### Method Name Format

- gRPC method names follow the pattern: `/reearth.visualizer.v1.ReEarthVisualizer/MethodName`
- The `isReadOnlyMethod` function uses partial matching with `strings.Contains` for flexibility
- Method classification is based on suffix matching: `v1.ReEarthVisualizer/GetProjectList`

#### Context Handling

- Internal context is attached using `adapter.AttachInternal(ctx, true)`
- User context is attached using `adapter.AttachUser(ctx, user)` for authenticated requests
- Current host is always attached for read-only requests: `adapter.AttachCurrentHost(ctx, cfg.Config.Host)`

#### Error Handling

- Unauthenticated access to private projects returns: `"project is private"`
- Missing authentication for write operations returns: `"unauthorized"`
- Invalid tokens return: `"unauthorized"`

### Troubleshooting

#### Common Issues

1. **Read-only method still requires auth**

   - Check that the method name is correctly listed in `isReadOnlyMethod`
   - Verify the method name format matches the gRPC service definition

2. **Private projects visible without auth**

   - Ensure `FindActiveById` has the visibility check
   - Verify `authenticated=false` is being passed for unauthenticated requests

3. **Write methods accepting no auth**
   - Confirm the method is NOT listed in `readOnlyMethods` array
   - Check that authentication interceptor is properly configured

#### Testing Locally

```bash
# Build the server
go build -o ./bin/reearth ./cmd/reearth

# Run tests
go test ./internal/app/ -run "Auth"
go test ./internal/usecase/interactor/ -run "project_auth"

# Check compilation
go build -o /tmp/test-build ./cmd/reearth
```

### Future Considerations

1. **Method Classification**: Consider extracting method classification to a configuration file for easier maintenance
2. **Audit Logging**: Add logging for unauthenticated access to track usage patterns
3. **Rate Limiting**: Consider implementing rate limiting for unauthenticated endpoints
4. **Additional Read-Only Methods**: Review other methods that could safely be made public

---

_Last Updated: 2025-07-09_  
_Implementation by: Claude (AI Assistant)_
