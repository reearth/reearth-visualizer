package app

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

type fakeDomainChecker struct{}

func (fakeDomainChecker) CheckDomain(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
	return &gateway.DomainCheckResponse{Allowed: false}, nil
}

type fakeFileGateway struct {
	content string
}

func (f fakeFileGateway) ReadAsset(ctx context.Context, name string) (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader(f.content)), nil
}
func (f fakeFileGateway) UploadAsset(ctx context.Context, ff *file.File) (*url.URL, int64, error) {
	return nil, 0, nil
}
func (f fakeFileGateway) UploadAssetFromURL(ctx context.Context, u *url.URL) (*url.URL, int64, error) {
	return nil, 0, nil
}
func (f fakeFileGateway) RemoveAsset(ctx context.Context, u *url.URL) error { return nil }

func (f fakeFileGateway) ReadPluginFile(ctx context.Context, pid id.PluginID, name string) (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader(f.content)), nil
}
func (f fakeFileGateway) UploadPluginFile(ctx context.Context, pid id.PluginID, ff *file.File) error {
	return nil
}
func (f fakeFileGateway) RemovePlugin(ctx context.Context, pid id.PluginID) error { return nil }

func (f fakeFileGateway) UploadBuiltScene(ctx context.Context, r io.Reader, name string) error {
	return nil
}
func (f fakeFileGateway) ReadBuiltSceneFile(ctx context.Context, name string) (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader(f.content)), nil
}
func (f fakeFileGateway) MoveBuiltScene(ctx context.Context, from, to string) error { return nil }
func (f fakeFileGateway) RemoveBuiltScene(ctx context.Context, name string) error   { return nil }

func (f fakeFileGateway) UploadStory(ctx context.Context, r io.Reader, name string) error {
	return nil
}
func (f fakeFileGateway) ReadStoryFile(ctx context.Context, name string) (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader(f.content)), nil
}
func (f fakeFileGateway) MoveStory(ctx context.Context, from, to string) error { return nil }
func (f fakeFileGateway) RemoveStory(ctx context.Context, name string) error  { return nil }

func (f fakeFileGateway) ReadExportProjectZip(ctx context.Context, name string) (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader(f.content)), nil
}
func (f fakeFileGateway) UploadExportProjectZip(ctx context.Context, af afero.File) error {
	return nil
}
func (f fakeFileGateway) RemoveExportProjectZip(ctx context.Context, name string) error { return nil }

func (f fakeFileGateway) GenerateSignedUploadUrl(ctx context.Context, name string) (*string, int, *string, error) {
	return nil, 0, nil, nil
}

func (f fakeFileGateway) ReadImportProjectZip(ctx context.Context, name string) (io.ReadCloser, error) {
	return io.NopCloser(strings.NewReader(f.content)), nil
}
func (f fakeFileGateway) RemoveImportProjectZip(ctx context.Context, name string) error { return nil }

func setupFileTestServer(t *testing.T) *echo.Echo {
	t.Helper()
	e := echo.New()
	fg := fakeFileGateway{content: "<script>alert(1)</script>"}
	serveFiles(e, nil, fakeDomainChecker{}, fg, "{}.example.com", "", "")
	return e
}

func TestServeFiles_AssetHardening(t *testing.T) {
	e := setupFileTestServer(t)

	t.Run("html asset gets nosniff and attachment", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/assets/x.html", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, "nosniff", rec.Header().Get("X-Content-Type-Options"))
		assert.Equal(t, "attachment", rec.Header().Get("Content-Disposition"))
	})

	t.Run("svg asset gets nosniff and attachment", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/assets/x.svg", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, "nosniff", rec.Header().Get("X-Content-Type-Options"))
		assert.Equal(t, "attachment", rec.Header().Get("Content-Disposition"))
	})

	t.Run("unknown extension gets nosniff and attachment", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/assets/x.unknownext", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, "nosniff", rec.Header().Get("X-Content-Type-Options"))
		assert.Equal(t, "attachment", rec.Header().Get("Content-Disposition"))
	})

	t.Run("image asset gets nosniff but not forced attachment", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/assets/x.png", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Equal(t, "nosniff", rec.Header().Get("X-Content-Type-Options"))
		assert.Empty(t, rec.Header().Get("Content-Disposition"))
	})
}

func TestServeFiles_PluginsAndPublishedUnaffected(t *testing.T) {
	e := setupFileTestServer(t)

	t.Run("plugin html file has no forced hardening headers", func(t *testing.T) {
		pid := id.OfficialPluginID
		req := httptest.NewRequest(http.MethodGet, "/plugins/"+pid.String()+"/x.html", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Empty(t, rec.Header().Get("X-Content-Type-Options"))
		assert.Empty(t, rec.Header().Get("Content-Disposition"))
	})

	t.Run("published file has no forced hardening headers", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/published/somename", nil)
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		assert.Empty(t, rec.Header().Get("X-Content-Type-Options"))
		assert.Empty(t, rec.Header().Get("Content-Disposition"))
	})
}
