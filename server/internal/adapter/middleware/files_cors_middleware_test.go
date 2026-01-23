package middleware

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/stretchr/testify/assert"
)

type mockDomainChecker struct {
	checkFunc func(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error)
}

func (m *mockDomainChecker) CheckDomain(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
	if m.checkFunc != nil {
		return m.checkFunc(ctx, req)
	}
	return &gateway.DomainCheckResponse{}, nil
}

func TestFilesCORSMiddleware(t *testing.T) {
	t.Run("no origin header continues without CORS headers", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest("GET", "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		mockChecker := &mockDomainChecker{}
		handler := func(c echo.Context) error {
			return c.String(http.StatusOK, "OK")
		}

		middleware := FilesCORSMiddleware(mockChecker, []string{"https://example.com"})
		h := middleware(handler)

		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Empty(t, rec.Header().Get("Access-Control-Allow-Origin"))
		assert.Empty(t, rec.Header().Get("Access-Control-Allow-Methods"))
		assert.Empty(t, rec.Header().Get("Access-Control-Allow-Headers"))
		assert.Empty(t, rec.Header().Get("Access-Control-Max-Age"))
	})

	t.Run("origin in allowed list", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest("GET", "/", nil)
		req.Header.Set("Origin", "https://example.com")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		mockChecker := &mockDomainChecker{}
		handler := func(c echo.Context) error {
			return c.String(http.StatusOK, "OK")
		}

		middleware := FilesCORSMiddleware(mockChecker, []string{"https://example.com", "https://test.com"})
		h := middleware(handler)

		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, "https://example.com", rec.Header().Get("Access-Control-Allow-Origin"))
		assert.Equal(t, "GET, OPTIONS", rec.Header().Get("Access-Control-Allow-Methods"))
		assert.Equal(t, "*", rec.Header().Get("Access-Control-Allow-Headers"))
		assert.Equal(t, "86400", rec.Header().Get("Access-Control-Max-Age"))
	})

	t.Run("origin not in allowed list", func(t *testing.T) {
		t.Run("allowed by domain checker", func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest("GET", "/", nil)
			req.Header.Set("Origin", "https://custom.com")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			mockChecker := &mockDomainChecker{
				checkFunc: func(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
					if req.Domain == "custom.com" {
						return &gateway.DomainCheckResponse{Allowed: true}, nil
					}
					return &gateway.DomainCheckResponse{Allowed: false}, nil
				},
			}

			handler := func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			}

			middleware := FilesCORSMiddleware(mockChecker, []string{"https://example.com"})
			h := middleware(handler)

			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Equal(t, "https://custom.com", rec.Header().Get("Access-Control-Allow-Origin"))
			assert.Equal(t, "GET, OPTIONS", rec.Header().Get("Access-Control-Allow-Methods"))
			assert.Equal(t, "*", rec.Header().Get("Access-Control-Allow-Headers"))
			assert.Equal(t, "86400", rec.Header().Get("Access-Control-Max-Age"))
		})

		t.Run("not allowed by domain checker", func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest("GET", "/", nil)
			req.Header.Set("Origin", "https://unauthorized.com")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			mockChecker := &mockDomainChecker{
				checkFunc: func(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
					return &gateway.DomainCheckResponse{Allowed: false}, nil
				},
			}

			handler := func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			}

			middleware := FilesCORSMiddleware(mockChecker, []string{"https://example.com"})
			h := middleware(handler)

			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Empty(t, rec.Header().Get("Access-Control-Allow-Origin"))
			assert.Empty(t, rec.Header().Get("Access-Control-Allow-Methods"))
			assert.Empty(t, rec.Header().Get("Access-Control-Allow-Headers"))
			assert.Empty(t, rec.Header().Get("Access-Control-Max-Age"))
		})

		t.Run("domain checker returns error", func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest("GET", "/", nil)
			req.Header.Set("Origin", "https://error.com")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			mockChecker := &mockDomainChecker{
				checkFunc: func(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
					return &gateway.DomainCheckResponse{}, errors.New("domain checker error")
				},
			}

			handler := func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			}

			middleware := FilesCORSMiddleware(mockChecker, []string{})
			h := middleware(handler)

			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Empty(t, rec.Header().Get("Access-Control-Allow-Origin"))
			assert.Empty(t, rec.Header().Get("Access-Control-Allow-Methods"))
			assert.Empty(t, rec.Header().Get("Access-Control-Allow-Headers"))
			assert.Empty(t, rec.Header().Get("Access-Control-Max-Age"))
		})
	})

	t.Run("OPTIONS request", func(t *testing.T) {
		t.Run("passes through with CORS headers when origin in allowed list", func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest("OPTIONS", "/", nil)
			req.Header.Set("Origin", "https://example.com")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			mockChecker := &mockDomainChecker{}
			handler := func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			}

			middleware := FilesCORSMiddleware(mockChecker, []string{"https://example.com"})
			h := middleware(handler)

			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Equal(t, "https://example.com", rec.Header().Get("Access-Control-Allow-Origin"))
			assert.Equal(t, "GET, OPTIONS", rec.Header().Get("Access-Control-Allow-Methods"))
			assert.Equal(t, "*", rec.Header().Get("Access-Control-Allow-Headers"))
			assert.Equal(t, "86400", rec.Header().Get("Access-Control-Max-Age"))
		})

		t.Run("continues without CORS headers when no origin header", func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest("OPTIONS", "/", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			mockChecker := &mockDomainChecker{}
			handler := func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			}

			middleware := FilesCORSMiddleware(mockChecker, []string{"https://example.com"})
			h := middleware(handler)

			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Empty(t, rec.Header().Get("Access-Control-Allow-Origin"))
			assert.Empty(t, rec.Header().Get("Access-Control-Allow-Methods"))
			assert.Empty(t, rec.Header().Get("Access-Control-Allow-Headers"))
			assert.Empty(t, rec.Header().Get("Access-Control-Max-Age"))
		})
	})

	t.Run("multiple allowed origins", func(t *testing.T) {
		t.Run("first origin matches", func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest("GET", "/", nil)
			req.Header.Set("Origin", "https://first.com")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			mockChecker := &mockDomainChecker{}
			handler := func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			}

			middleware := FilesCORSMiddleware(mockChecker, []string{"https://first.com", "https://second.com", "https://third.com"})
			h := middleware(handler)

			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Equal(t, "https://first.com", rec.Header().Get("Access-Control-Allow-Origin"))
		})

		t.Run("last origin matches", func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest("GET", "/", nil)
			req.Header.Set("Origin", "https://third.com")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			mockChecker := &mockDomainChecker{}
			handler := func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			}

			middleware := FilesCORSMiddleware(mockChecker, []string{"https://first.com", "https://second.com", "https://third.com"})
			h := middleware(handler)

			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Equal(t, "https://third.com", rec.Header().Get("Access-Control-Allow-Origin"))
		})

		t.Run("middle origin matches", func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest("GET", "/", nil)
			req.Header.Set("Origin", "https://second.com")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			mockChecker := &mockDomainChecker{}
			handler := func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			}

			middleware := FilesCORSMiddleware(mockChecker, []string{"https://first.com", "https://second.com", "https://third.com"})
			h := middleware(handler)

			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Equal(t, "https://second.com", rec.Header().Get("Access-Control-Allow-Origin"))
		})
	})

	t.Run("empty allowed origins list", func(t *testing.T) {
		t.Run("uses domain checker when allowed", func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest("GET", "/", nil)
			req.Header.Set("Origin", "https://dynamic.com")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			mockChecker := &mockDomainChecker{
				checkFunc: func(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
					return &gateway.DomainCheckResponse{Allowed: true}, nil
				},
			}

			handler := func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			}

			middleware := FilesCORSMiddleware(mockChecker, []string{})
			h := middleware(handler)

			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Equal(t, "https://dynamic.com", rec.Header().Get("Access-Control-Allow-Origin"))
			assert.Equal(t, "GET, OPTIONS", rec.Header().Get("Access-Control-Allow-Methods"))
			assert.Equal(t, "*", rec.Header().Get("Access-Control-Allow-Headers"))
			assert.Equal(t, "86400", rec.Header().Get("Access-Control-Max-Age"))
		})
	})

	t.Run("different HTTP methods", func(t *testing.T) {
		t.Run("POST method with allowed origin", func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest("POST", "/", nil)
			req.Header.Set("Origin", "https://example.com")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			mockChecker := &mockDomainChecker{}
			handler := func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			}

			middleware := FilesCORSMiddleware(mockChecker, []string{"https://example.com"})
			h := middleware(handler)

			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Equal(t, "https://example.com", rec.Header().Get("Access-Control-Allow-Origin"))
			assert.Equal(t, "GET, OPTIONS", rec.Header().Get("Access-Control-Allow-Methods"))
		})

		t.Run("PUT method with allowed origin", func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest("PUT", "/", nil)
			req.Header.Set("Origin", "https://example.com")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			mockChecker := &mockDomainChecker{}
			handler := func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			}

			middleware := FilesCORSMiddleware(mockChecker, []string{"https://example.com"})
			h := middleware(handler)

			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Equal(t, "https://example.com", rec.Header().Get("Access-Control-Allow-Origin"))
			assert.Equal(t, "GET, OPTIONS", rec.Header().Get("Access-Control-Allow-Methods"))
		})

		t.Run("DELETE method with allowed origin", func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest("DELETE", "/", nil)
			req.Header.Set("Origin", "https://example.com")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			mockChecker := &mockDomainChecker{}
			handler := func(c echo.Context) error {
				return c.String(http.StatusOK, "OK")
			}

			middleware := FilesCORSMiddleware(mockChecker, []string{"https://example.com"})
			h := middleware(handler)

			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Equal(t, "https://example.com", rec.Header().Get("Access-Control-Allow-Origin"))
			assert.Equal(t, "GET, OPTIONS", rec.Header().Get("Access-Control-Allow-Methods"))
		})
	})
}

