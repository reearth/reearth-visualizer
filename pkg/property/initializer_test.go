package property

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestInitializer_Clone(t *testing.T) {
	initializer := &Initializer{
		ID:     id.NewPropertyID().Ref(),
		Schema: id.MustPropertySchemaID("reearth/marker"),
		Items: []*InitializerItem{{
			ID:         id.NewPropertyItemID().Ref(),
			SchemaItem: id.PropertySchemaGroupID("hoge"),
		}},
	}

	cloned := initializer.Clone()

	assert.NotSame(t, cloned, initializer)
	assert.NotSame(t, cloned.Items, initializer.Items)
	assert.NotSame(t, cloned.Items[0], initializer.Items[0])
	assert.Equal(t, cloned, initializer)
}

func TestInitializer_Property(t *testing.T) {
	sid := id.NewSceneID()
	initializer := &Initializer{
		ID:     id.NewPropertyID().Ref(),
		Schema: id.MustPropertySchemaID("reearth/marker"),
		Items: []*InitializerItem{{
			ID:         id.NewPropertyItemID().Ref(),
			SchemaItem: id.PropertySchemaGroupID("hoge"),
		}},
	}

	expected := New().ID(*initializer.ID).Schema(initializer.Schema).Scene(sid).Items([]Item{
		NewItem().ID(*initializer.Items[0].ID).Schema(initializer.Schema, initializer.Items[0].SchemaItem).Group().MustBuild(),
	}).MustBuild()

	actual, err := initializer.Property(sid)
	assert.NoError(t, err)
	assert.Equal(t, expected, actual)

	// test if a new id is generated
	initializer.ID = nil
	actual, err = initializer.Property(sid)
	assert.NoError(t, err)
	assert.False(t, actual.ID().IsNil())
}

func TestInitializer_PropertyIncludingEmpty(t *testing.T) {
	sid := id.NewSceneID()
	psid := id.MustPropertySchemaID("reearth/hoge")
	psid2 := id.MustPropertySchemaID("reearth/marker")

	// test case 1: should generate an empty property
	var initializer *Initializer
	actual, err := initializer.PropertyIncludingEmpty(sid, psid)
	expected := New().ID(actual.ID()).Schema(psid).Scene(sid).MustBuild()
	assert.NoError(t, err)
	assert.Equal(t, expected, actual)

	// test case 2: should returns an error when schema does not match
	initializer = &Initializer{
		ID:     id.NewPropertyID().Ref(),
		Schema: psid2,
		Items: []*InitializerItem{{
			ID:         id.NewPropertyItemID().Ref(),
			SchemaItem: id.PropertySchemaGroupID("hoge"),
		}},
	}

	_, err = initializer.PropertyIncludingEmpty(sid, psid)
	assert.Equal(t, ErrSchemaDoesNotMatch, err)

	// test case 3: should generates a property normally
	actual, err = initializer.PropertyIncludingEmpty(sid, psid2)
	expected = New().ID(actual.ID()).Schema(initializer.Schema).Scene(sid).Items([]Item{
		NewItem().ID(*initializer.Items[0].ID).Schema(initializer.Schema, initializer.Items[0].SchemaItem).Group().MustBuild(),
	}).MustBuild()
	assert.NoError(t, err)
	assert.Equal(t, expected, actual)
}

func TestInitializerItem_Clone(t *testing.T) {
	item := &InitializerItem{
		ID:         id.NewPropertyItemID().Ref(),
		SchemaItem: id.PropertySchemaGroupID("hoge"),
		Groups: []*InitializerGroup{{
			ID: id.NewPropertyItemID().Ref(),
			Fields: []*InitializerField{{
				Field: id.PropertySchemaFieldID("name"),
				Type:  ValueTypeString,
				Value: ValueTypeString.ValueFrom("aaa"),
				Links: []*InitializerLink{{
					Dataset: id.NewDatasetID().Ref(),
					Schema:  id.NewDatasetSchemaID(),
					Field:   id.NewDatasetSchemaFieldID(),
				}},
			}},
		}},
	}

	cloned := item.Clone()

	assert.NotSame(t, cloned, item)
	assert.NotSame(t, cloned.Groups, item.Groups)
	assert.NotSame(t, cloned.Groups[0], item.Groups[0])
	assert.NotSame(t, cloned.Groups[0].Fields, item.Groups[0].Fields)
	assert.NotSame(t, cloned.Groups[0].Fields[0], item.Groups[0].Fields[0])
	assert.Equal(t, cloned, item)
}

func TestInitializerItem_PropertyItem(t *testing.T) {
	parent := id.MustPropertySchemaID("reearth/marker")
	item := &InitializerItem{
		ID:         id.NewPropertyItemID().Ref(),
		SchemaItem: id.PropertySchemaGroupID("hoge"),
	}

	expected := NewItem().ID(*item.ID).Schema(parent, item.SchemaItem).Group().MustBuild()

	created, err := item.PropertyItem(parent)
	assert.NoError(t, err)
	assert.Equal(t, expected, created)

	item.ID = nil
	created, err = item.PropertyItem(parent)
	assert.NoError(t, err)
	assert.False(t, created.ID().IsNil())
}

func TestInitializerItem_PropertyGroup(t *testing.T) {
	parent := id.MustPropertySchemaID("reearth/marker")
	item := &InitializerItem{
		ID:         id.NewPropertyItemID().Ref(),
		SchemaItem: id.PropertySchemaGroupID("hoge"),
		Fields: []*InitializerField{{
			Field: id.PropertySchemaFieldID("name"),
			Type:  ValueTypeString,
			Value: ValueTypeString.ValueFrom("aaa"),
		}},
	}

	expected := NewItem().ID(*item.ID).Schema(parent, item.SchemaItem).Group().Fields([]*Field{
		NewFieldUnsafe().FieldUnsafe(item.Fields[0].Field).ValueUnsafe(NewOptionalValue(item.Fields[0].Type, item.Fields[0].Value)).Build(),
	}).MustBuild()

	assert.Equal(t, expected, item.PropertyGroup(parent))

	// check if a new id is generated
	item.ID = nil
	assert.False(t, item.PropertyGroup(parent).ID().IsNil())
}

