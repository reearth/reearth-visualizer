package app

import (
	"context"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

type mockFileGateway struct {
	assets map[string][]byte
	err    error
}

func (m *mockFileGateway) ReadAsset(_ context.Context, name string) (io.ReadCloser, error) {
	if m.err != nil {
		return nil, m.err
	}
	if data, ok := m.assets[name]; ok {
		return io.NopCloser(strings.NewReader(string(data))), nil
	}
	return nil, rerror.ErrNotFound
}

func (m *mockFileGateway) UploadAsset(context.Context, *file.File) (*url.URL, int64, error) {
	return nil, 0, errors.New("not implemented")
}

func (m *mockFileGateway) UploadAssetFromURL(context.Context, *url.URL) (*url.URL, int64, error) {
	return nil, 0, errors.New("not implemented")
}

func (m *mockFileGateway) RemoveAsset(context.Context, *url.URL) error {
	return errors.New("not implemented")
}

func (m *mockFileGateway) ReadPluginFile(context.Context, id.PluginID, string) (io.ReadCloser, error) {
	return nil, errors.New("not implemented")
}

func (m *mockFileGateway) UploadPluginFile(context.Context, id.PluginID, *file.File) error {
	return errors.New("not implemented")
}

func (m *mockFileGateway) RemovePlugin(context.Context, id.PluginID) error {
	return errors.New("not implemented")
}

func (m *mockFileGateway) UploadBuiltScene(context.Context, io.Reader, string) error {
	return errors.New("not implemented")
}

func (m *mockFileGateway) ReadBuiltSceneFile(context.Context, string) (io.ReadCloser, error) {
	return nil, errors.New("not implemented")
}

func (m *mockFileGateway) MoveAsset(context.Context, string, string) error {
	return errors.New("not implemented")
}

func (m *mockFileGateway) ReadExportProjectZip(context.Context, string) (io.ReadCloser, error) {
	return nil, errors.New("not implemented")
}

func (m *mockFileGateway) RemoveExportProjectZip(context.Context, string) error {
	return errors.New("not implemented")
}

func (m *mockFileGateway) UploadExportProjectZip(context.Context, io.Reader) (*string, error) {
	return nil, errors.New("not implemented")
}

func (m *mockFileGateway) ReadStory(context.Context, string, string) (io.ReadCloser, error) {
	return nil, errors.New("not implemented")
}

func (m *mockFileGateway) UploadStory(context.Context, io.Reader, string) error {
	return errors.New("not implemented")
}

func (m *mockFileGateway) MoveStory(context.Context, string, string, string) error {
	return errors.New("not implemented")
}

func (m *mockFileGateway) RemoveStory(context.Context, string) error {
	return errors.New("not implemented")
}

func TestDomainAuthorizationService_ValidateAssetAccess(t *testing.T) {
	ctx := context.Background()
	
	assetID := id.NewAssetID()
	projectID := id.NewProjectID()
	workspaceID := accountdomain.NewWorkspaceID()
	
	testAsset := asset.New().
		ID(assetID).
		Workspace(workspaceID).
		Project(&projectID).
		Name("test.jpg").
		Size(1024).
		URL("https://example.com/assets/" + assetID.String()).
		ContentType("image/jpeg").
		MustBuild()
	
	testProject := project.New().
		ID(projectID).
		Workspace(workspaceID).
		Alias("testproject").
		PublishmentStatus(project.PublishmentStatusPublic).
		MustBuild()
	
	assetRepo := memory.NewAsset()
	_ = assetRepo.Save(ctx, testAsset)
	
	projectRepo := memory.NewProject()
	_ = projectRepo.Save(ctx, testProject)
	
	authService := NewDomainAuthorizationService(assetRepo, projectRepo, nil)
	
	pid, err := authService.ValidateAssetAccess(ctx, assetID.String(), "https://testproject.reearth.io")
	assert.NoError(t, err)
	assert.NotNil(t, pid)
	assert.Equal(t, projectID, *pid)

	_, err = authService.ValidateAssetAccess(ctx, "invalid-id", "https://testproject.reearth.io")
	assert.Error(t, err)
	assert.True(t, errors.Is(err, rerror.ErrNotFound))

	nonExistentID := id.NewAssetID()
	_, err = authService.ValidateAssetAccess(ctx, nonExistentID.String(), "https://testproject.reearth.io")
	assert.Error(t, err)
	assert.True(t, errors.Is(err, rerror.ErrNotFound))

	_, err = authService.ValidateAssetAccess(ctx, assetID.String(), "https://malicious.com")
	assert.Error(t, err)
}

func TestExtractDomain(t *testing.T) {
	assert.Equal(t, "example.com", extractDomain("https://example.com/path"))
	assert.Equal(t, "example.com", extractDomain("http://example.com/path"))
	assert.Equal(t, "example.com", extractDomain("https://example.com:8080/path"))
	assert.Equal(t, "example.com", extractDomain("example.com"))
	assert.Equal(t, "", extractDomain(""))
}

func TestSecureFileServingMiddleware(t *testing.T) {
	e := echo.New()
	
	assetRepo := memory.NewAsset()
	projectRepo := memory.NewProject()
	authService := NewDomainAuthorizationService(assetRepo, projectRepo, nil)
	
	e.Use(SecureFileServingMiddleware(authService))
	
	e.GET("/test", func(c echo.Context) error {
		assert.Equal(t, "nosniff", c.Response().Header().Get("X-Content-Type-Options"))
		assert.Equal(t, "DENY", c.Response().Header().Get("X-Frame-Options"))
		return c.String(http.StatusOK, "test")
	})
	
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("Origin", "https://example.com")
	rec := httptest.NewRecorder()
	
	e.ServeHTTP(rec, req)
	
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "nosniff", rec.Header().Get("X-Content-Type-Options"))
	assert.Equal(t, "DENY", rec.Header().Get("X-Frame-Options"))
}

