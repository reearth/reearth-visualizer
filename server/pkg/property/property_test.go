package property

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

var (
	testProperty1 = New().NewID().Schema(testSchema1.ID()).Scene(id.NewSceneID()).Items([]Item{testGroup1, testGroupList1}).MustBuild()
)

func TestProperty_MigrateSchema(t *testing.T) {
	sceneID := id.NewSceneID()
	oldSchema := id.MustPropertySchemaID("hoge~1.0.0/test")
	newSchema := id.MustPropertySchemaID("hoge~1.0.0/test2")
	schemaField1ID := id.PropertyFieldID("a")
	schemaField2ID := id.PropertyFieldID("b")
	schemaField3ID := id.PropertyFieldID("c")
	schemaField4ID := id.PropertyFieldID("d")
	schemaField5ID := id.PropertyFieldID("e")
	schemaField6ID := id.PropertyFieldID("f")
	schemaField7ID := id.PropertyFieldID("g")
	schemaField8ID := id.PropertyFieldID("h")
	schemaGroupID := id.PropertySchemaGroupID("i")

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
	schemaGroups := NewSchemaGroupList([]*SchemaGroup{
		NewSchemaGroup().ID(schemaGroupID).Fields(schemaFields).MustBuild(),
	})

	fields := []*Field{
		// should remain
		NewField(schemaField1ID).
			Value(OptionalValueFrom(ValueTypeString.ValueFrom("foobar"))).
			MustBuild(),
		// should be removed because of max
		NewField(schemaField2ID).
			Value(OptionalValueFrom(ValueTypeNumber.ValueFrom(101))).
			MustBuild(),
		// should remain
		NewField(schemaField3ID).
			Value(OptionalValueFrom(ValueTypeNumber.ValueFrom(1))).
			MustBuild(),
		// should be removed because of choices
		NewField(schemaField4ID).
			Value(OptionalValueFrom(ValueTypeString.ValueFrom("z"))).
			MustBuild(),
		// should be removed because of type
		NewField(schemaField7ID).
			Value(OptionalValueFrom(ValueTypeString.ValueFrom("hogehoge"))).
			MustBuild(),
		// should be removed because of not existing field
		NewField(schemaField8ID).
			Value(OptionalValueFrom(ValueTypeString.ValueFrom("hogehoge"))).
			MustBuild(),
	}
	items := []Item{
		NewGroup().NewID().SchemaGroup(schemaGroupID).Fields(fields).MustBuild(),
	}

	schema, _ := NewSchema().ID(newSchema).Groups(schemaGroups).Build()
	property, _ := New().NewID().Scene(sceneID).Schema(oldSchema).Items(items).Build()

	property.MigrateSchema(context.Background(), schema)

	newGroup := ToGroup(property.ItemBySchema(schemaGroupID))
	newFields := newGroup.Fields(nil)

	assert.Equal(t, schema.ID(), property.Schema())
	assert.Equal(t, 1, len(property.Items()))
	assert.Equal(t, 2, len(newFields))
	assert.NotNil(t, newGroup.Field(schemaField1ID))
	assert.NotNil(t, newGroup.Field(schemaField3ID))
	assert.Nil(t, newGroup.Field(schemaField5ID))
}

