package property

import (
	"testing"

	"github.com/reearth/reearth/server/customassert"
	"github.com/stretchr/testify/assert"
)

func TestInitializer_Clone(t *testing.T) {
	initializer := &Initializer{
		ID:     NewID().Ref(),
		Schema: MustSchemaID("reearth/marker"),
		Items: []*InitializerItem{{
			ID:         NewItemID().Ref(),
			SchemaItem: SchemaGroupID("hoge"),
		}},
	}

	cloned := initializer.Clone()

	customassert.NotSame(t, cloned, initializer)
	customassert.NotSame(t, cloned.Items, initializer.Items)
	customassert.NotSame(t, cloned.Items[0], initializer.Items[0])
	assert.Equal(t, cloned, initializer)
}

func TestInitializer_Property(t *testing.T) {
	sid := NewSceneID()
	initializer := &Initializer{
		ID:     NewID().Ref(),
		Schema: MustSchemaID("reearth/marker"),
		Items: []*InitializerItem{{
			ID:         NewItemID().Ref(),
			SchemaItem: SchemaGroupID("hoge"),
		}},
	}

	expected := New().ID(*initializer.ID).Schema(initializer.Schema).Scene(sid).Items([]Item{
		NewItem().ID(*initializer.Items[0].ID).SchemaGroup(initializer.Items[0].SchemaItem).Group().MustBuild(),
	}).MustBuild()

	actual, err := initializer.Property(sid)
	assert.NoError(t, err)
	assert.Equal(t, expected, actual)

	// test if a new id is generated
	initializer.ID = nil
	actual, err = initializer.Property(sid)
	assert.NoError(t, err)
	assert.False(t, actual.ID().IsEmpty())
}

func TestInitializer_PropertyIncludingEmpty(t *testing.T) {
	sid := NewSceneID()
	psid := MustSchemaID("reearth/hoge")
	psid2 := MustSchemaID("reearth/marker")

	// test case 1: should generate an empty property
	var initializer *Initializer
	actual, err := initializer.PropertyIncludingEmpty(sid, psid)
	expected := New().ID(actual.ID()).Schema(psid).Scene(sid).MustBuild()
	assert.NoError(t, err)
	assert.Equal(t, expected, actual)

	// test case 2: should returns an error when schema does not match
	initializer = &Initializer{
		ID:     NewID().Ref(),
		Schema: psid2,
		Items: []*InitializerItem{{
			ID:         NewItemID().Ref(),
			SchemaItem: SchemaGroupID("hoge"),
		}},
	}

	_, err = initializer.PropertyIncludingEmpty(sid, psid)
	assert.Equal(t, ErrSchemaDoesNotMatch, err)

	// test case 3: should generates a property normally
	actual, err = initializer.PropertyIncludingEmpty(sid, psid2)
	expected = New().ID(actual.ID()).Schema(initializer.Schema).Scene(sid).Items([]Item{
		NewItem().ID(*initializer.Items[0].ID).SchemaGroup(initializer.Items[0].SchemaItem).Group().MustBuild(),
	}).MustBuild()
	assert.NoError(t, err)
	assert.Equal(t, expected, actual)
}

func TestInitializerItem_Clone(t *testing.T) {
	item := &InitializerItem{
		ID:         NewItemID().Ref(),
		SchemaItem: SchemaGroupID("hoge"),
		Groups: []*InitializerGroup{{
			ID: NewItemID().Ref(),
			Fields: []*InitializerField{{
				Field: FieldID("name"),
				Type:  ValueTypeString,
				Value: ValueTypeString.ValueFrom("aaa"),
				Links: []*InitializerLink{{
					Dataset: NewDatasetID().Ref(),
					Schema:  NewDatasetSchemaID(),
					Field:   NewDatasetFieldID(),
				}},
			}},
		}},
	}

	cloned := item.Clone()

	customassert.NotSame(t, cloned, item)
	customassert.NotSame(t, cloned.Groups, item.Groups)
	customassert.NotSame(t, cloned.Groups[0], item.Groups[0])
	customassert.NotSame(t, cloned.Groups[0].Fields, item.Groups[0].Fields)
	customassert.NotSame(t, cloned.Groups[0].Fields[0], item.Groups[0].Fields[0])
	assert.Equal(t, cloned, item)
}

func TestInitializerItem_PropertyItem(t *testing.T) {
	item := &InitializerItem{
		ID:         NewItemID().Ref(),
		SchemaItem: SchemaGroupID("hoge"),
	}

	expected := NewItem().ID(*item.ID).SchemaGroup(item.SchemaItem).Group().MustBuild()

	created, err := item.PropertyItem()
	assert.NoError(t, err)
	assert.Equal(t, expected, created)

	item.ID = nil
	created, err = item.PropertyItem()
	assert.NoError(t, err)
	assert.False(t, created.ID().IsEmpty())
}

