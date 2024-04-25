package property

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

var (
	testGroup1 = NewGroup().NewID().SchemaGroup(testSchemaGroup1.ID()).Fields([]*Field{testField1}).MustBuild()
	testGroup2 = NewGroup().NewID().SchemaGroup(testSchemaGroup2.ID()).Fields([]*Field{testField2}).MustBuild()
)

func TestGroup_IDRef(t *testing.T) {
	id := NewItemID()
	assert.Nil(t, (*Group)(nil).IDRef())
	assert.Equal(t, &id, (&Group{
		itemBase: itemBase{
			ID: id,
		},
	}).IDRef())
}

func TestGroup_SchemaGroup(t *testing.T) {
	var g *Group
	assert.Nil(t, g.SchemaGroupRef())

	pfid := SchemaGroupID("aa")
	g = NewGroup().NewID().SchemaGroup(pfid).MustBuild()
	assert.Equal(t, pfid, g.SchemaGroup())
	assert.Equal(t, pfid.Ref(), g.SchemaGroupRef())
}

func TestGroup_HasLinkedField(t *testing.T) {
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	l := NewLink(NewDatasetID(), NewDatasetSchemaID(), NewDatasetFieldID())
	ls := NewLinks([]*Link{l})
	f := FieldFrom(sf).Value(OptionalValueFrom(v)).Links(ls).MustBuild()
	f2 := FieldFrom(sf).Value(OptionalValueFrom(v)).MustBuild()

	tests := []struct {
		Name     string
		Group    *Group
		Expected bool
	}{
		{
			Name:     "nil group",
			Group:    nil,
			Expected: false,
		},
		{
			Name:     "true",
			Group:    NewGroup().NewID().SchemaGroup("x").Fields([]*Field{f}).MustBuild(),
			Expected: true,
		},
		{
			Name:     "false",
			Group:    NewGroup().NewID().SchemaGroup("x").Fields([]*Field{f2}).MustBuild(),
			Expected: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.Group.HasLinkedField()
			assert.Equal(t, tt.Expected, res)
		})
	}
}
func TestGroup_IsDatasetLinked(t *testing.T) {
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	dsid := NewDatasetID()
	dssid := NewDatasetSchemaID()
	l := NewLink(dsid, dssid, NewDatasetFieldID())
	ls := NewLinks([]*Link{l})
	f := FieldFrom(sf).Value(OptionalValueFrom(v)).Links(ls).MustBuild()
	f2 := FieldFrom(sf).Value(OptionalValueFrom(v)).MustBuild()

	tests := []struct {
		Name          string
		Group         *Group
		DatasetSchema DatasetSchemaID
		Dataset       DatasetID
		Expected      bool
	}{
		{
			Name: "nil group",
		},
		{
			Name:          "true",
			Group:         NewGroup().NewID().SchemaGroup("x").Fields([]*Field{f}).MustBuild(),
			Dataset:       dsid,
			DatasetSchema: dssid,
			Expected:      true,
		},
		{
			Name:     "false",
			Group:    NewGroup().NewID().SchemaGroup("x").Fields([]*Field{f2}).MustBuild(),
			Expected: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.Group.IsDatasetLinked(tt.DatasetSchema, tt.Dataset)
			assert.Equal(t, tt.Expected, res)
		})
	}
}

func TestGroup_Datasets(t *testing.T) {
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	dsid := NewDatasetID()
	l := NewLink(dsid, NewDatasetSchemaID(), NewDatasetFieldID())
	ls := NewLinks([]*Link{l})
	f := FieldFrom(sf).Value(OptionalValueFrom(v)).Links(ls).MustBuild()

	tests := []struct {
		Name     string
		Group    *Group
		Expected []DatasetID
	}{
		{
			Name:     "nil group",
			Group:    nil,
			Expected: nil,
		},
		{
			Name:     "normal case",
			Group:    NewGroup().NewID().SchemaGroup("x").Fields([]*Field{f}).MustBuild(),
			Expected: []DatasetID{dsid},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.Group.Datasets()
			assert.Equal(t, tt.Expected, res)
		})
	}
}

