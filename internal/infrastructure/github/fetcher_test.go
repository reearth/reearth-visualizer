package github

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFetchURL(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		_, err := rw.Write([]byte(`OK`))
		assert.NoError(t, err)
	}))
	server2 := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		rw.WriteHeader(http.StatusBadRequest)
	}))

	defer func() {
		server.Close()
		server2.Close()
	}()

	tests := []struct {
		Name, URL   string
		Ctx         context.Context
		ExpectedErr string
	}{
		{
			Name:        "Fail: nil context",
			Ctx:         nil,
			URL:         server.URL,
			ExpectedErr: "net/http: nil Context",
		},
		{
			Name:        "Fail: nil unsupported protocol scheme",
			Ctx:         context.Background(),
			URL:         "",
			ExpectedErr: "Get \"\": unsupported protocol scheme \"\"",
		},
		{
			Name:        "Fail: bad request ",
			Ctx:         context.Background(),
			URL:         server2.URL,
			ExpectedErr: "StatusCode=400",
		},
		{
			Name: "Success",
			Ctx:  context.Background(),
			URL:  server.URL,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			body, err := fetchURL(tc.Ctx, tc.URL)
			if tc.ExpectedErr != "" {
				assert.EqualError(t, err, tc.ExpectedErr)
			} else {
				_ = body.Close()
				assert.NotNil(t, body)
			}
		})
	}

}
