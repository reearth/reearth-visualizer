package builder

import (
	"context"
	"encoding/json"
	"io"
	"time"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/layer/encoding"
	"github.com/reearth/reearth/server/pkg/layer/merging"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"github.com/reearth/reearth/server/pkg/tag"
)

const (
	// schema version
	version = 1
)

type Builder struct {
	ploader  property.Loader
	tloader  tag.SceneLoader
	exporter *encoding.Exporter
	encoder  *encoder

	scene *scene.Scene
	story *storytelling.Story
}

func New(ll layer.Loader, pl property.Loader, dl dataset.GraphLoader, tl tag.Loader, tsl tag.SceneLoader) *Builder {
	e := &encoder{}
	return &Builder{
		ploader: pl,
		tloader: tsl,
		encoder: e,
		exporter: &encoding.Exporter{
			Merger: &merging.Merger{
				LayerLoader:    ll,
				PropertyLoader: pl,
			},
			Sealer: &merging.Sealer{
				DatasetGraphLoader: dl,
				TagLoader:          tl,
			},
			Encoder: e,
		},
	}
}

func (b *Builder) ForScene(s *scene.Scene) *Builder {
	if b == nil {
		return nil
	}
	b.scene = s
	return b
}

func (b *Builder) WithStory(s *storytelling.Story) *Builder {
	if b == nil {
		return nil
	}
	b.story = s
	return b
}

func (b *Builder) Build(ctx context.Context, w io.Writer, publishedAt time.Time) error {
	if b == nil || b.scene == nil {
		return nil
	}

	res, err := b.buildScene(ctx, publishedAt)
	if err != nil {
		return err
	}

	if b.story != nil {
		story, err := b.buildStory(ctx)
		if err != nil {
			return err
		}
		res.Story = story
	}

	return json.NewEncoder(w).Encode(res)
}

func (b *Builder) buildScene(ctx context.Context, publishedAt time.Time) (*sceneJSON, error) {
	if b == nil {
		return nil, nil
	}

	// properties
	p, err := b.ploader(ctx, b.scene.Properties()...)
	if err != nil {
		return nil, err
	}

	// layers
	if err := b.exporter.ExportLayerByID(ctx, b.scene.RootLayer()); err != nil {
		return nil, err
	}
	layers := b.encoder.Result()

	return b.sceneJSON(ctx, publishedAt, layers, p)
}

func (b *Builder) buildStory(ctx context.Context) (*storyJSON, error) {
	if b == nil {
		return nil, nil
	}

	// properties
	p, err := b.ploader(ctx, b.story.Properties()...)
	if err != nil {
		return nil, err
	}

	return b.storyJSON(ctx, p)
}
