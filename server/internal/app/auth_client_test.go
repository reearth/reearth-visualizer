package app

import (
	"errors"
	"net/http"
	"testing"
)

// mockNetworkError simulates the NetworkError from hasura/go-graphql-client
type mockNetworkError struct {
	statusCode int
	body       string
}

func (e mockNetworkError) Error() string {
	return http.StatusText(e.statusCode)
}

func (e mockNetworkError) StatusCode() int {
	return e.statusCode
}

func TestIsRateLimitError(t *testing.T) {
	tests := []struct {
		name     string
		err      error
		expected bool
	}{
		{
			name:     "typed 429 error",
			err:      mockNetworkError{statusCode: 429, body: "rate limited"},
			expected: true,
		},
		{
			name:     "typed 401 error",
			err:      mockNetworkError{statusCode: 401, body: "unauthorized"},
			expected: false,
		},
		{
			name:     "typed 500 error",
			err:      mockNetworkError{statusCode: 500, body: "server error"},
			expected: false,
		},
		{
			name:     "string error with 429 Too Many Requests",
			err:      errors.New("request failed: 429 Too Many Requests"),
			expected: true,
		},
		{
			name:     "string error with just 429",
			err:      errors.New("error code: 429"),
			expected: false, // Should not match - too broad
		},
		{
			name:     "string error with UUID containing 429",
			err:      errors.New("user not found: 12345429-abcd-efgh"),
			expected: false, // Should not match UUID
		},
		{
			name:     "string error with path containing 429",
			err:      errors.New("failed to access /api/v1/resource/429"),
			expected: false, // Should not match path
		},
		{
			name:     "wrapped typed error",
			err:      errors.Join(errors.New("context"), mockNetworkError{statusCode: 429}),
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := isRateLimitError(tt.err)
			if result != tt.expected {
				t.Errorf("isRateLimitError(%v) = %v, want %v", tt.err, result, tt.expected)
			}
		})
	}
}
