package builder

import (
	"context"

	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearth/server/pkg/property"
)

type nlsLayerJSON struct {
	ID        string          `json:"id"`
	Title     string          `json:"title,omitempty"`
	LayerType string          `json:"layerType,omitempty"`
	Config    *configJSON     `json:"config,omitempty"`
	IsVisible bool            `json:"isVisible"`
	Infobox   *nlsInfoboxJSON `json:"nlsInfobox,omitempty"`
	Children  []*nlsLayerJSON `json:"children,omitempty"`
}

type configJSON map[string]any

type nlsInfoboxJSON struct {
	ID       string       `json:"id"`
	Property propertyJSON `json:"property"`
	Blocks   []*blockJSON `json:"blocks"`
}

func (b *Builder) nlsLayersJSON(ctx context.Context) ([]*nlsLayerJSON, error) {

	var res []*nlsLayerJSON

	for _, l := range *b.nlsLayer {
		if l == nil {
			continue
		}
		if c, _ := b.getNLSLayerJSON(ctx, *l); c != nil {
			res = append(res, c)
		}
	}

	return res, nil
}

func (b *Builder) getNLSLayerJSON(ctx context.Context, layer nlslayer.NLSLayer) (*nlsLayerJSON, error) {

	var children []*nlsLayerJSON
	if lg := nlslayer.ToNLSLayerGroup(layer); lg != nil {
		layers, err := b.nlsloader(ctx, lg.Children().Layers()...)
		if err != nil {
			return nil, err
		}
		for _, c := range layers {
			if c == nil {
				continue
			}
			if d, _ := b.getNLSLayerJSON(ctx, *c); d != nil {
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
		Infobox:   b.nlsInfoboxJSON(ctx, layer.Infobox()),
	}, nil
}

func (b *Builder) nlsInfoboxJSON(ctx context.Context, infobox *nlslayer.Infobox) *nlsInfoboxJSON {
	if infobox == nil {
		return nil
	}

	p, _ := b.ploader(ctx, infobox.Property())

	var blocks []*blockJSON
	for _, block := range infobox.Blocks() {
		if block == nil {
			continue
		}
		blockJSON := b.infoboxBlockJSON(ctx, block, p)
		if blockJSON != nil {
			blocks = append(blocks, blockJSON)
		}
	}

	return &nlsInfoboxJSON{
		ID:       infobox.Id().String(),
		Property: b.property(ctx, findProperty(p, infobox.Property())),
		Blocks:   blocks,
	}
}

func (b *Builder) infoboxBlockJSON(ctx context.Context, block *nlslayer.InfoboxBlock, p []*property.Property) *blockJSON {
	if block == nil {
		return nil
	}
	return &blockJSON{
		ID:          block.ID().String(),
		Property:    b.property(ctx, findProperty(p, block.Property())),
		Plugins:     nil,
		ExtensionId: block.Extension().String(),
		PluginId:    block.Plugin().String(),
	}
}