func TestDomainValidator(t *testing.T) {
	validator := NewDomainValidator()
	projectID1 := id.NewProjectID()
	projectID2 := id.NewProjectID()
	
	validator.RegisterProjectDomain(projectID1, "https://project1.reearth.io")
	validator.RegisterProjectDomain(projectID1, "project1.custom.com")
	validator.RegisterProjectDomain(projectID2, "https://project2.reearth.io")
	validator.RegisterProjectDomain(projectID2, "*.wildcard.com")
	
	validator.SetProjectPublic(projectID1, true)
	
	assert.True(t, validator.ValidateDomainForProject("https://random.com", projectID1))
	assert.True(t, validator.ValidateDomainForProject("https://project2.reearth.io", projectID2))
	assert.False(t, validator.ValidateDomainForProject("https://unauthorized.com", projectID2))
	assert.True(t, validator.ValidateDomainForProject("subdomain.wildcard.com", projectID2))
	assert.False(t, validator.ValidateDomainForProject("wildcard.net", projectID2))
}

func TestNormalizeDomain(t *testing.T) {
	assert.Equal(t, "example.com", normalizeDomain("https://Example.COM/path"))
	assert.Equal(t, "example.com", normalizeDomain("http://EXAMPLE.com:8080/path"))
	assert.Equal(t, "example.com", normalizeDomain("example.com."))
	assert.Equal(t, "example.com", normalizeDomain("ExAmPlE.CoM"))
	assert.Equal(t, "[2001:db8::1]", normalizeDomain("[2001:db8::1]:8080"))
}

func TestMockFileGateway_ReadAsset(t *testing.T) {
	ctx := context.Background()
	
	// Test successful asset reading
	mockGateway := &mockFileGateway{
		assets: map[string][]byte{
			"test.jpg": []byte("test image data"),
			"doc.pdf":  []byte("test document data"),
		},
	}
	
	reader, err := mockGateway.ReadAsset(ctx, "test.jpg")
	assert.NoError(t, err)
	assert.NotNil(t, reader)
	
	// Read the content to verify
	data := make([]byte, 15)
	n, _ := reader.Read(data)
	assert.Equal(t, "test image data", string(data[:n]))
	reader.Close()
	
	// Test asset not found
	_, err = mockGateway.ReadAsset(ctx, "nonexistent.jpg")
	assert.Error(t, err)
	assert.True(t, errors.Is(err, rerror.ErrNotFound))
	
	// Test error condition
	mockGateway.err = errors.New("mock error")
	_, err = mockGateway.ReadAsset(ctx, "test.jpg")
	assert.Error(t, err)
	assert.Equal(t, "mock error", err.Error())
}
