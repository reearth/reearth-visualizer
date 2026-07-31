package e2e

import (
	"bytes"
	"fmt"
	"io"
	"math"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"sync"
	"testing"
	"time"

	"github.com/gavv/httpexpect/v2"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

// go test -v -run TestProjectImportSplit ./e2e/...

// uploadProjectSplit uploads projectZipFilePath to /api/split-import in
// chunks and returns every chunk response in upload order, so callers can
// inspect the final ("completed": true) response — e.g. to read back the
// project_id and poll its resulting import status.
func uploadProjectSplit(t *testing.T, e *httpexpect.Expect, projectZipFilePath, workspaceId string) []map[string]interface{} {
	t.Helper()

	const CHUNK_SIZE = 1024 * 1024
	const CHUNK_CONCURRENCY = 4

	file, err := os.Open(projectZipFilePath)
	require.NoError(t, err)
	defer file.Close()

	fileInfo, err := file.Stat()
	require.NoError(t, err)
	fileSize := fileInfo.Size()

	totalChunks := int(math.Ceil(float64(fileSize) / float64(CHUNK_SIZE)))

	fileId := uuid.New().String()

	uploadChunk := func(chunkNum int) (map[string]interface{}, error) {
		start := int64(chunkNum) * CHUNK_SIZE
		end := start + CHUNK_SIZE
		if end > fileSize {
			end = fileSize
		}

		chunkData := make([]byte, end-start)
		_, err := file.ReadAt(chunkData, start)
		if err != nil && err != io.EOF {
			return nil, err
		}

		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)
		fileName := fmt.Sprintf("%s.part%d", filepath.Base(projectZipFilePath), chunkNum)
		part, err := writer.CreateFormFile("file", fileName)
		if err != nil {
			return nil, err
		}
		_, err = part.Write(chunkData)
		if err != nil {
			return nil, err
		}

		if err := writer.WriteField("file_id", fileId); err != nil {
			t.Fatalf("write field file_id: %v", err)
		}
		if err := writer.WriteField("workspace_id", workspaceId); err != nil {
			t.Fatalf("write field workspace_id: %v", err)
		}
		if err := writer.WriteField("chunk_num", strconv.Itoa(chunkNum)); err != nil {
			t.Fatalf("write field chunk_num: %v", err)
		}
		if err := writer.WriteField("total_chunks", strconv.Itoa(totalChunks)); err != nil {
			t.Fatalf("write field total_chunks: %v", err)
		}

		err = writer.Close()
		if err != nil {
			return nil, err
		}

		resp := e.POST("http://localhost:8080/api/split-import").
			WithHeader("X-Reearth-Debug-User", uID.String()).
			WithMultipart().
			WithFile("file", fileName, bytes.NewReader(chunkData)).
			WithFormField("file_id", fileId).
			WithFormField("workspace_id", workspaceId).
			WithFormField("chunk_num", strconv.Itoa(chunkNum)).
			WithFormField("total_chunks", strconv.Itoa(totalChunks)).
			Expect().
			Status(http.StatusOK).
			JSON().Object()

		result := make(map[string]interface{})
		for key := range resp.Raw() {
			result[key] = resp.Raw()[key]
		}

		return result, nil
	}

	var results []map[string]interface{}
	var resultsMu sync.Mutex

	t.Log("Uploading chunk 0...")
	firstChunkResponse, err := uploadChunk(0)
	require.NoError(t, err, "Failed to upload chunk 0")
	results = append(results, firstChunkResponse)

	if totalChunks > 1 {
		t.Logf("Uploading remaining %d chunks...", totalChunks-1)

		for i := 1; i < totalChunks; i += CHUNK_CONCURRENCY {
			end := i + CHUNK_CONCURRENCY
			if end > totalChunks {
				end = totalChunks
			}

			batchSize := end - i
			var wg sync.WaitGroup
			errChan := make(chan error, batchSize)

			for j := i; j < end; j++ {
				wg.Add(1)
				chunkNum := j
				go func() {
					defer wg.Done()
					response, err := uploadChunk(chunkNum)
					if err != nil {
						errChan <- err
						return
					}
					resultsMu.Lock()
					results = append(results, response)
					resultsMu.Unlock()
				}()
			}

			wg.Wait()
			close(errChan)

			for err := range errChan {
				require.NoError(t, err, "Failed to upload chunk batch")
			}

			t.Logf("Uploaded chunks %d to %d", i, end-1)
		}
	}

	require.NotEmpty(t, results, "No responses received")
	return results
}

// completedResponse returns the one chunk response with "completed": true —
// chunks after the first are uploaded concurrently, so the last element of
// results is not reliably the completing one.
func completedResponse(t *testing.T, results []map[string]interface{}) map[string]interface{} {
	t.Helper()
	for _, r := range results {
		if completed, _ := r["completed"].(bool); completed {
			return r
		}
	}
	t.Fatal("no chunk response reported completed: true")
	return nil
}