func TestGroup_FieldsByLinkedDataset(t *testing.T) {
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	dsid := NewDatasetID()
	dssid := NewDatasetSchemaID()
	l := NewLink(dsid, dssid, NewDatasetFieldID())
	ls := NewLinks([]*Link{l})
	f := FieldFrom(sf).Value(OptionalValueFrom(v)).Links(ls).MustBuild()

	tests := []struct {
		Name          string
		Group         *Group
		DatasetSchema DatasetSchemaID
		DataSet       DatasetID
		Expected      []*Field
	}{
		{
			Name: "nil group",
		},
		{
			Name:          "normal case",
			DataSet:       dsid,
			DatasetSchema: dssid,
			Group:         NewGroup().NewID().SchemaGroup("x").Fields([]*Field{f}).MustBuild(),
			Expected:      []*Field{f},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.Group.FieldsByLinkedDataset(tt.DatasetSchema, tt.DataSet)
			assert.Equal(t, tt.Expected, res)
		})
	}
}

func TestGroup_IsEmpty(t *testing.T) {
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	f := FieldFrom(sf).Value(OptionalValueFrom(v)).MustBuild()
	f2 := FieldFrom(sf).MustBuild()

	tests := []struct {
		Name     string
		Group    *Group
		Expected bool
	}{

		{
			Name:     "true case",
			Group:    NewGroup().NewID().SchemaGroup("x").Fields([]*Field{f2}).MustBuild(),
			Expected: true,
		},
		{
			Name:     "false case",
			Group:    NewGroup().NewID().SchemaGroup("x").Fields([]*Field{f}).MustBuild(),
			Expected: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.Group.IsEmpty()
			assert.Equal(t, tt.Expected, res)
		})
	}
}

func TestGroup_Prune(t *testing.T) {
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	f := FieldFrom(sf).Value(OptionalValueFrom(v)).MustBuild()
	f2 := FieldFrom(sf).MustBuild()

	tests := []struct {
		Name     string
		Group    *Group
		Expected []*Field
	}{

		{
			Name: "nil group",
		},
		{
			Name:     "normal case",
			Group:    NewGroup().NewID().SchemaGroup("x").Fields([]*Field{f, f2}).MustBuild(),
			Expected: []*Field{f},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			tt.Group.Prune()
			assert.Equal(t, tt.Expected, tt.Group.Fields(nil))
		})
	}
}

func TestGroup_GetOrCreateField(t *testing.T) {
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	f := FieldFrom(sf).MustBuild()
	sg := NewSchemaGroup().ID("aa").Fields([]*SchemaField{sf}).MustBuild()

	tests := []struct {
		Name     string
		Group    *Group
		PS       *Schema
		FID      FieldID
		Expected struct {
			Field *Field
			Bool  bool
		}
	}{
		{
			Name: "nil group",
		},
		{
			Name:  "nil ps",
			Group: NewGroup().NewID().SchemaGroup("aa").MustBuild(),
		},
		{
			Name:  "group schema doesn't equal to ps",
			Group: NewGroup().NewID().SchemaGroup("aa").MustBuild(),
			PS:    NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups(NewSchemaGroupList([]*SchemaGroup{sg})).MustBuild(),
		},
		{
			Name:  "create field",
			Group: NewGroup().NewID().SchemaGroup("aa").MustBuild(),
			PS:    NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups(NewSchemaGroupList([]*SchemaGroup{sg})).MustBuild(),
			FID:   "aa",
			Expected: struct {
				Field *Field
				Bool  bool
			}{
				Field: FieldFrom(sf).MustBuild(),
				Bool:  true,
			},
		},
		{
			Name:  "get field",
			Group: NewGroup().NewID().SchemaGroup("aa").Fields([]*Field{f}).MustBuild(),
			PS:    NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups(NewSchemaGroupList([]*SchemaGroup{sg})).MustBuild(),
			FID:   "aa",
			Expected: struct {
				Field *Field
				Bool  bool
			}{
				Field: FieldFrom(sf).MustBuild(),
				Bool:  false,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res, b := tt.Group.GetOrCreateField(tt.PS, tt.FID)
			assert.Equal(t, tt.Expected.Field, res)
			assert.Equal(t, tt.Expected.Bool, b)
		})
	}
}