func TestGetOrCreateItem(t *testing.T) {
	sceneID := id.NewSceneID()
	sid, _ := id.PropertySchemaIDFrom("hoge~1.0.0/test")
	sf1id := id.PropertyFieldID("a")
	sf2id := id.PropertyFieldID("b")
	sg1id := id.PropertySchemaGroupID("c")
	sg2id := id.PropertySchemaGroupID("d")

	sf1 := NewSchemaField().ID(sf1id).Type(ValueTypeString).MustBuild()
	sg1 := NewSchemaGroup().ID(sg1id).Fields([]*SchemaField{sf1}).MustBuild()
	sf2 := NewSchemaField().ID(sf2id).Type(ValueTypeString).MustBuild()
	sg2 := NewSchemaGroup().ID(sg2id).Fields([]*SchemaField{sf2}).IsList(true).MustBuild()
	s := NewSchema().ID(sid).Groups(NewSchemaGroupList([]*SchemaGroup{sg1, sg2})).MustBuild()

	p := New().NewID().Scene(sceneID).Schema(sid).MustBuild()

	// group
	assert.Nil(t, p.ItemBySchema(sg1id))
	assert.Equal(t, []Item{}, p.Items())

	i, gl := p.GetOrCreateItem(s, PointItemBySchema(sg1id))
	assert.Nil(t, gl)
	assert.NotNil(t, i)
	assert.Equal(t, sg1id, i.SchemaGroup())
	assert.Equal(t, i, ToGroup(p.ItemBySchema(sg1id)))
	assert.Equal(t, []Item{i}, p.Items())

	i2, gl := p.GetOrCreateItem(s, PointItemBySchema(sg1id))
	assert.Nil(t, gl)
	assert.NotNil(t, i2)
	assert.Equal(t, i, i2)
	assert.Equal(t, i2, ToGroup(p.ItemBySchema(sg1id)))
	assert.Equal(t, []Item{i2}, p.Items())

	// group list
	assert.Nil(t, p.ItemBySchema(sg2id))

	i3, gl := p.GetOrCreateItem(s, PointItemBySchema(sg2id))
	assert.Nil(t, gl)
	assert.NotNil(t, i3)
	assert.Equal(t, sg2id, i3.SchemaGroup())
	assert.Equal(t, i3, ToGroupList(p.ItemBySchema(sg2id)))
	assert.Equal(t, []Item{i, i3}, p.Items())

	i4, gl := p.GetOrCreateItem(s, PointItemBySchema(sg2id))
	assert.Nil(t, gl)
	assert.NotNil(t, i4)
	assert.Equal(t, i3, i4)
	assert.Equal(t, i4, ToGroupList(p.ItemBySchema(sg2id)))
	assert.Equal(t, []Item{i2, i4}, p.Items())
}

func TestGetOrCreateField(t *testing.T) {
	sceneID := id.NewSceneID()
	sid, _ := id.PropertySchemaIDFrom("hoge~1.0.0/test")
	sf1id := id.PropertyFieldID("a")
	sf2id := id.PropertyFieldID("b")
	sg1id := id.PropertySchemaGroupID("c")
	sg2id := id.PropertySchemaGroupID("d")

	sf1 := NewSchemaField().ID(sf1id).Type(ValueTypeString).MustBuild()
	sg1 := NewSchemaGroup().ID(sg1id).Fields([]*SchemaField{sf1}).MustBuild()
	sf2 := NewSchemaField().ID(sf2id).Type(ValueTypeString).MustBuild()
	sg2 := NewSchemaGroup().ID(sg2id).Fields([]*SchemaField{sf2}).IsList(true).MustBuild()
	s := NewSchema().ID(sid).Groups(NewSchemaGroupList([]*SchemaGroup{sg1, sg2})).MustBuild()

	p := New().NewID().Scene(sceneID).Schema(sid).MustBuild()

	// field and group will be created
	assert.Nil(t, p.ItemBySchema(sg1id))
	assert.Equal(t, []Item{}, p.Items())

	f, _, _, created := p.GetOrCreateField(s, PointFieldBySchemaGroup(sg1id, sf1id))
	assert.NotNil(t, f)
	assert.True(t, created)
	assert.Equal(t, sf1id, f.Field())
	i := ToGroup(p.ItemBySchema(sg1id))
	assert.Equal(t, sg1id, i.SchemaGroup())
	assert.Equal(t, []*Field{f}, i.Fields(nil))
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
	sfid := id.PropertyFieldID("a")
	sgid := id.PropertySchemaGroupID("b")
	sf := NewSchemaField().ID(sfid).Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID(sgid).Fields([]*SchemaField{sf}).IsList(true).MustBuild()
	ps := NewSchema().ID(sid).Groups(NewSchemaGroupList([]*SchemaGroup{sg})).MustBuild()
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
	g1 := NewGroup().NewID().SchemaGroup(sgid).MustBuild()
	g2 := NewGroup().NewID().SchemaGroup(sgid).MustBuild()
	gl := NewGroupList().NewID().SchemaGroup(sgid).Groups([]*Group{g1, g2}).MustBuild()
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
	g1 := NewGroup().NewID().SchemaGroup(sgid).MustBuild()
	g2 := NewGroup().NewID().SchemaGroup(sgid).MustBuild()
	gl := NewGroupList().NewID().SchemaGroup(sgid).Groups([]*Group{g1, g2}).MustBuild()
	p := New().NewID().Scene(sceneID).Schema(sid).Items([]Item{gl}).MustBuild()

	assert.Equal(t, []*Group{g1, g2}, gl.Groups())
	ok := p.RemoveListItem(PointItem(g1.ID()))
	assert.True(t, ok)
	assert.Equal(t, []*Group{g2}, gl.Groups())
	assert.Equal(t, 1, len(p.Items()))

	ok = p.RemoveListItem(NewPointer(sgid.Ref(), g2.IDRef(), nil))
	assert.True(t, ok)
	assert.Equal(t, []*Group{}, gl.Groups())
	assert.Equal(t, 0, len(p.Items()))
}