func TestFilesCORSMiddleware_ConcurrentRequests(t *testing.T) {
	e := echo.New()

	mockChecker := &mockDomainChecker{
		checkFunc: func(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
			return &gateway.DomainCheckResponse{Allowed: true}, nil
		},
	}

	middleware := FilesCORSMiddleware(mockChecker, []string{"https://allowed.com"})

	handler := func(c echo.Context) error {
		return c.String(http.StatusOK, "OK")
	}

	h := middleware(handler)

	concurrentRequests := 10
	done := make(chan bool, concurrentRequests)

	for i := 0; i < concurrentRequests; i++ {
		go func(idx int) {
			origin := "https://allowed.com"
			if idx%2 == 0 {
				origin = "https://dynamic.com"
			}

			req := httptest.NewRequest("GET", "/", nil)
			req.Header.Set("Origin", origin)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)

			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Equal(t, origin, rec.Header().Get("Access-Control-Allow-Origin"))

			done <- true
		}(i)
	}

	for i := 0; i < concurrentRequests; i++ {
		<-done
	}
}

func TestFilesCORSMiddleware_NilDomainChecker(t *testing.T) {
	e := echo.New()

	t.Run("origin not in allowed list - panics", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/", nil)
		req.Header.Set("Origin", "https://test.com")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		handler := func(c echo.Context) error {
			return c.String(http.StatusOK, "OK")
		}

		middleware := FilesCORSMiddleware(nil, []string{"https://allowed.com"})
		h := middleware(handler)

		assert.Panics(t, func() {
			_ = h(c)
		})
	})

	t.Run("origin in allowed list - works fine", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/", nil)
		req.Header.Set("Origin", "https://allowed.com")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		handler := func(c echo.Context) error {
			return c.String(http.StatusOK, "OK")
		}

		middleware := FilesCORSMiddleware(nil, []string{"https://allowed.com"})
		h := middleware(handler)

		assert.NotPanics(t, func() {
			err := h(c)
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, rec.Code)
			assert.Equal(t, "https://allowed.com", rec.Header().Get("Access-Control-Allow-Origin"))
		})
	})
}

