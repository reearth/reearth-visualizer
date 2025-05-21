package interfaces

import (
	"context"
	"io"
	"net/url"
)

type HasPublicMeta interface {
	PublicTitle() string
	PublicDescription() string
	PublicImage() string
	PublicNoIndex() bool
	IsBasicAuthActive() bool
	BasicAuthUsername() string
	BasicAuthPassword() string
	CoreSupport() bool
}

type PublishedMetadata struct {
	Title             string `json:"title,omitempty"`
	Description       string `json:"description,omitempty"`
	Image             string `json:"image,omitempty"`
	Noindex           bool   `json:"noindex,omitempty"`
	IsBasicAuthActive bool   `json:"isBasicAuthActive,omitempty"`
	BasicAuthUsername string `json:"basicAuthUsername,omitempty"`
	BasicAuthPassword string `json:"basicAuthPassword,omitempty"`
	CoreSupport       bool   `json:"coreSupport,omitempty"`
}

func PublishedMetadataFrom(i HasPublicMeta) PublishedMetadata {
	return PublishedMetadata{
		Title:             i.PublicTitle(),
		Description:       i.PublicDescription(),
		Image:             i.PublicImage(),
		Noindex:           i.PublicNoIndex(),
		IsBasicAuthActive: i.IsBasicAuthActive(),
		BasicAuthUsername: i.BasicAuthUsername(),
		BasicAuthPassword: i.BasicAuthPassword(),
		CoreSupport:       i.CoreSupport(),
	}
}

type Published interface {
	Metadata(context.Context, string) (PublishedMetadata, error)
	Data(context.Context, string) (io.Reader, error)
	Index(context.Context, string, *url.URL) (string, error)
}
