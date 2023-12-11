package builder

import (
	"context"

	"github.com/reearth/reearth/server/pkg/scene"
)

type layerStylesJSON struct {
	ID    string     `json:"id"`
	Name  string     `json:"name,omitempty"`
	Value *valueJSON `json:"value,omitempty"`
}

type valueJSON map[string]any

func (b *Builder) layerStylesJSON(ctx context.Context) ([]*layerStylesJSON, error) {

	var res []*layerStylesJSON

	for _, l := range *b.layerStyles {
		if l == nil {
			continue
		}
		if b, _ := getLayerStylesJSON(*l, ctx); b != nil {
			res = append(res, b)
		}
	}

	return res, nil
}

func getLayerStylesJSON(style scene.Style, ctx context.Context) (*layerStylesJSON, error) {

	return &layerStylesJSON{
		ID:    style.ID().String(),
		Name:  style.Name(),
		Value: (*valueJSON)(style.Value()),
	}, nil
}