func TestPointer_Test(t *testing.T) {
	itemID := id.NewPropertyItemID()

	type args struct {
		sg   id.PropertySchemaGroupID
		i    id.PropertyItemID
		f    id.PropertyFieldID
		want bool
	}
	tests := []struct {
		name   string
		target *Pointer
		args   []args
	}{
		{
			name:   "schema group only",
			target: &Pointer{schemaGroup: id.PropertySchemaGroupID("xx").Ref()},
			args: []args{
				{sg: id.PropertySchemaGroupID("xx"), i: itemID, f: id.PropertyFieldID("a"), want: true},
				{sg: id.PropertySchemaGroupID("xx"), i: itemID, f: id.PropertyFieldID("b"), want: true},
				{sg: id.PropertySchemaGroupID("yy"), i: itemID, f: id.PropertyFieldID("a"), want: false},
			},
		},
		{
			name:   "item only",
			target: &Pointer{item: itemID.Ref()},
			args: []args{
				{sg: id.PropertySchemaGroupID("xx"), i: itemID, f: id.PropertyFieldID("a"), want: true},
				{sg: id.PropertySchemaGroupID("yy"), i: itemID, f: id.PropertyFieldID("a"), want: true},
				{sg: id.PropertySchemaGroupID("xx"), i: itemID, f: id.PropertyFieldID("b"), want: true},
				{sg: id.PropertySchemaGroupID("xx"), i: id.NewPropertyItemID(), f: id.PropertyFieldID("a"), want: false},
			},
		},
		{
			name:   "schema group and item",
			target: &Pointer{schemaGroup: id.PropertySchemaGroupID("xx").Ref(), item: itemID.Ref()},
			args: []args{
				{sg: id.PropertySchemaGroupID("xx"), i: itemID, f: id.PropertyFieldID("a"), want: true},
				{sg: id.PropertySchemaGroupID("xx"), i: itemID, f: id.PropertyFieldID("b"), want: true},
				{sg: id.PropertySchemaGroupID("xx"), i: id.NewPropertyItemID(), f: id.PropertyFieldID("a"), want: false},
				{sg: id.PropertySchemaGroupID("yy"), i: itemID, f: id.PropertyFieldID("a"), want: false},
				{sg: id.PropertySchemaGroupID("yy"), i: id.NewPropertyItemID(), f: id.PropertyFieldID("a"), want: false},
			},
		},
		{
			name:   "all",
			target: &Pointer{schemaGroup: id.PropertySchemaGroupID("xx").Ref(), item: itemID.Ref(), field: id.PropertyFieldID("a").Ref()},
			args: []args{
				{sg: id.PropertySchemaGroupID("xx"), i: itemID, f: id.PropertyFieldID("a"), want: true},
				{sg: id.PropertySchemaGroupID("yy"), i: itemID, f: id.PropertyFieldID("a"), want: false},
				{sg: id.PropertySchemaGroupID("xx"), i: id.NewPropertyItemID(), f: id.PropertyFieldID("a"), want: false},
				{sg: id.PropertySchemaGroupID("xx"), i: itemID, f: id.PropertyFieldID("b"), want: false},
			},
		},
		{
			name:   "empty",
			target: &Pointer{},
			args: []args{
				{sg: id.PropertySchemaGroupID("xx"), i: id.NewPropertyItemID(), f: id.PropertyFieldID("a"), want: true},
				{sg: id.PropertySchemaGroupID("yy"), i: id.NewPropertyItemID(), f: id.PropertyFieldID("b"), want: true},
				{sg: id.PropertySchemaGroupID("zz"), i: id.NewPropertyItemID(), f: id.PropertyFieldID("c"), want: true},
			},
		},
		{
			name:   "nil",
			target: nil,
			args: []args{
				{sg: id.PropertySchemaGroupID("xx"), i: id.NewPropertyItemID(), f: id.PropertyFieldID("a"), want: false},
				{sg: id.PropertySchemaGroupID("yy"), i: id.NewPropertyItemID(), f: id.PropertyFieldID("b"), want: false},
				{sg: id.PropertySchemaGroupID("zz"), i: id.NewPropertyItemID(), f: id.PropertyFieldID("c"), want: false},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			for i, a := range tt.args {
				assert.Equal(t, a.want, tt.target.Test(a.sg, a.i, a.f), "test %d", i)
			}
		})
	}
}

