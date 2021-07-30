package fs

import (
	"context"
	"errors"
	"io"
	"net/url"
	"os"
	"path"

	"github.com/reearth/reearth-backend/internal/usecase/gateway"
	"github.com/reearth/reearth-backend/pkg/file"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/rerror"
)

type fileRepo struct {
	basePath string
	urlBase  *url.URL
}

func NewFile(basePath, urlBase string) (gateway.File, error) {
	var b *url.URL
	var err error
	b, err = url.Parse(urlBase)
	if err != nil {
		return nil, errors.New("invalid base URL")
	}

	return &fileRepo{
		basePath: basePath,
		urlBase:  b,
	}, nil
}

func (f *fileRepo) ReadAsset(ctx context.Context, name string) (io.Reader, error) {
	filename := getAssetFilePath(f.basePath, name)
	file, err := os.Open(filename)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, rerror.ErrNotFound
		}
		return nil, rerror.ErrInternalBy(err)
	}
	return file, nil
}

func (f *fileRepo) ReadPluginFile(ctx context.Context, id id.PluginID, p string) (io.Reader, error) {
	filename := getPluginFilePath(f.basePath, id, p)
	file, err := os.Open(filename)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, rerror.ErrNotFound
		}
		return nil, rerror.ErrInternalBy(err)
	}
	return file, nil
}

func (f *fileRepo) ReadBuiltSceneFile(ctx context.Context, name string) (io.Reader, error) {
	filename := getPublishedDataFilePath(f.basePath, name)
	file, err := os.Open(filename)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, rerror.ErrNotFound
		}
		return nil, rerror.ErrInternalBy(err)
	}
	return file, nil
}

func (f *fileRepo) UploadAsset(ctx context.Context, file *file.File) (*url.URL, error) {
	if f == nil || f.urlBase == nil {
		return nil, errors.New("cannot upload asset because of url lack")
	}
	if file == nil {
		return nil, gateway.ErrInvalidFile
	}

	base := path.Join(f.basePath, "assets")
	err := os.MkdirAll(base, 0755)
	if err != nil {
		return nil, gateway.ErrFailedToUploadFile
		// return nil, repo.ErrFailedToUploadFile.CausedBy(err)
	}

	// calc checksum
	// hasher := sha256.New()
	// tr := io.TeeReader(file.Content, hasher)
	// checksum := hex.EncodeToString(hasher.Sum(nil))

	id := id.New().String()
	filename := id + path.Ext(file.Name)
	name := getAssetFilePath(f.basePath, filename)

	dest, err2 := os.Create(name)
	if err2 != nil {
		return nil, gateway.ErrFailedToUploadFile
		// return nil, repo.ErrFailedToUploadFile.CausedBy(err2)
	}
	defer func() {
		_ = dest.Close()
	}()
	if _, err := io.Copy(dest, file.Content); err != nil {
		return nil, gateway.ErrFailedToUploadFile
		// return nil, repo.ErrFailedToUploadFile.CausedBy(err)
	}

	return getAssetFileURL(f.urlBase, filename), nil
}

func (f *fileRepo) RemoveAsset(ctx context.Context, u *url.URL) error {
	if u == nil {
		return gateway.ErrInvalidFile
	}

	p := getAssetFilePathFromURL(f.basePath, u)
	if p != "" {
		if err := os.Remove(p); err != nil {
			if os.IsNotExist(err) {
				return nil
			}
			return gateway.ErrFailedToRemoveFile
		}
	}

	return nil
}

func (f *fileRepo) UploadAndExtractPluginFiles(ctx context.Context, archive file.Archive, plugin *plugin.Plugin) (*url.URL, error) {
	defer func() {
		_ = archive.Close()
	}()
	base := getPluginFilePath(f.basePath, plugin.ID(), "")
	url, _ := url.Parse(base)

	for {
		err := func() error {
			f, err := archive.Next()
			if errors.Is(err, file.EOF) {
				return err
			}
			name := path.Join(base, f.Fullpath)
			fbase := path.Dir(name)
			err2 := os.MkdirAll(fbase, 0755)
			if err2 != nil {
				return gateway.ErrFailedToUploadFile
				// return repo.ErrFailedToUploadFile.CausedBy(err2)
			}
			dest, err2 := os.Create(name)
			if err2 != nil {
				return gateway.ErrFailedToUploadFile
				// return repo.ErrFailedToUploadFile.CausedBy(err2)
			}
			defer func() {
				_ = dest.Close()
			}()
			if _, err := io.Copy(dest, f.Content); err != nil {
				return gateway.ErrFailedToUploadFile
				// return repo.ErrFailedToUploadFile.CausedBy(err)
			}
			return nil
		}()

		if errors.Is(err, file.EOF) {
			break
		}
		if err != nil {
			return nil, err
		}
	}

	return url, nil
}

func (f *fileRepo) UploadBuiltScene(ctx context.Context, reader io.Reader, name string) error {
	filename := getPublishedDataFilePath(f.basePath, name)
	err := os.MkdirAll(path.Dir(filename), 0755)
	if err != nil {
		return gateway.ErrFailedToUploadFile
		// return repo.ErrFailedToUploadFile.CausedBy(err)
	}

	dest, err2 := os.Create(filename)
	if err2 != nil {
		return gateway.ErrFailedToUploadFile
		// return repo.ErrFailedToUploadFile.CausedBy(err2)
	}
	defer func() {
		_ = dest.Close()
	}()
	if _, err := io.Copy(dest, reader); err != nil {
		return gateway.ErrFailedToUploadFile
		// return repo.ErrFailedToUploadFile.CausedBy(err)
	}

	return nil
}

func (f *fileRepo) MoveBuiltScene(ctx context.Context, oldName, name string) error {
	if oldName == name {
		return nil
	}

	filename := getPublishedDataFilePath(f.basePath, oldName)
	newfilename := getPublishedDataFilePath(f.basePath, name)
	err := os.MkdirAll(path.Dir(newfilename), 0755)
	if err != nil {
		return gateway.ErrFailedToUploadFile
		// return repo.ErrFailedToUploadFile.CausedBy(err)
	}

	if err := os.Rename(
		filename,
		newfilename,
	); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return rerror.ErrNotFound
		}
		return rerror.ErrInternalBy(err)
	}

	return nil
}

func (f *fileRepo) RemoveBuiltScene(ctx context.Context, name string) error {
	filename := getPublishedDataFilePath(f.basePath, name)
	if err := os.Remove(filename); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil
		}
		return rerror.ErrInternalBy(err)
	}
	return nil
}
