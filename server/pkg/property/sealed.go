package property

import (
	"context"

	"github.com/reearth/reearth/server/pkg/dataset"
)

type Sealed struct {
	Original      *ID
	Parent        *ID
	Schema        SchemaID
	LinkedDataset *DatasetID
	Items         []*SealedItem
}

type SealedItem struct {
	Original      *ItemID
	Parent        *ItemID
	SchemaGroup   SchemaGroupID
	LinkedDataset *DatasetID
	Fields        []*SealedField
	Groups        []*SealedItem
}

type SealedField struct {
	ID  FieldID
	Val *ValueAndDatasetValue
}

func (f *SealedField) Value() *Value {
	if f == nil {
		return nil
	}
	return f.Val.Value()
}

func Seal(ctx context.Context, p *Merged, d dataset.GraphLoader) (*Sealed, error) {
	if p == nil {
		return nil, nil
	}
	items := make([]*SealedItem, 0, len(p.Groups))
	for _, g := range p.Groups {
		i, err := sealedItemFrom(ctx, g, d)
		if err != nil {
			return nil, err
		}
		items = append(items, i)
	}

	return &Sealed{
		Original:      p.Original.CloneRef(),
		Parent:        p.Parent.CloneRef(),
		Schema:        p.Schema,
		LinkedDataset: p.LinkedDataset.CloneRef(),
		Items:         items,
	}, nil
}

func SealProperty(ctx context.Context, p *Property) *Sealed {
	if p == nil {
		return nil
	}
	m := Merge(p, nil, nil)
	s, _ := Seal(ctx, m, nil)
	return s
}

func sealedItemFrom(ctx context.Context, g *MergedGroup, d dataset.GraphLoader) (item *SealedItem, err error) {
	if g == nil {
		return
	}

	item = &SealedItem{
		Original:      g.Original.CloneRef(),
		Parent:        g.Parent.CloneRef(),
		SchemaGroup:   g.SchemaGroup,
		LinkedDataset: g.LinkedDataset.CloneRef(),
	}

	if len(g.Groups) > 0 {
		item.Groups, err = sealedGroupList(ctx, g.Groups, d)
	} else if len(g.Fields) > 0 {
		item.Fields, err = sealedGroup(ctx, g.Fields, d)
	}

	return
}

func sealedGroupList(ctx context.Context, gl []*MergedGroup, d dataset.GraphLoader) ([]*SealedItem, error) {
	res := make([]*SealedItem, 0, len(gl))
	for _, g := range gl {
		sg, err := sealedItemFrom(ctx, g, d)
		if err != nil {
			return nil, err
		}
		res = append(res, sg)
	}
	return res, nil
}

func sealedGroup(ctx context.Context, fields []*MergedField, d dataset.GraphLoader) ([]*SealedField, error) {
	res := []*SealedField{}
	for _, f := range fields {
		dv, err := f.DatasetValue(ctx, d)
		if err != nil {
			return nil, err
		}

		if val := NewValueAndDatasetValue(f.Type, dv.Clone(), f.Value.Clone()); val != nil {
			res = append(res, &SealedField{
				ID:  f.ID,
				Val: val,
			})
		}
	}
	return res, nil
}

func (s *Sealed) Interface() map[string]interface{} {
	if s == nil {
		return nil
	}

	res := map[string]interface{}{}
	for _, item := range s.Items {
		i := item.Interface()
		if i != nil {
			res[item.SchemaGroup.String()] = i
		}
	}

	return res
}

func (s *SealedItem) Interface() interface{} {
	if s == nil {
		return nil
	}

	if len(s.Groups) > 0 {
		items := make([]map[string]interface{}, 0, len(s.Groups))
		for _, g := range s.Groups {
			i := sealedFieldsInterface(g.Fields)
			if g.Original != nil {
				i["id"] = g.Original.String()
			}
			items = append(items, i)
		}
		return items
	}

	return sealedFieldsInterface(s.Fields)
}

func sealedFieldsInterface(fields []*SealedField) map[string]interface{} {
	item := map[string]interface{}{}

	for _, f := range fields {
		item[f.ID.String()] = f.Val.Value().Interface()
	}

	return item
}

func (s *Sealed) Item(i ItemID) *SealedItem {
	if s == nil {
		return nil
	}
	for _, item := range s.Items {
		if item.Match(i) {
			return item
		}
		if g := item.Group(i); g != nil {
			return g
		}
	}
	return nil
}

func (s *Sealed) ItemBy(ptr *Pointer) *SealedItem {
	if s == nil || ptr == nil {
		return nil
	}
	if sg, ok := ptr.ItemBySchemaGroup(); ok {
		return s.ItemBySchemaGroup(sg)
	}
	if i, ok := ptr.Item(); ok {
		return s.Item(i)
	}
	return nil
}

func (s *Sealed) ItemBySchemaGroup(i SchemaGroupID) *SealedItem {
	if s == nil {
		return nil
	}
	for _, item := range s.Items {
		if item.SchemaGroup == i {
			return item
		}
	}
	return nil
}

func (s *Sealed) Field(id FieldID) *SealedField {
	if s == nil {
		return nil
	}
	for _, i := range s.Items {
		if f := i.Field(id); f != nil {
			return f
		}
	}
	return nil
}

func (s *Sealed) FieldBy(ptr *Pointer) *SealedField {
	if s == nil || ptr == nil {
		return nil
	}
	if sg, f, ok := ptr.FieldBySchemaGroup(); ok {
		return s.ItemBySchemaGroup(sg).Field(f)
	}
	if i, f, ok := ptr.FieldByItem(); ok {
		return s.Item(i).Field(f)
	}
	if f, ok := ptr.Field(); ok {
		return s.Field(f)
	}
	return nil
}

func (s *SealedItem) Match(id ItemID) bool {
	if s == nil {
		return false
	}
	return s.Original != nil && *s.Original == id || s.Parent != nil && *s.Parent == id
}

func (s *SealedItem) Group(id ItemID) *SealedItem {
	if s == nil {
		return nil
	}
	for _, g := range s.Groups {
		if g.Match(id) {
			return g
		}
	}
	return nil
}

func (s *SealedItem) Field(id FieldID) *SealedField {
	if s == nil {
		return nil
	}
	for _, f := range s.Fields {
		if f.ID == id {
			return f
		}
	}
	return nil
}
