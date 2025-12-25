package gcs

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
	"strings"
	"time"

	"cloud.google.com/go/storage"
	"github.com/kennygrant/sanitize"
	"github.com/reearth/reearth/server/internal/infrastructure"
	"github.com/reearth/reearth/server/internal/testutil"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/spf13/afero"
	"google.golang.org/api/iterator"
)

const (
	gcsAssetBasePath  string = "assets"
	gcsPluginBasePath string = "plugins"
	gcsMapBasePath    string = "maps"
	gcsStoryBasePath  string = "stories"
	gcsExportBasePath string = "export"
	gcsImportBasePath string = "import"
)

type fileRepo struct {
	isFake          bool
	bucketName      string
	base            *url.URL
	cacheControl    string
	baseFileStorage *infrastructure.BaseFileStorage
}

func NewFile(isFake bool, bucketName, base string, cacheControl string) (gateway.File, error) {
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
		isFake:       isFake,
		bucketName:   bucketName,
		base:         u,
		cacheControl: cacheControl,
		baseFileStorage: &infrastructure.BaseFileStorage{
			MaxFileSize: gateway.UploadFileSizeLimit,
		},
	}, nil
}

// asset

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
	if file.Size >= gateway.UploadFileSizeLimit {
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

func (f *fileRepo) UploadAssetFromURL(ctx context.Context, u *url.URL) (*url.URL, int64, error) {
	if u == nil {
		return nil, 0, errors.New("invalid URL")
	}

	ctxWithTimeout, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	req, err := http.NewRequestWithContext(ctxWithTimeout, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to create request: %w", err)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Errorfc(ctx, "gcs: failed to fetch URL: %v", err)
		return nil, 0, errors.New("failed to fetch URL")
	}

	if resp.StatusCode != http.StatusOK {
		log.Errorfc(ctx, "gcs: failed to fetch URL, status: %d", resp.StatusCode)
		return nil, 0, errors.New("failed to fetch URL")
	}

	err = f.baseFileStorage.ValidateResponseBodySize(resp)
	if err != nil {
		return nil, 0, err
	}

	defer func() {
		if err := resp.Body.Close(); err != nil {
			log.Errorfc(ctx, "gcs: failed to close response body: %v", err)
		}
	}()

	fileName := path.Base(u.Path)
	if fileName == "" {
		return nil, 0, gateway.ErrInvalidFile
	}
	fileName = sanitize.Path(newAssetID() + path.Ext(fileName))
	filename := path.Join(gcsAssetBasePath, fileName)

	size, err := f.upload(ctx, filename, resp.Body)
	if err != nil {
		log.Errorfc(ctx, "gcs: upload from URL failed: %v", err)
		return nil, 0, err
	}

	gcsURL := getGCSObjectURL(f.base, filename)
	if gcsURL == nil {
		return nil, 0, gateway.ErrInvalidFile
	}

	return gcsURL, size, nil
}

// plugin

func (f *fileRepo) ReadPluginFile(ctx context.Context, pid id.PluginID, filename string) (io.ReadCloser, error) {
	sn := sanitize.Path(filename)
	if sn == "" {
		return nil, gateway.ErrInvalidFile
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
		return nil, gateway.ErrInvalidFile
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
		return nil, gateway.ErrInvalidFile
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

// export

func (f *fileRepo) ReadExportProjectZip(ctx context.Context, name string) (io.ReadCloser, error) {
	sn := sanitize.Path(name)
	if sn == "" {
		return nil, gateway.ErrInvalidFile
	}
	r, err := f.read(ctx, path.Join(gcsExportBasePath, sn))
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return f.read(ctx, path.Join(gcsExportBasePath, name))
		}
	}
	return r, err
}

func (f *fileRepo) UploadExportProjectZip(ctx context.Context, zipFile afero.File) error {
	fname := sanitize.Path(zipFile.Name())
	size, err := f.upload(ctx, path.Join(gcsExportBasePath, zipFile.Name()), zipFile)
	fmt.Println("[export] save file name:", fname, " size:", size)
	return err
}

func (f *fileRepo) RemoveExportProjectZip(ctx context.Context, filename string) error {
	return f.delete(ctx, path.Join(gcsExportBasePath, filename))
}

// import

func (f *fileRepo) GenerateSignedUploadUrl(ctx context.Context, filename string) (*string, int, *string, error) {

	contentType := "application/octet-stream"
	expiresIn := 15 // default 15 min
	objectName := path.Join(gcsImportBasePath, filename)

	expiresAt := time.Now().Add(time.Duration(expiresIn) * time.Minute)

	opts := &storage.SignedURLOptions{
		Scheme: storage.SigningSchemeV4,
		Method: "PUT",
		Headers: []string{
			fmt.Sprintf("Content-Type:%s", contentType),
		},
		Expires: expiresAt,
	}

	client, err := f.client(ctx)
	if err != nil {
		return nil, 0, nil, err
	}

	signedURL, err := client.Bucket(f.bucketName).SignedURL(objectName, opts)
	if err != nil {
		return nil, 0, nil, fmt.Errorf("failed to generate signed URL: %w", err)
	}

	return &signedURL, expiresIn, &contentType, nil
}

func (f *fileRepo) ReadImportProjectZip(ctx context.Context, name string) (io.ReadCloser, error) {
	sn := sanitize.Path(name)
	if sn == "" {
		return nil, gateway.ErrInvalidFile
	}
	r, err := f.read(ctx, path.Join(gcsImportBasePath, sn))
	if err != nil {
		return nil, err
	}
	return r, nil
}

func (f *fileRepo) RemoveImportProjectZip(ctx context.Context, filename string) error {
	return f.delete(ctx, path.Join(gcsImportBasePath, filename))
}

// helpers

func (f *fileRepo) client(ctx context.Context) (*storage.Client, error) {
	var client *storage.Client
	var err error

	if f.isFake {
		testGCS, err := testutil.NewGCSForTesting()
		if err != nil {
			return nil, err
		}
		client = testGCS.Client()
	} else {
		client, err = storage.NewClient(ctx)
		if err != nil {
			return nil, err
		}
		go func() {
			<-ctx.Done()
			if err := client.Close(); err != nil {
				log.Errorfc(ctx, "gcs: failed to close client: %v", err)
			}
		}()
	}
	return client, nil
}

func (f *fileRepo) bucket(ctx context.Context) (*storage.BucketHandle, error) {

	client, err := f.client(ctx)
	if err != nil {
		return nil, err
	}

	bucket := client.Bucket(f.bucketName)
	return bucket, nil
}

func (f *fileRepo) read(ctx context.Context, filename string) (io.ReadCloser, error) {
	if filename == "" {
		visualizer.WarnWithCallerLogging(ctx, "gcs: read filename is empty")
		return nil, rerror.ErrNotFound
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		return nil, visualizer.ErrorWithCallerLogging(ctx, "gcs: read bucket err", rerror.ErrInternalByWithContext(ctx, err))
	}

	_, err = bucket.Object(filename).Attrs(ctx)
	if err != nil && errors.Is(err, storage.ErrObjectNotExist) {
		visualizer.WarnWithCallerLogging(ctx, "gcs: read attrs err")
		return nil, rerror.ErrNotFound
	}

	if err != nil {
		return nil, visualizer.ErrorWithCallerLogging(ctx, "gcs: read attrs err", rerror.ErrInternalByWithContext(ctx, err))
	}

	// Note:
	// fsouza/fake-gcs-server can't read object by Reader.
	// so we need to download it from the server directly.
	if f.isFake {
		gcsHost := testutil.GetFakeGCSTestHost()
		u := fmt.Sprintf("%s/download/storage/v1/b/%s/o/%s?alt=media",
			strings.TrimRight(gcsHost, "/"),
			url.PathEscape(bucket.BucketName()),
			url.PathEscape(filename),
		)

		resp, err := http.Get(u)
		if err != nil {
			return nil, err
		}

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			return nil, visualizer.ErrorWithCallerLogging(ctx, "gcs: read fake object err", fmt.Errorf("emu GET failed: status=%d body=%s", resp.StatusCode, string(body)))
		}
		return resp.Body, nil
	}

	reader, err := bucket.Object(filename).NewReader(ctx)
	if err != nil {
		if errors.Is(err, storage.ErrObjectNotExist) {
			return nil, rerror.ErrNotFound
		}
		return nil, visualizer.ErrorWithCallerLogging(ctx, "gcs: read object err", rerror.ErrInternalByWithContext(ctx, err))
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
	writer.CacheControl = f.cacheControl

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
