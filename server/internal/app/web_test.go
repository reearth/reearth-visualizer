package app

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase/interactor"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestWeb(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	httpmock.RegisterResponder("GET", "https://example.com/favicon.ico", httpmock.NewBytesResponder(http.StatusOK, []byte("icon")))

	const indexHTML = `<html><head><meta charset="utf-8" /><title>Re:Earth</title><link rel="icon" href="favicon.ico" /></head></html>`
	const indexHTML2 = `<html><head><meta charset="utf-8" /><title>title</title><link rel="icon" href="/favicon.ico" /></head></html>`
	const publishedHTML = `<html><head><meta charset="utf-8" /><title>Re:Earth Published</title></head></html>`
	const testJS = `console.log("hello, world");`
	const dataJSON = `{"data":"data"}`
	const alias = "alias"
	prj := project.New().NewID().Workspace(project.NewWorkspaceID()).
		PublicTitle("TITLE").
		PublicDescription("DESC").
		Alias(alias).
		PublishmentStatus(project.PublishmentStatusPublic).
		MustBuild()

	ctx := context.Background()
	mfs := afero.NewMemMapFs()
	lo.Must0(afero.WriteFile(mfs, "web/index.html", []byte(indexHTML), 0777))
	lo.Must0(afero.WriteFile(mfs, "web/published.html", []byte(publishedHTML), 0777))
	lo.Must0(afero.WriteFile(mfs, "web/test.js", []byte(testJS), 0777))
	prjRepo := memory.NewProject()
	storyRepo := memory.NewStorytelling()
	lo.Must0(prjRepo.Save(ctx, prj))
	fileg := lo.Must(fs.NewFile(mfs, ""))
	lo.Must0(fileg.UploadBuiltScene(ctx, strings.NewReader(dataJSON), prj.Alias()))

	tests := []struct {
		name        string
		path        string
		host        string
		disabled    bool
		appDisabled bool
		statusCode  int
		body        string
		contentType string
		assertBody  func(t *testing.T, body string)
	}{
		{
			name:       "disabled",
			disabled:   true,
			path:       "/reearth_config.json",
			statusCode: http.StatusNotFound,
			body:       `{"error":"not found"}`,
		},
		{
			name:        "reearth_config.json",
			path:        "/reearth_config.json",
			statusCode:  http.StatusOK,
			body:        `{"a":"b","auth0Audience":"https://aud.example.com","auth0ClientId":"clientID","auth0Domain":"https://iss.example.com","published":"https://{}.example.com"}`,
			contentType: "application/json; charset=UTF-8",
		},
		{
			name:        "invalid path should serve index.html",
			path:        "/not_found.js",
			statusCode:  http.StatusOK,
			body:        indexHTML2,
			contentType: "text/html; charset=utf-8",
		},
		{
			name:       "static file",
			path:       "/test.js",
			statusCode: http.StatusOK,
			body:       testJS,
			// content type is not static
			// contentType: "application/javascript",
			// contentType: "text/javascript; charset=utf-8",
		},
		{
			name:        "data file without host",
			path:        "/data.json",
			statusCode:  http.StatusNotFound,
			body:        `{"error":"not found"}`,
			contentType: "application/json; charset=UTF-8",
		},
		{
			name:        "data file with host",
			path:        "/data.json",
			host:        alias + ".example.com",
			statusCode:  http.StatusOK,
			body:        dataJSON,
			contentType: "application/json",
		},
		{
			name:       "index.html redirection",
			path:       "/index.html",
			statusCode: http.StatusPermanentRedirect,
		},
		{
			name:        "index file without host",
			path:        "/",
			statusCode:  http.StatusOK,
			body:        indexHTML2,
			contentType: "text/html; charset=utf-8",
		},
		{
			name:        "index file with app disabled",
			appDisabled: true,
			path:        "/",
			statusCode:  http.StatusNotFound,
		},
		{
			name:        "index file with app host",
			path:        "/",
			host:        "aaa.example2.com",
			statusCode:  http.StatusOK,
			body:        indexHTML2,
			contentType: "text/html; charset=utf-8",
		},
		{
			name:        "index file with invalid alias",
			path:        "/",
			host:        "aaa.example.com",
			statusCode:  http.StatusOK,
			body:        publishedHTML,
			contentType: "text/html; charset=UTF-8",
		},
		{
			name:        "index file with host",
			path:        "/",
			host:        alias + ".example.com",
			statusCode:  http.StatusOK,
			contentType: "text/html; charset=UTF-8",
			assertBody: func(t *testing.T, body string) {
				assert.Contains(t, body, "TITLE")
				assert.Contains(t, body, "DESC")
			},
		},
		{
			name:        "favicon",
			path:        "/favicon.ico",
			statusCode:  http.StatusOK,
			body:        "icon",
			contentType: "image/vnd.microsoft.icon",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			// t.Parallel()

			e := echo.New()
			e.HTTPErrorHandler = func(err error, c echo.Context) {
				if errors.Is(err, rerror.ErrNotFound) || errors.Is(err, echo.ErrNotFound) {
					_ = c.JSON(http.StatusNotFound, map[string]any{"error": "not found"})
					return
				}
				_ = c.JSON(http.StatusInternalServerError, err.Error())
			}

			e.Use(ContextMiddleware(func(ctx context.Context) context.Context {
				return adapter.AttachUsecases(ctx, &interfaces.Container{
					Published: interactor.NewPublished(prjRepo, storyRepo, fileg, publishedHTML),
				})
			}))

			(&WebHandler{
				Disabled:    tt.disabled,
				AppDisabled: tt.appDisabled,
				WebConfig: map[string]any{
					"a": "b",
				},
				AuthConfig: &config.AuthConfig{
					ISS:      "https://iss.example.com",
					AUD:      []string{"https://aud.example.com"},
					ClientID: lo.ToPtr("clientID"),
				},
				HostPattern: `{}.example.com`,
				FS:          mfs,
				Title:       "title",
				FaviconURL:  "https://example.com/favicon.ico",
			}).Handler(e)

			r := httptest.NewRequest("GET", tt.path, nil)
			if tt.host != "" {
				r.Host = tt.host
			}
			w := httptest.NewRecorder()
			e.ServeHTTP(w, r)
			assert.Equal(t, tt.statusCode, w.Result().StatusCode)
			if tt.body != "" {
				assert.Equal(t, tt.body, strings.TrimSpace(w.Body.String()))
			}
			if tt.contentType != "" {
				assert.Equal(t, tt.contentType, w.Header().Get("Content-Type"))
			}
			if tt.assertBody != nil {
				tt.assertBody(t, w.Body.String())
			}
		})
	}
}
