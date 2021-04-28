package graphql

import (
	"net/url"

	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/id"
)

func toDatasetValue(v *dataset.Value) *interface{} {
	var res interface{}
	if v == nil {
		return nil
	}
	switch v2 := v.Value().(type) {
	case bool:
		res = v2
	case float64:
		res = v2
	case string:
		res = v2
	case id.ID:
		res = v2.String()
	case *url.URL:
		res = v2.String()
	case dataset.LatLng:
		res = LatLng{
			Lat: v2.Lat,
			Lng: v2.Lng,
		}
	case dataset.LatLngHeight:
		res = LatLngHeight{
			Lat:    v2.Lat,
			Lng:    v2.Lng,
			Height: v2.Height,
		}
	}
	return &res
}

func toDatasetValueType(t dataset.ValueType) ValueType {
	switch t {
	case dataset.ValueTypeBool:
		return ValueTypeBool
	case dataset.ValueTypeNumber:
		return ValueTypeNumber
	case dataset.ValueTypeString:
		return ValueTypeString
	case dataset.ValueTypeLatLng:
		return ValueTypeLatlng
	case dataset.ValueTypeLatLngHeight:
		return ValueTypeLatlngheight
	case dataset.ValueTypeURL:
		return ValueTypeURL
	case dataset.ValueTypeRef:
		return ValueTypeRef
	}
	return ""
}

func toDatasetSource(ds dataset.Source) string {
	return ds.String()
}

func toDatasetField(f *dataset.Field, parent *dataset.Dataset) *DatasetField {
	if f == nil || parent == nil {
		return nil
	}

	return &DatasetField{
		SchemaID: parent.Schema().ID(),
		FieldID:  f.Field().ID(),
		Type:     toDatasetValueType(f.Type()),
		Value:    toDatasetValue(f.Value()),
		Source:   toDatasetSource(f.Source()),
	}
}

func toDataset(ds *dataset.Dataset) *Dataset {
	if ds == nil {
		return nil
	}

	dsFields := ds.Fields()
	fields := make([]*DatasetField, 0, len(dsFields))
	for _, f := range dsFields {
		fields = append(fields, toDatasetField(f, ds))
	}

	return &Dataset{
		ID:       ds.ID().ID(),
		SchemaID: ds.Schema().ID(),
		Source:   toDatasetSource(ds.Source()),
		Fields:   fields,
	}
}

func toDatasetSchema(ds *dataset.Schema) *DatasetSchema {
	if ds == nil {
		return nil
	}

	dsFields := ds.Fields()
	fields := make([]*DatasetSchemaField, 0, len(dsFields))
	for _, f := range dsFields {
		fields = append(fields, &DatasetSchemaField{
			ID:       f.ID().ID(),
			Name:     f.Name(),
			Type:     toDatasetValueType(f.Type()),
			SchemaID: ds.ID().ID(),
			Source:   toDatasetSource(f.Source()),
			RefID:    f.Ref().IDRef(),
		})
	}

	return &DatasetSchema{
		ID:                    ds.ID().ID(),
		Source:                toDatasetSource(ds.Source()),
		Name:                  ds.Name(),
		SceneID:               ds.Scene().ID(),
		RepresentativeFieldID: ds.RepresentativeField().IDRef().IDRef(),
		Fields:                fields,
	}
}
