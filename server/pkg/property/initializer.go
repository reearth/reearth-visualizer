//go:generate deep-copy --type Initializer --pointer-receiver -o initializer_gen.go .

package property

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/id"
)

var ErrSchemaDoesNotMatch = errors.New("schema of the initializer does not match schema of the argument")

type Initializer struct {
	ID     *id.PropertyID      `json:"id"`
	Schema id.PropertySchemaID `json:"schema"`
	Items  []*InitializerItem  `json:"items"`
}

func (p *Initializer) Clone() *Initializer {
	if p == nil {
		return nil
	}

	var items []*InitializerItem
	if p.Items != nil {
		items = make([]*InitializerItem, 0, len(p.Items))
		for _, i := range p.Items {
			items = append(items, i.Clone())
		}
	}

	return &Initializer{
		ID:     p.ID.CloneRef(),
		Schema: p.Schema,
		Items:  items,
	}
}

func (p *Initializer) Property(scene id.SceneID) (*Property, error) {
	if p == nil {
		return nil, nil
	}

	i := p.ID
	if i == nil {
		i = id.NewPropertyID().Ref()
	}

	var items []Item
	if p.Items != nil {
		items = make([]Item, 0, len(p.Items))
		for _, i := range p.Items {
			item, err := i.PropertyItem()
			if err != nil {
				return nil, err
			}
			items = append(items, item)
		}
	}

	return New().ID(*i).Schema(p.Schema).Scene(scene).Items(items).Build()
}

// PropertyIncludingEmpty generates a new property, but even if the initializer is empty, an empty property will be generated.
func (p *Initializer) PropertyIncludingEmpty(scene id.SceneID, schema id.PropertySchemaID) (*Property, error) {
	if p != nil && p.Schema != schema {
		return nil, ErrSchemaDoesNotMatch
	}

	pr, err := p.Property(scene)
	if err != nil {
		return nil, err
	}

	if pr == nil {
		pr, err = New().NewID().Schema(schema).Scene(scene).Build()
		if err != nil {
			return nil, err
		}
	}

	return pr, nil
}

func (p *Initializer) MustBeProperty(scene id.SceneID) *Property {
	r, err := p.Property(scene)
	if err != nil {
		panic(err)
	}
	return r
}

type InitializerItem struct {
	ID         *id.PropertyItemID       `json:"id"`
	SchemaItem id.PropertySchemaGroupID `json:"schemaItem"`
	Groups     []*InitializerGroup      `json:"groups"`
	Fields     []*InitializerField      `json:"fields"`
}

func (p *InitializerItem) Clone() *InitializerItem {
	if p == nil {
		return nil
	}

	var groups []*InitializerGroup
	if p.Groups != nil {
		groups = make([]*InitializerGroup, 0, len(p.Groups))
		for _, g := range p.Groups {
			groups = append(groups, g.Clone())
		}
	}

	var fields []*InitializerField
	if p.Fields != nil {
		fields = make([]*InitializerField, 0, len(p.Fields))
		for _, f := range p.Fields {
			fields = append(fields, f.Clone())
		}
	}

	return &InitializerItem{
		ID:         p.ID.CloneRef(),
		SchemaItem: p.SchemaItem,
		Groups:     groups,
		Fields:     fields,
	}
}

func (p *InitializerItem) PropertyItem() (Item, error) {
	if p == nil {
		return nil, nil
	}

	i := p.ID
	if i == nil {
		i = id.NewPropertyItemID().Ref()
	}

	pi := NewItem().ID(*i).SchemaGroup(p.SchemaItem)

	if p.Groups != nil {
		groups := make([]*Group, 0, len(p.Groups))
		for _, g := range p.Groups {
			g2, err := g.PropertyGroup(p.SchemaItem)
			if err != nil {
				return nil, err
			}
			if g2 != nil {
				groups = append(groups, g2)
			}
		}

		return pi.GroupList().Groups(groups).Build()
	}

	var fields []*Field
	if p.Fields != nil {
		fields = make([]*Field, 0, len(p.Fields))
		for _, f := range p.Fields {
			if f2 := f.PropertyField(); f2 != nil {
				fields = append(fields, f2)
			}
		}
	}

	return pi.Group().Fields(fields).Build()
}

func (p *InitializerItem) PropertyGroupList() *GroupList {
	i, _ := p.PropertyItem()
	if g := ToGroupList(i); g != nil {
		return g
	}
	return nil
}

func (p *InitializerItem) PropertyGroup() *Group {
	i, _ := p.PropertyItem()
	if g := ToGroup(i); g != nil {
		return g
	}
	return nil
}

type InitializerGroup struct {
	ID     *id.PropertyItemID  `json:"id"`
	Fields []*InitializerField `json:"fields"`
}

func (p *InitializerGroup) Clone() *InitializerGroup {
	if p == nil {
		return nil
	}

	var fields []*InitializerField
	if p.Fields != nil {
		fields = make([]*InitializerField, 0, len(p.Fields))
		for _, f := range p.Fields {
			fields = append(fields, f.Clone())
		}
	}

	return &InitializerGroup{
		ID:     p.ID.CloneRef(),
		Fields: fields,
	}
}

func (p *InitializerGroup) PropertyGroup(parentItem id.PropertySchemaGroupID) (*Group, error) {
	if p == nil {
		return nil, nil
	}

	i := p.ID
	if i == nil {
		i = id.NewPropertyItemID().Ref()
	}

	pi := NewItem().ID(*i).SchemaGroup(parentItem)

	var fields []*Field
	if p.Fields != nil {
		fields = make([]*Field, 0, len(p.Fields))
		for _, f := range p.Fields {
			if f2 := f.PropertyField(); f2 != nil {
				fields = append(fields, f2)
			}
		}
	}

	return pi.Group().Fields(fields).Build()
}

type InitializerField struct {
	Field id.PropertyFieldID `json:"field"`
	Type  ValueType          `json:"type"`
	Value *Value             `json:"value"`
}

func (p *InitializerField) Clone() *InitializerField {
	if p == nil {
		return nil
	}

	return &InitializerField{
		Field: p.Field,
		Type:  p.Type,
		Value: p.Value.Clone(),
	}
}

func (p *InitializerField) PropertyField() *Field {
	if p == nil || p.Field == "" || p.Type == "" {
		return nil
	}

	return NewField(p.Field).
		Value(NewOptionalValue(p.Type, p.Value.Clone())).
		Build()
}
