package gateway

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path/filepath"
	"strings"
	"time"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
)

// CSVDataSource implements DataSource for hosted CSV/TSV files.
type CSVDataSource struct{}

// IsURLValid checks if the URL is valid for CSV fetch (HTTP/HTTPS, .csv/.tsv).
func (CSVDataSource) IsURLValid(ctx context.Context, u string) bool {
	parsed, err := url.Parse(u)
	if err != nil {
		return false
	}

	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return false
	}

	if strings.Contains(parsed.Host, "docs.google.com") && strings.Contains(parsed.Path, "/spreadsheets/d/e/") {
		return true
	}

	if parsed.Host == "raw.githubusercontent.com" {
		return true
	}

	ext := strings.ToLower(filepath.Ext(parsed.Path))
	return ext == ".csv" || ext == ".tsv"
}

// Fetch fetches CSV without auth.
func (CSVDataSource) Fetch(ctx context.Context, urlStr string, sceneID id.SceneID) (dataset.SchemaList, dataset.List, error) {
	return fetchCSV(ctx, urlStr, sceneID, nil)
}

// FetchWithAuth fetches CSV with auth.
func (CSVDataSource) FetchWithAuth(ctx context.Context, urlStr string, sceneID id.SceneID, auth *dataset.AuthConfig) (dataset.SchemaList, dataset.List, error) {
	return fetchCSV(ctx, urlStr, sceneID, auth)
}

// FetchRaw fetches raw CSV body for custom parsing (e.g., replacement mode).
func (CSVDataSource) FetchRaw(ctx context.Context, urlStr string, auth *dataset.AuthConfig) (io.ReadCloser, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", urlStr, nil)
	if err != nil {
		return nil, rerror.ErrInternalByWithContext(ctx, err)
	}

	if auth != nil && auth.Type != "" {
		switch auth.Type {
		case "basic":
			req.SetBasicAuth(auth.Username, auth.Password)
		case "bearer":
			req.Header.Set("Authorization", "Bearer "+auth.APIKey)
		case "apikey":
			req.Header.Set("X-API-Key", auth.APIKey)
		default:
			return nil, fmt.Errorf("unsupported auth type: %s", auth.Type)
		}
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, rerror.ErrInternalByWithContext(ctx, err)
	}

	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		return nil, rerror.ErrInternalByWithContext(ctx, fmt.Errorf("HTTP %d: %s", resp.StatusCode, resp.Status))
	}

	return resp.Body, nil
}

// fetchCSV is the internal fetch logic for full parse.
func fetchCSV(ctx context.Context, urlStr string, sceneID id.SceneID, auth *dataset.AuthConfig) (dataset.SchemaList, dataset.List, error) {
	body, err := (CSVDataSource{}).FetchRaw(ctx, urlStr, auth)
	if err != nil {
		return nil, nil, err
	}
	defer body.Close()

	name := filepath.Base(urlStr)
	if name == "" {
		name = "hosted.csv"
	}
	separator := ','
	if strings.HasSuffix(strings.ToLower(name), ".tsv") {
		separator = '\t'
	}

	parser := dataset.NewCSVParser(body, name, urlStr, separator)
	if err := parser.Init(); err != nil {
		return nil, nil, rerror.ErrInternalByWithContext(ctx, err)
	}

	if err := parser.GuessSchema(sceneID); err != nil {
		return nil, nil, rerror.ErrInternalByWithContext(ctx, err)
	}

	schema, datasets, err := parser.ReadAll()
	if err != nil {
		return nil, nil, rerror.ErrInternalByWithContext(ctx, err)
	}

	if auth != nil {
		schema.SetAuthConfig(auth)
	}

	return dataset.SchemaList{schema}, dataset.List(datasets), nil
}