func TestGroup_RemoveField(t *testing.T) {
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	sf2 := NewSchemaField().ID("b").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	f := FieldFrom(sf).Value(OptionalValueFrom(v)).MustBuild()
	f2 := FieldFrom(sf2).MustBuild()

	tests := []struct {
		Name     string
		Group    *Group
		Input    FieldID
		Expected []*Field
	}{
		{
			Name: "nil group",
		},
		{
			Name:     "normal case",
			Input:    "b",
			Group:    NewGroup().NewID().SchemaGroup("x").Fields([]*Field{f, f2}).MustBuild(),
			Expected: []*Field{f},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			tt.Group.RemoveField(tt.Input)
			assert.Equal(t, tt.Expected, tt.Group.Fields(nil))
		})
	}
}

func TestGroup_FieldIDs(t *testing.T) {
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	sf2 := NewSchemaField().ID("b").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	f := FieldFrom(sf).Value(OptionalValueFrom(v)).MustBuild()
	f2 := FieldFrom(sf2).MustBuild()

	tests := []struct {
		Name     string
		Group    *Group
		Expected []FieldID
	}{
		{
			Name: "nil group",
		},
		{
			Name:     "normal case",
			Group:    NewGroup().NewID().SchemaGroup("x").Fields([]*Field{f, f2}).MustBuild(),
			Expected: []FieldID{"a", "b"},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.Group.FieldIDs()
			assert.Equal(t, tt.Expected, res)
		})
	}
}

func TestGroup_Field(t *testing.T) {
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	sf2 := NewSchemaField().ID("b").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	f := FieldFrom(sf).Value(OptionalValueFrom(v)).MustBuild()
	f2 := FieldFrom(sf2).MustBuild()

	tests := []struct {
		Name     string
		Group    *Group
		Input    FieldID
		Expected *Field
	}{
		{
			Name: "nil group",
		},
		{
			Name:     "normal case",
			Group:    NewGroup().NewID().SchemaGroup("x").Fields([]*Field{f, f2}).MustBuild(),
			Input:    "a",
			Expected: f,
		},
		{
			Name:     "normal case",
			Group:    NewGroup().NewID().SchemaGroup("x").Fields([]*Field{f, f2}).MustBuild(),
			Input:    "x",
			Expected: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.Group.Field(tt.Input)
			assert.Equal(t, tt.Expected, res)
		})
	}
}

func TestGroup_RepresentativeFieldValue(t *testing.T) {
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aa").
		Fields([]*SchemaField{sf}).
		RepresentativeField(FieldID("aa").Ref()).
		MustBuild()
	sg2 := NewSchemaGroup().
		ID("bb").
		Fields([]*SchemaField{sf}).
		MustBuild()

	type args struct {
		Schema *Schema
		Value  *Value
	}

	tests := []struct {
		Name     string
		Args     args
		Group    *Group
		FieldID  FieldID
		Expected *Field
	}{
		{
			Name: "nil group",
		},
		{
			Name:  "nil ps",
			Group: NewGroup().NewID().SchemaGroup("aa").MustBuild(),
		},
		{
			Name:  "invalid property field",
			Group: NewGroup().NewID().SchemaGroup("aa").MustBuild(),
			Args: args{
				Schema: NewSchema().ID(MustSchemaID("xx~1.0.0/bb")).Groups(NewSchemaGroupList([]*SchemaGroup{sg2})).MustBuild(),
				Value:  ValueTypeString.ValueFrom("abc"),
			},
		},
		{
			Name:  "ok",
			Group: NewGroup().NewID().SchemaGroup("aa").MustBuild(),
			Args: args{
				Schema: NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups(NewSchemaGroupList([]*SchemaGroup{sg})).MustBuild(),
				Value:  ValueTypeString.ValueFrom("abc"),
			},
			Expected: &Field{field: "aa", v: &OptionalValue{ov: *value.NewOptional(value.TypeString, nil)}},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.Expected, tt.Group.RepresentativeField(tt.Args.Schema))
		})
	}
}
