package gqlmodel

import (
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/layer/decoding"
)

func ToLayerItem(l *layer.Item, parent *id.LayerID) *LayerItem {
	if l == nil {
		return nil
	}

	return &LayerItem{
		ID:              l.ID().ID(),
		SceneID:         l.Scene().ID(),
		Name:            l.Name(),
		IsVisible:       l.IsVisible(),
		PropertyID:      l.Property().IDRef(),
		PluginID:        l.Plugin(),
		ExtensionID:     l.Extension(),
		Infobox:         ToInfobox(l.Infobox(), l.ID(), l.Scene(), l.LinkedDataset()),
		LinkedDatasetID: l.LinkedDataset().IDRef(),
		ParentID:        parent.IDRef(),
		Tags:            ToLayerTagList(l.Tags(), l.Scene()),
	}
}

func ToLayerGroup(l *layer.Group, parent *id.LayerID) *LayerGroup {
	if l == nil {
		return nil
	}

	laLayers := l.Layers().Layers()
	layers := make([]*id.ID, 0, len(laLayers))
	for _, lay := range laLayers {
		layers = append(layers, lay.IDRef())
	}

	return &LayerGroup{
		ID:                    l.ID().ID(),
		SceneID:               l.Scene().ID(),
		Name:                  l.Name(),
		IsVisible:             l.IsVisible(),
		PropertyID:            l.Property().IDRef(),
		PluginID:              l.Plugin(),
		ExtensionID:           l.Extension(),
		Infobox:               ToInfobox(l.Infobox(), l.ID(), l.Scene(), nil),
		LinkedDatasetSchemaID: l.LinkedDatasetSchema().IDRef(),
		LayerIds:              layers,
		Root:                  l.IsRoot(),
		ParentID:              parent.IDRef(),
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
	if len(layers) == 0 {
		return nil
	}

	result := make([]Layer, 0, len(layers))
	for _, l := range layers {
		if l == nil {
			continue
		}
		result = append(result, ToLayer(*l, parent))
	}

	return result
}

func ToInfoboxField(ibf *layer.InfoboxField, parentSceneID id.SceneID, parentDatasetID *id.DatasetID) *InfoboxField {
	if ibf == nil {
		return nil
	}
	return &InfoboxField{
		ID:              ibf.ID().ID(),
		SceneID:         parentSceneID.ID(),
		PluginID:        ibf.Plugin(),
		ExtensionID:     ibf.Extension(),
		PropertyID:      ibf.Property().ID(),
		LinkedDatasetID: parentDatasetID.IDRef(),
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
		SceneID:         parentSceneID.ID(),
		PropertyID:      ib.Property().ID(),
		Fields:          fields,
		LayerID:         parent.ID(),
		LinkedDatasetID: parentDatasetID.IDRef(),
	}
}

func ToMergedLayer(layer *layer.Merged) *MergedLayer {
	if layer == nil {
		return nil
	}

	return &MergedLayer{
		SceneID:    layer.Scene.ID(),
		OriginalID: layer.Original.ID(),
		ParentID:   layer.Parent.IDRef(),
		Infobox:    ToMergedInfobox(layer.Infobox, layer.Scene),
		Property:   ToMergedPropertyFromMetadata(layer.Property),
	}
}

func ToMergedInfobox(ib *layer.MergedInfobox, sceneID id.SceneID) *MergedInfobox {
	if ib == nil {
		return nil
	}

	fields := make([]*MergedInfoboxField, 0, len(ib.Fields))
	for _, f := range ib.Fields {
		fields = append(fields, ToMergedInfoboxField(f, sceneID))
	}

	return &MergedInfobox{
		SceneID:  sceneID.ID(),
		Fields:   fields,
		Property: ToMergedPropertyFromMetadata(ib.Property),
	}
}

func ToMergedInfoboxField(ibf *layer.MergedInfoboxField, sceneID id.SceneID) *MergedInfoboxField {
	if ibf == nil {
		return nil
	}

	return &MergedInfoboxField{
		SceneID:     sceneID.ID(),
		OriginalID:  ibf.ID.ID(),
		PluginID:    ibf.Plugin,
		ExtensionID: ibf.Extension,
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
	tags := t.Tags()
	gtags := make([]LayerTag, 0, len(tags))
	for _, t := range tags {
		if gt := ToLayerTag(t); gt != nil {
			gtags = append(gtags, gt)
		}
	}
	return gtags
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
		TagID: t.ID().ID(),
	}
}

func ToLayerTagGroup(t *layer.TagGroup) *LayerTagGroup {
	if t == nil {
		return nil
	}
	children := t.Children()
	tags := make([]*LayerTagItem, 0, len(children))
	for _, c := range children {
		if t := ToLayerTagItem(c); t != nil {
			tags = append(tags, t)
		}
	}
	return &LayerTagGroup{
		TagID:    t.ID().ID(),
		Children: tags,
	}
}
