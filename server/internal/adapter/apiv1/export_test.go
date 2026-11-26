package apiv1

import (
	"context"
	"errors"
	"io"
	"strings"
	"testing"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type exportFileGateway struct {
	gateway.File
	readErr error
	removed []string
}

func (f *exportFileGateway) ReadExportProjectZip(context.Context, string) (io.ReadCloser, error) {
	if f.readErr != nil {
		return nil, f.readErr
	}
	return io.NopCloser(strings.NewReader("zip")), nil
}

func (f *exportFileGateway) RemoveExportProjectZip(_ context.Context, name string) error {
	f.removed = append(f.removed, name)
	return nil
}

func TestOpenExport(t *testing.T) {
	t.Run("removes the stored zip when it cannot be read", func(t *testing.T) {
		readErr := errors.New("storage unavailable")
		f := &exportFileGateway{readErr: readErr}
		r, err := openExport(context.Background(), f, "p.zip")
		assert.ErrorIs(t, err, readErr)
		assert.Nil(t, r)
		assert.Equal(t, []string{"p.zip"}, f.removed)
	})

	t.Run("removes the stored zip once the response is closed", func(t *testing.T) {
		f := &exportFileGateway{}
		r, err := openExport(context.Background(), f, "p.zip")
		require.NoError(t, err)
		assert.Empty(t, f.removed)
		b, err := io.ReadAll(r)
		require.NoError(t, err)
		assert.Equal(t, "zip", string(b))
		require.NoError(t, r.Close())
		assert.Equal(t, []string{"p.zip"}, f.removed)
	})
}
