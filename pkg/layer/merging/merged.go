package merging

import (
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/layer"
	"github.com/reearth/reearth-backend/pkg/property"
)

var (
	_ MergedLayer = &MergedLayerGroup{} // must implement Layer
	_ MergedLayer = &MergedLayerItem{}  // must implement Layer
)

type MergedLayer interface {
	Common() *MergedLayerCommon
	AllDatasets() []id.DatasetID
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

func (l *MergedLayerCommon) Datasets() []id.DatasetID {
	return l.datasetIDSet().All()
}

func (l *MergedLayerCommon) datasetIDSet() *id.DatasetIDSet {
	if l == nil {
		return nil
	}
	res := id.NewDatasetIDSet()
	res.Add(l.Property.Datasets()...)
	res.Add(l.Infobox.Property.Datasets()...)
	for _, f := range l.Infobox.Fields {
		res.Add(f.Property.Datasets()...)
	}
	return res
}

func (l *MergedLayerItem) AllDatasets() []id.DatasetID {
	if l == nil {
		return nil
	}
	return l.Datasets()
}

func (l *MergedLayerGroup) AllDatasets() []id.DatasetID {
	return l.allDatasetIDSet().All()
}

func (l *MergedLayerGroup) allDatasetIDSet() *id.DatasetIDSet {
	if l == nil {
		return nil
	}
	d := l.datasetIDSet()
	for _, l := range l.Children {
		d.Add(l.AllDatasets()...)
	}
	return d
}
