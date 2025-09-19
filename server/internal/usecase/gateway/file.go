package gateway

import (
	"context"
	"errors"
	"io"
	"net/url"

	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/spf13/afero"
)

var (
	ErrInvalidFile        error = errors.New("invalid file")
	ErrFailedToUploadFile error = errors.New("failed to upload file")
	ErrFileTooLarge       error = errors.New("file too large")
	ErrFailedToRemoveFile error = errors.New("failed to remove file")
)

const (
	UploadFileSizeLimit int64 = 1024 * 1024 * 100 // about 100MB
)

type File interface {
	ReadAsset(context.Context, string) (io.ReadCloser, error)
	UploadAsset(context.Context, *file.File) (*url.URL, int64, error)
	UploadAssetFromURL(context.Context, *url.URL) (*url.URL, int64, error)
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

	ReadExportProjectZip(context.Context, string) (io.ReadCloser, error)
	UploadExportProjectZip(context.Context, afero.File) error
	RemoveExportProjectZip(context.Context, string) error

	GenerateSignedUploadUrl(context.Context, string) (*string, int, *string, error)

	ReadImportProjectZip(context.Context, string) (io.ReadCloser, error)
	RemoveImportProjectZip(context.Context, string) error
}
