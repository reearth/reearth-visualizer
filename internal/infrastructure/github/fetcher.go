package github

import (
	"context"
	"fmt"
	"io"
	"net/http"
)

func fetchURL(ctx context.Context, url string) (io.ReadCloser, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("StatusCode=%d", res.StatusCode)
	}

	return res.Body, nil
}
