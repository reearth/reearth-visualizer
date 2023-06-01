package config

type GCSConfig struct {
	BucketName              string
	PublicationCacheControl string
}

func (g GCSConfig) IsConfigured() bool {
	return g.BucketName != ""
}

type S3Config struct {
	BucketName              string
	PublicationCacheControl string
}

func (s S3Config) IsConfigured() bool {
	return s.BucketName != ""
}
