package gateway

import (
	"context"
	"errors"
	"io"
	"net/url"

	"github.com/reearth/reearth-backend/pkg/file"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
)

var (
	ErrInvalidFile        error = errors.New("invalid file")
	ErrFailedToUploadFile error = errors.New("failed to upload file")
	ErrFileTooLarge       error = errors.New("file too large")
	ErrFailedToRemoveFile error = errors.New("failed to remove file")
)

type File interface {
	ReadAsset(context.Context, string) (io.Reader, error)
	ReadPluginFile(context.Context, id.PluginID, string) (io.Reader, error)
	ReadBuiltSceneFile(context.Context, string) (io.Reader, error)
	UploadAsset(context.Context, *file.File) (*url.URL, error)
	UploadAndExtractPluginFiles(context.Context, file.Archive, *plugin.Plugin) (*url.URL, error)
	UploadBuiltScene(context.Context, io.Reader, string) error
	MoveBuiltScene(context.Context, string, string) error
	RemoveAsset(context.Context, *url.URL) error
	RemoveBuiltScene(context.Context, string) error
}
