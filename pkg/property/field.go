package property

import (
	"context"
	"errors"

	"github.com/reearth/reearth-backend/pkg/dataset"
)

var (
	ErrInvalidPropertyValue = errors.New("invalid property value")
	ErrCannotLinkDataset    = errors.New("cannot link dataset")
	ErrInvalidPropertyType  = errors.New("invalid property type")
	ErrInvalidPropertyField = errors.New("invalid property field")
)

type Field struct {
	field FieldID
	links *Links
	v     *OptionalValue
}

func (p *Field) Clone() *Field {
	return &Field{
		field: p.field,
		links: p.links.Clone(),
		v:     p.v.Clone(),
	}
}

func (p *Field) Field() FieldID {
	return p.field
}

func (p *Field) Links() *Links {
	if p == nil {
		return nil
	}
	return p.links
}

func (p *Field) Type() ValueType {
	if p == nil {
		return ValueTypeUnknown
	}
	return p.v.Type()
}

func (p *Field) Value() *Value {
	if p == nil {
		return nil
	}
	return p.v.Value()
}

func (p *Field) ActualValue(ds *dataset.Dataset) *Value {
	if p.links != nil {
		if l := p.links.Last(); l != nil {
			ldid := l.Dataset()
			ldsfid := l.DatasetSchemaField()
			if ldid != nil || ldsfid != nil || ds.ID() == *ldid {
				if f := ds.Field(*ldsfid); f != nil {
					return valueFromDataset(f.Value())
				}
			}
		}
		return nil
	}
	return p.Value()
}

func (p *Field) HasLinkedField() bool {
	return p.Links().IsLinked()
}

func (p *Field) CollectDatasets() []DatasetID {
	if p == nil {
		return nil
	}
	res := []DatasetID{}

	if p.Links().IsLinkedFully() {
		dsid := p.Links().Last().Dataset()
		if dsid != nil {
			res = append(res, *dsid)
		}
	}

	return res
}

func (p *Field) IsDatasetLinked(s DatasetSchemaID, i DatasetID) bool {
	return p.Links().HasDatasetOrSchema(s, i)
}

func (p *Field) Update(value *Value, field *SchemaField) error {
	if p == nil {
		return nil
	}
	if field == nil || p.field != field.ID() || !field.Validate(p.v) {
		return ErrInvalidPropertyValue
	}
	p.v.SetValue(value)
	return nil
}

func (p *Field) UpdateUnsafe(value *Value) {
	if p == nil {
		return
	}
	p.v.SetValue(value)
}

func (p *Field) Link(links *Links) {
	if p == nil {
		return
	}
	p.links = links.Clone()
}

func (p *Field) Unlink() {
	if p == nil {
		return
	}
	p.links = nil
}

func (p *Field) UpdateField(field FieldID) {
	if p == nil {
		return
	}
	p.field = field
}

func (p *Field) IsEmpty() bool {
	return p != nil && p.Value().IsEmpty() && p.Links().IsEmpty()
}

func (p *Field) MigrateSchema(ctx context.Context, newSchema *Schema, dl dataset.Loader) bool {
	if p == nil || dl == nil || newSchema == nil {
		return false
	}

	fid := p.Field()
	schemaField := newSchema.Field(fid)

	// If field is not found in new schema, this field should be removed
	invalid := schemaField == nil

	// if value is not compatible for type, value will be cleared
	if !schemaField.Validate(p.v) {
		p.UpdateUnsafe(nil)
	}

	// If linked dataset is not compatible for type, it will be unlinked
	l := p.Links()
	if dl != nil && l.IsLinkedFully() {
		if dsid, dsfid := l.Last().Dataset(), l.Last().DatasetSchemaField(); dsid != nil && dsfid != nil {
			dss, _ := dl(ctx, *dsid)
			if dsf := dss[0].Field(*dsfid); dsf != nil {
				if schemaField.Type() != ValueType(dsf.Type()) {
					p.Unlink()
				}
			}
		}
	}

	return !invalid
}

func (p *Field) DatasetValue(ctx context.Context, d dataset.GraphLoader) (*dataset.Value, error) {
	if p == nil {
		return nil, nil
	}
	return p.links.DatasetValue(ctx, d)
}

func (p *Field) MigrateDataset(q DatasetMigrationParam) {
	if p == nil {
		return
	}
	link := p.Links()
	link.Replace(q.OldDatasetSchemaMap, q.OldDatasetMap, q.DatasetFieldIDMap)
	if !link.Validate(q.NewDatasetSchemaMap, q.NewDatasetMap) {
		p.Unlink()
	}
}

func (p *Field) ValidateSchema(ps *SchemaField) error {
	if p == nil {
		return nil
	}
	if ps == nil {
		return errors.New("schema not found")
	}
	if p.v == nil {
		return errors.New("invalid field value and type")
	}
	return nil
}

type DatasetMigrationParam struct {
	OldDatasetSchemaMap map[DatasetSchemaID]DatasetSchemaID
	OldDatasetMap       map[DatasetID]DatasetID
	DatasetFieldIDMap   map[DatasetFieldID]DatasetFieldID
	NewDatasetSchemaMap map[DatasetSchemaID]*dataset.Schema
	NewDatasetMap       map[DatasetID]*dataset.Dataset
}
