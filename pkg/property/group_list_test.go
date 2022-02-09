package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

var (
	testGroupList1 = NewGroupList().NewID().SchemaGroup(testSchemaGroup2.ID()).Groups([]*Group{testGroup2}).MustBuild()
)

func TestGroupList_IDRef(t *testing.T) {
	id := NewItemID()
	assert.Nil(t, (*GroupList)(nil).IDRef())
	assert.Equal(t, &id, (&GroupList{
		itemBase: itemBase{ID: id},
	}).IDRef())
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
	groups := []*Group{NewGroup().ID(pid).SchemaGroup("xx").Fields([]*Field{f}).MustBuild()}
	groups2 := []*Group{NewGroup().ID(pid).SchemaGroup("xx").MustBuild()}

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
	groups := []*Group{NewGroup().ID(pid).SchemaGroup("xx").Fields([]*Field{f}).MustBuild()}
	groups2 := []*Group{NewGroup().ID(pid).SchemaGroup("xx").MustBuild()}

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
	groups := []*Group{NewGroup().ID(pid).SchemaGroup("xx").Fields([]*Field{f}).MustBuild()}
	groups2 := []*Group{NewGroup().ID(pid).SchemaGroup("xx").MustBuild()}

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
	groups := []*Group{NewGroup().ID(pid).SchemaGroup("xx").Fields([]*Field{f}).MustBuild()}

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
	groups := []*Group{NewGroup().ID(pid).SchemaGroup("xx").Fields([]*Field{f, f2}).MustBuild()}
	pruned := []*Group{NewGroup().ID(pid).SchemaGroup("xx").Fields([]*Field{f}).MustBuild()}

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
	g := NewGroup().ID(pid).SchemaGroup("xx").MustBuild()

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
	g1 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g2 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g3 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g4 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()

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
	g1 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g2 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g3 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g4 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()

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
	g1 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g2 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g3 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g4 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()

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
	g1 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g2 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g3 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g4 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()

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
	g1 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g2 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g3 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g4 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()

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
	g1 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g2 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g3 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g4 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()

	tests := []struct {
		Name          string
		GL            *GroupList
		ID            ItemID
		ToIndex       int
		ExpectedID    ItemID
		ExpectedIndex int
	}{
		{
			Name: "nil group list",
		},
		{
			Name:          "success",
			ID:            g1.ID(),
			ToIndex:       2,
			GL:            NewGroupList().NewID().SchemaGroup("xx").Groups([]*Group{g1, g2, g3, g4}).MustBuild(),
			ExpectedID:    g1.ID(),
			ExpectedIndex: 2,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			tt.GL.Move(tt.ID, tt.ToIndex)
			g := tt.GL.GroupAt(tt.ExpectedIndex)
			if !tt.ExpectedID.IsNil() {
				assert.Equal(t, tt.ExpectedID, g.ID())
			}
		})
	}
}

func TestGroupList_MoveAt(t *testing.T) {
	g1 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g2 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g3 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g4 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()

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
	g1 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g2 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g3 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g4 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()

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
	g1 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g2 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g3 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()
	g4 := NewGroup().ID(NewItemID()).SchemaGroup("xx").MustBuild()

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
	s := NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups(NewSchemaGroupList([]*SchemaGroup{sg})).MustBuild()

	tests := []struct {
		Name       string
		Target     *GroupList
		Schema     *Schema
		Ptr        *Pointer
		Expected   *Field
		ExpectedOK bool
	}{
		{
			Name:       "success",
			Target:     NewGroupList().NewID().SchemaGroup("aa").Groups([]*Group{g}).MustBuild(),
			Schema:     s,
			Ptr:        NewPointer(nil, g.IDRef(), sf.ID().Ref()),
			Expected:   FieldFrom(sf).MustBuild(),
			ExpectedOK: true,
		},
		{
			Name:   "can't get a group",
			Target: NewGroupList().NewID().SchemaGroup("aa").MustBuild(),
			Schema: s,
			Ptr:    NewPointer(nil, g.IDRef(), sf.ID().Ref()),
		},
		{
			Name:   "FieldByItem not ok: sg != nil",
			Target: NewGroupList().NewID().SchemaGroup("aa").Groups([]*Group{g}).MustBuild(),
			Schema: s,
			Ptr:    NewPointer(sg.IDRef(), g.IDRef(), sf.ID().Ref()),
		},
		{
			Name:   "psg == nil",
			Target: nil,
			Schema: s,
			Ptr:    NewPointer(nil, g.IDRef(), sf.ID().Ref()),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res, ok := tt.Target.GetOrCreateField(tt.Schema, tt.Ptr)
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
			Schema:   NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups(NewSchemaGroupList([]*SchemaGroup{sg})).MustBuild(),
			Expected: g,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.GL.CreateAndAddListItem(tt.Schema, tt.Index)
			assert.Equal(t, tt.Expected.Fields(nil), res.Fields(nil))
			assert.Equal(t, tt.Expected.SchemaGroup(), res.SchemaGroup())
		})
	}
}

func TestGroupList_Clone(t *testing.T) {
	tests := []struct {
		name   string
		target *GroupList
		n      bool
	}{
		{
			name:   "ok",
			target: testGroupList1.Clone(),
		},
		{
			name: "nil",
			n:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res := tt.target.Clone()
			if tt.n {
				assert.Nil(t, res)
			} else {
				assert.Equal(t, tt.target, res)
				assert.NotSame(t, tt.target, res)
			}
		})
	}
}

