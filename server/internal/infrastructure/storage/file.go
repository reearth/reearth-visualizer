package storage

import (
	"context"
	"errors"
	"io"
	"net/url"
	"os"
	"path"
	"path/filepath"

	"github.com/kennygrant/sanitize"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/spf13/afero"
)

type fsFileRepo struct {
	fs      afero.Fs
	urlBase *url.URL
}

func NewFS(fs afero.Fs, urlBase string) (gateway.File, error) {
	var b *url.URL
	var err error
	b, err = url.Parse(urlBase)
	if err != nil {
		return nil, errors.New("invalid base URL")
	}

	return &fsFileRepo{
		fs:      fs,
		urlBase: b,
	}, nil
}

// asset

func (f *fsFileRepo) ReadAsset(ctx context.Context, filename string) (io.ReadCloser, error) {
	return f.read(ctx, filepath.Join(assetDir, sanitize.Path(filename)))
}

func (f *fsFileRepo) UploadAsset(ctx context.Context, file *file.File) (*url.URL, int64, error) {
	filename := sanitize.Path(newAssetID() + path.Ext(file.Path))
	size, err := f.upload(ctx, filepath.Join(assetDir, filename), file.Content)
	if err != nil {
		return nil, 0, err
	}
	return getAssetFileURL(f.urlBase, filename), size, nil
}

func (f *fsFileRepo) RemoveAsset(ctx context.Context, u *url.URL) error {
	if u == nil {
		return nil
	}
	p := sanitize.Path(u.Path)
	if p == "" || f.urlBase == nil || u.Scheme != f.urlBase.Scheme || u.Host != f.urlBase.Host || path.Dir(p) != f.urlBase.Path {
		return gateway.ErrInvalidFile
	}
	return f.delete(ctx, filepath.Join(assetDir, path.Base(p)))
}

// plugin

func (f *fsFileRepo) ReadPluginFile(ctx context.Context, pid id.PluginID, filename string) (io.ReadCloser, error) {
	return f.read(ctx, filepath.Join(pluginDir, pid.String(), sanitize.Path(filename)))
}

func (f *fsFileRepo) UploadPluginFile(ctx context.Context, pid id.PluginID, file *file.File) error {
	_, err := f.upload(ctx, filepath.Join(pluginDir, pid.String(), sanitize.Path(file.Path)), file.Content)
	return err
}

func (f *fsFileRepo) RemovePlugin(ctx context.Context, pid id.PluginID) error {
	return f.delete(ctx, filepath.Join(pluginDir, pid.String()))
}

// built scene

func (f *fsFileRepo) ReadBuiltSceneFile(ctx context.Context, name string) (io.ReadCloser, error) {
	return f.read(ctx, filepath.Join(publishedDir, sanitize.Path(name+".json")))
}

func (f *fsFileRepo) UploadBuiltScene(ctx context.Context, reader io.Reader, name string) error {
	_, err := f.upload(ctx, filepath.Join(publishedDir, sanitize.Path(name+".json")), reader)
	return err
}

func (f *fsFileRepo) MoveBuiltScene(ctx context.Context, oldName, name string) error {
	return f.move(
		ctx,
		filepath.Join(publishedDir, sanitize.Path(oldName+".json")),
		filepath.Join(publishedDir, sanitize.Path(name+".json")),
	)
}

func (f *fsFileRepo) RemoveBuiltScene(ctx context.Context, name string) error {
	return f.delete(ctx, filepath.Join(publishedDir, sanitize.Path(name+".json")))
}

// helpers

func (f *fsFileRepo) read(_ context.Context, filename string) (io.ReadCloser, error) {
	if filename == "" {
		return nil, rerror.ErrNotFound
	}

	ff, err := f.fs.Open(filename)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, rerror.ErrNotFound
		}
		return nil, rerror.ErrInternalBy(err)
	}
	return ff, nil
}

func (f *fsFileRepo) upload(_ context.Context, filename string, content io.Reader) (int64, error) {
	if filename == "" {
		return 0, gateway.ErrFailedToUploadFile
	}

	if fnd := path.Dir(filename); fnd != "" {
		if err := f.fs.MkdirAll(fnd, 0755); err != nil {
			return 0, rerror.ErrInternalBy(err)
		}
	}

	dest, err := f.fs.Create(filename)
	if err != nil {
		return 0, rerror.ErrInternalBy(err)
	}
	defer func() {
		_ = dest.Close()
	}()

	size, err := io.Copy(dest, content)
	if err != nil {
		return 0, gateway.ErrFailedToUploadFile
	}

	return size, nil
}

func (f *fsFileRepo) move(_ context.Context, from, dest string) error {
	if from == "" || dest == "" || from == dest {
		return gateway.ErrInvalidFile
	}

	if destDir := path.Dir(dest); destDir != "" {
		if err := f.fs.MkdirAll(destDir, 0755); err != nil {
			return rerror.ErrInternalBy(err)
		}
	}

	if err := f.fs.Rename(from, dest); err != nil {
		if os.IsNotExist(err) {
			return rerror.ErrNotFound
		}
		return rerror.ErrInternalBy(err)
	}

	return nil
}

func (f *fsFileRepo) delete(_ context.Context, filename string) error {
	if filename == "" {
		return gateway.ErrFailedToUploadFile
	}

	if err := f.fs.RemoveAll(filename); err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func getAssetFileURL(base *url.URL, filename string) *url.URL {
	if base == nil {
		return nil
	}

	// https://github.com/golang/go/issues/38351
	b := *base
	b.Path = path.Join(b.Path, filename)
	return &b
}
