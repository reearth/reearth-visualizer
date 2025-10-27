package testutil

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"os"

	"cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

const (
	GCSBaseURLForTesting = "http://localhost:4443/storage/v1/b"
)

type GCSForTesting struct {
	client *storage.Client
}

func GetFakeGCSTestHost() string {
	gcsHost := os.Getenv("STORAGE_EMULATOR_HOST") // In the case of Docker, it should be http://reearth-gcs:4443
	if gcsHost == "" {
		return "http://localhost:4443"
	}
	return gcsHost
}

func getFakeGCSTestEndpoint() string {
	gcsHost := GetFakeGCSTestHost()
	return gcsHost + "/storage/v1/b"
}

func NewGCSForTesting() (*GCSForTesting, error) {
	ctx := context.Background()
	endpoint := getFakeGCSTestEndpoint()
	client, err := storage.NewClient(ctx, option.WithoutAuthentication(), option.WithEndpoint(endpoint))
	if err != nil {
		return nil, err
	}
	return &GCSForTesting{client: client}, nil
}

func (g *GCSForTesting) Client() *storage.Client {
	return g.client
}

func (g *GCSForTesting) Close() error {
	return g.client.Close()
}

func (g *GCSForTesting) UploadTestData(bucket *storage.BucketHandle, testFileName string) {
	ctx := context.Background()

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

func (g *GCSForTesting) CreateBucket(bucketName string) *storage.BucketHandle {
	ctx := context.Background()
	bucket := g.client.Bucket(bucketName)
	err := bucket.Create(ctx, "", nil)
	fmt.Println("TestGetGCSObjectURL_LOG: err", err)
	if err != nil {
		panic(err)
	}
	return bucket
}

func (g *GCSForTesting) DeleteBucketWithObjects(bucketName string) {
	ctx := context.Background()
	bucket := g.client.Bucket(bucketName)

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
