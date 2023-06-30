package google

import (
	"io"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
)

type google struct {
}

func NewGoogle() gateway.Google {
	return &google{}
}

func (g google) FetchCSV(token string, fileId string, sheetName string) (io.ReadCloser, error) {
	return fetchCSV(token, fileId, sheetName)
}
