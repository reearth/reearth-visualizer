package config

type GCSConfig struct {
	BucketName              string `pp:",omitempty"`
	PublicationCacheControl string `pp:",omitempty"`
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
