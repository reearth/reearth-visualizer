package property

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

var (
	testProperty1 = New().NewID().Schema(testSchema1.ID()).Scene(id.NewSceneID()).Items([]Item{testGroup1, testGroupList1}).MustBuild()
)

func TestProperty_MigrateSchema(t *testing.T) {
	sceneID := NewSceneID()
	oldSchema := MustSchemaID("hoge~1.0.0/test")
	schemaField1ID := FieldID("a")
	schemaField2ID := FieldID("b")
	schemaField3ID := FieldID("c")
	schemaField4ID := FieldID("d")
	schemaField5ID := FieldID("e")
	schemaField6ID := FieldID("f")
	schemaField7ID := FieldID("g")
	schemaField8ID := FieldID("h")
	schemaGroupID := SchemaGroupID("i")

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
		// should remain
		NewField(schemaField5ID).
			Type(ValueTypeString).
			MustBuild(),
		// should be removed because of linked dataset field value type
		NewField(schemaField6ID).
			Type(ValueTypeString).
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

	property, _ := New().NewID().Scene(sceneID).Schema(oldSchema).Items(items).Build()

	newGroup := ToGroup(property.ItemBySchema(schemaGroupID))
	newFields := newGroup.Fields(nil)

	assert.Equal(t, 1, len(property.Items()))
	assert.Equal(t, 8, len(newFields))
	assert.NotNil(t, newGroup.Field(schemaField1ID))
	assert.NotNil(t, newGroup.Field(schemaField3ID))
	assert.NotNil(t, newGroup.Field(schemaField5ID))
}