func TestFilesCORSMiddleware_EdgeCases(t *testing.T) {
	t.Run("origin with trailing slash", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest("GET", "/", nil)
		req.Header.Set("Origin", "https://example.com/")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		mockChecker := &mockDomainChecker{
			checkFunc: func(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
				if req.Domain == "example.com" {
					return &gateway.DomainCheckResponse{Allowed: true}, nil
				}
				return &gateway.DomainCheckResponse{Allowed: false}, nil
			},
		}

		handler := func(c echo.Context) error {
			return c.String(http.StatusOK, "OK")
		}

		middleware := FilesCORSMiddleware(mockChecker, []string{"https://example.com"})
		h := middleware(handler)

		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, "https://example.com/", rec.Header().Get("Access-Control-Allow-Origin"))
	})

	t.Run("case sensitive origin matching", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest("GET", "/", nil)
		req.Header.Set("Origin", "https://Example.COM")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		mockChecker := &mockDomainChecker{
			checkFunc: func(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
				return &gateway.DomainCheckResponse{Allowed: false}, nil
			},
		}

		handler := func(c echo.Context) error {
			return c.String(http.StatusOK, "OK")
		}

		middleware := FilesCORSMiddleware(mockChecker, []string{"https://example.com"})
		h := middleware(handler)

		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Empty(t, rec.Header().Get("Access-Control-Allow-Origin"))
	})

	t.Run("origin with port number", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest("GET", "/", nil)
		req.Header.Set("Origin", "https://example.com:8080")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		mockChecker := &mockDomainChecker{}
		handler := func(c echo.Context) error {
			return c.String(http.StatusOK, "OK")
		}

		middleware := FilesCORSMiddleware(mockChecker, []string{"https://example.com:8080"})
		h := middleware(handler)

		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, "https://example.com:8080", rec.Header().Get("Access-Control-Allow-Origin"))
	})

	t.Run("localhost origin", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest("GET", "/", nil)
		req.Header.Set("Origin", "http://localhost:3000")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)

		mockChecker := &mockDomainChecker{}
		handler := func(c echo.Context) error {
			return c.String(http.StatusOK, "OK")
		}

		middleware := FilesCORSMiddleware(mockChecker, []string{"http://localhost:3000"})
		h := middleware(handler)

		err := h(c)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, "http://localhost:3000", rec.Header().Get("Access-Control-Allow-Origin"))
	})
}

func BenchmarkFilesCORSMiddleware_AllowedOrigin(b *testing.B) {
	e := echo.New()
	mockChecker := &mockDomainChecker{}
	middleware := FilesCORSMiddleware(mockChecker, []string{"https://example.com"})

	handler := func(c echo.Context) error {
		return c.String(http.StatusOK, "OK")
	}

	h := middleware(handler)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("GET", "/", nil)
		req.Header.Set("Origin", "https://example.com")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		_ = h(c)
	}
}

func BenchmarkFilesCORSMiddleware_DomainChecker(b *testing.B) {
	e := echo.New()
	mockChecker := &mockDomainChecker{
		checkFunc: func(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
			return &gateway.DomainCheckResponse{Allowed: true}, nil
		},
	}
	middleware := FilesCORSMiddleware(mockChecker, []string{})

	handler := func(c echo.Context) error {
		return c.String(http.StatusOK, "OK")
	}

	h := middleware(handler)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := httptest.NewRequest("GET", "/", nil)
		req.Header.Set("Origin", "https://dynamic.com")
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		_ = h(c)
	}
}
