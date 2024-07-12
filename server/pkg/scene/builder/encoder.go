package builder

import (
	"github.com/reearth/reearth/server/pkg/property"
)

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
	ID          string `json:"id"`
	PluginID    string `json:"pluginId"`
	ExtensionID string `json:"extensionId"`
	Extended    bool   `json:"extended"`
}

type clusterJSON struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}