func TestInitializerItem_PropertyGroup(t *testing.T) {
	item := &InitializerItem{
		ID:         NewItemID().Ref(),
		SchemaItem: SchemaGroupID("hoge"),
		Fields: []*InitializerField{{
			Field: FieldID("name"),
			Type:  ValueTypeString,
			Value: ValueTypeString.ValueFrom("aaa"),
		}},
	}

	expected := NewItem().ID(*item.ID).SchemaGroup(item.SchemaItem).Group().Fields([]*Field{
		NewField(item.Fields[0].Field).
			Value(NewOptionalValue(item.Fields[0].Type, item.Fields[0].Value)).
			MustBuild(),
	}).MustBuild()

	assert.Equal(t, expected, item.PropertyGroup())

	// check if a new id is generated
	item.ID = nil
	assert.False(t, item.PropertyGroup().ID().IsEmpty())
}

func TestInitializerItem_PropertyGroupList(t *testing.T) {
	item := &InitializerItem{
		ID:         NewItemID().Ref(),
		SchemaItem: SchemaGroupID("hoge"),
		Groups: []*InitializerGroup{{
			ID: NewItemID().Ref(),
		}},
	}

	expected := NewItem().ID(*item.ID).SchemaGroup(item.SchemaItem).GroupList().Groups([]*Group{
		NewItem().ID(*item.Groups[0].ID).SchemaGroup(item.SchemaItem).Group().MustBuild(),
	}).MustBuild()

	assert.Equal(t, expected, item.PropertyGroupList())

	// check if a new id is generated
	item.ID = nil
	assert.False(t, item.PropertyGroupList().ID().IsEmpty())
}

func TestInitializerGroup_Clone(t *testing.T) {
	item := &InitializerGroup{
		ID: NewItemID().Ref(),
		Fields: []*InitializerField{{
			Field: FieldID("name"),
			Type:  ValueTypeString,
			Value: ValueTypeString.ValueFrom("aaa"),
			Links: []*InitializerLink{{
				Dataset: NewDatasetID().Ref(),
				Schema:  NewDatasetSchemaID(),
				Field:   NewDatasetFieldID(),
			}},
		}},
	}

	cloned := item.Clone()

	customassert.NotSame(t, cloned, item)
	customassert.NotSame(t, cloned.Fields, item.Fields)
	customassert.NotSame(t, cloned.Fields[0], item.Fields[0])
	assert.Equal(t, cloned, item)
}

func TestInitializerGroup_PropertyGroup(t *testing.T) {
	parentItem := SchemaGroupID("hoge")
	item := &InitializerGroup{
		ID: NewItemID().Ref(),
		Fields: []*InitializerField{{
			Field: FieldID("name"),
			Type:  ValueTypeString,
			Value: ValueTypeString.ValueFrom("aaa"),
		}},
	}

	expected := NewItem().ID(*item.ID).SchemaGroup(parentItem).Group().Fields([]*Field{
		NewField(item.Fields[0].Field).
			Value(NewOptionalValue(item.Fields[0].Type, item.Fields[0].Value)).
			MustBuild(),
	}).MustBuild()

	p, err := item.PropertyGroup(parentItem)
	assert.NoError(t, err)
	assert.Equal(t, expected, p)

	// check if a new id is generated
	item.ID = nil
	p, err = item.PropertyGroup(parentItem)
	assert.NoError(t, err)
	assert.False(t, p.ID().IsEmpty())
}

func TestInitializerField_Clone(t *testing.T) {
	field := &InitializerField{
		Field: FieldID("name"),
		Type:  ValueTypeString,
		Value: ValueTypeString.ValueFrom("aaa"),
		Links: []*InitializerLink{{
			Dataset: NewDatasetID().Ref(),
			Schema:  NewDatasetSchemaID(),
			Field:   NewDatasetFieldID(),
		}},
	}
	cloned := field.Clone()

	customassert.NotSame(t, cloned, field)
	customassert.NotSame(t, cloned.Links, field.Links)
	assert.Equal(t, cloned, field)
}

func TestInitializerField_PropertyField(t *testing.T) {
	field := &InitializerField{
		Field: FieldID("name"),
		Type:  ValueTypeString,
		Value: ValueTypeString.ValueFrom("aaa"),
		Links: []*InitializerLink{{
			Dataset: NewDatasetID().Ref(),
			Schema:  NewDatasetSchemaID(),
			Field:   NewDatasetFieldID(),
		}},
	}

	expected := NewField(field.Field).
		Value(NewOptionalValue(field.Type, field.Value)).
		Links(NewLinks([]*Link{NewLink(*field.Links[0].Dataset.CloneRef(), field.Links[0].Schema, field.Links[0].Field)})).
		MustBuild()

	assert.Equal(t, expected, field.PropertyField())
}

func TestInitializerLink_Clone(t *testing.T) {
	link := &InitializerLink{
		Dataset: NewDatasetID().Ref(),
		Schema:  NewDatasetSchemaID(),
		Field:   NewDatasetFieldID(),
	}
	cloned := link.Clone()

	customassert.NotSame(t, cloned, link)
	assert.Equal(t, cloned, link)
}

func TestInitializerLink_PropertyLink(t *testing.T) {
	link := &InitializerLink{
		Dataset: NewDatasetID().Ref(),
		Schema:  NewDatasetSchemaID(),
		Field:   NewDatasetFieldID(),
	}

	expected := NewLink(*link.Dataset.CloneRef(), link.Schema, link.Field)

	assert.Equal(t, expected, link.PropertyLink())
}
