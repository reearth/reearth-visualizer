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
}

type ProjectPublishedMetadata struct {
	Title             string `json:"title,omitempty"`
	Description       string `json:"description,omitempty"`
	Image             string `json:"image,omitempty"`
	Noindex           bool   `json:"noindex,omitempty"`
	IsBasicAuthActive bool   `json:"isBasicAuthActive,omitempty"`
	BasicAuthUsername string `json:"basicAuthUsername,omitempty"`
	BasicAuthPassword string `json:"basicAuthPassword,omitempty"`
}

func PublishedMetadataFrom(i HasPublicMeta) ProjectPublishedMetadata {
	return ProjectPublishedMetadata{
		Title:             i.PublicTitle(),
		Description:       i.PublicDescription(),
		Image:             i.PublicImage(),
		Noindex:           i.PublicNoIndex(),
		IsBasicAuthActive: i.IsBasicAuthActive(),
		BasicAuthUsername: i.BasicAuthUsername(),
		BasicAuthPassword: i.BasicAuthPassword(),
	}
}

type Published interface {
	Metadata(context.Context, string) (ProjectPublishedMetadata, error)
	Data(context.Context, string) (io.Reader, error)
	Index(context.Context, string, *url.URL) (string, error)
}
