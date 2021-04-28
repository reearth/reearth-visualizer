package builder

import (
	"github.com/reearth/reearth-backend/pkg/layer/encoding"
	"github.com/reearth/reearth-backend/pkg/layer/merging"
	"github.com/reearth/reearth-backend/pkg/property"
)

var _ encoding.Encoder = &encoder{}

type encoder struct {
	res []*layerJSON
}

func (e *encoder) Result() []*layerJSON {
	if e == nil {
		return nil
	}
	return e.res
}

func (e *encoder) Encode(l merging.SealedLayer) (err error) {
	if e == nil {
		return
	}
	e.res = e.layers(l)
	return
}

func (e *encoder) layers(l merging.SealedLayer) []*layerJSON {
	if l == nil {
		return nil
	}
	if i, ok := l.(*merging.SealedLayerItem); ok {
		layer := e.layer(i)
		if layer == nil {
			return nil
		}
		return []*layerJSON{layer}
	} else if g, ok := l.(*merging.SealedLayerGroup); ok {
		// This encoder does not print group layer representation.
		layers := make([]*layerJSON, 0, len(g.Children))
		for _, c := range g.Children {
			l := e.layers(c)
			if l != nil {
				layers = append(layers, l...)
			}
		}
		return layers
	}
	return nil
}

func (e *encoder) layer(l *merging.SealedLayerItem) *layerJSON {
	if l == nil {
		return nil
	}
	return &layerJSON{
		ID:          l.Original.String(),
		PluginID:    l.PluginID.StringRef(),
		ExtensionID: l.ExtensionID.StringRef(),
		Name:        l.Name,
		Property:    e.property(l.Property),
		Infobox:     e.infobox(l.Infobox),
	}
}

func (e *encoder) infobox(i *merging.SealedInfobox) *infoboxJSON {
	if i == nil {
		return nil
	}
	fields := make([]infoboxFieldJSON, 0, len(i.Fields))
	for _, f := range i.Fields {
		fields = append(fields, infoboxFieldJSON{
			ID:          f.ID.String(),
			PluginID:    f.Plugin.String(),
			ExtensionID: string(f.Extension),
			Property:    e.property(f.Property),
		})
	}
	return &infoboxJSON{
		Fields:   fields,
		Property: e.property(i.Property),
	}
}

func (e *encoder) property(p *property.Sealed) propertyJSON {
	return p.Interface()
}

type layerJSON struct {
	ID          string       `json:"id"`
	PluginID    *string      `json:"pluginId,omitempty"`
	ExtensionID *string      `json:"extensionId,omitempty"`
	Name        string       `json:"name,omitempty"`
	Property    propertyJSON `json:"property,omitempty"`
	Infobox     *infoboxJSON `json:"infobox,omitempty"`
}

type infoboxJSON struct {
	Fields   []infoboxFieldJSON `json:"fields"`
	Property propertyJSON       `json:"property"`
}

type infoboxFieldJSON struct {
	ID          string       `json:"id"`
	PluginID    string       `json:"pluginId"`
	ExtensionID string       `json:"extensionId"`
	Property    propertyJSON `json:"property"`
}

type propertyJSON = map[string]interface{}
