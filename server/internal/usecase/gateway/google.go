package gateway

import (
	"io"
)

type Google interface {
	FetchCSV(token string, fileId string, sheetName string) (io.ReadCloser, error)
}
