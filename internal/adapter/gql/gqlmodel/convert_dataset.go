package gqlmodel

import (
	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/value"
)

func ToDatasetValue(v *dataset.Value) *interface{} {
	i := valueInterfaceToGqlValue(v.Value())
	return &i
}

func ToDatasetField(f *dataset.Field, parent *dataset.Dataset) *DatasetField {
	if f == nil || parent == nil {
		return nil
	}

	return &DatasetField{
		SchemaID: parent.Schema().ID(),
		FieldID:  f.Field().ID(),
		Type:     ToValueType(value.Type(f.Type())),
		Value:    ToDatasetValue(f.Value()),
		Source:   f.Source(),
	}
}

func ToDataset(ds *dataset.Dataset) *Dataset {
	if ds == nil {
		return nil
	}

	dsFields := ds.Fields()
	fields := make([]*DatasetField, 0, len(dsFields))
	for _, f := range dsFields {
		fields = append(fields, ToDatasetField(f, ds))
	}

	return &Dataset{
		ID:       ds.ID().ID(),
		SchemaID: ds.Schema().ID(),
		Source:   ds.Source(),
		Fields:   fields,
	}
}

func ToDatasetSchema(ds *dataset.Schema) *DatasetSchema {
	if ds == nil {
		return nil
	}

	dsFields := ds.Fields()
	fields := make([]*DatasetSchemaField, 0, len(dsFields))
	for _, f := range dsFields {
		fields = append(fields, &DatasetSchemaField{
			ID:       f.ID().ID(),
			Name:     f.Name(),
			Type:     ToValueType(value.Type(f.Type())),
			SchemaID: ds.ID().ID(),
			Source:   f.Source(),
			RefID:    f.Ref().IDRef(),
		})
	}

	return &DatasetSchema{
		ID:                    ds.ID().ID(),
		Source:                ds.Source(),
		Name:                  ds.Name(),
		SceneID:               ds.Scene().ID(),
		RepresentativeFieldID: ds.RepresentativeField().IDRef().IDRef(),
		Fields:                fields,
	}
}
