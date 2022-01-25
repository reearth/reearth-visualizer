package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGroupList_IDRef(t *testing.T) {
	var b *GroupList
	assert.Nil(t, b.IDRef())
	b = NewGroupList().NewID().MustBuild()
	assert.NotNil(t, b.IDRef())
}

func TestGroupList_SchemaRef(t *testing.T) {
	tests := []struct {
		Name           string
		GL             *GroupList
		ExpectedSG     *SchemaGroupID
		ExpectedSchema *SchemaID
	}{
		{
			Name: "nil group list",
		},
		{
			Name:           "success",
			GL:             NewGroupList().NewID().SchemaGroup(SchemaGroupID("xx")).MustBuild(),
			ExpectedSG:     SchemaGroupID("xx").Ref(),
			ExpectedSchema: MustSchemaID("xx~1.0.0/aa").Ref(),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.ExpectedSG, tc.GL.SchemaGroupRef())
		})
	}
}

func TestGroupList_HasLinkedField(t *testing.T) {
	pid := NewItemID()
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	dsid := NewDatasetID()
	dssid := NewDatasetSchemaID()
	f := FieldFrom(sf).
		Value(OptionalValueFrom(v)).
		Links(&Links{links: []*Link{NewLink(dsid, dssid, NewDatasetFieldID())}}).
		MustBuild()
	groups := []*Group{NewGroup().ID(pid).Fields([]*Field{f}).MustBuild()}
	groups2 := []*Group{NewGroup().ID(pid).MustBuild()}

	tests := []struct {
		Name     string
		GL       *GroupList
		Expected bool
	}{
		{
			Name: "nil group list",
		},
		{
			Name:     "has linked field",
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups(groups).MustBuild(),
			Expected: true,
		},
		{
			Name:     "no linked field",
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups(groups2).MustBuild(),
			Expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.GL.HasLinkedField())
			assert.Equal(t, tc.Expected, tc.GL.IsDatasetLinked(dssid, dsid))
		})
	}
}

func TestGroupList_Datasets(t *testing.T) {
	pid := NewItemID()
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	dsid := NewDatasetID()
	dssid := NewDatasetSchemaID()
	f := FieldFrom(sf).
		Value(OptionalValueFrom(v)).
		Links(&Links{links: []*Link{NewLink(dsid, dssid, NewDatasetFieldID())}}).
		MustBuild()
	groups := []*Group{NewGroup().ID(pid).Fields([]*Field{f}).MustBuild()}
	groups2 := []*Group{NewGroup().ID(pid).MustBuild()}

	tests := []struct {
		Name     string
		GL       *GroupList
		Expected []DatasetID
	}{
		{
			Name: "nil group list",
		},
		{
			Name:     "one dataset",
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups(groups).MustBuild(),
			Expected: []DatasetID{dsid},
		},
		{
			Name:     "empty list",
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups(groups2).MustBuild(),
			Expected: []DatasetID{},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.GL.Datasets())
		})
	}
}

func TestGroupList_FieldsByLinkedDataset(t *testing.T) {
	pid := NewItemID()
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	dsid := NewDatasetID()
	dssid := NewDatasetSchemaID()
	f := FieldFrom(sf).
		Value(OptionalValueFrom(v)).
		Links(&Links{links: []*Link{NewLink(dsid, dssid, NewDatasetFieldID())}}).
		MustBuild()
	groups := []*Group{NewGroup().ID(pid).Fields([]*Field{f}).MustBuild()}
	groups2 := []*Group{NewGroup().ID(pid).MustBuild()}

	tests := []struct {
		Name     string
		GL       *GroupList
		Expected []*Field
	}{
		{
			Name: "nil group list",
		},
		{
			Name:     "one field list",
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups(groups).MustBuild(),
			Expected: []*Field{f},
		},
		{
			Name:     "empty list",
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups(groups2).MustBuild(),
			Expected: []*Field{},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.GL.FieldsByLinkedDataset(dssid, dsid))
		})
	}
}

func TestGroupList_IsEmpty(t *testing.T) {
	pid := NewItemID()
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	dsid := NewDatasetID()
	dssid := NewDatasetSchemaID()
	f := FieldFrom(sf).
		Value(OptionalValueFrom(v)).
		Links(&Links{links: []*Link{NewLink(dsid, dssid, NewDatasetFieldID())}}).
		MustBuild()
	groups := []*Group{NewGroup().ID(pid).Fields([]*Field{f}).MustBuild()}

	tests := []struct {
		Name     string
		GL       *GroupList
		Expected bool
	}{
		{
			Name: "nil group list",
		},
		{
			Name:     "is empty",
			GL:       NewGroupList().NewID().SchemaGroup("xx").MustBuild(),
			Expected: true,
		},
		{
			Name:     "is not empty",
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups(groups).MustBuild(),
			Expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.GL.IsEmpty())
		})
	}
}

