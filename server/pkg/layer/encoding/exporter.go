package encoding

import (
	"context"

	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/layer/merging"
)

type Exporter struct {
	Merger  *merging.Merger
	Sealer  *merging.Sealer
	Encoder Encoder
}

func (e *Exporter) ExportLayerByID(ctx context.Context, l layer.ID) error {
	if e == nil {
		return nil
	}
	m, err := e.Merger.MergeLayerFromID(ctx, l, nil)
	if err != nil {
		return err
	}
	return e.Encode(ctx, m)
}

func (e *Exporter) ExportLayer(ctx context.Context, l layer.Layer) error {
	if e == nil {
		return nil
	}
	m, err := e.Merger.MergeLayer(ctx, l, nil)
	if err != nil {
		return err
	}
	return e.Encode(ctx, m)
}

func (e *Exporter) Encode(ctx context.Context, m merging.MergedLayer) error {
	if e == nil {
		return nil
	}
	s, err := e.Sealer.Seal(ctx, m)
	if err != nil {
		return err
	}
	err = e.Encoder.Encode(s)
	if err != nil {
		return err
	}
	return nil
}