func TestPointer_TestItem(t *testing.T) {
	iid := id.NewPropertyItemID()

	type args struct {
		sg id.PropertySchemaGroupID
		i  id.PropertyItemID
	}
	tests := []struct {
		name   string
		target *Pointer
		args   args
		want   bool
	}{
		{
			name:   "true schema group only",
			target: &Pointer{schemaGroup: id.PropertySchemaGroupID("xx").Ref()},
			args:   args{sg: id.PropertySchemaGroupID("xx"), i: iid},
			want:   true,
		},
		{
			name:   "true item only",
			target: &Pointer{item: iid.Ref()},
			args:   args{sg: id.PropertySchemaGroupID("xx"), i: iid},
			want:   true,
		},
		{
			name:   "true schema group and item",
			target: &Pointer{schemaGroup: id.PropertySchemaGroupID("xx").Ref(), item: iid.Ref()},
			args:   args{sg: id.PropertySchemaGroupID("xx"), i: iid},
			want:   true,
		},
		{
			name:   "true empty",
			target: &Pointer{},
			args:   args{sg: id.PropertySchemaGroupID("xx"), i: iid},
			want:   true,
		},
		{
			name:   "false schema group only",
			target: &Pointer{schemaGroup: id.PropertySchemaGroupID("xx").Ref()},
			args:   args{sg: id.PropertySchemaGroupID("yy"), i: iid},
			want:   false,
		},
		{
			name:   "false item only",
			target: &Pointer{item: iid.Ref()},
			args:   args{sg: id.PropertySchemaGroupID("xx"), i: id.NewPropertyItemID()},
			want:   false,
		},
		{
			name:   "false schema group and item",
			target: &Pointer{schemaGroup: id.PropertySchemaGroupID("xx").Ref(), item: iid.Ref()},
			args:   args{sg: id.PropertySchemaGroupID("xx"), i: id.NewPropertyItemID()},
			want:   false,
		},
		{
			name:   "false nil",
			target: nil,
			args:   args{sg: id.PropertySchemaGroupID("xx"), i: iid},
			want:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.TestItem(tt.args.sg, tt.args.i))
		})
	}
}

func TestPointer_TestSchemaGroup(t *testing.T) {
	type args struct {
		sg id.PropertySchemaGroupID
	}
	tests := []struct {
		name   string
		target *Pointer
		args   args
		want   bool
	}{
		{
			name:   "true",
			target: &Pointer{schemaGroup: id.PropertySchemaGroupID("xx").Ref()},
			args:   args{sg: id.PropertySchemaGroupID("xx")},
			want:   true,
		},
		{
			name:   "false",
			target: &Pointer{schemaGroup: id.PropertySchemaGroupID("xx").Ref()},
			args:   args{sg: id.PropertySchemaGroupID("yy")},
			want:   false,
		},
		{
			name:   "empty",
			target: &Pointer{},
			args:   args{sg: id.PropertySchemaGroupID("xx")},
			want:   true,
		},
		{
			name:   "nil",
			target: nil,
			args:   args{sg: id.PropertySchemaGroupID("xx")},
			want:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.TestSchemaGroup(tt.args.sg))
		})
	}
}