func TestGroupList_Prune(t *testing.T) {
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	f := FieldFrom(sf).Value(OptionalValueFrom(v)).MustBuild()
	f2 := FieldFrom(sf).MustBuild()
	pid := NewItemID()
	groups := []*Group{NewGroup().ID(pid).Fields([]*Field{f, f2}).MustBuild()}
	pruned := []*Group{NewGroup().ID(pid).Fields([]*Field{f}).MustBuild()}

	tests := []struct {
		Name     string
		GL       *GroupList
		Expected []*Group
	}{
		{
			Name: "nil group list",
		},
		{
			Name:     "pruned list",
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups(groups).MustBuild(),
			Expected: pruned,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			tc.GL.Prune()
			assert.Equal(t, tc.Expected, tc.GL.Groups())
		})
	}
}

func TestGroupList_Group(t *testing.T) {
	pid := NewItemID()
	g := NewGroup().ID(pid).MustBuild()

	tests := []struct {
		Name     string
		Input    ItemID
		GL       *GroupList
		Expected *Group
	}{
		{
			Name: "nil group list",
		},
		{
			Name:     "found",
			Input:    pid,
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g}).MustBuild(),
			Expected: g,
		},
		{
			Name:     "not found",
			Input:    NewItemID(),
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g}).MustBuild(),
			Expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.GL.Group(tc.Input))
		})
	}
}

func TestGroupList_GroupAt(t *testing.T) {
	g1 := NewGroup().ID(NewItemID()).MustBuild()
	g2 := NewGroup().ID(NewItemID()).MustBuild()
	g3 := NewGroup().ID(NewItemID()).MustBuild()
	g4 := NewGroup().ID(NewItemID()).MustBuild()

	tests := []struct {
		Name     string
		Index    int
		GL       *GroupList
		Expected *Group
	}{
		{
			Name: "nil group list",
		},
		{
			Name:  "index < 0",
			Index: -1,
		},
		{
			Name:  "index > len(g)-1",
			Index: 4,
		},
		{
			Name:     "found",
			Index:    2,
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g2, g3, g4}).MustBuild(),
			Expected: g3,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.GL.GroupAt(tc.Index))
		})
	}
}

func TestGroupList_Has(t *testing.T) {
	g1 := NewGroup().ID(NewItemID()).MustBuild()
	g2 := NewGroup().ID(NewItemID()).MustBuild()
	g3 := NewGroup().ID(NewItemID()).MustBuild()
	g4 := NewGroup().ID(NewItemID()).MustBuild()

	tests := []struct {
		Name     string
		Input    ItemID
		GL       *GroupList
		Expected bool
	}{
		{
			Name: "nil group list",
		},
		{
			Name:     "found",
			Input:    g2.ID(),
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g2, g3, g4}).MustBuild(),
			Expected: true,
		},
		{
			Name:     "not found",
			Input:    g3.ID(),
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g2, g4}).MustBuild(),
			Expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.GL.Has(tc.Input))
		})
	}
}

func TestGroupList_Count(t *testing.T) {
	g1 := NewGroup().ID(NewItemID()).MustBuild()
	g2 := NewGroup().ID(NewItemID()).MustBuild()
	g3 := NewGroup().ID(NewItemID()).MustBuild()
	g4 := NewGroup().ID(NewItemID()).MustBuild()

	tests := []struct {
		Name     string
		GL       *GroupList
		Expected int
	}{
		{
			Name: "nil group list",
		},
		{
			Name:     "not found",
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g2, g3, g4}).MustBuild(),
			Expected: 4,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.GL.Count())
		})
	}
}

func TestGroupList_Add(t *testing.T) {
	g1 := NewGroup().ID(NewItemID()).MustBuild()
	g2 := NewGroup().ID(NewItemID()).MustBuild()
	g3 := NewGroup().ID(NewItemID()).MustBuild()
	g4 := NewGroup().ID(NewItemID()).MustBuild()

	tests := []struct {
		Name     string
		GL       *GroupList
		Gr       *Group
		Index    int
		Expected struct {
			Gr    *Group
			Index int
		}
	}{
		{
			Name: "nil group list",
		},
		{
			Name:  "index < 0",
			Index: -1,
			Gr:    g2,
			GL:    NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g3, g4}).MustBuild(),
			Expected: struct {
				Gr    *Group
				Index int
			}{
				Gr:    g2,
				Index: 3,
			},
		},
		{
			Name:  "len(g) > index > 0 ",
			Index: 2,
			Gr:    g2,
			GL:    NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g3, g4}).MustBuild(),
			Expected: struct {
				Gr    *Group
				Index int
			}{
				Gr:    g2,
				Index: 2,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			tt.GL.Add(tt.Gr, tt.Index)
			assert.Equal(t, tt.Expected.Gr, tt.GL.GroupAt(tt.Expected.Index))
		})
	}
}