func TestGroupList_CloneItem(t *testing.T) {
	tests := []struct {
		name   string
		target *GroupList
		n      bool
	}{
		{
			name:   "ok",
			target: testGroupList1.Clone(),
		},
		{
			name: "nil",
			n:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res := tt.target.CloneItem()
			if tt.n {
				assert.Nil(t, res)
			} else {
				assert.Equal(t, tt.target, res)
				assert.NotSame(t, tt.target, res)
			}
		})
	}
}

func TestGroupList_Fields(t *testing.T) {
	type args struct {
		p *Pointer
	}
	tests := []struct {
		name   string
		target *GroupList
		args   args
		want   []*Field
	}{
		{
			name:   "all",
			target: testGroupList1,
			args:   args{p: nil},
			want:   []*Field{testField2},
		},
		{
			name:   "specified",
			target: testGroupList1,
			args:   args{p: PointFieldOnly(testField2.Field())},
			want:   []*Field{testField2},
		},
		{
			name:   "not found",
			target: testGroupList1,
			args:   args{p: PointFieldOnly("xxxxxx")},
			want:   nil,
		},
		{
			name:   "empty",
			target: &GroupList{},
			args:   args{p: PointFieldOnly(testField2.Field())},
			want:   nil,
		},
		{
			name:   "nil",
			target: nil,
			args:   args{p: PointFieldOnly(testField2.Field())},
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.Fields(tt.args.p))
		})
	}
}

func TestGroupList_RemoveFields(t *testing.T) {
	type args struct {
		p *Pointer
	}
	tests := []struct {
		name       string
		target     *GroupList
		args       args
		want       bool
		wantFields []*Field
	}{
		{
			name:       "nil pointer",
			target:     testGroupList1.Clone(),
			args:       args{p: nil},
			want:       false,
			wantFields: []*Field{testField2},
		},
		{
			name:       "specified",
			target:     testGroupList1.Clone(),
			args:       args{p: PointFieldOnly(testField2.Field())},
			want:       true,
			wantFields: nil,
		},
		{
			name:       "specified schema group",
			target:     testGroupList1.Clone(),
			args:       args{p: PointItemBySchema(testGroupList1.SchemaGroup())},
			want:       false,
			wantFields: []*Field{testField2},
		},
		{
			name:       "specified item",
			target:     testGroupList1.Clone(),
			args:       args{p: PointItem(testGroupList1.ID())},
			want:       false,
			wantFields: []*Field{testField2},
		},
		{
			name:       "not found",
			target:     testGroupList1.Clone(),
			args:       args{p: PointFieldOnly("xxxxxx")},
			want:       false,
			wantFields: []*Field{testField2},
		},
		{
			name:       "empty",
			target:     &GroupList{},
			args:       args{p: PointFieldOnly(testField1.Field())},
			want:       false,
			wantFields: nil,
		},
		{
			name:       "nil",
			target:     nil,
			args:       args{p: PointFieldOnly(testField1.Field())},
			want:       false,
			wantFields: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.RemoveFields(tt.args.p))
			if tt.target != nil {
				assert.Equal(t, tt.wantFields, tt.target.Fields(nil))
			}
		})
	}
}

func TestGroupList_GroupAndFields(t *testing.T) {
	tests := []struct {
		name   string
		target *GroupList
		args   *Pointer
		want   []GroupAndField
	}{
		{
			name:   "all",
			target: testGroupList1,
			args:   nil,
			want: []GroupAndField{
				{ParentGroup: testGroupList1, Group: testGroup2, Field: testField2},
			},
		},
		{
			name:   "specified",
			target: testGroupList1,
			args:   PointFieldByItem(testGroup2.ID(), testField2.Field()),
			want: []GroupAndField{
				{ParentGroup: testGroupList1, Group: testGroup2, Field: testField2},
			},
		},
		{
			name:   "specified but not found",
			target: testGroupList1,
			args:   PointFieldByItem(testGroup1.ID(), testField2.Field()),
			want:   []GroupAndField{},
		},
		{
			name:   "empty",
			target: &GroupList{},
			args:   nil,
			want:   nil,
		},
		{
			name:   "nil",
			target: nil,
			args:   nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res := tt.target.GroupAndFields(tt.args)
			assert.Equal(t, tt.want, res)
			for i, r := range res {
				assert.Same(t, tt.want[i].Field, r.Field)
				assert.Same(t, tt.want[i].Group, r.Group)
				assert.Same(t, tt.want[i].ParentGroup, r.ParentGroup)
			}
		})
	}
}

func TestGroupList_GuessSchema(t *testing.T) {
	tests := []struct {
		name   string
		target *GroupList
		want   *SchemaGroup
	}{
		{
			name: "ok",
			target: &GroupList{
				itemBase: itemBase{
					SchemaGroup: "aa",
				},
				groups: []*Group{
					{
						itemBase: itemBase{
							SchemaGroup: "aa",
						},
						fields: []*Field{
							{field: "a", v: NewOptionalValue(ValueTypeLatLng, nil)},
						},
					},
					{
						itemBase: itemBase{
							SchemaGroup: "aa",
						},
						fields: []*Field{
							{field: "b", v: NewOptionalValue(ValueTypeString, nil)},
						},
					},
				},
			},
			want: &SchemaGroup{
				id:   "aa",
				list: true,
				fields: []*SchemaField{
					{id: "a", propertyType: ValueTypeLatLng},
					{id: "b", propertyType: ValueTypeString},
				},
			},
		},
		{
			name:   "empty",
			target: &GroupList{},
			want:   nil,
		},
		{
			name:   "nil",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.GuessSchema())
		})
	}
}