func TestPointer_TestField(t *testing.T) {
	type args struct {
		f id.PropertyFieldID
	}
	tests := []struct {
		name   string
		target *Pointer
		args   args
		want   bool
	}{
		{
			name:   "true",
			target: &Pointer{field: id.PropertyFieldID("xx").Ref()},
			args:   args{f: id.PropertyFieldID("xx")},
			want:   true,
		},
		{
			name:   "false",
			target: &Pointer{field: id.PropertyFieldID("xx").Ref()},
			args:   args{f: id.PropertyFieldID("yy")},
			want:   false,
		},
		{
			name:   "empty",
			target: &Pointer{},
			args:   args{f: id.PropertyFieldID("xx")},
			want:   true,
		},
		{
			name:   "nil",
			target: nil,
			args:   args{f: id.PropertyFieldID("xx")},
			want:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.TestField(tt.args.f))
		})
	}
}

func TestProperty_MoveFields(t *testing.T) {
	itemID1 := id.NewPropertyItemID()
	itemID2 := id.NewPropertyItemID()

	type args struct {
		from *Pointer
		to   *Pointer
	}
	tests := []struct {
		name           string
		target         *Property
		args           args
		wantRes        bool
		wantFieldsFrom []*Field
		wantFieldsTo   []*Field
	}{
		{
			name:   "same group",
			target: testProperty1.Clone(),
			args: args{
				from: NewPointer(testGroup1.SchemaGroup().Ref(), nil, testField1.Field().Ref()),
				to:   NewPointer(testGroup1.SchemaGroup().Ref(), nil, id.PropertyFieldID("x").Ref()),
			},
			wantRes:        true,
			wantFieldsFrom: []*Field{testField1}, // changing field ID is not supported
			wantFieldsTo:   []*Field{testField1},
		},
		{
			name: "group -> group",
			target: New().NewID().Schema(testSchema1.ID()).Scene(id.NewSceneID()).Items([]Item{
				NewGroup().NewID().SchemaGroup(testSchemaGroup1.ID()).Fields([]*Field{testField1}).MustBuild(),
				NewGroup().NewID().SchemaGroup("x").Fields([]*Field{testField2}).MustBuild(),
			}).MustBuild(),
			args: args{
				from: NewPointer(testGroup1.SchemaGroup().Ref(), nil, testField1.Field().Ref()),
				to:   NewPointer(id.PropertySchemaGroupID("x").Ref(), nil, testField1.Field().Ref()),
			},
			wantRes:        true,
			wantFieldsFrom: []*Field{},
			wantFieldsTo:   []*Field{testField2, testField1},
		},
		{
			name: "group -> group (new)",
			target: New().NewID().Schema(testSchema1.ID()).Scene(id.NewSceneID()).Items([]Item{
				NewGroup().NewID().SchemaGroup(testSchemaGroup1.ID()).Fields([]*Field{testField1}).MustBuild(),
			}).MustBuild(),
			args: args{
				from: NewPointer(testGroup1.SchemaGroup().Ref(), nil, testField1.Field().Ref()),
				to:   NewPointer(id.PropertySchemaGroupID("x").Ref(), nil, testField1.Field().Ref()),
			},
			wantRes:        true,
			wantFieldsFrom: []*Field{},
			wantFieldsTo:   []*Field{testField1},
		},
		{
			name: "group -> group (rename)",
			target: New().NewID().Schema(testSchema1.ID()).Scene(id.NewSceneID()).Items([]Item{
				NewGroup().NewID().SchemaGroup(testSchemaGroup1.ID()).Fields([]*Field{testField1}).MustBuild(),
				NewGroup().NewID().SchemaGroup("x").Fields([]*Field{}).MustBuild(),
			}).MustBuild(),
			args: args{
				from: NewPointer(testGroup1.SchemaGroup().Ref(), nil, testField1.Field().Ref()),
				to:   NewPointer(id.PropertySchemaGroupID("x").Ref(), nil, id.PropertyFieldID("y").Ref()),
			},
			wantRes:        true,
			wantFieldsFrom: []*Field{},
			wantFieldsTo:   []*Field{testField1}, // changing field ID is not supported
		},
		{
			name: "group -> group (field nil)",
			target: New().NewID().Schema(testSchema1.ID()).Scene(id.NewSceneID()).Items([]Item{
				NewGroup().NewID().SchemaGroup(testSchemaGroup1.ID()).Fields([]*Field{testField1}).MustBuild(),
				NewGroup().NewID().SchemaGroup("x").Fields([]*Field{}).MustBuild(),
			}).MustBuild(),
			args: args{
				from: NewPointer(testGroup1.SchemaGroup().Ref(), nil, testField1.Field().Ref()),
				to:   NewPointer(id.PropertySchemaGroupID("x").Ref(), nil, nil),
			},
			wantRes:        true,
			wantFieldsFrom: []*Field{},
			wantFieldsTo:   []*Field{testField1},
		},
		{
			name: "group -> list",
			target: New().NewID().Schema(testSchema1.ID()).Scene(id.NewSceneID()).Items([]Item{
				NewGroup().NewID().SchemaGroup(testSchemaGroup1.ID()).Fields([]*Field{testField1}).MustBuild(),
				NewGroupList().NewID().SchemaGroup(testSchemaGroup2.ID()).MustBuild(),
			}).MustBuild(),
			args: args{
				from: NewPointer(testGroup1.SchemaGroup().Ref(), nil, testField1.Field().Ref()),
				to:   NewPointer(testSchemaGroup2.ID().Ref(), nil, testField1.Field().Ref()),
			},
			wantRes:        true,
			wantFieldsFrom: []*Field{}, // deleted
			wantFieldsTo:   []*Field{}, // not moved
		},
		{
			name: "list -> group",
			target: New().NewID().Schema(testSchema1.ID()).Scene(id.NewSceneID()).Items([]Item{
				NewGroup().NewID().SchemaGroup(id.PropertySchemaGroupID("x")).Fields([]*Field{testField1}).MustBuild(),
				NewGroupList().NewID().SchemaGroup(id.PropertySchemaGroupID("y")).Groups([]*Group{
					NewGroup().ID(itemID1).SchemaGroup(id.PropertySchemaGroupID("y")).Fields([]*Field{testField2}).MustBuild(),
				}).MustBuild(),
			}).MustBuild(),
			args: args{
				from: NewPointer(id.PropertySchemaGroupID("y").Ref(), itemID1.Ref(), testField2.Field().Ref()),
				to:   NewPointer(id.PropertySchemaGroupID("x").Ref(), nil, testField2.Field().Ref()),
			},
			wantRes:        true,
			wantFieldsFrom: []*Field{},           // deleted
			wantFieldsTo:   []*Field{testField1}, // not moved
		},
		{
			name: "list -> list",
			target: New().NewID().Schema(testSchema1.ID()).Scene(id.NewSceneID()).Items([]Item{
				NewGroupList().NewID().SchemaGroup(id.PropertySchemaGroupID("x")).Groups([]*Group{
					NewGroup().ID(itemID1).SchemaGroup(id.PropertySchemaGroupID("x")).Fields([]*Field{testField1}).MustBuild(),
				}).MustBuild(),
				NewGroupList().NewID().SchemaGroup(id.PropertySchemaGroupID("y")).Groups([]*Group{
					NewGroup().ID(itemID2).SchemaGroup(id.PropertySchemaGroupID("y")).Fields([]*Field{testField2}).MustBuild(),
				}).MustBuild(),
			}).MustBuild(),
			args: args{
				from: NewPointer(id.PropertySchemaGroupID("x").Ref(), itemID1.Ref(), testField1.Field().Ref()),
				to:   NewPointer(id.PropertySchemaGroupID("y").Ref(), itemID2.Ref(), testField2.Field().Ref()),
			},
			wantRes:        true,
			wantFieldsFrom: []*Field{},           // deleted
			wantFieldsTo:   []*Field{testField2}, // not moved
		},
		{
			name:   "nil",
			target: nil,
			args: args{
				from: NewPointer(testGroup1.SchemaGroup().Ref(), nil, testField1.Field().Ref()),
				to:   NewPointer(testGroup1.SchemaGroup().Ref(), nil, id.PropertyFieldID("x").Ref()),
			},
			wantRes:        false,
			wantFieldsFrom: nil,
			wantFieldsTo:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.wantRes, tt.target.MoveFields(tt.args.from, tt.args.to))
			assert.Equal(t, tt.wantFieldsFrom, tt.target.Fields(tt.args.from.AllFields()))
			assert.Equal(t, tt.wantFieldsTo, tt.target.Fields(tt.args.to.AllFields()))
		})
	}
}

