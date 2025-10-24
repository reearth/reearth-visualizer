package gcs

import (
	"context"
	"fmt"
	"net/url"
	"path"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/reearth/reearth/server/internal/testutil"
	"github.com/stretchr/testify/assert"
)

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

func TestGCSFile_UploadAssetFromURL(t *testing.T) {
	ctx := context.Background()

	// Mock fileRepo
	gcsHost := testutil.GetFakeGCSTestHost()
	baseURL, _ := url.Parse(testutil.GCSBaseURLForTesting)

	distBucketName := strings.ToLower(uuid.New().String())
	srcBucketName := fmt.Sprintf("test-bucket-%s", distBucketName)
	testGCS, err := testutil.NewGCSForTesting()
	if err != nil {
		t.Fatalf("failed to create GCSForTesting: %v", err)
	}

	srcBucket := testGCS.CreateBucket(srcBucketName)
	testGCS.CreateBucket(distBucketName)
	testFileName := uuid.New().String()
	testGCS.UploadTestData(srcBucket, testFileName)

	defer func() {
		testGCS.DeleteBucketWithObjects(distBucketName)
		testGCS.DeleteBucketWithObjects(srcBucketName)
		err := testGCS.Close()
		if err != nil {
			t.Fatalf("failed to close client: %v", err)
		}
	}()

	newFileRepo, err := NewFile(true, distBucketName, baseURL.String(), "")
	assert.NoError(t, err)

	srcURL, _ := url.Parse(fmt.Sprintf("%s/download/storage/v1/b/%s/o/%s?alt=media", gcsHost, srcBucketName, testFileName))
	uploadedURL, _, err := newFileRepo.UploadAssetFromURL(ctx, srcURL)

	assert.NoError(t, err)
	assert.Equal(t, fmt.Sprintf("%s/assets/%s", baseURL.String(), path.Base(uploadedURL.Path)), uploadedURL.String())
}