func TestGroupList_AddOrMove(t *testing.T) {
	g1 := NewGroup().ID(NewItemID()).MustBuild()
	g2 := NewGroup().ID(NewItemID()).MustBuild()
	g3 := NewGroup().ID(NewItemID()).MustBuild()
	g4 := NewGroup().ID(NewItemID()).MustBuild()

	tests := []struct {
		Name     string
		GL       *GroupList
		Gr       *Group
		Index    int
		Expected struct {
			Gr    *Group
			Index int
		}
	}{
		{
			Name: "nil group list",
		},
		{
			Name:  "index < 0",
			Index: -1,
			Gr:    g2,
			GL:    NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g3, g4}).MustBuild(),
			Expected: struct {
				Gr    *Group
				Index int
			}{
				Gr:    g2,
				Index: 3,
			},
		},
		{
			Name:  "len(g) > index > 0 ",
			Index: 2,
			Gr:    g2,
			GL:    NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g3, g4}).MustBuild(),
			Expected: struct {
				Gr    *Group
				Index int
			}{
				Gr:    g2,
				Index: 2,
			},
		},
		{
			Name:  "move group",
			Index: 2,
			Gr:    g1,
			GL:    NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g3, g4}).MustBuild(),
			Expected: struct {
				Gr    *Group
				Index int
			}{
				Gr:    g1,
				Index: 2,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			tt.GL.AddOrMove(tt.Gr, tt.Index)
			assert.Equal(t, tt.Expected.Gr, tt.GL.GroupAt(tt.Expected.Index))
		})
	}
}

func TestGroupList_Move(t *testing.T) {
	g1 := NewGroup().ID(NewItemID()).MustBuild()
	g2 := NewGroup().ID(NewItemID()).MustBuild()
	g3 := NewGroup().ID(NewItemID()).MustBuild()
	g4 := NewGroup().ID(NewItemID()).MustBuild()

	tests := []struct {
		Name     string
		GL       *GroupList
		Id       ItemID
		ToIndex  int
		Expected struct {
			Id    ItemID
			Index int
		}
	}{
		{
			Name: "nil group list",
		},
		{
			Name:    "success",
			Id:      g1.ID(),
			ToIndex: 2,
			GL:      NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g2, g3, g4}).MustBuild(),
			Expected: struct {
				Id    ItemID
				Index int
			}{Id: g1.ID(), Index: 2},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			tt.GL.Move(tt.Id, tt.ToIndex)
			assert.Equal(t, tt.Expected.Id, tt.GL.GroupAt(tt.Expected.Index).ID())
		})
	}
}

func TestGroupList_MoveAt(t *testing.T) {
	g1 := NewGroup().ID(NewItemID()).MustBuild()
	g2 := NewGroup().ID(NewItemID()).MustBuild()
	g3 := NewGroup().ID(NewItemID()).MustBuild()
	g4 := NewGroup().ID(NewItemID()).MustBuild()

	tests := []struct {
		Name               string
		GL                 *GroupList
		FromIndex, ToIndex int
		Expected           []*Group
	}{
		{
			Name: "nil group list",
		},
		{
			Name:      "from = to",
			FromIndex: 2,
			ToIndex:   2,
			GL:        NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g2, g3, g4}).MustBuild(),
			Expected:  []*Group{g1, g2, g3, g4},
		},
		{
			Name:      "from < 0",
			FromIndex: -1,
			ToIndex:   2,
			GL:        NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g2, g3, g4}).MustBuild(),
			Expected:  []*Group{g1, g2, g3, g4},
		},
		{
			Name:      "success move",
			FromIndex: 0,
			ToIndex:   2,
			GL:        NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g2, g3, g4}).MustBuild(),
			Expected:  []*Group{g2, g3, g1, g4},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			tt.GL.MoveAt(tt.FromIndex, tt.ToIndex)
			assert.Equal(t, tt.Expected, tt.GL.Groups())
		})
	}
}

