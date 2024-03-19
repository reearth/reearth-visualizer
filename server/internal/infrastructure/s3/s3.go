package s3

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"net/url"
	"path"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/kennygrant/sanitize"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

const (
	assetBasePath  string = "assets"
	pluginBasePath string = "plugins"
	mapBasePath    string = "maps"
	storyBasePath  string = "stories"
	fileSizeLimit  int64  = 1024 * 1024 * 100 // about 100MB
)

type fileRepo struct {
	bucketName   string
	base         *url.URL
	cacheControl string
	client       *s3.Client
}

func NewS3(ctx context.Context, bucketName, baseURL, cacheControl string) (gateway.File, error) {
	if bucketName == "" {
		return nil, errors.New("bucket name is empty")
	}

	if baseURL == "" {
		baseURL = fmt.Sprintf("https://%s.s3.amazonaws.com/", bucketName)
	}

	u, err := url.Parse(baseURL)
	if err != nil {
		return nil, errors.New("invalid base URL")
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, err
	}

	return &fileRepo{
		bucketName:   bucketName,
		base:         u,
		cacheControl: cacheControl,
		client:       s3.NewFromConfig(cfg),
	}, nil
}

func (f *fileRepo) ReadAsset(ctx context.Context, name string) (io.ReadCloser, error) {
	sn := sanitize.Path(name)
	if sn == "" {
		return nil, rerror.ErrNotFound
	}
	return f.read(ctx, path.Join(assetBasePath, sn))
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

	filename := path.Join(assetBasePath, sn)
	u := getObjectURL(f.base, filename)
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
	log.Infofc(ctx, "s3: asset deleted: %s", u)

	sn := getObjectNameFromURL(f.base, u)
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
	return f.read(ctx, path.Join(pluginBasePath, pid.String(), sn))
}

func (f *fileRepo) UploadPluginFile(ctx context.Context, pid id.PluginID, file *file.File) error {
	sn := sanitize.Path(file.Path)
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	_, err := f.upload(ctx, path.Join(pluginBasePath, pid.String(), sanitize.Path(file.Path)), file.Content)
	return err
}

func (f *fileRepo) RemovePlugin(ctx context.Context, pid id.PluginID) error {
	log.Infofc(ctx, "s3: plugin deleted: %s", pid)

	return f.deleteAll(ctx, path.Join(pluginBasePath, pid.String()))
}

// built scene

func (f *fileRepo) ReadBuiltSceneFile(ctx context.Context, name string) (io.ReadCloser, error) {
	if name == "" {
		return nil, rerror.ErrNotFound
	}
	return f.read(ctx, path.Join(mapBasePath, sanitize.Path(name)+".json"))
}

func (f *fileRepo) UploadBuiltScene(ctx context.Context, content io.Reader, name string) error {
	sn := sanitize.Path(name + ".json")
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	_, err := f.upload(ctx, path.Join(mapBasePath, sn), content)
	return err
}

func (f *fileRepo) MoveBuiltScene(ctx context.Context, oldName, name string) error {
	from := sanitize.Path(oldName + ".json")
	dest := sanitize.Path(name + ".json")
	if from == "" || dest == "" {
		return gateway.ErrInvalidFile
	}
	return f.move(ctx, path.Join(mapBasePath, from), path.Join(mapBasePath, dest))
}

func (f *fileRepo) RemoveBuiltScene(ctx context.Context, name string) error {
	log.Infofc(ctx, "s3: built scene deleted: %s", name)

	sn := sanitize.Path(name + ".json")
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	return f.delete(ctx, path.Join(mapBasePath, sn))
}

// stories

func (f *fileRepo) ReadStoryFile(ctx context.Context, name string) (io.ReadCloser, error) {
	if name == "" {
		return nil, rerror.ErrNotFound
	}
	return f.read(ctx, path.Join(storyBasePath, sanitize.Path(name)+".json"))
}

func (f *fileRepo) UploadStory(ctx context.Context, content io.Reader, name string) error {
	sn := sanitize.Path(name + ".json")
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	_, err := f.upload(ctx, path.Join(storyBasePath, sn), content)
	return err
}

func (f *fileRepo) MoveStory(ctx context.Context, oldName, name string) error {
	from := sanitize.Path(oldName + ".json")
	dest := sanitize.Path(name + ".json")
	if from == "" || dest == "" {
		return gateway.ErrInvalidFile
	}
	return f.move(ctx, path.Join(storyBasePath, from), path.Join(storyBasePath, dest))
}

func (f *fileRepo) RemoveStory(ctx context.Context, name string) error {
	log.Infofc(ctx, "s3: story deleted: %s", name)

	sn := sanitize.Path(name + ".json")
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	return f.delete(ctx, path.Join(storyBasePath, sn))
}