func TestInitializerItem_PropertyGroupList(t *testing.T) {
	parent := id.MustPropertySchemaID("reearth/marker")
	item := &InitializerItem{
		ID:         id.NewPropertyItemID().Ref(),
		SchemaItem: id.PropertySchemaGroupID("hoge"),
		Groups: []*InitializerGroup{{
			ID: id.NewPropertyItemID().Ref(),
		}},
	}

	expected := NewItem().ID(*item.ID).Schema(parent, item.SchemaItem).GroupList().Groups([]*Group{
		NewItem().ID(*item.Groups[0].ID).Schema(parent, item.SchemaItem).Group().MustBuild(),
	}).MustBuild()

	assert.Equal(t, expected, item.PropertyGroupList(parent))

	// check if a new id is generated
	item.ID = nil
	assert.False(t, item.PropertyGroupList(parent).ID().IsNil())
}

func TestInitializerGroup_Clone(t *testing.T) {
	item := &InitializerGroup{
		ID: id.NewPropertyItemID().Ref(),
		Fields: []*InitializerField{{
			Field: id.PropertySchemaFieldID("name"),
			Type:  ValueTypeString,
			Value: ValueTypeString.ValueFrom("aaa"),
			Links: []*InitializerLink{{
				Dataset: id.NewDatasetID().Ref(),
				Schema:  id.NewDatasetSchemaID(),
				Field:   id.NewDatasetSchemaFieldID(),
			}},
		}},
	}

	cloned := item.Clone()

	assert.NotSame(t, cloned, item)
	assert.NotSame(t, cloned.Fields, item.Fields)
	assert.NotSame(t, cloned.Fields[0], item.Fields[0])
	assert.Equal(t, cloned, item)
}

func TestInitializerGroup_PropertyGroup(t *testing.T) {
	parent := id.MustPropertySchemaID("reearth/marker")
	parentItem := id.PropertySchemaGroupID("hoge")
	item := &InitializerGroup{
		ID: id.NewPropertyItemID().Ref(),
		Fields: []*InitializerField{{
			Field: id.PropertySchemaFieldID("name"),
			Type:  ValueTypeString,
			Value: ValueTypeString.ValueFrom("aaa"),
		}},
	}

	expected := NewItem().ID(*item.ID).Schema(parent, parentItem).Group().Fields([]*Field{
		NewFieldUnsafe().FieldUnsafe(item.Fields[0].Field).ValueUnsafe(NewOptionalValue(item.Fields[0].Type, item.Fields[0].Value)).Build(),
	}).MustBuild()

	p, err := item.PropertyGroup(parent, parentItem)
	assert.NoError(t, err)
	assert.Equal(t, expected, p)

	// check if a new id is generated
	item.ID = nil
	p, err = item.PropertyGroup(parent, parentItem)
	assert.NoError(t, err)
	assert.False(t, p.ID().IsNil())
}

func TestInitializerField_Clone(t *testing.T) {
	field := &InitializerField{
		Field: id.PropertySchemaFieldID("name"),
		Type:  ValueTypeString,
		Value: ValueTypeString.ValueFrom("aaa"),
		Links: []*InitializerLink{{
			Dataset: id.NewDatasetID().Ref(),
			Schema:  id.NewDatasetSchemaID(),
			Field:   id.NewDatasetSchemaFieldID(),
		}},
	}
	cloned := field.Clone()

	assert.NotSame(t, cloned, field)
	assert.NotSame(t, cloned.Links, field.Links)
	assert.Equal(t, cloned, field)
}

func TestInitializerField_PropertyField(t *testing.T) {
	field := &InitializerField{
		Field: id.PropertySchemaFieldID("name"),
		Type:  ValueTypeString,
		Value: ValueTypeString.ValueFrom("aaa"),
		Links: []*InitializerLink{{
			Dataset: id.NewDatasetID().Ref(),
			Schema:  id.NewDatasetSchemaID(),
			Field:   id.NewDatasetSchemaFieldID(),
		}},
	}

	expected := NewFieldUnsafe().
		FieldUnsafe(field.Field).
		ValueUnsafe(NewOptionalValue(field.Type, field.Value)).
		LinksUnsafe(NewLinks([]*Link{NewLink(*field.Links[0].Dataset.CopyRef(), field.Links[0].Schema, field.Links[0].Field)})).
		Build()

	assert.Equal(t, expected, field.PropertyField())
}

func TestInitializerLink_Clone(t *testing.T) {
	link := &InitializerLink{
		Dataset: id.NewDatasetID().Ref(),
		Schema:  id.NewDatasetSchemaID(),
		Field:   id.NewDatasetSchemaFieldID(),
	}
	cloned := link.Clone()

	assert.NotSame(t, cloned, link)
	assert.Equal(t, cloned, link)
}

func TestInitializerLink_PropertyLink(t *testing.T) {
	link := &InitializerLink{
		Dataset: id.NewDatasetID().Ref(),
		Schema:  id.NewDatasetSchemaID(),
		Field:   id.NewDatasetSchemaFieldID(),
	}

	expected := NewLink(*link.Dataset.CopyRef(), link.Schema, link.Field)

	assert.Equal(t, expected, link.PropertyLink())
}
