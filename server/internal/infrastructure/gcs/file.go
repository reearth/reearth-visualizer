package gcs

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/url"
	"path"
	"strings"

	"cloud.google.com/go/storage"
	"github.com/kennygrant/sanitize"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"google.golang.org/api/iterator"
)

const (
	gcsAssetBasePath  string = "assets"
	gcsPluginBasePath string = "plugins"
	gcsMapBasePath    string = "maps"
	gcsStoryBasePath  string = "stories"
	fileSizeLimit     int64  = 1024 * 1024 * 100 // about 100MB
)

type fileRepo struct {
	bucketName   string
	base         *url.URL
	cacheControl string
}

func NewFile(bucketName, base string, cacheControl string) (gateway.File, error) {
	if bucketName == "" {
		return nil, errors.New("bucket name is empty")
	}

	var u *url.URL
	if base == "" {
		base = fmt.Sprintf("https://storage.googleapis.com/%s", bucketName)
	}

	var err error
	u, _ = url.Parse(base)
	if err != nil {
		return nil, errors.New("invalid base URL")
	}

	return &fileRepo{
		bucketName:   bucketName,
		base:         u,
		cacheControl: cacheControl,
	}, nil
}

func (f *fileRepo) ReadAsset(ctx context.Context, name string) (io.ReadCloser, error) {
	sn := sanitize.Path(name)
	if sn == "" {
		return nil, rerror.ErrNotFound
	}
	return f.read(ctx, path.Join(gcsAssetBasePath, sn))
}

func (f *fileRepo) UploadAsset(ctx context.Context, file *file.File) (*url.URL, int64, error) {
	if file == nil {
		return nil, 0, gateway.ErrInvalidFile
	}
	if file.Size >= fileSizeLimit {
		return nil, 0, gateway.ErrFileTooLarge
	}

	sn := sanitize.Path(newAssetID() + path.Ext(file.Path))
	if sn == "" {
		return nil, 0, gateway.ErrInvalidFile
	}

	filename := path.Join(gcsAssetBasePath, sn)
	u := getGCSObjectURL(f.base, filename)
	if u == nil {
		return nil, 0, gateway.ErrInvalidFile
	}

	s, err := f.upload(ctx, filename, file.Content)
	if err != nil {
		return nil, 0, err
	}
	return u, s, nil
}

func (f *fileRepo) RemoveAsset(ctx context.Context, u *url.URL) error {
	log.Infofc(ctx, "gcs: asset deleted: %s", u)

	sn := getGCSObjectNameFromURL(f.base, u)
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	return f.delete(ctx, sn)
}

// plugin

func (f *fileRepo) ReadPluginFile(ctx context.Context, pid id.PluginID, filename string) (io.ReadCloser, error) {
	sn := sanitize.Path(filename)
	if sn == "" {
		return nil, rerror.ErrNotFound
	}
	return f.read(ctx, path.Join(gcsPluginBasePath, pid.String(), sn))
}

func (f *fileRepo) UploadPluginFile(ctx context.Context, pid id.PluginID, file *file.File) error {
	sn := sanitize.Path(file.Path)
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	_, err := f.upload(ctx, path.Join(gcsPluginBasePath, pid.String(), sanitize.Path(file.Path)), file.Content)
	return err
}

func (f *fileRepo) RemovePlugin(ctx context.Context, pid id.PluginID) error {
	log.Infofc(ctx, "gcs: plugin deleted: %s", pid)

	return f.deleteAll(ctx, path.Join(gcsPluginBasePath, pid.String()))
}

// built scene

func (f *fileRepo) ReadBuiltSceneFile(ctx context.Context, name string) (io.ReadCloser, error) {
	if name == "" {
		return nil, rerror.ErrNotFound
	}
	return f.read(ctx, path.Join(gcsMapBasePath, sanitize.Path(name)+".json"))
}

func (f *fileRepo) UploadBuiltScene(ctx context.Context, content io.Reader, name string) error {
	sn := sanitize.Path(name + ".json")
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	_, err := f.upload(ctx, path.Join(gcsMapBasePath, sn), content)
	return err
}

func (f *fileRepo) MoveBuiltScene(ctx context.Context, oldName, name string) error {
	from := sanitize.Path(oldName + ".json")
	dest := sanitize.Path(name + ".json")
	if from == "" || dest == "" {
		return gateway.ErrInvalidFile
	}
	return f.move(ctx, path.Join(gcsMapBasePath, from), path.Join(gcsMapBasePath, dest))
}

func (f *fileRepo) RemoveBuiltScene(ctx context.Context, name string) error {
	log.Infofc(ctx, "gcs: built scene deleted: %s", name)

	sn := sanitize.Path(name + ".json")
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	return f.delete(ctx, path.Join(gcsMapBasePath, sn))
}

// Stories

func (f *fileRepo) ReadStoryFile(ctx context.Context, name string) (io.ReadCloser, error) {
	if name == "" {
		return nil, rerror.ErrNotFound
	}
	return f.read(ctx, path.Join(gcsStoryBasePath, sanitize.Path(name)+".json"))
}

func (f *fileRepo) UploadStory(ctx context.Context, content io.Reader, name string) error {
	sn := sanitize.Path(name + ".json")
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	_, err := f.upload(ctx, path.Join(gcsStoryBasePath, sn), content)
	return err
}

func (f *fileRepo) MoveStory(ctx context.Context, oldName, name string) error {
	from := sanitize.Path(oldName + ".json")
	dest := sanitize.Path(name + ".json")
	if from == "" || dest == "" {
		return gateway.ErrInvalidFile
	}
	return f.move(ctx, path.Join(gcsStoryBasePath, from), path.Join(gcsStoryBasePath, dest))
}