func TestProperty_GroupAndList(t *testing.T) {
	type args struct {
		ptr *Pointer
	}

	pgid1 := id.NewPropertyItemID()
	pgid2 := id.NewPropertyItemID()

	tests := []struct {
		name   string
		target *Property
		args   args
		want   *Group
		want1  *GroupList
	}{
		{
			name: "found",
			target: &Property{
				items: []Item{
					&GroupList{
						itemBase: itemBase{
							ID:          pgid1,
							SchemaGroup: id.PropertySchemaGroupID("aaaa"),
						},
						groups: []*Group{
							{
								itemBase: itemBase{
									ID:          pgid2,
									SchemaGroup: id.PropertySchemaGroupID("aaaa"),
								},
							},
						},
					},
				},
			},
			args: args{
				ptr: &Pointer{
					schemaGroup: id.PropertySchemaGroupID("aaaa").Ref(),
					item:        pgid2.Ref(),
					field:       nil,
				},
			},
			want: &Group{
				itemBase: itemBase{
					ID:          pgid2,
					SchemaGroup: id.PropertySchemaGroupID("aaaa"),
				},
			},
			want1: &GroupList{
				itemBase: itemBase{
					ID:          pgid1,
					SchemaGroup: id.PropertySchemaGroupID("aaaa"),
				},
				groups: []*Group{
					{
						itemBase: itemBase{
							ID:          pgid2,
							SchemaGroup: id.PropertySchemaGroupID("aaaa"),
						},
					},
				},
			},
		},
		{
			name: "list only",
			target: &Property{
				items: []Item{
					&GroupList{
						itemBase: itemBase{
							ID:          pgid1,
							SchemaGroup: id.PropertySchemaGroupID("aaaa"),
						},
						groups: []*Group{
							{
								itemBase: itemBase{
									ID:          pgid2,
									SchemaGroup: id.PropertySchemaGroupID("aaaa"),
								},
							},
						},
					},
				},
			},
			args: args{
				ptr: &Pointer{
					schemaGroup: id.PropertySchemaGroupID("aaaa").Ref(),
					item:        pgid1.Ref(),
					field:       nil,
				},
			},
			want: nil,
			want1: &GroupList{
				itemBase: itemBase{
					ID:          pgid1,
					SchemaGroup: id.PropertySchemaGroupID("aaaa"),
				},
				groups: []*Group{
					{
						itemBase: itemBase{
							ID:          pgid2,
							SchemaGroup: id.PropertySchemaGroupID("aaaa"),
						},
					},
				},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, got1 := tt.target.GroupAndList(tt.args.ptr)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.want1, got1)
		})
	}
}

