package builder

import (
	"context"
	"encoding/json"
	"io"
	"time"

	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/storytelling"
)

const (
	// schema version
	version = 1
)

type Builder struct {
	ploader     property.Loader
	nlsloader   nlslayer.Loader
	encoder     *encoder
	scene       *scene.Scene
	nlsLayer    *nlslayer.NLSLayerList
	layerStyles *scene.StyleList
	story       *storytelling.Story
}

func New(pl property.Loader, nlsl nlslayer.Loader) *Builder {
	e := &encoder{}
	return &Builder{
		ploader:   pl,
		nlsloader: nlsl,
		encoder:   e,
	}
}

func (b *Builder) ForScene(s *scene.Scene) *Builder {
	if b == nil {
		return nil
	}
	b.scene = s
	return b
}

func (b *Builder) WithNLSLayers(nlsLayer *nlslayer.NLSLayerList) *Builder {
	if b == nil {
		return nil
	}
	b.nlsLayer = nlsLayer
	return b
}

func (b *Builder) WithLayerStyle(layerStyles *scene.StyleList) *Builder {
	if b == nil {
		return nil
	}
	b.layerStyles = layerStyles
	return b
}

func (b *Builder) WithStory(s *storytelling.Story) *Builder {
	if b == nil {
		return nil
	}
	b.story = s
	return b
}

func (b *Builder) Build(ctx context.Context, w io.Writer, publishedAt time.Time, coreSupport bool, enableGa bool, trackingId string) error {
	if b == nil || b.scene == nil {
		return nil
	}

	res, err := b.buildScene(ctx, publishedAt, coreSupport, enableGa, trackingId)
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

	if b.nlsLayer != nil {
		nlsLayers, err := b.buildNLSLayers(ctx)
		if err != nil {
			return err
		}
		res.NLSLayers = nlsLayers
	}

	if b.layerStyles != nil {
		layerStyles, err := b.buildLayerStyles(ctx)
		if err != nil {
			return err
		}
		res.LayerStyles = layerStyles
	}

	return json.NewEncoder(w).Encode(res)
}

func (b *Builder) buildScene(ctx context.Context, publishedAt time.Time, coreSupport bool, enableGa bool, trackingId string) (*sceneJSON, error) {
	if b == nil {
		return nil, nil
	}

	// properties
	p, err := b.ploader(ctx, b.scene.Properties()...)
	if err != nil {
		return nil, err
	}

	// layers
	layers := b.encoder.Result()

	return b.sceneJSON(ctx, publishedAt, layers, p, coreSupport, enableGa, trackingId)
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

func (b *Builder) buildNLSLayers(ctx context.Context) ([]*nlsLayerJSON, error) {
	if b == nil {
		return nil, nil
	}

	return b.nlsLayersJSON(ctx)
}

func (b *Builder) buildLayerStyles(ctx context.Context) ([]*layerStylesJSON, error) {
	if b == nil {
		return nil, nil
	}

	return b.layerStylesJSON(ctx)
}
