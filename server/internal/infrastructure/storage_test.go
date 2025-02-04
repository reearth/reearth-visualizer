package infrastructure_test

import (
	"bytes"
	"io"
	"net/http"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/stretchr/testify/assert"
)

func TestBaseFileStorage_ValidateResponseBodySize(t *testing.T) {
	tests := []struct {
		name          string
		contentLength int64
		body          []byte
		maxFileSize   int64
		expectedError error
	}{
		{
			name:          "Valid size with ContentLength",
			contentLength: 100,
			body:          []byte("valid content"),
			maxFileSize:   200,
			expectedError: nil,
		},
		{
			name:          "Empty body",
			contentLength: -1,
			body:          nil,
			maxFileSize:   200,
			expectedError: nil,
		},
		{
			name:          "Too large with ContentLength",
			contentLength: 300,
			body:          []byte("too large content"),
			maxFileSize:   200,
			expectedError: gateway.ErrFileTooLarge,
		},
		{
			name:          "Valid size without ContentLength",
			contentLength: -1,
			body:          []byte("valid content"),
			maxFileSize:   200,
			expectedError: nil,
		},
		{
			name:          "Too large without ContentLength",
			contentLength: -1,
			body:          bytes.Repeat([]byte("a"), 300),
			maxFileSize:   200,
			expectedError: gateway.ErrFileTooLarge,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create a mock HTTP response
			resp := &http.Response{
				ContentLength: tt.contentLength,
				Body: func() io.ReadCloser {
					if tt.body == nil {
						return io.NopCloser(&errorReader{})
					}
					return io.NopCloser(bytes.NewReader(tt.body))
				}(),
			}

			baseFileStorage := &infrastructure.BaseFileStorage{
				MaxFileSize: tt.maxFileSize,
			}

			err := baseFileStorage.ValidateResponseBodySize(resp)

			if tt.expectedError != nil {
				assert.EqualError(t, err, tt.expectedError.Error())
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// errorReader simulates an error during reading to test error handling.
type errorReader struct{}

func (e *errorReader) Read(p []byte) (int, error) {
	return 0, io.EOF
}

func (e *errorReader) Close() error {
	return nil
}