func TestProperty_AddItem(t *testing.T) {
	type args struct {
		i Item
	}

	iid := id.NewPropertyItemID()

	tests := []struct {
		name      string
		target    *Property
		args      args
		want      bool
		wantItems []Item
	}{
		{
			name:      "ok",
			target:    &Property{},
			args:      args{i: &Group{}},
			want:      true,
			wantItems: []Item{&Group{}},
		},
		{
			name:      "schema group duplicated",
			target:    &Property{items: []Item{&Group{itemBase: itemBase{SchemaGroup: "a"}}}},
			args:      args{i: &Group{itemBase: itemBase{SchemaGroup: "a"}}},
			want:      false,
			wantItems: []Item{&Group{itemBase: itemBase{SchemaGroup: "a"}}},
		},
		{
			name:      "id duplicated",
			target:    &Property{items: []Item{&Group{itemBase: itemBase{ID: iid}}}},
			args:      args{i: &Group{itemBase: itemBase{ID: iid}}},
			want:      false,
			wantItems: []Item{&Group{itemBase: itemBase{ID: iid}}},
		},
		{
			name:      "nil",
			target:    nil,
			args:      args{i: &Group{}},
			want:      false,
			wantItems: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.AddItem(tt.args.i))
			if tt.target != nil {
				assert.Equal(t, tt.wantItems, tt.target.items)
			}
		})
	}
}
