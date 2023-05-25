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
	s3AssetBasePath  string = "assets"
	s3PluginBasePath string = "plugins"
	s3MapBasePath    string = "maps"
	s3FileSizeLimit  int64  = 1024 * 1024 * 100 // about 100MB
)

type awsFileRepo struct {
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

	return &awsFileRepo{
		bucketName:   bucketName,
		base:         u,
		cacheControl: cacheControl,
		client:       s3.NewFromConfig(cfg),
	}, nil
}

func (f *awsFileRepo) ReadAsset(ctx context.Context, name string) (io.ReadCloser, error) {
	sn := sanitize.Path(name)
	if sn == "" {
		return nil, rerror.ErrNotFound
	}
	return f.read(ctx, path.Join(s3AssetBasePath, sn))
}

func (f *awsFileRepo) UploadAsset(ctx context.Context, file *file.File) (*url.URL, int64, error) {
	if file == nil {
		return nil, 0, gateway.ErrInvalidFile
	}
	if file.Size >= s3FileSizeLimit {
		return nil, 0, gateway.ErrFileTooLarge
	}

	sn := sanitize.Path(newAssetID() + path.Ext(file.Path))
	if sn == "" {
		return nil, 0, gateway.ErrInvalidFile
	}

	filename := path.Join(s3AssetBasePath, sn)
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

func (f *awsFileRepo) RemoveAsset(ctx context.Context, u *url.URL) error {
	log.Infof("s3: asset deleted: %s", u)

	sn := getObjectNameFromURL(f.base, u)
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	return f.delete(ctx, sn)
}

// plugin

func (f *awsFileRepo) ReadPluginFile(ctx context.Context, pid id.PluginID, filename string) (io.ReadCloser, error) {
	sn := sanitize.Path(filename)
	if sn == "" {
		return nil, rerror.ErrNotFound
	}
	return f.read(ctx, path.Join(s3PluginBasePath, pid.String(), sn))
}

func (f *awsFileRepo) UploadPluginFile(ctx context.Context, pid id.PluginID, file *file.File) error {
	sn := sanitize.Path(file.Path)
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	_, err := f.upload(ctx, path.Join(s3PluginBasePath, pid.String(), sanitize.Path(file.Path)), file.Content)
	return err
}

func (f *awsFileRepo) RemovePlugin(ctx context.Context, pid id.PluginID) error {
	log.Infof("s3: plugin deleted: %s", pid)

	return f.deleteAll(ctx, path.Join(s3PluginBasePath, pid.String()))
}

// built scene

func (f *awsFileRepo) ReadBuiltSceneFile(ctx context.Context, name string) (io.ReadCloser, error) {
	if name == "" {
		return nil, rerror.ErrNotFound
	}
	return f.read(ctx, path.Join(s3MapBasePath, sanitize.Path(name)+".json"))
}

func (f *awsFileRepo) UploadBuiltScene(ctx context.Context, content io.Reader, name string) error {
	sn := sanitize.Path(name + ".json")
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	_, err := f.upload(ctx, path.Join(s3MapBasePath, sn), content)
	return err
}

func (f *awsFileRepo) MoveBuiltScene(ctx context.Context, oldName, name string) error {
	from := sanitize.Path(oldName + ".json")
	dest := sanitize.Path(name + ".json")
	if from == "" || dest == "" {
		return gateway.ErrInvalidFile
	}
	return f.move(ctx, path.Join(s3MapBasePath, from), path.Join(s3MapBasePath, dest))
}

func (f *awsFileRepo) RemoveBuiltScene(ctx context.Context, name string) error {
	log.Infof("s3: built scene deleted: %s", name)

	sn := sanitize.Path(name + ".json")
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	return f.delete(ctx, path.Join(s3MapBasePath, sn))
}

// helpers

func (f *awsFileRepo) read(ctx context.Context, filename string) (io.ReadCloser, error) {
	if filename == "" {
		return nil, rerror.ErrNotFound
	}

	obj, err := f.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(filename),
	})
	if err != nil {
		log.Errorf("s3: read err: %+v\n", err)
		return nil, rerror.ErrInternalBy(err)
	}

	return obj.Body, nil
}

func (f *awsFileRepo) upload(ctx context.Context, filename string, content io.Reader) (int64, error) {
	if filename == "" {
		return 0, gateway.ErrInvalidFile
	}

	// By default, uploading the file with same name. It will overwrite the existing file.
	// No need to check if the file exists.

	ba, err := io.ReadAll(content)
	if err != nil {
		return 0, rerror.ErrInternalBy(err)
	}
	body := bytes.NewReader(ba)

	_, err = f.client.PutObject(ctx, &s3.PutObjectInput{
		Body:          body,
		Bucket:        aws.String(f.bucketName),
		CacheControl:  &f.cacheControl,
		Key:           aws.String(filename),
		ContentLength: body.Size(),
	})
	if err != nil {
		log.Errorf("s3: upload err: %+v\n", err)
		return 0, gateway.ErrFailedToUploadFile
	}

	result, err := f.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(filename),
	})
	if err != nil {
		log.Errorf("s3: check file size after upload err: %+v\n", err)
		return 0, gateway.ErrFailedToUploadFile
	}

	return result.ContentLength, nil
}

func (f *awsFileRepo) copy(ctx context.Context, from, dest string) error {
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
		log.Errorf("s3: copy err: %+v\n", err)
		return rerror.ErrInternalBy(err)
	}

	return nil
}

func (f *awsFileRepo) move(ctx context.Context, from, dest string) error {
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

func (f *awsFileRepo) delete(ctx context.Context, filename string) error {
	if filename == "" {
		return gateway.ErrInvalidFile
	}

	_, err := f.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(filename),
	})
	if err != nil {
		log.Errorf("s3: delete err: %+v\n", err)
		return rerror.ErrInternalBy(err)
	}

	return nil
}

func (f *awsFileRepo) deleteAll(ctx context.Context, path string) error {
	if path == "" {
		return gateway.ErrInvalidFile
	}

	l, err := f.client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket: aws.String(f.bucketName),
		Prefix: aws.String(path),
	})
	if err != nil {
		log.Errorf("s3: Unable to list object for delete %v", err)
		return rerror.ErrInternalBy(err)
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
		log.Errorf("s3: Unable to delete object %v", err)
		return rerror.ErrInternalBy(err)
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
	if p == "" || u.Host != base.Host || u.Scheme != base.Scheme || !strings.HasPrefix(p, s3AssetBasePath+"/") {
		return ""
	}

	return p
}

func newAssetID() string {
	// TODO: replace
	return id.NewAssetID().String()
}
