package apiv1

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestRequireBearerToken(t *testing.T) {
	for _, tc := range []struct {
		name   string
		header string
		passed bool
	}{
		{name: "no header"},
		{name: "empty bearer", header: "Bearer "},
		{name: "spaces only", header: "Bearer    "},
		{name: "other scheme", header: "Basic dXNlcjpwYXNz"},
		{name: "no scheme", header: "abc.def.ghi"},
		{name: "bearer token", header: "Bearer abc.def.ghi", passed: true},
		{name: "lowercase scheme", header: "bearer abc.def.ghi", passed: true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/api/v1/projects/x", nil)
			if tc.header != "" {
				req.Header.Set(echo.HeaderAuthorization, tc.header)
			}
			c := e.NewContext(req, httptest.NewRecorder())

			called := false
			err := RequireBearerToken(func(echo.Context) error { called = true; return nil })(c)

			assert.Equal(t, tc.passed, called)
			if tc.passed {
				assert.NoError(t, err)
			} else {
				assert.Equal(t, errUnauthorized, err)
			}
		})
	}
}
