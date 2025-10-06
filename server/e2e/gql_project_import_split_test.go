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

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

// go test -v -run TestProjectImportSplit ./e2e/...

func TestProjectImportSplit(t *testing.T) {
	e := Server(t, fullSeeder)
	projectZipFilePath := GenProjectZipFile(t, e)
	workspaceId := wID.String()

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

		writer.WriteField("file_id", fileId)
		writer.WriteField("workspace_id", workspaceId)
		writer.WriteField("chunk_num", strconv.Itoa(chunkNum))
		writer.WriteField("total_chunks", strconv.Itoa(totalChunks))

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
	lastResponse := results[len(results)-1]

	t.Logf("Final response: %+v", lastResponse)

	status, ok := lastResponse["status"].(string)
	require.True(t, ok, "Status field not found in response")
	require.NotEmpty(t, status, "Status should not be empty")
}
