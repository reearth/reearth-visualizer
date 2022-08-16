package decoding

import (
	"fmt"

	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/property"
)

type Decoder interface {
	Decode() (Result, error)
}

type Result struct {
	Root       *layer.IDList
	Layers     layer.Map
	Properties property.Map
}

func (r Result) RootLayers() layer.List {
	return r.Layers.Pick(r.Root)
}

func (r Result) Merge(r2 Result) Result {
	root := r.Root.Clone()
	root.Merge(r2.Root)
	return Result{
		Root:       root,
		Layers:     r.Layers.Merge(r2.Layers),
		Properties: r.Properties.Merge(r2.Properties),
	}
}

func (r Result) MergeInitializerResult(r2 layer.InitializerResult) Result {
	return Result{
		Root:       r.Root.Clone().AppendLayers(r2.Root),
		Layers:     r.Layers.Merge(r2.Layers),
		Properties: r.Properties.Merge(r2.Properties),
	}
}

func (r Result) Validate() error {
	for _, l := range r.Layers.List().Deref() {
		if err := l.ValidateProperties(r.Properties); err != nil {
			return fmt.Errorf("layer %s is invalid: %w", l.ID(), err)
		}
	}
	return nil
}

func resultFrom(lg *layer.Group, layers layer.Map, properties property.Map) (r Result, err error) {
	r = Result{
		Root:       layer.NewIDList([]layer.ID{lg.ID()}),
		Layers:     layers.Add(lg.LayerRef()),
		Properties: properties,
	}
	err = r.Validate()
	return
}
