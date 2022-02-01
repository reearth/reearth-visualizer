package merging

import (
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/property"
)

var (
	_ MergedLayer = &MergedLayerGroup{} // must implement Layer
	_ MergedLayer = &MergedLayerItem{}  // must implement Layer
)

type MergedLayer interface {
	Common() *MergedLayerCommon
	AllDatasets() []layer.DatasetID
	AllTags() []layer.TagID
}

type MergedLayerGroup struct {
	MergedLayerCommon
	Children []MergedLayer
}

type MergedLayerItem struct {
	MergedLayerCommon
}

type MergedLayerCommon struct {
	layer.Merged
	Property *property.Merged
	Infobox  *MergedInfobox
}

type MergedInfobox struct {
	layer.MergedInfobox
	Property *property.Merged
	Fields   []*MergedInfoboxField
}

type MergedInfoboxField struct {
	layer.MergedInfoboxField
	Property *property.Merged
}

func (l *MergedLayerGroup) Common() *MergedLayerCommon {
	if l == nil {
		return nil
	}
	return &l.MergedLayerCommon
}

func (l *MergedLayerItem) Common() *MergedLayerCommon {
	if l == nil {
		return nil
	}
	return &l.MergedLayerCommon
}

func (l *MergedLayerCommon) Datasets() []layer.DatasetID {
	return l.datasetIDSet().All()
}

func (l *MergedLayerCommon) Tags() []layer.TagID {
	return l.tagIDSet().All()
}

func (l *MergedLayerCommon) datasetIDSet() *layer.DatasetIDSet {
	if l == nil {
		return nil
	}
	res := layer.NewDatasetIDSet()
	res.Add(l.Property.Datasets()...)
	res.Add(l.Infobox.Property.Datasets()...)
	for _, f := range l.Infobox.Fields {
		res.Add(f.Property.Datasets()...)
	}
	return res
}

func (l *MergedLayerCommon) tagIDSet() *layer.TagIDSet {
	if l == nil {
		return nil
	}
	res := layer.NewTagIDSet()
	res.Add(l.Merged.AllTagIDs()...)
	return res
}

func (l *MergedLayerItem) AllDatasets() []layer.DatasetID {
	if l == nil {
		return nil
	}
	return l.Datasets()
}

func (l *MergedLayerItem) AllTags() []layer.TagID {
	if l == nil {
		return nil
	}
	return l.Tags()
}

func (l *MergedLayerGroup) AllDatasets() []layer.DatasetID {
	if l == nil {
		return nil
	}
	d := l.datasetIDSet()
	for _, l := range l.Children {
		d.Add(l.AllDatasets()...)
	}
	return d.All()
}

func (l *MergedLayerGroup) AllTags() []layer.TagID {
	if l == nil {
		return nil
	}
	d := l.tagIDSet()
	for _, l := range l.Children {
		d.Add(l.AllTags()...)
	}
	return d.All()
}
