package interfaces

import (
	"context"
	"io"
	"net/url"

	"github.com/reearth/reearth-backend/pkg/project"
)

type ProjectPublishedMetadata struct {
	Title             string `json:"title,omitempty"`
	Description       string `json:"description,omitempty"`
	Image             string `json:"image,omitempty"`
	Noindex           bool   `json:"noindex,omitempty"`
	IsBasicAuthActive bool   `json:"isBasicAuthActive,omitempty"`
	BasicAuthUsername string `json:"basicAuthUsername,omitempty"`
	BasicAuthPassword string `json:"basicAuthPassword,omitempty"`
}

func ProjectPublishedMetadataFrom(prj *project.Project) ProjectPublishedMetadata {
	title := prj.PublicTitle()
	description := prj.PublicDescription()
	image := prj.PublicImage()
	if title == "" {
		title = prj.Name()
	}
	if description == "" {
		description = prj.Description()
	}
	if image == "" {
		image = prj.ImageURL().String()
	}

	return ProjectPublishedMetadata{
		Title:             title,
		Description:       description,
		Image:             image,
		Noindex:           prj.PublicNoIndex(),
		IsBasicAuthActive: prj.IsBasicAuthActive(),
		BasicAuthUsername: prj.BasicAuthUsername(),
		BasicAuthPassword: prj.BasicAuthPassword(),
	}
}

type Published interface {
	Metadata(context.Context, string) (ProjectPublishedMetadata, error)
	Data(context.Context, string) (io.Reader, error)
	Index(context.Context, string, *url.URL) (string, error)
}