// helpers

func (f *fileRepo) read(ctx context.Context, filename string) (io.ReadCloser, error) {
	if filename == "" {
		return nil, rerror.ErrNotFound
	}

	obj, err := f.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(filename),
	})
	if err != nil {
		return nil, rerror.ErrInternalByWithContext(ctx, fmt.Errorf("s3: read err: %+v", err))
	}

	return obj.Body, nil
}

func (f *fileRepo) upload(ctx context.Context, filename string, content io.Reader) (int64, error) {
	if filename == "" {
		return 0, gateway.ErrInvalidFile
	}

	// By default, uploading the file with same name. It will overwrite the existing file.
	// No need to check if the file exists.

	ba, err := io.ReadAll(content)
	if err != nil {
		return 0, rerror.ErrInternalByWithContext(ctx, err)
	}
	body := bytes.NewReader(ba)

	_, err = f.client.PutObject(ctx, &s3.PutObjectInput{
		Body:          body,
		Bucket:        aws.String(f.bucketName),
		CacheControl:  &f.cacheControl,
		Key:           aws.String(filename),
		ContentLength: lo.ToPtr(body.Size()),
	})
	if err != nil {
		log.Errorfc(ctx, "s3: upload err: %v", err)
		return 0, gateway.ErrFailedToUploadFile
	}

	result, err := f.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(filename),
	})
	if err != nil {
		log.Errorfc(ctx, "s3: check file size after upload err: %v", err)
		return 0, gateway.ErrFailedToUploadFile
	}

	return lo.FromPtr(result.ContentLength), nil
}

func (f *fileRepo) copy(ctx context.Context, from, dest string) error {
	if from == "" || dest == "" || from == dest {
		return gateway.ErrInvalidFile
	}

	// Copy the item
	_, err := f.client.CopyObject(ctx, &s3.CopyObjectInput{
		Bucket:     aws.String(f.bucketName),
		CopySource: aws.String(url.QueryEscape(from)),
		Key:        aws.String(dest),
	})
	if err != nil {
		log.Errorfc(ctx, "s3: copy err: %+v\n", err)
		return rerror.ErrInternalByWithContext(ctx, err)
	}

	return nil
}

func (f *fileRepo) move(ctx context.Context, from, dest string) error {
	if from == "" || dest == "" || from == dest {
		return gateway.ErrInvalidFile
	}

	err := f.copy(ctx, from, dest)
	if err != nil {
		return err
	}

	err = f.delete(ctx, from)
	if err != nil {
		return err
	}

	return nil
}

func (f *fileRepo) delete(ctx context.Context, filename string) error {
	if filename == "" {
		return gateway.ErrInvalidFile
	}

	_, err := f.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(filename),
	})
	if err != nil {
		log.Errorfc(ctx, "s3: delete err: %v", err)
		return rerror.ErrInternalByWithContext(ctx, err)
	}

	return nil
}

func (f *fileRepo) deleteAll(ctx context.Context, path string) error {
	if path == "" {
		return gateway.ErrInvalidFile
	}

	l, err := f.client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket: aws.String(f.bucketName),
		Prefix: aws.String(path),
	})
	if err != nil {
		log.Errorfc(ctx, "s3: unable to list object for delete %v", err)
		return rerror.ErrInternalByWithContext(ctx, err)
	}

	keys := lo.Map(l.Contents, func(obj types.Object, _ int) types.ObjectIdentifier {
		return types.ObjectIdentifier{Key: obj.Key}
	})
	_, err = f.client.DeleteObjects(ctx, &s3.DeleteObjectsInput{
		Bucket: aws.String(f.bucketName),
		Delete: &types.Delete{
			Objects: keys,
		},
	})
	if err != nil {
		log.Errorfc(ctx, "s3: unable to delete object: %v", err)
		return rerror.ErrInternalByWithContext(ctx, err)
	}

	return nil
}

func getObjectURL(base *url.URL, objectName string) *url.URL {
	if base == nil {
		return nil
	}

	// https://github.com/golang/go/issues/38351
	b := *base
	b.Path = path.Join(b.Path, objectName)
	return &b
}

func getObjectNameFromURL(base, u *url.URL) string {
	if u == nil {
		return ""
	}
	if base == nil {
		base = &url.URL{}
	}
	p := sanitize.Path(strings.TrimPrefix(u.Path, "/"))
	if p == "" || u.Host != base.Host || u.Scheme != base.Scheme || !strings.HasPrefix(p, assetBasePath+"/") {
		return ""
	}

	return p
}

func newAssetID() string {
	// TODO: replace
	return id.NewAssetID().String()
}
