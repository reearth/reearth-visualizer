package google

import (
	"fmt"
	"io"
	"net/http"
)

func fetchCSV(token string, fileId string, sheetName string) (*io.ReadCloser, error) {
	url := fmt.Sprintf("https://docs.google.com/spreadsheets/d/%s/gviz/tq?tqx=out:csv&sheet=%s", fileId, sheetName)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("StatusCode=%d", res.StatusCode)
	}

	return &res.Body, nil
}
