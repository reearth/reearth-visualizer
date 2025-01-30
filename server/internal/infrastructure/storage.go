package infrastructure

import (
	"fmt"
	"io"
	"net/http"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
)

type BaseFileStorage struct {
	MaxFileSize int64
}

func (b *BaseFileStorage) ValidateResponseBodySize(resp *http.Response) error {
	// The verification confirms that implementations can bypass the file size limit
	// when ContentLength is not provided (equals -1). The suggested streaming check using io.LimitedReader is the correct approach to fix this security issue.
	if resp.ContentLength >= b.MaxFileSize {
		return gateway.ErrFileTooLarge
	}

	var size int64
	limitReader := &io.LimitedReader{
		R: resp.Body,
		N: b.MaxFileSize,
	}

	buf := make([]byte, 32*1024)
	for {
		n, err := limitReader.Read(buf)
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("failed to read response body: %w", err)
		}
		size += int64(n)
	}

	if limitReader.N <= 0 {
		return gateway.ErrFileTooLarge
	}

	return nil
}
