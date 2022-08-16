package gqlmodel

import (
	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/reearth/reearth/server/pkg/value"
	"github.com/reearth/reearthx/util"
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
		SchemaID: IDFrom(parent.Schema()),
		FieldID:  IDFrom(f.Field()),
		Type:     ToValueType(value.Type(f.Type())),
		Value:    ToDatasetValue(f.Value()),
		Source:   f.Source(),
	}
}

func ToDataset(ds *dataset.Dataset) *Dataset {
	if ds == nil {
		return nil
	}

	return &Dataset{
		ID:       IDFrom(ds.ID()),
		SchemaID: IDFrom(ds.Schema()),
		Source:   ds.Source(),
		Fields: util.FilterMapR(ds.Fields(), func(f *dataset.Field) *DatasetField {
			return ToDatasetField(f, ds)
		}),
	}
}

func ToDatasetSchema(ds *dataset.Schema) *DatasetSchema {
	if ds == nil {
		return nil
	}

	return &DatasetSchema{
		ID:                    IDFrom(ds.ID()),
		Source:                ds.Source(),
		Name:                  ds.Name(),
		SceneID:               IDFrom(ds.Scene()),
		RepresentativeFieldID: IDFromRef(ds.RepresentativeField().IDRef()),
		Fields: util.Map(ds.Fields(), func(f *dataset.SchemaField) *DatasetSchemaField {
			return &DatasetSchemaField{
				ID:       IDFrom(f.ID()),
				Name:     f.Name(),
				Type:     ToValueType(value.Type(f.Type())),
				SchemaID: IDFrom(ds.ID()),
				Source:   f.Source(),
				RefID:    IDFromRef(f.Ref()),
			}
		}),
	}
}
