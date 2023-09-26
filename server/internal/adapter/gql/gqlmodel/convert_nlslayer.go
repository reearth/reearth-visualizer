package gqlmodel

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/nlslayer"
	"github.com/reearth/reearthx/util"
)

func ToNLSLayerSimple(l *nlslayer.NLSLayerSimple) *NLSLayerSimple {
	if l == nil {
		return nil
	}

	return &NLSLayerSimple{
		ID:        IDFrom(l.ID()),
		SceneID:   IDFrom(l.Scene()),
		Title:     l.Title(),
		Visible:   l.IsVisible(),
		Infobox:   nil, // Temporarily
		LayerType: string(l.LayerType()),
		Config:    JSON(*l.Config()),
		Tags:      ToLayerTagList(l.Tags(), l.Scene()),
	}
}

func ToNLSConfig(p JSON) *nlslayer.Config {
	if p == nil {
		return nil
	}
	co := make(nlslayer.Config)

	for key, value := range p {
		co[key] = value
	}
	return &co
}

func ToNLSLayerType(p string) nlslayer.LayerType {
	lt, err := nlslayer.NewLayerType(p)
	if err != nil {
		return nlslayer.LayerType("")
	}
	return lt
}

func ToNLSLayerGroup(l *nlslayer.NLSLayerGroup, parent *id.NLSLayerID) *NLSLayerGroup {
	if l == nil {
		return nil
	}

	return &NLSLayerGroup{
		ID:          IDFrom(l.ID()),
		SceneID:     IDFrom(l.Scene()),
		Title:       l.Title(),
		Visible:     l.IsVisible(),
		Config:      JSON(*l.Config()),
		Infobox:     nil, // Temporarily
		Tags:        ToLayerTagList(l.Tags(), l.Scene()),
		ChildrenIds: util.Map(l.Children().Layers(), IDFrom[id.NLSLayer]),
	}
}

func ToNLSLayer(l nlslayer.NLSLayer, parent *id.NLSLayerID) NLSLayer {
	if l == nil {
		return nil
	}

	switch la := l.(type) {
	case *nlslayer.NLSLayerSimple:
		return ToNLSLayerSimple(la)
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
