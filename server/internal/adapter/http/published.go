package http

import (
	"context"
	"io"
	"net/url"

	"github.com/reearth/reearth/server/internal/usecase/interfaces"
)

type PublishedController struct {
	usecase interfaces.Published
}

func NewPublishedController(usecase interfaces.Published) *PublishedController {
	return &PublishedController{usecase: usecase}
}

func (c *PublishedController) Metadata(ctx context.Context, name string) (interfaces.ProjectPublishedMetadata, error) {
	return c.usecase.Metadata(ctx, name)
}

func (c *PublishedController) Data(ctx context.Context, name string) (io.Reader, error) {
	return c.usecase.Data(ctx, name)
}

func (c *PublishedController) Index(ctx context.Context, name string, url *url.URL) (string, error) {
	return c.usecase.Index(ctx, name, url)
}
