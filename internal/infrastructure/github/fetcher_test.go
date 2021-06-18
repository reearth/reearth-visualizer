package github

import (
	"context"
	"errors"
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
	testCases := []struct {
		Name, URL   string
		Ctx         context.Context
		ExpectedErr error
	}{
		{
			Name:        "Fail: nil context",
			Ctx:         nil,
			URL:         server.URL,
			ExpectedErr: errors.New("nil Context"),
		},
		{
			Name:        "Fail: nil unsupported protocol scheme ",
			Ctx:         context.Background(),
			URL:         "",
			ExpectedErr: errors.New("unsupported protocol scheme"),
		},
		{
			Name:        "Fail: bad request ",
			Ctx:         context.Background(),
			URL:         server2.URL,
			ExpectedErr: errors.New("StatusCode=400"),
		},
		{
			Name: "Success",
			Ctx:  context.Background(),
			URL:  server.URL,
		},
	}
	defer func() {
		server.Close()
		server2.Close()
	}()
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			body, err := fetchURL(tc.Ctx, tc.URL)
			if err != nil {
				assert.True(tt, errors.As(tc.ExpectedErr, &err))
			} else {
				assert.NotNil(tt, body)
			}
		})
	}

}
