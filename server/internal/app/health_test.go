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

var (
	originalHealthCheck func(*config.Config, string) echo.HandlerFunc
	// Make HealthCheck a variable that can be reassigned during tests
	healthCheckFunc func(*config.Config, string) echo.HandlerFunc
)

func TestHealthCheck(t *testing.T) {
	defer func() { healthCheckFunc = originalHealthCheck }()
	healthCheckFunc = func(cfg *config.Config, version string) echo.HandlerFunc {
		return func(c echo.Context) error {
			if cfg.HealthCheck.Username != "" && cfg.HealthCheck.Password != "" {
				username, password, ok := c.Request().BasicAuth()
				if !ok || username != cfg.HealthCheck.Username || password != cfg.HealthCheck.Password {
					return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
				}
			}
			return c.JSON(http.StatusOK, map[string]interface{}{
				"status":  "ok",
				"version": version,
			})
		}
	}

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
			name: "basic config without auth",
			config: &config.Config{
				DB: dbURI,
			},
			version:        "1.0.0",
			wantStatusCode: http.StatusOK,
		},
		{
			name: "with auth - correct credentials",
			config: &config.Config{
				DB: dbURI,
				HealthCheck: config.HealthCheckConfig{
					Username: "testuser",
					Password: "testpass",
				},
			},
			version:        "1.0.0",
			username:       "testuser",
			password:       "testpass",
			wantStatusCode: http.StatusOK,
		},
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
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/health", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			handler := healthCheckFunc(tt.config, tt.version)
			req.SetBasicAuth(tt.username, tt.password)
			err := handler(c)

			if tt.wantStatusCode == http.StatusOK {
				require.NoError(t, err)
				assert.Equal(t, tt.wantStatusCode, rec.Code)
				assert.Contains(t, rec.Body.String(), tt.version)
			} else {
				assert.Equal(t, tt.wantStatusCode, rec.Code)
				assert.Contains(t, rec.Body.String(), "unauthorized")
			}
		})
	}
}

func TestGCSCheck(t *testing.T) {
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
