//go:build command

package main

import (
	"bytes"
	"flag"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
)

const (
	chunkSize = 16 * 1024 * 1024
)

/**
Usage:

1. build ---------
go build -tags command -o reearth-cmd ./cmd/reearth-cmd/main.go
               or
go build -o reearth-cmd github.com/reearth/reearth-visualizer/server/cmd/reearth-cmd

2. upload ---------
./reearth-cmd -file test.zip -teamId 01jra33jtezrnw302p6b0rr51a

*/

func main() {
	filePath := flag.String("file", "", "Path to the file to upload")
	teamID := flag.String("teamId", "", "Team ID for the upload")
	server := flag.String("server", "http://localhost:8080/split-import", "Server URL for file upload")
	flag.Parse()

	if *filePath == "" || *teamID == "" {
		fmt.Println("Usage: ./uploader -file <file_path> -teamId <team_id>")
		flag.PrintDefaults()
		os.Exit(1)
	}

	fileID := uuid.New().String()
	fmt.Printf("Generated file ID (UUID): %s\n", fileID)
	fmt.Printf("Team ID: %s\n", *teamID)

	file, err := os.Open(*filePath)
	if err != nil {
		fmt.Printf("Error opening file: %v\n", err)
		os.Exit(1)
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		fmt.Printf("Error getting file info: %v\n", err)
		os.Exit(1)
	}

	totalChunks := (fileInfo.Size() + chunkSize - 1) / chunkSize
	fmt.Printf("File size: %d bytes\n", fileInfo.Size())
	fmt.Printf("Total chunks: %d\n", totalChunks)

	var totalBytesUploaded int64

	for chunkNum := 0; ; chunkNum++ {
		chunkStart := time.Now()

		buf := make([]byte, chunkSize)
		n, err := file.Read(buf)
		if err != nil && err != io.EOF {
			fmt.Printf("Error reading chunk: %v\n", err)
			os.Exit(1)
		}
		if n == 0 {
			break
		}

		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)

		fields := map[string]string{
			"file_id":      fileID,
			"team_id":      *teamID,
			"chunk_num":    fmt.Sprintf("%d", chunkNum),
			"total_chunks": fmt.Sprintf("%d", totalChunks),
		}
		for k, v := range fields {
			if err := writer.WriteField(k, v); err != nil {
				fmt.Printf("Error writing %s field: %v\n", k, err)
				os.Exit(1)
			}
		}
		part, err := writer.CreateFormFile("file", fmt.Sprintf("chunk-%d", chunkNum))
		if err != nil {
			fmt.Printf("Error creating form file: %v\n", err)
			os.Exit(1)
		}
		if _, err = part.Write(buf[:n]); err != nil {
			fmt.Printf("Error writing chunk data: %v\n", err)
			os.Exit(1)
		}
		if err := writer.Close(); err != nil {
			fmt.Printf("Error closing multipart writer: %v\n", err)
			os.Exit(1)
		}

		resp, err := http.Post(*server, writer.FormDataContentType(), body)
		if err != nil {
			fmt.Printf("Upload failed: %v\n", err)
			os.Exit(1)
		}
		if resp.StatusCode != http.StatusOK {
			bodyBytes, _ := io.ReadAll(resp.Body)
			fmt.Printf("Server returned error status: %d\nResponse: %s\n", resp.StatusCode, string(bodyBytes))
			os.Exit(1)
		}
		resp.Body.Close()

		elapsed := time.Since(chunkStart).Seconds()
		if elapsed < 0.01 {
			elapsed = 0.01
		}
		speed := float64(n) / elapsed / 1024 / 1024

		totalBytesUploaded += int64(n)
		percentage := float64(totalBytesUploaded) / float64(fileInfo.Size()) * 100

		fmt.Printf("Uploading chunk %d/%d... Progress: %.2f%% (%.2f MB/s)\n", chunkNum+1, totalChunks, percentage, speed)
	}

	fmt.Printf("\nUpload completed successfully! File ID: %s, Team ID: %s\n", fileID, *teamID)
}