func TestGroupList_RemoveAt(t *testing.T) {
	g1 := NewGroup().ID(NewItemID()).MustBuild()
	g2 := NewGroup().ID(NewItemID()).MustBuild()
	g3 := NewGroup().ID(NewItemID()).MustBuild()
	g4 := NewGroup().ID(NewItemID()).MustBuild()

	tests := []struct {
		Name     string
		GL       *GroupList
		Index    int
		Expected []*Group
	}{
		{
			Name: "nil group list",
		},
		{
			Name:     "success",
			Index:    1,
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g2, g3, g4}).MustBuild(),
			Expected: []*Group{g1, g3, g4},
		},
		{
			Name:     "index < 0",
			Index:    -1,
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g2, g3, g4}).MustBuild(),
			Expected: []*Group{g1, g2, g3, g4},
		},
		{
			Name:     "index > length",
			Index:    5,
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g2, g3, g4}).MustBuild(),
			Expected: []*Group{g1, g2, g3, g4},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			tt.GL.RemoveAt(tt.Index)
			assert.Equal(t, tt.Expected, tt.GL.Groups())
		})
	}
}
func TestGroupList_Remove(t *testing.T) {
	g1 := NewGroup().ID(NewItemID()).MustBuild()
	g2 := NewGroup().ID(NewItemID()).MustBuild()
	g3 := NewGroup().ID(NewItemID()).MustBuild()
	g4 := NewGroup().ID(NewItemID()).MustBuild()

	tests := []struct {
		Name     string
		GL       *GroupList
		Input    ItemID
		Expected bool
	}{
		{
			Name: "nil group list",
		},
		{
			Name:     "success",
			Input:    g1.ID(),
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g2, g3, g4}).MustBuild(),
			Expected: true,
		},
		{
			Name:     "not found",
			Input:    g4.ID(),
			GL:       NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g2, g3}).MustBuild(),
			Expected: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.GL.Remove(tt.Input)
			assert.Equal(t, tt.Expected, res)
		})
	}
}

func TestGroupList_GetOrCreateField(t *testing.T) {
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aa").Fields([]*SchemaField{sf}).MustBuild()
	g := NewGroup().ID(NewItemID()).SchemaGroup(sg.ID()).MustBuild()

	tests := []struct {
		Name       string
		GL         *GroupList
		Schema     *Schema
		Ptr        *Pointer
		Expected   *Field
		ExpectedOK bool
	}{
		{
			Name:       "success",
			GL:         NewGroupList().NewID().SchemaGroup("aa").Groups([]*Group{g}).MustBuild(),
			Schema:     NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups([]*SchemaGroup{sg}).MustBuild(),
			Ptr:        NewPointer(nil, g.IDRef(), sf.ID().Ref()),
			Expected:   FieldFrom(sf).MustBuild(),
			ExpectedOK: true,
		},
		{
			Name:   "can't get a group",
			GL:     NewGroupList().NewID().SchemaGroup("aa").MustBuild(),
			Schema: NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups([]*SchemaGroup{sg}).MustBuild(),
			Ptr:    NewPointer(nil, g.IDRef(), sf.ID().Ref()),
		},
		{
			Name:   "FieldByItem not ok: sg!=nil",
			GL:     NewGroupList().NewID().SchemaGroup("aa").Groups([]*Group{g}).MustBuild(),
			Schema: NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups([]*SchemaGroup{sg}).MustBuild(),
			Ptr:    NewPointer(sg.IDRef(), g.IDRef(), sf.ID().Ref()),
		},
		{
			Name:   "psg == nil",
			GL:     NewGroupList().NewID().Groups([]*Group{g}).MustBuild(),
			Schema: NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups([]*SchemaGroup{sg}).MustBuild(),
			Ptr:    NewPointer(nil, g.IDRef(), sf.ID().Ref()),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res, ok := tt.GL.GetOrCreateField(tt.Schema, tt.Ptr)
			assert.Equal(t, tt.Expected, res)
			assert.Equal(t, tt.ExpectedOK, ok)
		})
	}
}

func TestGroupList_CreateAndAddListItem(t *testing.T) {
	getIntRef := func(i int) *int { return &i }
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aa").Fields([]*SchemaField{sf}).MustBuild()
	g := NewGroup().ID(NewItemID()).SchemaGroup(sg.ID()).MustBuild()

	tests := []struct {
		Name     string
		GL       *GroupList
		Schema   *Schema
		Index    *int
		Expected *Group
	}{
		{
			Name:     "success",
			Index:    getIntRef(0),
			GL:       NewGroupList().NewID().SchemaGroup("aa").MustBuild(),
			Schema:   NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups([]*SchemaGroup{sg}).MustBuild(),
			Expected: g,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.GL.CreateAndAddListItem(tt.Schema, tt.Index)
			assert.Equal(t, tt.Expected.Fields(), res.Fields())
			assert.Equal(t, tt.Expected.SchemaGroup(), res.SchemaGroup())
		})
	}
}
