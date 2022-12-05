package gqlmodel

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/layer/decoding"
	"github.com/reearth/reearthx/util"
)

func ToLayerItem(l *layer.Item, parent *id.LayerID) *LayerItem {
	if l == nil {
		return nil
	}

	return &LayerItem{
		ID:              IDFrom(l.ID()),
		SceneID:         IDFrom(l.Scene()),
		Name:            l.Name(),
		IsVisible:       l.IsVisible(),
		PropertyID:      IDFromRef(l.Property()),
		PluginID:        IDFromPluginIDRef(l.Plugin()),
		ExtensionID:     IDFromStringRef(l.Extension()),
		Infobox:         ToInfobox(l.Infobox(), l.ID(), l.Scene(), l.LinkedDataset()),
		LinkedDatasetID: IDFromRef(l.LinkedDataset()),
		ParentID:        IDFromRef(parent),
		Tags:            ToLayerTagList(l.Tags(), l.Scene()),
	}
}

func ToLayerGroup(l *layer.Group, parent *id.LayerID) *LayerGroup {
	if l == nil {
		return nil
	}

	return &LayerGroup{
		ID:                    IDFrom(l.ID()),
		SceneID:               IDFrom(l.Scene()),
		Name:                  l.Name(),
		IsVisible:             l.IsVisible(),
		PropertyID:            IDFromRef(l.Property()),
		PluginID:              IDFromPluginIDRef(l.Plugin()),
		ExtensionID:           IDFromStringRef(l.Extension()),
		Infobox:               ToInfobox(l.Infobox(), l.ID(), l.Scene(), nil),
		LinkedDatasetSchemaID: IDFromRef(l.LinkedDatasetSchema()),
		LayerIds:              util.Map(l.Layers().Layers(), IDFrom[id.Layer]),
		Root:                  l.IsRoot(),
		ParentID:              IDFromRef(parent),
		Tags:                  ToLayerTagList(l.Tags(), l.Scene()),
	}
}

func ToLayer(l layer.Layer, parent *id.LayerID) Layer {
	if l == nil {
		return nil
	}

	switch la := l.(type) {
	case *layer.Item:
		return ToLayerItem(la, parent)
	case *layer.Group:
		return ToLayerGroup(la, parent)
	}
	return nil
}

func ToLayers(layers layer.List, parent *id.LayerID) []Layer {
	return util.Map(layers, func(l *layer.Layer) Layer {
		return ToLayer(*l, parent)
	})
}

func ToInfoboxField(ibf *layer.InfoboxField, parentSceneID id.SceneID, parentDatasetID *id.DatasetID) *InfoboxField {
	if ibf == nil {
		return nil
	}

	return &InfoboxField{
		ID:              IDFrom(ibf.ID()),
		SceneID:         IDFrom(parentSceneID),
		PluginID:        IDFromPluginID(ibf.Plugin()),
		ExtensionID:     ID(ibf.Extension()),
		PropertyID:      IDFrom(ibf.Property()),
		LinkedDatasetID: IDFromRef(parentDatasetID),
	}
}

func ToInfobox(ib *layer.Infobox, parent id.LayerID, parentSceneID id.SceneID, parentDatasetID *id.DatasetID) *Infobox {
	if ib == nil {
		return nil
	}
	ibFields := ib.Fields()
	fields := make([]*InfoboxField, 0, len(ibFields))
	for _, ibf := range ibFields {
		fields = append(fields, ToInfoboxField(ibf, parentSceneID, parentDatasetID))
	}

	return &Infobox{
		SceneID:         IDFrom(parentSceneID),
		PropertyID:      IDFrom(ib.Property()),
		Fields:          fields,
		LayerID:         IDFrom(parent),
		LinkedDatasetID: IDFromRef(parentDatasetID),
	}
}

func ToMergedLayer(layer *layer.Merged) *MergedLayer {
	if layer == nil {
		return nil
	}

	return &MergedLayer{
		SceneID:    IDFrom(layer.Scene),
		OriginalID: IDFrom(layer.Original),
		ParentID:   IDFromRef(layer.Parent),
		Infobox:    ToMergedInfobox(layer.Infobox, layer.Scene),
		Property:   ToMergedPropertyFromMetadata(layer.Property),
	}
}

func ToMergedInfobox(ib *layer.MergedInfobox, sceneID id.SceneID) *MergedInfobox {
	if ib == nil {
		return nil
	}

	return &MergedInfobox{
		SceneID: IDFrom(sceneID),
		Fields: util.Map(ib.Fields, func(f *layer.MergedInfoboxField) *MergedInfoboxField {
			return ToMergedInfoboxField(f, sceneID)
		}),
		Property: ToMergedPropertyFromMetadata(ib.Property),
	}
}

func ToMergedInfoboxField(ibf *layer.MergedInfoboxField, sceneID id.SceneID) *MergedInfoboxField {
	if ibf == nil {
		return nil
	}

	return &MergedInfoboxField{
		SceneID:     IDFrom(sceneID),
		OriginalID:  IDFrom(ibf.ID),
		PluginID:    IDFromPluginID(ibf.Plugin),
		ExtensionID: ID(ibf.Extension),
		Property:    ToMergedPropertyFromMetadata(ibf.Property),
	}
}
func FromLayerEncodingFormat(v LayerEncodingFormat) decoding.LayerEncodingFormat {
	switch v {
	case LayerEncodingFormatKml:
		return decoding.LayerEncodingFormatKML
	case LayerEncodingFormatCzml:
		return decoding.LayerEncodingFormatCZML
	case LayerEncodingFormatGeojson:
		return decoding.LayerEncodingFormatGEOJSON
	case LayerEncodingFormatShape:
		return decoding.LayerEncodingFormatSHAPE
	case LayerEncodingFormatReearth:
		return decoding.LayerEncodingFormatREEARTH
	}

	return decoding.LayerEncodingFormat("")
}

func ToLayerTagList(t *layer.TagList, sid id.SceneID) []LayerTag {
	if t.IsEmpty() {
		return nil
	}

	return util.FilterMap(t.Tags(), func(v layer.Tag) *LayerTag {
		if t := ToLayerTag(v); t != nil {
			return &t
		}
		return nil
	})
}

func ToLayerTag(l layer.Tag) LayerTag {
	if l == nil {
		return nil
	}
	if tg := layer.TagGroupFrom(l); tg != nil {
		return ToLayerTagGroup(tg)
	}
	if ti := layer.TagItemFrom(l); ti != nil {
		return ToLayerTagItem(ti)
	}
	return nil
}

func ToLayerTagItem(t *layer.TagItem) *LayerTagItem {
	if t == nil {
		return nil
	}
	return &LayerTagItem{
		TagID: IDFrom(t.ID()),
	}
}

func ToLayerTagGroup(t *layer.TagGroup) *LayerTagGroup {
	if t == nil {
		return nil
	}

	return &LayerTagGroup{
		TagID:    IDFrom(t.ID()),
		Children: util.FilterMapR(t.Children(), ToLayerTagItem),
	}
}
