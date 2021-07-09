package graphql

import (
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/layer/decoding"
)

func toLayerItem(l *layer.Item, parent *id.LayerID) *LayerItem {
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
		Infobox:         toInfobox(l.Infobox(), l.ID(), l.Scene(), l.LinkedDataset()),
		LinkedDatasetID: l.LinkedDataset().IDRef(),
		ParentID:        parent.IDRef(),
	}
}

func toLayerGroup(l *layer.Group, parent *id.LayerID) *LayerGroup {
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
		Infobox:               toInfobox(l.Infobox(), l.ID(), l.Scene(), nil),
		LinkedDatasetSchemaID: l.LinkedDatasetSchema().IDRef(),
		LayerIds:              layers,
		Root:                  l.IsRoot(),
		ParentID:              parent.IDRef(),
	}
}

func toLayer(l layer.Layer, parent *id.LayerID) Layer {
	if l == nil {
		return nil
	}
	switch la := l.(type) {
	case *layer.Item:
		return toLayerItem(la, parent)
	case *layer.Group:
		return toLayerGroup(la, parent)
	}
	return nil
}

func toLayers(layers layer.List, parent *id.LayerID) []Layer {
	if len(layers) == 0 {
		return nil
	}

	result := make([]Layer, 0, len(layers))
	for _, l := range layers {
		if l == nil {
			continue
		}
		result = append(result, toLayer(*l, parent))
	}

	return result
}

func toInfoboxField(ibf *layer.InfoboxField, parentSceneID id.SceneID, parentDatasetID *id.DatasetID) *InfoboxField {
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

func toInfobox(ib *layer.Infobox, parent id.LayerID, parentSceneID id.SceneID, parentDatasetID *id.DatasetID) *Infobox {
	if ib == nil {
		return nil
	}
	ibFields := ib.Fields()
	fields := make([]*InfoboxField, 0, len(ibFields))
	for _, ibf := range ibFields {
		fields = append(fields, toInfoboxField(ibf, parentSceneID, parentDatasetID))
	}

	return &Infobox{
		SceneID:         parentSceneID.ID(),
		PropertyID:      ib.Property().ID(),
		Fields:          fields,
		LayerID:         parent.ID(),
		LinkedDatasetID: parentDatasetID.IDRef(),
	}
}

func toMergedLayer(layer *layer.Merged) *MergedLayer {
	if layer == nil {
		return nil
	}

	return &MergedLayer{
		SceneID:    layer.Scene.ID(),
		OriginalID: layer.Original.ID(),
		ParentID:   layer.Parent.IDRef(),
		Infobox:    toMergedInfobox(layer.Infobox, layer.Scene),
		Property:   toMergedPropertyFromMetadata(layer.Property),
	}
}

func toMergedInfobox(ib *layer.MergedInfobox, sceneID id.SceneID) *MergedInfobox {
	if ib == nil {
		return nil
	}

	fields := make([]*MergedInfoboxField, 0, len(ib.Fields))
	for _, f := range ib.Fields {
		fields = append(fields, toMergedInfoboxField(f, sceneID))
	}

	return &MergedInfobox{
		SceneID:  sceneID.ID(),
		Fields:   fields,
		Property: toMergedPropertyFromMetadata(ib.Property),
	}
}

func toMergedInfoboxField(ibf *layer.MergedInfoboxField, sceneID id.SceneID) *MergedInfoboxField {
	if ibf == nil {
		return nil
	}

	return &MergedInfoboxField{
		SceneID:     sceneID.ID(),
		OriginalID:  ibf.ID.ID(),
		PluginID:    ibf.Plugin,
		ExtensionID: ibf.Extension,
		Property:    toMergedPropertyFromMetadata(ibf.Property),
	}
}
func fromLayerEncodingFormat(v LayerEncodingFormat) decoding.LayerEncodingFormat {
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
