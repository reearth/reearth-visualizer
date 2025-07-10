package app

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
)

func TestIsReadOnlyMethod(t *testing.T) {
	testCases := []struct {
		name     string
		method   string
		expected bool
	}{
		// Read-only methods (should return true)
		{
			name:     "GetProjectList is read-only",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/GetProjectList",
			expected: true,
		},
		{
			name:     "GetProject is read-only",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/GetProject",
			expected: true,
		},
		{
			name:     "GetProjectByAlias is read-only",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/GetProjectByAlias",
			expected: true,
		},
		{
			name:     "ValidateProjectAlias is read-only",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/ValidateProjectAlias",
			expected: false,
		},
		{
			name:     "ExportProject is read-only",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/ExportProject",
			expected: false,
		},

		// Write methods (should return false)
		{
			name:     "CreateProject is not read-only",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/CreateProject",
			expected: false,
		},
		{
			name:     "UpdateProject is not read-only",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/UpdateProject",
			expected: false,
		},
		{
			name:     "UpdateProjectMetadata is not read-only",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/UpdateProjectMetadata",
			expected: false,
		},
		{
			name:     "PublishProject is not read-only",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/PublishProject",
			expected: false,
		},
		{
			name:     "DeleteProject is not read-only",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/DeleteProject",
			expected: false,
		},

		// Edge cases
		{
			name:     "Unknown method is not read-only",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/UnknownMethod",
			expected: false,
		},
		{
			name:     "Empty method is not read-only",
			method:   "",
			expected: false,
		},
		{
			name:     "Different service method is not read-only",
			method:   "/different.service.v1.SomeService/GetSomething",
			expected: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := isReadOnlyMethod(tc.method)
			assert.Equal(t, tc.expected, result, "Method %s should return %v", tc.method, tc.expected)
		})
	}
}

func TestIsReadOnlyMethodWithPartialMatches(t *testing.T) {
	// Test current implementation that uses strings.Contains
	testCases := []struct {
		name     string
		method   string
		expected bool
	}{
		{
			name:     "Partial match with GetProjectList",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/GetProjectList",
			expected: true,
		},
		{
			name:     "Partial match with GetProject",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/GetProject",
			expected: true,
		},
		{
			name:     "Partial match with GetProjectByAlias",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/GetProjectByAlias",
			expected: true,
		},
		{
			name:     "Should not match CreateProject",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/CreateProject",
			expected: false,
		},
		{
			name:     "Should not match UpdateProject",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/UpdateProject",
			expected: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := isReadOnlyMethod(tc.method)
			assert.Equal(t, tc.expected, result, "Method %s should return %v", tc.method, tc.expected)
		})
	}
}

func TestTokenFromGrpcMetadata(t *testing.T) {
	testCases := []struct {
		name     string
		metadata metadata.MD
		expected string
	}{
		{
			name: "Valid Bearer token",
			metadata: metadata.New(map[string]string{
				"authorization": "Bearer valid-token-123",
			}),
			expected: "valid-token-123",
		},
		{
			name: "Bearer token with spaces",
			metadata: metadata.New(map[string]string{
				"authorization": "Bearer   token-with-spaces   ",
			}),
			expected: "  token-with-spaces   ",
		},
		{
			name: "Missing authorization header",
			metadata: metadata.New(map[string]string{
				"other-header": "some-value",
			}),
			expected: "",
		},
		{
			name: "Authorization header without Bearer prefix",
			metadata: metadata.New(map[string]string{
				"authorization": "just-a-token",
			}),
			expected: "",
		},
		{
			name: "Authorization header with only Bearer",
			metadata: metadata.New(map[string]string{
				"authorization": "Bearer",
			}),
			expected: "",
		},
		{
			name: "Authorization header with Bearer and space only",
			metadata: metadata.New(map[string]string{
				"authorization": "Bearer ",
			}),
			expected: "",
		},
		{
			name: "Empty authorization header",
			metadata: metadata.New(map[string]string{
				"authorization": "",
			}),
			expected: "",
		},
		{
			name: "Case sensitivity test (should work with lowercase)",
			metadata: metadata.New(map[string]string{
				"Authorization": "Bearer case-test-token",
			}),
			expected: "case-test-token",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := tokenFromGrpcMetadata(tc.metadata)
			assert.Equal(t, tc.expected, result, "Token extraction should return %s", tc.expected)
		})
	}
}

func TestUnaryAuthInterceptor(t *testing.T) {
	// Create a mock server config
	cfg := &ServerConfig{
		Config: &config.Config{
			Visualizer: config.VisualizerConfig{
				InternalApi: config.InternalApiConfig{
					Token: "test-token",
				},
			},
		},
	}

	// Create the interceptor
	interceptor := unaryAuthInterceptor(cfg)

	// Mock handler that returns success
	mockHandler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return "success", nil
	}

	testCases := []struct {
		name           string
		method         string
		metadata       metadata.MD
		expectedError  bool
		expectedResult string
	}{
		{
			name:     "Read-only method without auth should succeed",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/GetProjectList",
			metadata: metadata.New(map[string]string{
				// No authorization header
			}),
			expectedError:  false,
			expectedResult: "success",
		},
		{
			name:   "Read-only method with auth should succeed",
			method: "/reearth.visualizer.v1.ReEarthVisualizer/GetProject",
			metadata: metadata.New(map[string]string{
				"authorization": "Bearer test-token",
			}),
			expectedError:  false,
			expectedResult: "success",
		},
		{
			name:     "Write method without auth should fail",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/CreateProject",
			metadata: metadata.New(map[string]string{
				// No authorization header
			}),
			expectedError:  true,
			expectedResult: "",
		},
		{
			name:   "Write method with valid auth should succeed",
			method: "/reearth.visualizer.v1.ReEarthVisualizer/CreateProject",
			metadata: metadata.New(map[string]string{
				"authorization": "Bearer test-token",
			}),
			expectedError:  false,
			expectedResult: "success",
		},
		{
			name:   "Write method with invalid auth should fail",
			method: "/reearth.visualizer.v1.ReEarthVisualizer/CreateProject",
			metadata: metadata.New(map[string]string{
				"authorization": "Bearer invalid-token",
			}),
			expectedError:  true,
			expectedResult: "",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create context with metadata
			ctx := metadata.NewIncomingContext(context.Background(), tc.metadata)

			// Create mock UnaryServerInfo
			info := &grpc.UnaryServerInfo{
				FullMethod: tc.method,
			}

			// Call the interceptor
			result, err := interceptor(ctx, nil, info, mockHandler)

			if tc.expectedError {
				assert.Error(t, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tc.expectedResult, result)
			}
		})
	}
}