func TestGetOrCreateItem(t *testing.T) {
	sceneID := NewSceneID()
	sid, _ := SchemaIDFrom("hoge~1.0.0/test")
	sf1id := FieldID("a")
	sf2id := FieldID("b")
	sg1id := SchemaGroupID("c")
	sg2id := SchemaGroupID("d")

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
	sceneID := NewSceneID()
	sid, _ := SchemaIDFrom("hoge~1.0.0/test")
	sf1id := FieldID("a")
	sf2id := FieldID("b")
	sg1id := SchemaGroupID("c")
	sg2id := SchemaGroupID("d")

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
	sceneID := NewSceneID()
	sid, _ := SchemaIDFrom("hoge~1.0.0/test")
	sfid := FieldID("a")
	sgid := SchemaGroupID("b")
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
	sceneID := NewSceneID()
	sid, _ := SchemaIDFrom("hoge~1.0.0/test")
	sgid := SchemaGroupID("b")
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
	sceneID := NewSceneID()
	sid, _ := SchemaIDFrom("hoge~1.0.0/test")
	sgid := SchemaGroupID("b")
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
	itemID := NewItemID()

	type args struct {
		sg   SchemaGroupID
		i    ItemID
		f    FieldID
		want bool
	}
	tests := []struct {
		name   string
		target *Pointer
		args   []args
	}{
		{
			name:   "schema group only",
			target: &Pointer{schemaGroup: SchemaGroupID("xx").Ref()},
			args: []args{
				{sg: SchemaGroupID("xx"), i: itemID, f: FieldID("a"), want: true},
				{sg: SchemaGroupID("xx"), i: itemID, f: FieldID("b"), want: true},
				{sg: SchemaGroupID("yy"), i: itemID, f: FieldID("a"), want: false},
			},
		},
		{
			name:   "item only",
			target: &Pointer{item: itemID.Ref()},
			args: []args{
				{sg: SchemaGroupID("xx"), i: itemID, f: FieldID("a"), want: true},
				{sg: SchemaGroupID("yy"), i: itemID, f: FieldID("a"), want: true},
				{sg: SchemaGroupID("xx"), i: itemID, f: FieldID("b"), want: true},
				{sg: SchemaGroupID("xx"), i: NewItemID(), f: FieldID("a"), want: false},
			},
		},
		{
			name:   "schema group and item",
			target: &Pointer{schemaGroup: SchemaGroupID("xx").Ref(), item: itemID.Ref()},
			args: []args{
				{sg: SchemaGroupID("xx"), i: itemID, f: FieldID("a"), want: true},
				{sg: SchemaGroupID("xx"), i: itemID, f: FieldID("b"), want: true},
				{sg: SchemaGroupID("xx"), i: NewItemID(), f: FieldID("a"), want: false},
				{sg: SchemaGroupID("yy"), i: itemID, f: FieldID("a"), want: false},
				{sg: SchemaGroupID("yy"), i: NewItemID(), f: FieldID("a"), want: false},
			},
		},
		{
			name:   "all",
			target: &Pointer{schemaGroup: SchemaGroupID("xx").Ref(), item: itemID.Ref(), field: FieldID("a").Ref()},
			args: []args{
				{sg: SchemaGroupID("xx"), i: itemID, f: FieldID("a"), want: true},
				{sg: SchemaGroupID("yy"), i: itemID, f: FieldID("a"), want: false},
				{sg: SchemaGroupID("xx"), i: NewItemID(), f: FieldID("a"), want: false},
				{sg: SchemaGroupID("xx"), i: itemID, f: FieldID("b"), want: false},
			},
		},
		{
			name:   "empty",
			target: &Pointer{},
			args: []args{
				{sg: SchemaGroupID("xx"), i: NewItemID(), f: FieldID("a"), want: true},
				{sg: SchemaGroupID("yy"), i: NewItemID(), f: FieldID("b"), want: true},
				{sg: SchemaGroupID("zz"), i: NewItemID(), f: FieldID("c"), want: true},
			},
		},
		{
			name:   "nil",
			target: nil,
			args: []args{
				{sg: SchemaGroupID("xx"), i: NewItemID(), f: FieldID("a"), want: false},
				{sg: SchemaGroupID("yy"), i: NewItemID(), f: FieldID("b"), want: false},
				{sg: SchemaGroupID("zz"), i: NewItemID(), f: FieldID("c"), want: false},
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
	iid := NewItemID()

	type args struct {
		sg SchemaGroupID
		i  ItemID
	}
	tests := []struct {
		name   string
		target *Pointer
		args   args
		want   bool
	}{
		{
			name:   "true schema group only",
			target: &Pointer{schemaGroup: SchemaGroupID("xx").Ref()},
			args:   args{sg: SchemaGroupID("xx"), i: iid},
			want:   true,
		},
		{
			name:   "true item only",
			target: &Pointer{item: iid.Ref()},
			args:   args{sg: SchemaGroupID("xx"), i: iid},
			want:   true,
		},
		{
			name:   "true schema group and item",
			target: &Pointer{schemaGroup: SchemaGroupID("xx").Ref(), item: iid.Ref()},
			args:   args{sg: SchemaGroupID("xx"), i: iid},
			want:   true,
		},
		{
			name:   "true empty",
			target: &Pointer{},
			args:   args{sg: SchemaGroupID("xx"), i: iid},
			want:   true,
		},
		{
			name:   "false schema group only",
			target: &Pointer{schemaGroup: SchemaGroupID("xx").Ref()},
			args:   args{sg: SchemaGroupID("yy"), i: iid},
			want:   false,
		},
		{
			name:   "false item only",
			target: &Pointer{item: iid.Ref()},
			args:   args{sg: SchemaGroupID("xx"), i: NewItemID()},
			want:   false,
		},
		{
			name:   "false schema group and item",
			target: &Pointer{schemaGroup: SchemaGroupID("xx").Ref(), item: iid.Ref()},
			args:   args{sg: SchemaGroupID("xx"), i: NewItemID()},
			want:   false,
		},
		{
			name:   "false nil",
			target: nil,
			args:   args{sg: SchemaGroupID("xx"), i: iid},
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
		sg SchemaGroupID
	}
	tests := []struct {
		name   string
		target *Pointer
		args   args
		want   bool
	}{
		{
			name:   "true",
			target: &Pointer{schemaGroup: SchemaGroupID("xx").Ref()},
			args:   args{sg: SchemaGroupID("xx")},
			want:   true,
		},
		{
			name:   "false",
			target: &Pointer{schemaGroup: SchemaGroupID("xx").Ref()},
			args:   args{sg: SchemaGroupID("yy")},
			want:   false,
		},
		{
			name:   "empty",
			target: &Pointer{},
			args:   args{sg: SchemaGroupID("xx")},
			want:   true,
		},
		{
			name:   "nil",
			target: nil,
			args:   args{sg: SchemaGroupID("xx")},
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
		f FieldID
	}
	tests := []struct {
		name   string
		target *Pointer
		args   args
		want   bool
	}{
		{
			name:   "true",
			target: &Pointer{field: FieldID("xx").Ref()},
			args:   args{f: FieldID("xx")},
			want:   true,
		},
		{
			name:   "false",
			target: &Pointer{field: FieldID("xx").Ref()},
			args:   args{f: FieldID("yy")},
			want:   false,
		},
		{
			name:   "empty",
			target: &Pointer{},
			args:   args{f: FieldID("xx")},
			want:   true,
		},
		{
			name:   "nil",
			target: nil,
			args:   args{f: FieldID("xx")},
			want:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.TestField(tt.args.f))
		})
	}
}

func TestProperty_GroupAndList(t *testing.T) {
	type args struct {
		ptr *Pointer
	}

	pgid1 := NewItemID()
	pgid2 := NewItemID()

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
							SchemaGroup: SchemaGroupID("aaaa"),
						},
						groups: []*Group{
							{
								itemBase: itemBase{
									ID:          pgid2,
									SchemaGroup: SchemaGroupID("aaaa"),
								},
							},
						},
					},
				},
			},
			args: args{
				ptr: &Pointer{
					schemaGroup: SchemaGroupID("aaaa").Ref(),
					item:        pgid2.Ref(),
					field:       nil,
				},
			},
			want: &Group{
				itemBase: itemBase{
					ID:          pgid2,
					SchemaGroup: SchemaGroupID("aaaa"),
				},
			},
			want1: &GroupList{
				itemBase: itemBase{
					ID:          pgid1,
					SchemaGroup: SchemaGroupID("aaaa"),
				},
				groups: []*Group{
					{
						itemBase: itemBase{
							ID:          pgid2,
							SchemaGroup: SchemaGroupID("aaaa"),
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
							SchemaGroup: SchemaGroupID("aaaa"),
						},
						groups: []*Group{
							{
								itemBase: itemBase{
									ID:          pgid2,
									SchemaGroup: SchemaGroupID("aaaa"),
								},
							},
						},
					},
				},
			},
			args: args{
				ptr: &Pointer{
					schemaGroup: SchemaGroupID("aaaa").Ref(),
					item:        pgid1.Ref(),
					field:       nil,
				},
			},
			want: nil,
			want1: &GroupList{
				itemBase: itemBase{
					ID:          pgid1,
					SchemaGroup: SchemaGroupID("aaaa"),
				},
				groups: []*Group{
					{
						itemBase: itemBase{
							ID:          pgid2,
							SchemaGroup: SchemaGroupID("aaaa"),
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

	iid := NewItemID()

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
