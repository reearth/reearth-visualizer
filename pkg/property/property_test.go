package property

import (
	"context"
	"testing"

	"github.com/reearth/reearth-backend/pkg/dataset"
	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestPropertyMigrateSchema(t *testing.T) {
	sceneID := id.NewSceneID()
	oldSchema, _ := id.PropertySchemaIDFrom("hoge~1.0.0/test")
	newSchema, _ := id.PropertySchemaIDFrom("hoge~1.0.0/test2")
	schemaField1ID := id.PropertySchemaFieldID("a")
	schemaField2ID := id.PropertySchemaFieldID("b")
	schemaField3ID := id.PropertySchemaFieldID("c")
	schemaField4ID := id.PropertySchemaFieldID("d")
	schemaField5ID := id.PropertySchemaFieldID("e")
	schemaField6ID := id.PropertySchemaFieldID("f")
	schemaField7ID := id.PropertySchemaFieldID("g")
	schemaField8ID := id.PropertySchemaFieldID("h")
	schemaGroupID := id.PropertySchemaGroupID("i")
	datasetID := id.NewDatasetID()
	datasetSchemaID := id.NewDatasetSchemaID()
	datasetFieldID := id.NewDatasetSchemaFieldID()

	schemaField1, _ := NewSchemaField().ID(schemaField1ID).Type(ValueTypeString).Build()
	schemaField2, _ := NewSchemaField().ID(schemaField2ID).Type(ValueTypeNumber).Min(0).Max(100).Build()
	schemaField3, _ := NewSchemaField().ID(schemaField3ID).Type(ValueTypeNumber).Min(0).Max(100).Build()
	schemaField4, _ := NewSchemaField().ID(schemaField4ID).Type(ValueTypeString).Choices([]SchemaFieldChoice{
		{Title: i18n.StringFrom("x"), Key: "x"},
		{Title: i18n.StringFrom("y"), Key: "y"},
	}).Build()
	schemaField5, _ := NewSchemaField().ID(schemaField5ID).Type(ValueTypeString).Build()
	schemaField6, _ := NewSchemaField().ID(schemaField6ID).Type(ValueTypeNumber).Build()
	schemaField7, _ := NewSchemaField().ID(schemaField7ID).Type(ValueTypeNumber).Build()
	schemaFields := []*SchemaField{
		schemaField1,
		schemaField2,
		schemaField3,
		schemaField4,
		schemaField5,
		schemaField6,
		schemaField7,
	}
	schemaGroups := []*SchemaGroup{
		NewSchemaGroup().ID(schemaGroupID).Schema(oldSchema).Fields(schemaFields).MustBuild(),
	}

	fields := []*Field{
		// should remain
		NewFieldUnsafe().FieldUnsafe(schemaField1ID).
			ValueUnsafe(OptionalValueFrom(ValueTypeString.ValueFrom("foobar"))).
			Build(),
		// should be removed because of max
		NewFieldUnsafe().FieldUnsafe(schemaField2ID).
			ValueUnsafe(OptionalValueFrom(ValueTypeNumber.ValueFrom(101))).
			Build(),
		// should remain
		NewFieldUnsafe().FieldUnsafe(schemaField3ID).
			ValueUnsafe(OptionalValueFrom(ValueTypeNumber.ValueFrom(1))).
			Build(),
		// should be removed because of choices
		NewFieldUnsafe().FieldUnsafe(schemaField4ID).
			ValueUnsafe(OptionalValueFrom(ValueTypeString.ValueFrom("z"))).
			Build(),
		// should remain
		NewFieldUnsafe().FieldUnsafe(schemaField5ID).
			LinksUnsafe(NewLinks([]*Link{
				NewLink(datasetID, datasetSchemaID, datasetFieldID),
			})).
			Build(),
		// should be removed because of linked dataset field value type
		NewFieldUnsafe().FieldUnsafe(schemaField6ID).
			LinksUnsafe(NewLinks([]*Link{
				NewLink(datasetID, datasetSchemaID, datasetFieldID),
			})).
			Build(),
		// should be removed because of type
		NewFieldUnsafe().FieldUnsafe(schemaField7ID).
			ValueUnsafe(OptionalValueFrom(ValueTypeString.ValueFrom("hogehoge"))).
			Build(),
		// should be removed because of not existing field
		NewFieldUnsafe().FieldUnsafe(schemaField8ID).
			ValueUnsafe(OptionalValueFrom(ValueTypeString.ValueFrom("hogehoge"))).
			Build(),
	}
	items := []Item{
		NewGroup().NewID().Schema(oldSchema, schemaGroupID).Fields(fields).MustBuild(),
	}

	datasetFields := []*dataset.Field{
		dataset.NewField(datasetFieldID, dataset.ValueTypeString.ValueFrom("a"), ""),
	}

	schema, _ := NewSchema().ID(newSchema).Groups(schemaGroups).Build()
	property, _ := New().NewID().Scene(sceneID).Schema(oldSchema).Items(items).Build()
	ds, _ := dataset.New().ID(datasetID).Schema(datasetSchemaID).Scene(sceneID).Fields(datasetFields).Build()

	property.MigrateSchema(context.Background(), schema, dataset.LoaderFrom([]*dataset.Dataset{ds}))

	newGroup := ToGroup(property.ItemBySchema(schemaGroupID))
	newFields := newGroup.Fields()

	assert.Equal(t, schema.ID(), property.Schema())
	assert.Equal(t, 1, len(property.Items()))
	assert.Equal(t, schema.ID(), newGroup.Schema())
	assert.Equal(t, 3, len(newFields))
	assert.NotNil(t, newGroup.Field(schemaField1ID))
	assert.NotNil(t, newGroup.Field(schemaField3ID))
	assert.NotNil(t, newGroup.Field(schemaField5ID))
}

func TestGetOrCreateItem(t *testing.T) {
	sceneID := id.NewSceneID()
	sid, _ := id.PropertySchemaIDFrom("hoge~1.0.0/test")
	sf1id := id.PropertySchemaFieldID("a")
	sf2id := id.PropertySchemaFieldID("b")
	sg1id := id.PropertySchemaGroupID("c")
	sg2id := id.PropertySchemaGroupID("d")

	sf1 := NewSchemaField().ID(sf1id).Type(ValueTypeString).MustBuild()
	sg1 := NewSchemaGroup().ID(sg1id).Schema(sid).Fields([]*SchemaField{sf1}).MustBuild()
	sf2 := NewSchemaField().ID(sf2id).Type(ValueTypeString).MustBuild()
	sg2 := NewSchemaGroup().ID(sg2id).Schema(sid).Fields([]*SchemaField{sf2}).IsList(true).MustBuild()
	s := NewSchema().ID(sid).Groups([]*SchemaGroup{sg1, sg2}).MustBuild()

	p := New().NewID().Scene(sceneID).Schema(sid).MustBuild()

	// group
	assert.Nil(t, p.ItemBySchema(sg1id))
	assert.Equal(t, []Item{}, p.Items())

	i, _ := p.GetOrCreateItem(s, PointItemBySchema(sg1id))
	assert.NotNil(t, i)
	assert.Equal(t, sid, i.Schema())
	assert.Equal(t, sg1id, i.SchemaGroup())
	assert.Equal(t, i, ToGroup(p.ItemBySchema(sg1id)))
	assert.Equal(t, []Item{i}, p.Items())

	i2, _ := p.GetOrCreateItem(s, PointItemBySchema(sg1id))
	assert.NotNil(t, i2)
	assert.Equal(t, i, i2)
	assert.Equal(t, i2, ToGroup(p.ItemBySchema(sg1id)))
	assert.Equal(t, []Item{i2}, p.Items())

	// group list
	assert.Nil(t, p.ItemBySchema(sg2id))

	i3, _ := p.GetOrCreateItem(s, PointItemBySchema(sg2id))
	assert.NotNil(t, i3)
	assert.Equal(t, sid, i3.Schema())
	assert.Equal(t, sg2id, i3.SchemaGroup())
	assert.Equal(t, i3, ToGroupList(p.ItemBySchema(sg2id)))
	assert.Equal(t, []Item{i, i3}, p.Items())

	i4, _ := p.GetOrCreateItem(s, PointItemBySchema(sg2id))
	assert.NotNil(t, i4)
	assert.Equal(t, i3, i4)
	assert.Equal(t, i4, ToGroupList(p.ItemBySchema(sg2id)))
	assert.Equal(t, []Item{i2, i4}, p.Items())
}

func TestGetOrCreateField(t *testing.T) {
	sceneID := id.NewSceneID()
	sid, _ := id.PropertySchemaIDFrom("hoge~1.0.0/test")
	sf1id := id.PropertySchemaFieldID("a")
	sf2id := id.PropertySchemaFieldID("b")
	sg1id := id.PropertySchemaGroupID("c")
	sg2id := id.PropertySchemaGroupID("d")

	sf1 := NewSchemaField().ID(sf1id).Type(ValueTypeString).MustBuild()
	sg1 := NewSchemaGroup().ID(sg1id).Schema(sid).Fields([]*SchemaField{sf1}).MustBuild()
	sf2 := NewSchemaField().ID(sf2id).Type(ValueTypeString).MustBuild()
	sg2 := NewSchemaGroup().ID(sg2id).Schema(sid).Fields([]*SchemaField{sf2}).IsList(true).MustBuild()
	s := NewSchema().ID(sid).Groups([]*SchemaGroup{sg1, sg2}).MustBuild()

	p := New().NewID().Scene(sceneID).Schema(sid).MustBuild()

	// field and group will be created
	assert.Nil(t, p.ItemBySchema(sg1id))
	assert.Equal(t, []Item{}, p.Items())

	f, _, _, created := p.GetOrCreateField(s, PointFieldBySchemaGroup(sg1id, sf1id))
	assert.NotNil(t, f)
	assert.True(t, created)
	assert.Equal(t, sf1id, f.Field())
	i := ToGroup(p.ItemBySchema(sg1id))
	assert.Equal(t, sid, i.Schema())
	assert.Equal(t, sg1id, i.SchemaGroup())
	assert.Equal(t, []*Field{f}, i.Fields())
	field, _, _ := p.Field(PointFieldBySchemaGroup(sg1id, sf1id))
	assert.Equal(t, f, field)

	f2, _, _, created := p.GetOrCreateField(s, PointFieldBySchemaGroup(sg1id, sf1id))
	assert.NotNil(t, f2)
	assert.False(t, created)
	assert.Equal(t, f, f2)
	i2 := ToGroup(p.ItemBySchema(sg1id))
	assert.Equal(t, i, i2)
	field, _, _ = p.Field(PointFieldBySchemaGroup(sg1id, sf1id))
	assert.Equal(t, f2, field)

	// field will not be created if field is incorrect
	f3, _, _, _ := p.GetOrCreateField(s, PointFieldBySchemaGroup(sg1id, sf2id))
	assert.Nil(t, f3)

	// field and group list will not be created
	assert.Nil(t, p.ItemBySchema(sg2id))
	f4, _, _, _ := p.GetOrCreateField(s, PointFieldBySchemaGroup(sg1id, sf2id))
	assert.Nil(t, f4)
	assert.Nil(t, p.ItemBySchema(sg2id))
	assert.Equal(t, []Item{i}, p.Items())
}

func TestAddListItem(t *testing.T) {
	sceneID := id.NewSceneID()
	sid, _ := id.PropertySchemaIDFrom("hoge~1.0.0/test")
	sfid := id.PropertySchemaFieldID("a")
	sgid := id.PropertySchemaGroupID("b")
	sf := NewSchemaField().ID(sfid).Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID(sgid).Schema(sid).Fields([]*SchemaField{sf}).IsList(true).MustBuild()
	ps := NewSchema().ID(sid).Groups([]*SchemaGroup{sg}).MustBuild()
	p := New().NewID().Scene(sceneID).Schema(sid).MustBuild()

	item, _ := p.AddListItem(ps, PointItemBySchema(sgid), nil)
	assert.Equal(t, sgid, item.SchemaGroup())
	_, list := p.ListItem(PointItemBySchema(sgid))
	assert.Equal(t, sgid, list.SchemaGroup())
	assert.Equal(t, []*Group{item}, list.Groups())

	index := 0
	item2, _ := p.AddListItem(ps, PointItem(list.ID()), &index)
	assert.Equal(t, sgid, item2.SchemaGroup())
	assert.Equal(t, []*Group{item2, item}, list.Groups())
}

func TestMoveListItem(t *testing.T) {
	sceneID := id.NewSceneID()
	sid, _ := id.PropertySchemaIDFrom("hoge~1.0.0/test")
	sgid := id.PropertySchemaGroupID("b")
	g1 := NewGroup().NewID().Schema(sid, sgid).MustBuild()
	g2 := NewGroup().NewID().Schema(sid, sgid).MustBuild()
	gl := NewGroupList().NewID().Schema(sid, sgid).Groups([]*Group{g1, g2}).MustBuild()
	p := New().NewID().Scene(sceneID).Schema(sid).Items([]Item{gl}).MustBuild()

	assert.Equal(t, []*Group{g1, g2}, gl.Groups())
	i, _ := p.MoveListItem(PointItem(g1.ID()), 1)
	assert.Equal(t, g1, i)
	assert.Equal(t, []*Group{g2, g1}, gl.Groups())
}

func TestRemoveListItem(t *testing.T) {
	sceneID := id.NewSceneID()
	sid, _ := id.PropertySchemaIDFrom("hoge~1.0.0/test")
	sgid := id.PropertySchemaGroupID("b")
	g1 := NewGroup().NewID().Schema(sid, sgid).MustBuild()
	g2 := NewGroup().NewID().Schema(sid, sgid).MustBuild()
	gl := NewGroupList().NewID().Schema(sid, sgid).Groups([]*Group{g1, g2}).MustBuild()
	p := New().NewID().Scene(sceneID).Schema(sid).Items([]Item{gl}).MustBuild()

	assert.Equal(t, []*Group{g1, g2}, gl.Groups())
	ok := p.RemoveListItem(PointItem(g1.ID()))
	assert.True(t, ok)
	assert.Equal(t, []*Group{g2}, gl.Groups())
	assert.Equal(t, 1, len(p.Items()))

	ok = p.RemoveListItem(PointItem(g2.ID()))
	assert.True(t, ok)
	assert.Equal(t, []*Group{}, gl.Groups())
	assert.Equal(t, 0, len(p.Items()))
}
