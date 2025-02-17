package builder

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
	Enabled     bool         `json:"enabled"`
	Extended    bool         `json:"extended"`
}
