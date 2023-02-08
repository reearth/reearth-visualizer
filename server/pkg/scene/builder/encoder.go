package builder

import (
	"github.com/reearth/reearth/server/pkg/layer/encoding"
	"github.com/reearth/reearth/server/pkg/layer/merging"
	"github.com/reearth/reearth/server/pkg/property"
)

var _ encoding.Encoder = &encoder{}

type encoder struct {
	res *layerJSON
}

func (*encoder) MimeType() string {
	return "application/json"
}

func (e *encoder) Result() []*layerJSON {
	if e == nil || e.res == nil {
		return nil
	}
	return e.res.Children
}

func (e *encoder) Encode(l merging.SealedLayer) (err error) {
	if e == nil {
		return
	}
	e.res = e.layer(l)
	return
}

func (e *encoder) layer(layer merging.SealedLayer) *layerJSON {
	if layer == nil {
		return nil
	}
	l := layer.Common()
	if l == nil {
		return nil
	}

	var children []*layerJSON
	if g := layer.Group(); g != nil {
		for _, c := range g.Children {
			if d := e.layer(c); d != nil {
				children = append(children, d)
			}
		}
	}

	var propertyID string
	if l.Property != nil {
		propertyID = l.Property.Original.String()
	}

	var tags []tagJSON
	if len(l.Tags) > 0 {
		for _, t := range l.Tags {
			var tags2 []tagJSON
			if len(t.Tags) > 0 {
				tags2 = make([]tagJSON, 0, len(t.Tags))
				for _, t := range t.Tags {
					tags2 = append(tags2, tagJSON{
						ID:    t.ID.String(),
						Label: t.Label,
					})
				}
			}
			tags = append(tags, tagJSON{
				ID:    t.ID.String(),
				Label: t.Label,
				Tags:  tags2,
			})
		}
	}

	return &layerJSON{
		ID:          l.Original.String(),
		PluginID:    l.PluginID.StringRef(),
		ExtensionID: l.ExtensionID.StringRef(),
		Name:        l.Name,
		Property:    e.property(l.Property),
		PropertyID:  propertyID,
		Infobox:     e.infobox(l.Infobox),
		IsVisible:   l.IsVisible,
		Tags:        tags,
		Children:    children,
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
	PropertyID  string       `json:"propertyId,omitempty"`
	Property    propertyJSON `json:"property,omitempty"`
	Infobox     *infoboxJSON `json:"infobox,omitempty"`
	Tags        []tagJSON    `json:"tags,omitempty"`
	IsVisible   bool         `json:"isVisible"`
	Children    []*layerJSON `json:"children,omitempty"`
}

type tagJSON struct {
	ID    string    `json:"id"`
	Label string    `json:"label"`
	Tags  []tagJSON `json:"tags,omitempty"`
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

type widgetAlignSystemJSON struct {
	Inner *widgetZoneJSON `json:"inner"`
	Outer *widgetZoneJSON `json:"outer"`
}

type widgetZoneJSON struct {
	Left   *widgetSectionJSON `json:"left"`
	Center *widgetSectionJSON `json:"center"`
	Right  *widgetSectionJSON `json:"right"`
}

type widgetSectionJSON struct {
	Top    *widgetAreaJSON `json:"top"`
	Middle *widgetAreaJSON `json:"middle"`
	Bottom *widgetAreaJSON `json:"bottom"`
}

type widgetAreaJSON struct {
	WidgetIDs  []string               `json:"widgetIds"`
	Align      string                 `json:"align"`
	Padding    *widgetAreaPaddingJSON `json:"padding"`
	Gap        *int                   `json:"gap"`
	Centered   bool                   `json:"centered"`
	Background *string                `json:"background"`
}

type widgetAreaPaddingJSON struct {
	Top    int `json:"top"`
	Bottom int `json:"bottom"`
	Left   int `json:"left"`
	Right  int `json:"right"`
}

type widgetJSON struct {
	ID          string       `json:"id"`
	PluginID    string       `json:"pluginId"`
	ExtensionID string       `json:"extensionId"`
	Property    propertyJSON `json:"property"`
	Extended    bool         `json:"extended"`
}

type clusterJSON struct {
	ID       string       `json:"id"`
	Name     string       `json:"name"`
	Property propertyJSON `json:"property"`
}
