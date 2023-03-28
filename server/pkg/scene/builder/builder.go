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
	"github.com/reearth/reearth/server/pkg/tag"
)

const (
	// schema version
	version = 1
)

type Builder struct {
	ploader           property.Loader
	sloader           property.SchemaLoader
	tloader           tag.SceneLoader
	exporter          *encoding.Exporter
	encoder           *encoder
	dropPrivateFields bool
}

func New(ll layer.Loader, pl property.Loader, sl property.SchemaLoader, dl dataset.GraphLoader, tl tag.Loader, tsl tag.SceneLoader, dropPrivateFields bool) *Builder {
	e := &encoder{}
	return &Builder{
		ploader: pl,
		sloader: sl,
		tloader: tsl,
		encoder: e,
		exporter: &encoding.Exporter{
			Merger: &merging.Merger{
				LayerLoader:    ll,
				PropertyLoader: pl,
				SchemaLoader:   sl,
			},
			Sealer: &merging.Sealer{
				DatasetGraphLoader: dl,
				TagLoader:          tl,
			},
			Encoder: e,
		},
		dropPrivateFields: dropPrivateFields,
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

	ps, err := b.sloader(ctx, p.Schemas()...)
	if err != nil {
		return nil, err
	}

	pf := property.FieldIDMapFrom(ps.Map(), p)

	// layers
	if err := b.exporter.ExportLayerByID(ctx, s.RootLayer()); err != nil {
		return nil, err
	}
	layers := b.encoder.Result()

	return b.scene(ctx, s, publishedAt, layers, p, ps, pf)
}
