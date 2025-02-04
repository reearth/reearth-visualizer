[![ci-server](https://github.com/reearth/reearth-visualizer/actions/workflows/ci_server.yml/badge.svg)](https://github.com/reearth/reearth-visualizer/actions/workflows/ci_server.yml) [![codecov](https://codecov.io/gh/reearth/reearth/branch/main/graph/badge.svg?flag=server)](https://codecov.io/gh/reearth/reearth)

# reearth/server

A back-end API server application for Re:Earth

## Storage

Visualizer is compatible with the following storage interfaces:

- [Google Cloud Storage](https://cloud.google.com/storage)
- [Amazon S3](https://aws.amazon.com/s3/)
- Local File System

### Storage Configuration

To use these storage interfaces, you need to set the following environment variables in order of priority: 1. `REEARTH_GCS_BUCKETNAME`: Set this to use Google Cloud Storage. 2. `REEARTH_S3_BUCKET_NAME`: Set this to use Amazon S3.

If neither `REEARTH_GCS_BUCKETNAME` nor `REEARTH_S3_BUCKET_NAME` is configured, the local file system will be used as the default storage interface.

Additionally, `REEARTH_ASSETBASEURL` is a required environment variable that is used across all storage types. This should be set to the base URL for accessing your stored assets.

### Testing GCS Locally

1. `make gcs` ([fake-gcs-server](https://github.com/fsouza/fake-gcs-server) image is up)

2. create a bucket

```shell
curl -X POST http://localhost:4443/storage/v1/b\?project\=your-project-id \
    -H "Content-Type: application/json" \
    -d '{
          "name": "test-bucket"
        }'
```

3. set `REEARTH_GCS_BUCKETNAME` to `test-bucket`

※ project name and test name is anything you want
