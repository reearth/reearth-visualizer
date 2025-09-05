package domain

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/stretchr/testify/assert"
)

func TestNewHTTPDomainChecker(t *testing.T) {
	t.Run("creates checker with correct configuration", func(t *testing.T) {
		endpoint := "https://example.com/check"
		token := "test-token"
		timeout := 30

		checker := NewHTTPDomainChecker(endpoint, token, timeout)

		assert.NotNil(t, checker)
		assert.Equal(t, endpoint, checker.endpoint)
		assert.Equal(t, token, checker.token)
		assert.NotNil(t, checker.client)
		assert.Equal(t, 30*time.Second, checker.client.Timeout)
	})

	t.Run("creates checker without token", func(t *testing.T) {
		endpoint := "https://example.com/check"
		token := ""
		timeout := 10

		checker := NewHTTPDomainChecker(endpoint, token, timeout)

		assert.NotNil(t, checker)
		assert.Equal(t, endpoint, checker.endpoint)
		assert.Equal(t, "", checker.token)
		assert.NotNil(t, checker.client)
		assert.Equal(t, 10*time.Second, checker.client.Timeout)
	})
}

func TestHTTPDomainChecker_CheckDomain(t *testing.T) {
	t.Run("successful domain check - allowed", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			assert.Equal(t, http.MethodPost, r.Method)
			assert.Equal(t, "application/json", r.Header.Get("Content-Type"))
			assert.Equal(t, "Bearer test-token", r.Header.Get("Authorization"))

			body, err := io.ReadAll(r.Body)
			assert.NoError(t, err)

			var req gateway.DomainCheckRequest
			err = json.Unmarshal(body, &req)
			assert.NoError(t, err)
			assert.Equal(t, "https://example.com", req.Domain)

			resp := gateway.DomainCheckResponse{Allowed: true}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(resp)
		}))
		defer server.Close()

		checker := NewHTTPDomainChecker(server.URL, "test-token", 10)
		ctx := context.Background()
		req := gateway.DomainCheckRequest{Domain: "https://example.com"}

		resp, err := checker.CheckDomain(ctx, req)

		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.True(t, resp.Allowed)
	})

	t.Run("successful domain check - not allowed", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			resp := gateway.DomainCheckResponse{Allowed: false}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(resp)
		}))
		defer server.Close()

		checker := NewHTTPDomainChecker(server.URL, "", 10)
		ctx := context.Background()
		req := gateway.DomainCheckRequest{Domain: "https://example.com"}

		resp, err := checker.CheckDomain(ctx, req)

		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.False(t, resp.Allowed)
	})

	t.Run("without authentication token", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			assert.Equal(t, "", r.Header.Get("Authorization"))

			resp := gateway.DomainCheckResponse{Allowed: true}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(resp)
		}))
		defer server.Close()

		checker := NewHTTPDomainChecker(server.URL, "", 10)
		ctx := context.Background()
		req := gateway.DomainCheckRequest{Domain: "https://example.com"}

		resp, err := checker.CheckDomain(ctx, req)

		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.True(t, resp.Allowed)
	})

	t.Run("server returns non-200 status", func(t *testing.T) {
		testCases := []struct {
			name       string
			statusCode int
		}{
			{"bad request", http.StatusBadRequest},
			{"unauthorized", http.StatusUnauthorized},
			{"forbidden", http.StatusForbidden},
			{"not found", http.StatusNotFound},
			{"internal server error", http.StatusInternalServerError},
			{"service unavailable", http.StatusServiceUnavailable},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					w.WriteHeader(tc.statusCode)
				}))
				defer server.Close()

				checker := NewHTTPDomainChecker(server.URL, "test-token", 10)
				ctx := context.Background()
				req := gateway.DomainCheckRequest{Domain: "https://example.com"}

				resp, err := checker.CheckDomain(ctx, req)

				assert.Error(t, err)
				assert.Nil(t, resp)
				assert.Equal(t, "internal", err.Error())
			})
		}
	})

	t.Run("server returns invalid JSON", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("invalid json"))
		}))
		defer server.Close()

		checker := NewHTTPDomainChecker(server.URL, "test-token", 10)
		ctx := context.Background()
		req := gateway.DomainCheckRequest{Domain: "https://example.com"}

		resp, err := checker.CheckDomain(ctx, req)

		assert.Error(t, err)
		assert.Nil(t, resp)
		assert.Equal(t, "internal", err.Error())
	})

	t.Run("server timeout", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(2 * time.Second)
			w.WriteHeader(http.StatusOK)
		}))
		defer server.Close()

		checker := NewHTTPDomainChecker(server.URL, "test-token", 1)
		ctx := context.Background()
		req := gateway.DomainCheckRequest{Domain: "https://example.com"}

		resp, err := checker.CheckDomain(ctx, req)

		assert.Error(t, err)
		assert.Nil(t, resp)
		assert.Equal(t, "internal", err.Error())
	})

	t.Run("context cancellation", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(1 * time.Second)
			w.WriteHeader(http.StatusOK)
		}))
		defer server.Close()

		checker := NewHTTPDomainChecker(server.URL, "test-token", 10)
		ctx, cancel := context.WithCancel(context.Background())
		req := gateway.DomainCheckRequest{Domain: "https://example.com"}

		go func() {
			time.Sleep(100 * time.Millisecond)
			cancel()
		}()

		resp, err := checker.CheckDomain(ctx, req)

		assert.Error(t, err)
		assert.Nil(t, resp)
	})

	t.Run("invalid endpoint URL", func(t *testing.T) {
		checker := NewHTTPDomainChecker("http://[invalid-url", "test-token", 10)
		ctx := context.Background()
		req := gateway.DomainCheckRequest{Domain: "https://example.com"}

		resp, err := checker.CheckDomain(ctx, req)

		assert.Error(t, err)
		assert.Nil(t, resp)
	})

	t.Run("unreachable server", func(t *testing.T) {
		checker := NewHTTPDomainChecker("http://localhost:99999", "test-token", 1)
		ctx := context.Background()
		req := gateway.DomainCheckRequest{Domain: "https://example.com"}

		resp, err := checker.CheckDomain(ctx, req)

		assert.Error(t, err)
		assert.Nil(t, resp)
		assert.Equal(t, "internal", err.Error())
	})

	t.Run("various domain formats", func(t *testing.T) {
		testDomains := []string{
			"https://example.com",
			"http://localhost:3000",
			"https://subdomain.example.com",
			"https://example.com/path",
			"https://example.com:8080",
		}

		for _, domain := range testDomains {
			t.Run(domain, func(t *testing.T) {
				server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					body, _ := io.ReadAll(r.Body)
					var req gateway.DomainCheckRequest
					json.Unmarshal(body, &req)
					assert.Equal(t, domain, req.Domain)

					resp := gateway.DomainCheckResponse{Allowed: true}
					w.WriteHeader(http.StatusOK)
					json.NewEncoder(w).Encode(resp)
				}))
				defer server.Close()

				checker := NewHTTPDomainChecker(server.URL, "test-token", 10)
				ctx := context.Background()
				req := gateway.DomainCheckRequest{Domain: domain}

				resp, err := checker.CheckDomain(ctx, req)

				assert.NoError(t, err)
				assert.NotNil(t, resp)
				assert.True(t, resp.Allowed)
			})
		}
	})

	t.Run("empty response body", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		}))
		defer server.Close()

		checker := NewHTTPDomainChecker(server.URL, "test-token", 10)
		ctx := context.Background()
		req := gateway.DomainCheckRequest{Domain: "https://example.com"}

		resp, err := checker.CheckDomain(ctx, req)

		assert.Error(t, err)
		assert.Nil(t, resp)
		assert.Equal(t, "internal", err.Error())
	})

	t.Run("server closes connection", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			conn, _, _ := w.(http.Hijacker).Hijack()
			conn.Close()
		}))
		defer server.Close()

		checker := NewHTTPDomainChecker(server.URL, "test-token", 10)
		ctx := context.Background()
		req := gateway.DomainCheckRequest{Domain: "https://example.com"}

		resp, err := checker.CheckDomain(ctx, req)

		assert.Error(t, err)
		assert.Nil(t, resp)
	})

	t.Run("concurrent requests", func(t *testing.T) {
		requestCount := 0
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			requestCount++
			resp := gateway.DomainCheckResponse{Allowed: true}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(resp)
		}))
		defer server.Close()

		checker := NewHTTPDomainChecker(server.URL, "test-token", 10)
		ctx := context.Background()

		concurrentRequests := 10
		done := make(chan bool, concurrentRequests)

		for i := 0; i < concurrentRequests; i++ {
			go func(idx int) {
				req := gateway.DomainCheckRequest{Domain: "https://example.com"}
				resp, err := checker.CheckDomain(ctx, req)

				assert.NoError(t, err)
				assert.NotNil(t, resp)
				assert.True(t, resp.Allowed)

				done <- true
			}(i)
		}

		for i := 0; i < concurrentRequests; i++ {
			<-done
		}
	})

	t.Run("large request body", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			body, _ := io.ReadAll(r.Body)
			var req gateway.DomainCheckRequest
			json.Unmarshal(body, &req)

			resp := gateway.DomainCheckResponse{Allowed: true}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(resp)
		}))
		defer server.Close()

		checker := NewHTTPDomainChecker(server.URL, "test-token", 10)
		ctx := context.Background()

		largeDomain := "https://" + strings.Repeat("subdomain.", 100) + "example.com"
		req := gateway.DomainCheckRequest{Domain: largeDomain}

		resp, err := checker.CheckDomain(ctx, req)

		assert.NoError(t, err)
		assert.NotNil(t, resp)
		assert.True(t, resp.Allowed)
	})
}

func TestHTTPDomainChecker_CheckDomain_Headers(t *testing.T) {
	t.Run("verifies all headers are set correctly", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			assert.Equal(t, http.MethodPost, r.Method)
			assert.Equal(t, "application/json", r.Header.Get("Content-Type"))
			assert.Equal(t, "Bearer secret-token", r.Header.Get("Authorization"))

			resp := gateway.DomainCheckResponse{Allowed: true}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(resp)
		}))
		defer server.Close()

		checker := NewHTTPDomainChecker(server.URL, "secret-token", 10)
		ctx := context.Background()
		req := gateway.DomainCheckRequest{Domain: "https://example.com"}

		resp, err := checker.CheckDomain(ctx, req)

		assert.NoError(t, err)
		assert.NotNil(t, resp)
	})
}

func BenchmarkHTTPDomainChecker_CheckDomain(b *testing.B) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := gateway.DomainCheckResponse{Allowed: true}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	checker := NewHTTPDomainChecker(server.URL, "test-token", 10)
	ctx := context.Background()
	req := gateway.DomainCheckRequest{Domain: "https://example.com"}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = checker.CheckDomain(ctx, req)
	}
}
