//go:build e2e

package e2e

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/gavv/httpexpect/v2"
	"github.com/stretchr/testify/require"
)

// make e2e-test TEST_NAME=TestProjectImport

// !!! To run this test, you need to create an environment.

func TestProjectImportSignature(t *testing.T) {
	// e := Server(t, fullSeeder)

	// projectZipFilePath := GenProjectZipFile(t, e)
	// response := GenSignatureUrl("01k5aynsx7ddk31rpqkzhgytea", t)
	// fmt.Printf("UploadURL: %s\n", response.UploadURL)

	// err := UploadProjectZipFile(response.UploadURL, projectZipFilePath, response.ContentType)
	// if err != nil {
	// 	t.Fatalf("Failed to upload project zip file: %v", err)
	// }

	// fmt.Printf("Successfully uploaded project zip file: %s\n", projectZipFilePath)
	// t.Cleanup(func() { _ = os.Remove(projectZipFilePath) })
}

func GenProjectZipFile(t *testing.T, e *httpexpect.Expect, result *SeederResult) (projectZipFilePath string) {

	projectZipFilePath = filepath.Join(t.TempDir(), "project.zip")

	projectId := SetupProject(t, e, result)
	projectDataPath := Export(t, e, projectId, result)
	resp := e.GET(projectDataPath).
		Expect().
		Status(200)
	resp.Header("Content-Type").Contains("application/zip")
	b := []byte(resp.Body().Raw())
	require.NotEmpty(t, b, "response body must not be empty")
	require.NoError(t, os.WriteFile(projectZipFilePath, b, 0o644))
	t.Logf("saved: %s (%d bytes)", projectZipFilePath, len(b))
	zr, err := zip.NewReader(bytes.NewReader(b), int64(len(b)))
	require.NoError(t, err)
	require.Greater(t, len(zr.File), 0, "zip has no entries")
	return
}

type SignedUploadURLResponse struct {
	UploadURL   string `json:"upload_url"`
	ExpiresAt   string `json:"expires_at"`
	ContentType string `json:"content_type"`
}

func GenSignatureUrl(workspaceID string, t *testing.T) (response SignedUploadURLResponse) {

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	err := writer.WriteField("workspace_id", workspaceID)
	if err != nil {
		t.Fatalf("[SignatureUrl] Failed to write field: %v", err)
	}

	writer.Close()

	req, err := http.NewRequest("POST", "http://localhost:8080/api/signature-url", &buf)
	if err != nil {
		t.Fatalf("[SignatureUrl] Failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("[SignatureUrl] Failed to send request: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("[SignatureUrl] Failed to read response: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("[SignatureUrl] Expected status 200, got %d. Response: %s", resp.StatusCode, string(body))
	}

	err = json.Unmarshal(body, &response)
	if err != nil {
		t.Fatalf("[SignatureUrl] Failed to parse JSON response: %v", err)
	}

	if response.UploadURL == "" {
		t.Error("[SignatureUrl] UploadURL is empty")
	}

	if response.ExpiresAt == "" {
		t.Error("[SignatureUrl] ExpiresAt is empty")
	}

	if response.ContentType == "" {
		t.Error("[SignatureUrl] ContentType is empty")
	}

	expiresAt, err := time.Parse(time.RFC3339, response.ExpiresAt)
	if err != nil {
		t.Errorf("[SignatureUrl] Failed to parse ExpiresAt: %v", err)
	} else {
		if expiresAt.Before(time.Now()) {
			t.Error("[SignatureUrl] ExpiresAt should be in the future")
		}
	}
	return

}

func UploadProjectZipFile(uploadURL, filePath, contentType string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("[UploadProjectZip] failed to open file: %w", err)
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		return fmt.Errorf("[UploadProjectZip] failed to get file info: %w", err)
	}

	fmt.Printf("[UploadProjectZip] Uploading file: %s (size: %d bytes)\n", filepath.Base(filePath), fileInfo.Size())

	fileContent, err := io.ReadAll(file)
	if err != nil {
		return fmt.Errorf("[UploadProjectZip] failed to read file content: %w", err)
	}

	req, err := http.NewRequest("PUT", uploadURL, bytes.NewReader(fileContent))
	if err != nil {
		return fmt.Errorf("[UploadProjectZip] failed to create request: %w", err)
	}

	if contentType != "" {
		req.Header.Set("Content-Type", contentType)
	} else {
		req.Header.Set("Content-Type", "application/zip")
	}

	req.ContentLength = fileInfo.Size()

	client := &http.Client{Timeout: 60 * time.Second}

	fmt.Printf("[UploadProjectZip] Sending PUT request to: %s\n", uploadURL)
	start := time.Now()

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("[UploadProjectZip] failed to send request: %w", err)
	}
	defer resp.Body.Close()

	duration := time.Since(start)
	fmt.Printf("[UploadProjectZip] Upload completed in %v\n", duration)

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("[UploadProjectZip] failed to read response body: %w", err)
	}

	fmt.Printf("[UploadProjectZip] Upload response status: %d\n", resp.StatusCode)
	// fmt.Printf("[UploadProjectZip] Upload response headers:\n")
	// for key, values := range resp.Header {
	// 	for _, value := range values {
	// 		fmt.Printf("  %s: %s\n", key, value)
	// 	}
	// }

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("[UploadProjectZip] upload failed with status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}
