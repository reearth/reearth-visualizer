package builder

import (
	"context"
	"encoding/json"
	"io"
	"time"

	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/layer/encoding"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/scene"
)

const (
	// schema version
	version = 1
)

type Builder struct {
	ploader  property.Loader
	exporter *encoding.Exporter
	encoder  *encoder
}

func New(ll layer.Loader, pl property.Loader, dl dataset.GraphLoader) *Builder {
	e := &encoder{}
	return &Builder{
		ploader: pl,
		encoder: e,
		exporter: &encoding.Exporter{
			Merger: &merging.Merger{
				LayerLoader:    ll,
				PropertyLoader: pl,
			},
			Sealer: &merging.Sealer{
				DatasetGraphLoader: dl,
			},
			Encoder: e,
		},
	}
}

func (b *Builder) BuildScene(ctx context.Context, w io.Writer, s *scene.Scene, publishedAt time.Time) error {
	if b == nil {
		return nil
	}

	res, err := b.buildScene(ctx, s, publishedAt)
	if err != nil {
		return err
	}

	return json.NewEncoder(w).Encode(res)
}

func (b *Builder) buildScene(ctx context.Context, s *scene.Scene, publishedAt time.Time) (*sceneJSON, error) {
	if b == nil {
		return nil, nil
	}

	// properties
	p, err := b.ploader(ctx, s.Properties()...)
	if err != nil {
		return nil, err
	}

	// layers
	if err := b.exporter.ExportLayerByID(ctx, s.RootLayer()); err != nil {
		return nil, err
	}
	layers := b.encoder.Result()

	res := b.scene(ctx, s, publishedAt, layers, p)
	return res, nil
}
