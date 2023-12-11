package builder

import (
	"context"

	"github.com/reearth/reearth/server/pkg/nlslayer"
)

type nlsLayerJSON struct {
	ID        string      `json:"id"`
	Title     string      `json:"title,omitempty"`
	LayerType string      `json:"layerType,omitempty"`
	Config    *configJSON `json:"config,omitempty"`
	IsVisible bool        `json:"isVisible"`
	// Infobox     *infoboxJSON    `json:"infobox,omitempty"`
	// Tags        []tagJSON       `json:"tags,omitempty"`
	Children []*nlsLayerJSON `json:"children,omitempty"`
}

type configJSON map[string]any

func (b *Builder) nlsLayersJSON(ctx context.Context) ([]*nlsLayerJSON, error) {

	var res []*nlsLayerJSON

	for _, l := range *b.nlsLayer {
		if l == nil {
			continue
		}
		if b, _ := getNLSLayerJSON(*l, b.nlsloader, ctx); b != nil {
			res = append(res, b)
		}
	}

	return res, nil
}

func getNLSLayerJSON(layer nlslayer.NLSLayer, nlsLoader nlslayer.Loader, ctx context.Context) (*nlsLayerJSON, error) {

	var children []*nlsLayerJSON
	if lg := nlslayer.ToNLSLayerGroup(layer); lg != nil {
		layers, err := nlsLoader(ctx, lg.Children().Layers()...)
		if err != nil {
			return nil, err
		}
		for _, c := range layers {
			if c == nil {
				continue
			}
			if d, _ := getNLSLayerJSON(*c, nlsLoader, ctx); d != nil {
				children = append(children, d)
			}
		}
	}

	return &nlsLayerJSON{
		ID:        layer.ID().String(),
		Title:     layer.Title(),
		LayerType: string(layer.LayerType()),
		Config:    (*configJSON)(layer.Config()),
		IsVisible: layer.IsVisible(),
		Children:  children,
	}, nil
}
