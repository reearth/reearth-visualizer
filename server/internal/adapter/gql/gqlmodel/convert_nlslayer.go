package gqlmodel

import (
	"net/url"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearthx/util"
)

func ToNLSLayerSimple(l *nlslayer.NLSLayerSimple, parent *id.NLSLayerID) *NLSLayerSimple {
	if l == nil {
		return nil
	}

	return &NLSLayerSimple{
		ID:              IDFrom(l.ID()),
		SceneID:         IDFrom(l.Scene()),
		Title:           l.Title(),
		Visible:         l.IsVisible(),
		Infobox:         nil,  // Temporarily
		Data:			 ToData(l.Data()),
		Properties:		 l.Properties(),
		Defines: 		 l.Defines(),    
		Events:			 ToEvents(l.Events()),     
		Appearance:		 l.Appearance(), 
		Tags:            ToLayerTagList(l.Tags(), l.Scene()),
	}
}

func ToData(d *nlslayer.Data) *Data {
	if d == nil {
		return nil
	}
	return &Data{
		DataType:       d.DataType,     
		URL:            d.URL,
		Value:          d.Value,
		Layers:         d.Layers,
		JSONProperties: d.JSONProperties,
		UpdateInterval: d.UpdateInterval,
		Parameters:     d.Parameters,
		Time:           ToTime(d.Time),
		CSV:            ToCSV(d.CSV),
	}
}

func ToTime(t *nlslayer.Time) *Time {
	if t == nil {
		return nil
	}
	return &Time{
		Property: t.Property,
		Interval: t.Interval,
		UpdateClockOnLoad: t.UpdateClockOnLoad,
	}
}

func ToCSV(c *nlslayer.CSV) *CSV {
	if c == nil {
		return nil
	}
	return &CSV{
		IDColumn: c.IDColumn,
		LatColumn: c.LatColumn,
		LngColumn: c.LngColumn,
		HeightColumn: c.HeightColumn,
		NoHeader: c.NoHeader,
		DisableTypeConversion: c.DisableTypeConversion,
	}
		
}

func ToEvents(e *nlslayer.Events) *Events {
	if e == nil {
		return nil
	}
	return &Events{
		SelectEvent: ToSelectEvent(e.SelectEvent()),
	}
}

func ToSelectEvent(se *nlslayer.SelectEvent) *SelectEvent {
	if se == nil {
		return nil
	}
	return &SelectEvent{
		OpenURL: ToOpenURL(se.OpenUrl()),
	}
}

func ToOpenURL(oe *nlslayer.OpenUrlEvent) *OpenURLEvent {
	if oe == nil {
		return nil
	}
	return &OpenURLEvent{
		URL: oe.Url(),
		URLKey: oe.UrlKey(),
	}
}

func ToNLSLayerData(dataType, timeProperty, csvIdColumn, csvLatColumn, csvLngColumn, csvHeightColumn *string, dataJsonProperties []*string, dataUpdateInterval, timeInterval *int, dataLayers, dataParameters, dataValue interface{},csvDisableTypeConversion, csvNoHeader, timeUpdateClockOnLoad *bool, dataURL *url.URL) *nlslayer.Data {
	csvData := &nlslayer.CSV{
		IDColumn: csvIdColumn,
		LatColumn: csvLatColumn,
		LngColumn: csvLngColumn,
		HeightColumn: csvHeightColumn,
		NoHeader: csvNoHeader,
		DisableTypeConversion: csvDisableTypeConversion,
	}

	timeData := &nlslayer.Time{
		Property: timeProperty,
		Interval: timeInterval,
		UpdateClockOnLoad: timeUpdateClockOnLoad,
	}

	return &nlslayer.Data{
		DataType: *dataType,
		URL: dataURL,
		Value: dataValue,
		Layers: dataLayers,
		JSONProperties: dataJsonProperties,
		UpdateInterval: dataUpdateInterval,
		Parameters: dataParameters,
		Time: timeData,
		CSV: csvData,
	}
}

func ToNLSProperties(p interface{}) *nlslayer.Properties {
	if prop, ok := p.(nlslayer.Properties); ok {
		return &prop
	}
	return nil
}

// TODO: Make Events Reals
func ToNLSEvents(ev interface{}) *nlslayer.Events {
	if ev, ok := ev.(nlslayer.Events); ok {
		return &ev
	}
	return nil
}

func ToNLSDefines(d interface{}) *nlslayer.Defines {
	if def, ok := d.(nlslayer.Defines); ok {
		return &def
	}
	return nil
}

func ToNLSApperance(a interface{}) *nlslayer.Appearance {
	if app, ok := a.(nlslayer.Appearance); ok {
		return &app
	}
	return nil
}

func ToNLSLayerGroup(l *nlslayer.NLSLayerGroup, parent *id.NLSLayerID) *NLSLayerGroup {
	if l == nil {
		return nil
	}

	return &NLSLayerGroup{
		ID:                    IDFrom(l.ID()),
		SceneID:               IDFrom(l.Scene()),
		Title:           l.Title(),
		Visible:         l.IsVisible(),
		Infobox:         nil,  // Temporarily
		Tags:            ToLayerTagList(l.Tags(), l.Scene()),
		ChildrenIds:              util.Map(l.Children().Layers(), IDFrom[id.NLSLayer]),
	}
}

func ToNLSLayer(l nlslayer.NLSLayer, parent *id.NLSLayerID) NLSLayer {
	if l == nil {
		return nil
	}

	switch la := l.(type) {
	case *nlslayer.NLSLayerSimple:
		return ToNLSLayerSimple(la, parent)
	case *nlslayer.NLSLayerGroup:
		return ToNLSLayerGroup(la, parent)
	}
	return nil
}

func ToNLSLayers(layers nlslayer.NLSLayerList, parent *id.NLSLayerID) []NLSLayer {
	return util.Map(layers, func(l *nlslayer.NLSLayer) NLSLayer {
		return ToNLSLayer(*l, parent)
	})
}
