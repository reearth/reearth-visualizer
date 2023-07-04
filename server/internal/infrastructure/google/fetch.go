package google

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
)

func sheetURL(fileId string, sheetName string) string {
	gurl := url.URL{
		Scheme: "https",
		Host:   "docs.google.com",
		Path:   fmt.Sprintf("spreadsheets/d/%s/gviz/tq", fileId),
	}

	queryValues := gurl.Query()
	queryValues.Set("tqx", "out:csv")
	queryValues.Set("sheet", sheetName)
	gurl.RawQuery = queryValues.Encode()

	return gurl.String()
}

func fetchCSV(token string, fileId string, sheetName string) (io.ReadCloser, error) {
	u := sheetURL(fileId, sheetName)
	req, err := http.NewRequest("GET", u, nil)
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

	return res.Body, nil
}