func TestUnaryAttachOperatorInterceptor(t *testing.T) {
	// Create a mock server config
	cfg := &ServerConfig{
		Config: &config.Config{
			Host: "https://example.com",
		},
	}

	// Create the interceptor
	interceptor := unaryAttachOperatorInterceptor(cfg)

	// Mock handler that returns success
	mockHandler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return "success", nil
	}

	testCases := []struct {
		name           string
		method         string
		metadata       metadata.MD
		expectedError  bool
		expectedResult string
	}{
		{
			name:     "Read-only method without metadata should succeed",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/GetProjectList",
			metadata: metadata.New(map[string]string{
				// No metadata
			}),
			expectedError:  false,
			expectedResult: "success",
		},
		{
			name:   "Read-only method without user-id should succeed",
			method: "/reearth.visualizer.v1.ReEarthVisualizer/GetProject",
			metadata: metadata.New(map[string]string{
				"authorization": "Bearer test-token",
				// No user-id
			}),
			expectedError:  false,
			expectedResult: "success",
		},
		{
			name:     "Write method without metadata should fail",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/CreateProject",
			metadata: metadata.New(map[string]string{
				// No metadata
			}),
			expectedError:  true,
			expectedResult: "",
		},
		{
			name:   "Write method without user-id should fail",
			method: "/reearth.visualizer.v1.ReEarthVisualizer/CreateProject",
			metadata: metadata.New(map[string]string{
				"authorization": "Bearer test-token",
				// No user-id
			}),
			expectedError:  true,
			expectedResult: "",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create context with metadata
			var ctx context.Context
			if len(tc.metadata) > 0 {
				ctx = metadata.NewIncomingContext(context.Background(), tc.metadata)
			} else {
				ctx = context.Background()
			}

			// Create mock UnaryServerInfo
			info := &grpc.UnaryServerInfo{
				FullMethod: tc.method,
			}

			// Call the interceptor
			result, err := interceptor(ctx, nil, info, mockHandler)

			if tc.expectedError {
				assert.Error(t, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tc.expectedResult, result)
			}
		})
	}
}

// Test the integration of both interceptors
func TestAuthenticationFlow(t *testing.T) {
	// Create a mock server config
	cfg := &ServerConfig{
		Config: &config.Config{
			Host: "https://example.com",
			Visualizer: config.VisualizerConfig{
				InternalApi: config.InternalApiConfig{
					Token: "test-token",
				},
			},
		},
	}

	// Create both interceptors
	authInterceptor := unaryAuthInterceptor(cfg)
	operatorInterceptor := unaryAttachOperatorInterceptor(cfg)

	// Mock handler that returns success
	mockHandler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return "success", nil
	}

	// Chain the interceptors (auth first, then operator)
	chainedHandler := func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo) (interface{}, error) {
		return authInterceptor(ctx, req, info, func(ctx context.Context, req interface{}) (interface{}, error) {
			return operatorInterceptor(ctx, req, info, mockHandler)
		})
	}

	testCases := []struct {
		name           string
		method         string
		metadata       metadata.MD
		expectedError  bool
		expectedResult string
	}{
		{
			name:     "Read-only method without any auth should succeed",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/GetProjectList",
			metadata: metadata.New(map[string]string{
				// No headers
			}),
			expectedError:  false,
			expectedResult: "success",
		},
		{
			name:     "Write method without auth should fail at auth interceptor",
			method:   "/reearth.visualizer.v1.ReEarthVisualizer/CreateProject",
			metadata: metadata.New(map[string]string{
				// No headers
			}),
			expectedError:  true,
			expectedResult: "",
		},
		{
			name:   "Write method with valid auth but no user-id should fail at operator interceptor",
			method: "/reearth.visualizer.v1.ReEarthVisualizer/CreateProject",
			metadata: metadata.New(map[string]string{
				"authorization": "Bearer test-token",
				// No user-id
			}),
			expectedError:  true,
			expectedResult: "",
		},
		{
			name:   "Write method with invalid auth should fail at auth interceptor",
			method: "/reearth.visualizer.v1.ReEarthVisualizer/CreateProject",
			metadata: metadata.New(map[string]string{
				"authorization": "Bearer invalid-token",
				"user-id":       "test-user",
			}),
			expectedError:  true,
			expectedResult: "",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create context with metadata
			var ctx context.Context
			if len(tc.metadata) > 0 {
				ctx = metadata.NewIncomingContext(context.Background(), tc.metadata)
			} else {
				ctx = context.Background()
			}

			// Create mock UnaryServerInfo
			info := &grpc.UnaryServerInfo{
				FullMethod: tc.method,
			}

			// Call the chained interceptors
			result, err := chainedHandler(ctx, nil, info)

			if tc.expectedError {
				assert.Error(t, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tc.expectedResult, result)
			}
		})
	}
}