func (f *fileRepo) RemoveStory(ctx context.Context, name string) error {
	log.Infofc(ctx, "gcs: story deleted: %s", name)

	sn := sanitize.Path(name + ".json")
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	return f.delete(ctx, path.Join(gcsStoryBasePath, sn))
}

// helpers

func (f *fileRepo) bucket(ctx context.Context) (*storage.BucketHandle, error) {
	client, err := storage.NewClient(ctx)
	if err != nil {
		return nil, err
	}
	bucket := client.Bucket(f.bucketName)
	return bucket, nil
}

func (f *fileRepo) read(ctx context.Context, filename string) (io.ReadCloser, error) {
	if filename == "" {
		return nil, rerror.ErrNotFound
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorfc(ctx, "gcs: read bucket err: %+v\n", err)
		return nil, rerror.ErrInternalByWithContext(ctx, err)
	}

	reader, err := bucket.Object(filename).NewReader(ctx)
	if err != nil {
		if errors.Is(err, storage.ErrObjectNotExist) {
			return nil, rerror.ErrNotFound
		}
		log.Errorfc(ctx, "gcs: read err: %+v\n", err)
		return nil, rerror.ErrInternalByWithContext(ctx, err)
	}

	return reader, nil
}

func (f *fileRepo) upload(ctx context.Context, filename string, content io.Reader) (int64, error) {
	if filename == "" {
		return 0, gateway.ErrInvalidFile
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorfc(ctx, "gcs: upload bucket err: %+v\n", err)
		return 0, rerror.ErrInternalByWithContext(ctx, err)
	}

	object := bucket.Object(filename)
	if err := object.Delete(ctx); err != nil && !errors.Is(err, storage.ErrObjectNotExist) {
		log.Errorfc(ctx, "gcs: upload delete err: %+v\n", err)
		return 0, gateway.ErrFailedToUploadFile
	}

	writer := object.NewWriter(ctx)
	writer.ObjectAttrs.CacheControl = f.cacheControl

	size, err := io.Copy(writer, content)
	if err != nil {
		log.Errorfc(ctx, "gcs: upload err: %+v\n", err)
		return 0, gateway.ErrFailedToUploadFile
	}

	if err := writer.Close(); err != nil {
		log.Errorfc(ctx, "gcs: upload close err: %+v\n", err)
		return 0, gateway.ErrFailedToUploadFile
	}

	return size, nil
}

func (f *fileRepo) move(ctx context.Context, from, dest string) error {
	if from == "" || dest == "" || from == dest {
		return gateway.ErrInvalidFile
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorfc(ctx, "gcs: move bucket err: %+v\n", err)
		return rerror.ErrInternalByWithContext(ctx, err)
	}

	object := bucket.Object(from)
	destObject := bucket.Object(dest)
	if _, err := destObject.CopierFrom(object).Run(ctx); err != nil {
		if errors.Is(err, storage.ErrObjectNotExist) {
			return rerror.ErrNotFound
		}
		log.Errorfc(ctx, "gcs: move copy err: %+v\n", err)
		return rerror.ErrInternalByWithContext(ctx, err)
	}

	if err := object.Delete(ctx); err != nil {
		log.Errorfc(ctx, "gcs: move delete err: %+v\n", err)
		return rerror.ErrInternalByWithContext(ctx, err)
	}

	return nil
}

func (f *fileRepo) delete(ctx context.Context, filename string) error {
	if filename == "" {
		return gateway.ErrInvalidFile
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorfc(ctx, "gcs: delete bucket err: %+v\n", err)
		return rerror.ErrInternalByWithContext(ctx, err)
	}

	object := bucket.Object(filename)
	if err := object.Delete(ctx); err != nil {
		if errors.Is(err, storage.ErrObjectNotExist) {
			return nil
		}

		log.Errorfc(ctx, "gcs: delete err: %+v\n", err)
		return rerror.ErrInternalByWithContext(ctx, err)
	}
	return nil
}

func (f *fileRepo) deleteAll(ctx context.Context, path string) error {
	if path == "" {
		return gateway.ErrInvalidFile
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorfc(ctx, "gcs: deleteAll bucket err: %+v\n", err)
		return rerror.ErrInternalByWithContext(ctx, err)
	}

	it := bucket.Objects(ctx, &storage.Query{
		Prefix: path,
	})

	for {
		attrs, err := it.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Errorfc(ctx, "gcs: deleteAll next err: %+v\n", err)
			return rerror.ErrInternalByWithContext(ctx, err)
		}
		if err := bucket.Object(attrs.Name).Delete(ctx); err != nil {
			log.Errorfc(ctx, "gcs: deleteAll err: %+v\n", err)
			return rerror.ErrInternalByWithContext(ctx, err)
		}
	}
	return nil
}

func getGCSObjectURL(base *url.URL, objectName string) *url.URL {
	if base == nil {
		return nil
	}

	// https://github.com/golang/go/issues/38351
	b := *base
	b.Path = path.Join(b.Path, objectName)
	return &b
}

func getGCSObjectNameFromURL(base, u *url.URL) string {
	if u == nil {
		return ""
	}
	if base == nil {
		base = &url.URL{}
	}
	p := sanitize.Path(strings.TrimPrefix(u.Path, "/"))
	if p == "" || u.Host != base.Host || u.Scheme != base.Scheme || !strings.HasPrefix(p, gcsAssetBasePath+"/") {
		return ""
	}

	return p
}

func newAssetID() string {
	// TODO: replace
	return id.NewAssetID().String()
}