func TestProjectImportSplit(t *testing.T) {
	e := Server(t, fullSeeder)
	projectZipFilePath := GenProjectZipFile(t, e)
	workspaceId := wID.String()

	results := uploadProjectSplit(t, e, projectZipFilePath, workspaceId)
	lastResponse := completedResponse(t, results)

	t.Logf("Completed response: %+v", lastResponse)

	status, ok := lastResponse["status"].(string)
	require.True(t, ok, "Status field not found in response")
	require.NotEmpty(t, status, "Status should not be empty")
}

// TestProjectImportSplit_CompletesAsyncImport is the REL-03 regression
// test for dispatchImport's async hand-off: since dispatching a completed
// upload to the worker pool no longer blocks the request (it now runs in
// its own goroutine racing dispatchWaitTimeout — see file_split_uploader.go),
// the chunk response alone no longer proves the import actually ran. This
// polls the resulting project's real import status through to a terminal
// state, so a regression that silently dropped the dispatched job (e.g.
// always taking the timeout branch) would show up as a stuck PROCESSING
// status here instead of passing unnoticed.
func TestProjectImportSplit_CompletesAsyncImport(t *testing.T) {
	e := Server(t, fullSeeder)
	projectZipFilePath := GenProjectZipFile(t, e)
	workspaceId := wID.String()

	results := uploadProjectSplit(t, e, projectZipFilePath, workspaceId)
	lastResponse := completedResponse(t, results)

	projectId, ok := lastResponse["project_id"].(string)
	require.True(t, ok, "project_id field not found in the completed chunk response")
	require.NotEmpty(t, projectId)

	query := `query GetProjectImportStatus($projectId: ID!) {
		node(id: $projectId, type: PROJECT) {
			... on Project {
				metadata {
					importStatus
				}
			}
		}
	}`

	const pollInterval = 200 * time.Millisecond
	const pollTimeout = 30 * time.Second

	deadline := time.Now().Add(pollTimeout)
	var lastStatus string
	for time.Now().Before(deadline) {
		res := Request(e, uID.String(), GraphQLRequest{
			OperationName: "GetProjectImportStatus",
			Query:         query,
			Variables:     map[string]any{"projectId": projectId},
		})
		lastStatus = res.Object().Value("data").Object().Value("node").Object().Value("metadata").Object().Value("importStatus").String().Raw()

		if lastStatus == "SUCCESS" || lastStatus == "FAILED" {
			break
		}
		time.Sleep(pollInterval)
	}

	require.Equal(t, "SUCCESS", lastStatus, "import did not reach SUCCESS within %s (last observed status: %s)", pollTimeout, lastStatus)
}

// TestProjectImportSplit_RejectsChunkWithoutSessionStart is the SCA-03
// regression test: a chunk request for a file_id that never had chunk 0
// must be rejected instead of silently creating an upload session (and the
// fd/tmpfs file that comes with it) for a workspace whose permission was
// never checked.
func TestProjectImportSplit_RejectsChunkWithoutSessionStart(t *testing.T) {
	e := Server(t, fullSeeder)
	workspaceId := wID.String()
	fileId := uuid.New().String()
	chunkData := []byte("x")

	e.POST("http://localhost:8080/api/split-import").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithMultipart().
		WithFile("file", "chunk1", bytes.NewReader(chunkData)).
		WithFormField("file_id", fileId).
		WithFormField("workspace_id", workspaceId).
		WithFormField("chunk_num", "1").
		WithFormField("total_chunks", "2").
		Expect().
		Status(http.StatusBadRequest)
}

// TestProjectImportSplit_RejectsTotalChunksMismatch is a regression test
// for a review finding on the SCA-03 fix: once a session exists, a later
// chunk request must be rejected if it supplies a different total_chunks
// than the session was created with. Otherwise a client could pass an
// inflated total_chunks to clear the request-level bound check and then
// write a chunk_num far beyond the session's real chunk count.
func TestProjectImportSplit_RejectsTotalChunksMismatch(t *testing.T) {
	e := Server(t, fullSeeder)
	workspaceId := wID.String()
	fileId := uuid.New().String()

	// total_chunks=2 makes chunk 0 non-final, so it must be exactly the
	// server's fixed 16MB chunk size.
	chunk0 := make([]byte, 16*1024*1024)

	e.POST("http://localhost:8080/api/split-import").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithMultipart().
		WithFile("file", "chunk0", bytes.NewReader(chunk0)).
		WithFormField("file_id", fileId).
		WithFormField("workspace_id", workspaceId).
		WithFormField("chunk_num", "0").
		WithFormField("total_chunks", "2").
		Expect().
		Status(http.StatusOK)

	e.POST("http://localhost:8080/api/split-import").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithMultipart().
		WithFile("file", "chunk1", bytes.NewReader([]byte("y"))).
		WithFormField("file_id", fileId).
		WithFormField("workspace_id", workspaceId).
		WithFormField("chunk_num", "1").
		WithFormField("total_chunks", "50").
		Expect().
		Status(http.StatusBadRequest)
}
