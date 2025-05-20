package app

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHealthCheck(t *testing.T) {
	dbURI := os.Getenv("REEARTH_DB")
	if dbURI == "" {
		dbURI = "mongodb://localhost"
	}

	t.Logf("Using MongoDB URI: %s", dbURI)

	tests := []struct {
		name           string
		config         *config.Config
		version        string
		username       string
		password       string
		wantStatusCode int
	}{
		{
			name: "with auth - incorrect credentials",
			config: &config.Config{
				DB: dbURI,
				HealthCheck: config.HealthCheckConfig{
					Username: "testuser",
					Password: "testpass",
				},
			},
			version:        "1.0.0",
			username:       "wronguser",
			password:       "wrongpass",
			wantStatusCode: http.StatusUnauthorized,
		},
		{
			name: "with auth - missing credentials",
			config: &config.Config{
				DB: dbURI,
				HealthCheck: config.HealthCheckConfig{
					Username: "testuser",
					Password: "testpass",
				},
			},
			version:        "1.0.0",
			wantStatusCode: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Skip actual connection tests - we're just testing the handler setup
			// This is a mock test that only checks the auth functionality

			// Setup
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/health", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			// Add basic auth if credentials provided
			if tt.username != "" || tt.password != "" {
				req.SetBasicAuth(tt.username, tt.password)
			}

			// Execute
			handler := HealthCheck(tt.config, tt.version)
			err := handler(c)

			// Verify
			if tt.wantStatusCode == http.StatusOK {
				require.NoError(t, err)
				assert.Equal(t, tt.wantStatusCode, rec.Code)
				// We can't fully test the health check response without mocking dependencies,
				// but we can verify it contains the version info
				assert.Contains(t, rec.Body.String(), tt.version)
			} else {
				// For unauthorized case, we expect an explicit JSON response
				assert.Equal(t, tt.wantStatusCode, rec.Code)
				assert.Contains(t, rec.Body.String(), "unauthorized")
			}
		})
	}
}

func TestGCSCheck(t *testing.T) {
	// Test error case only since we can't easily mock GCS
	ctx := context.Background()
	err := gcsCheck(ctx, "nonexistent-bucket-name-for-testing")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "GCS")
}

func TestAuthServerPingCheck(t *testing.T) {
	tests := []struct {
		name      string
		issuerURL string
		wantError bool
	}{
		{
			name:      "invalid URL",
			issuerURL: "http://localhost:99999",
			wantError: true,
		},
		{
			name:      "non-existent domain",
			issuerURL: "http://nonexistent.domain.local",
			wantError: true,
		},
		{
			name:      "valid URL but timeout",
			issuerURL: "http://example.com:81",
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := authServerPingCheck(tt.issuerURL)
			if tt.wantError {
				assert.Error(t, err)
				assert.True(t, strings.Contains(err.Error(), "auth server") ||
					strings.Contains(err.Error(), "unreachable"),
					"Expected error message about auth server, got: %v", err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
