package gateway

import (
	"context"
	"errors"
	"io"
	"net/url"

	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
)

var (
	ErrInvalidFile        error = errors.New("invalid file")
	ErrFailedToUploadFile error = errors.New("failed to upload file")
	ErrFileTooLarge       error = errors.New("file too large")
	ErrFailedToRemoveFile error = errors.New("failed to remove file")
)

type File interface {
	ReadAsset(context.Context, string) (io.ReadCloser, error)
	UploadAsset(context.Context, *file.File) (*url.URL, int64, error)
	RemoveAsset(context.Context, *url.URL) error

	ReadPluginFile(context.Context, id.PluginID, string) (io.ReadCloser, error)
	UploadPluginFile(context.Context, id.PluginID, *file.File) error
	RemovePlugin(context.Context, id.PluginID) error

	UploadBuiltScene(context.Context, io.Reader, string) error
	ReadBuiltSceneFile(context.Context, string) (io.ReadCloser, error)
	MoveBuiltScene(context.Context, string, string) error
	RemoveBuiltScene(context.Context, string) error

	UploadStory(context.Context, io.Reader, string) error
	ReadStoryFile(context.Context, string) (io.ReadCloser, error)
	MoveStory(context.Context, string, string) error
	RemoveStory(context.Context, string) error
}
