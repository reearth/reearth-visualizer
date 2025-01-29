package gcs

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/url"
	"os"
	"path"
	"strings"
	"testing"

	"cloud.google.com/go/storage"
	"github.com/google/uuid"
	"github.com/reearth/reearthx/log"
	"github.com/stretchr/testify/assert"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

func uploadTestData(client *storage.Client, bucketName string, testFileName string) {
	ctx := context.Background()

	bucket := client.Bucket(bucketName)
	err := bucket.Create(ctx, "", nil)
	if err != nil {
		panic(err)
	}

	object := bucket.Object(testFileName)
	if err := object.Delete(ctx); err != nil && !errors.Is(err, storage.ErrObjectNotExist) {
		panic(err)
	}
	writer := object.NewWriter(ctx)

	content, err := os.Open("testdata/geojson.json")
	if err != nil {
		panic(err)
	}

	_, err = io.Copy(writer, content)
	if err != nil {
		panic(err)
	}

	if err := writer.Close(); err != nil {
		panic(err)
	}
}

func createBucket(client *storage.Client, bucketName string) {
	ctx := context.Background()
	bucket := client.Bucket(bucketName)
	err := bucket.Create(ctx, "", nil)
	if err != nil {
		panic(err)
	}
}

func deleteBucketWithObjects(client *storage.Client, bucketName string) {
	ctx := context.Background()
	bucket := client.Bucket(bucketName)

	it := bucket.Objects(ctx, nil)
	for {
		objAttrs, err := it.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			panic(err)
		}
		if err := bucket.Object(objAttrs.Name).Delete(ctx); err != nil {
			panic(err)
		}
	}

	if err := bucket.Delete(ctx); err != nil {
		panic(err)
	}

	log.Printf("Bucket %s deleted successfully", bucketName)
}

func TestGetGCSObjectURL(t *testing.T) {
	e, _ := url.Parse("https://hoge.com/assets/xxx.yyy")
	b, _ := url.Parse("https://hoge.com/assets")
	assert.Equal(t, e, getGCSObjectURL(b, "xxx.yyy"))
}

func TestGetGCSObjectNameFromURL(t *testing.T) {
	u, _ := url.Parse("https://hoge.com/assets/xxx.yyy")
	b, _ := url.Parse("https://hoge.com")
	b2, _ := url.Parse("https://hoge2.com")
	assert.Equal(t, "assets/xxx.yyy", getGCSObjectNameFromURL(b, u))
	assert.Equal(t, "", getGCSObjectNameFromURL(b2, u))
	assert.Equal(t, "", getGCSObjectNameFromURL(nil, u))
	assert.Equal(t, "", getGCSObjectNameFromURL(b, nil))
}

func TestUploadAssetFromURL(t *testing.T) {
	ctx := context.Background()

	// Mock fileRepo
	baseURL, _ := url.Parse("http://0.0.0.0:4443/download/storage/v1/b")

	distBucketName := strings.ToLower(uuid.New().String())
	srcBucketName := fmt.Sprintf("test-bucket-%s", distBucketName)
	client, _ := storage.NewClient(ctx, option.WithoutAuthentication(), option.WithEndpoint(devBaseURL))

	defer func() {
		deleteBucketWithObjects(client, distBucketName)
		deleteBucketWithObjects(client, srcBucketName)
		err := client.Close()
		if err != nil {
			t.Fatalf("failed to close client: %v", err)
		}
	}()

	createBucket(client, distBucketName)

	testFileName := uuid.New().String()
	uploadTestData(client, srcBucketName, testFileName)

	newFileRepo, err := NewFile(true, distBucketName, baseURL.String(), "")
	assert.NoError(t, err)

	srcURL, _ := url.Parse(fmt.Sprintf("%s/%s/o/%s", baseURL.String(), srcBucketName, testFileName))
	uploadedURL, _, err := newFileRepo.UploadAssetFromURL(ctx, srcURL)

	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("%s/assets/%s", baseURL.String(), path.Base(uploadedURL.Path)), uploadedURL.String())
}
