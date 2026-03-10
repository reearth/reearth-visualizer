package e2e

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/gcs"
	"github.com/reearth/reearth/server/internal/testutil"
	"github.com/stretchr/testify/assert"
)

// go test -v -run TestFileUploadAndDownload ./e2e/...

func isFakeGCSAvailable() bool {
	host := testutil.GetFakeGCSTestHost()
	resp, err := http.Get(host + "/storage/v1/b")
	if err != nil {
		return false
	}
	resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

func extractFilenameFromAssetURL(assetURL string) string {
	// URL format: https://example.com/assets/<uuid>.ext
	idx := strings.LastIndex(assetURL, "/assets/")
	if idx == -1 {
		return ""
	}
	return assetURL[idx+len("/assets/"):]
}

func TestFileUploadAndDownload(t *testing.T) {
	if !isFakeGCSAvailable() {
		t.Skip("fake GCS server is not available, skipping test")
	}

	bucketName := fmt.Sprintf("test-e2e-fileio-%s", generateUUID())

	gcsTest, err := testutil.NewGCSForTesting()
	assert.NoError(t, err)
	defer gcsTest.Close()

	gcsTest.CreateBucket(bucketName)
	t.Cleanup(func() {
		gcsTest.DeleteBucketWithObjects(bucketName)
	})

	fileGw, err := gcs.NewFile(true, bucketName, "https://example.com/", "")
	assert.NoError(t, err)

	e, _, _ := ServerAndReposWithFileGateway(t, baseSeeder, fileGw)

	workspaceId := wID.String()

	// --- PNG upload and download ---
	t.Run("PNG upload and download", func(t *testing.T) {
		res := createAsset(t, e, "test.png", true, workspaceId, nil)
		assetURL := res.Path("$.data.createAsset.asset.url").String().Raw()
		assert.NotEmpty(t, assetURL)

		filename := extractFilenameFromAssetURL(assetURL)
		assert.NotEmpty(t, filename, "failed to extract filename from asset URL: %s", assetURL)

		resp := e.GET("/assets/{filename}", filename).
			WithHeader("Origin", "https://example.com").
			Expect().
			Status(http.StatusOK)

		resp.HasContentType("image/png")

		downloadedBody := resp.Body().Raw()

		originalData, err := os.ReadFile("test.png")
		assert.NoError(t, err)
		assert.Equal(t, len(originalData), len(downloadedBody), "downloaded file size mismatch")
		assert.Equal(t, string(originalData), downloadedBody, "downloaded file content mismatch")
	})

	// --- CSV upload and download ---
	t.Run("CSV upload and download", func(t *testing.T) {
		res := createAsset(t, e, "test.csv", true, workspaceId, nil)
		assetURL := res.Path("$.data.createAsset.asset.url").String().Raw()
		assert.NotEmpty(t, assetURL)

		filename := extractFilenameFromAssetURL(assetURL)
		assert.NotEmpty(t, filename, "failed to extract filename from asset URL: %s", assetURL)

		resp := e.GET("/assets/{filename}", filename).
			WithHeader("Origin", "https://example.com").
			Expect().
			Status(http.StatusOK)

		resp.HasContentType("text/csv")

		downloadedBody := resp.Body().Raw()

		originalData, err := os.ReadFile("test.csv")
		assert.NoError(t, err)
		assert.Equal(t, string(originalData), downloadedBody, "downloaded CSV content mismatch")
	})

	// --- Nonexistent file returns error ---
	t.Run("nonexistent file returns error", func(t *testing.T) {
		resp := e.GET("/assets/{filename}", "nonexistent.png").
			WithHeader("Origin", "https://example.com").
			Expect()

		status := resp.Raw().StatusCode
		assert.NotEqual(t, http.StatusOK, status, "expected non-200 status for nonexistent file, got %d", status)
	})
}

// go test -v -run TestFileUploadAndDownloadMultipleFormats ./e2e/...

func TestFileUploadAndDownloadMultipleFormats(t *testing.T) {
	if !isFakeGCSAvailable() {
		t.Skip("fake GCS server is not available, skipping test")
	}

	bucketName := fmt.Sprintf("test-e2e-multi-%s", generateUUID())

	gcsTest, err := testutil.NewGCSForTesting()
	assert.NoError(t, err)
	defer gcsTest.Close()

	gcsTest.CreateBucket(bucketName)
	t.Cleanup(func() {
		gcsTest.DeleteBucketWithObjects(bucketName)
	})

	fileGw, err := gcs.NewFile(true, bucketName, "https://example.com/", "")
	assert.NoError(t, err)

	e, _, _ := ServerAndReposWithFileGateway(t, baseSeeder, fileGw)

	workspaceId := wID.String()

	// Upload multiple files and verify each can be downloaded
	files := []struct {
		path        string
		contentType string
	}{
		{"test.png", "image/png"},
		{"test.csv", "text/csv"},
	}

	for _, f := range files {
		t.Run(f.path, func(t *testing.T) {
			res := createAsset(t, e, f.path, true, workspaceId, nil)
			assetURL := res.Path("$.data.createAsset.asset.url").String().Raw()

			filename := extractFilenameFromAssetURL(assetURL)
			assert.NotEmpty(t, filename)

			// Download and verify
			resp := e.GET("/assets/{filename}", filename).
				WithHeader("Origin", "https://example.com").
				Expect().
				Status(http.StatusOK)

			resp.HasContentType(f.contentType)

			originalData, err := os.ReadFile(f.path)
			assert.NoError(t, err)

			downloadedBody := resp.Body().Raw()
			assert.Equal(t, string(originalData), downloadedBody)
		})
	}

	// Verify that re-downloading the same file works (idempotency)
	t.Run("re-download same file", func(t *testing.T) {
		res := createAsset(t, e, "test.png", true, workspaceId, nil)
		assetURL := res.Path("$.data.createAsset.asset.url").String().Raw()
		filename := extractFilenameFromAssetURL(assetURL)

		for i := 0; i < 3; i++ {
			resp := e.GET("/assets/{filename}", filename).
				WithHeader("Origin", "https://example.com").
				Expect().
				Status(http.StatusOK)

			originalData, err := os.ReadFile("test.png")
			assert.NoError(t, err)
			downloadedBody := resp.Body().Raw()
			assert.Equal(t, string(originalData), downloadedBody, "download attempt %d failed", i+1)
		}
	})
}
