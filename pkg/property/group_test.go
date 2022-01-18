package property

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestGroup_IDRef(t *testing.T) {
	gid := NewItemID()
	var g *Group
	assert.Nil(t, g.IDRef())
	g = NewGroup().ID(gid).MustBuild()
	assert.Equal(t, gid.Ref(), g.IDRef())
}

func TestGroup_SchemaGroup(t *testing.T) {
	var g *Group
	assert.Nil(t, g.SchemaGroupRef())
	assert.Equal(t, SchemaGroupID(""), g.SchemaGroup())
	pfid := SchemaGroupID("aa")
	g = NewGroup().NewID().Schema(MustSchemaID("xx~1.0.0/aa"), pfid).MustBuild()
	assert.Equal(t, pfid, g.SchemaGroup())
	assert.Equal(t, pfid.Ref(), g.SchemaGroupRef())
}

func TestGroup_HasLinkedField(t *testing.T) {
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	l := NewLink(NewDatasetID(), NewDatasetSchemaID(), NewDatasetFieldID())
	ls := NewLinks([]*Link{l})
	f := NewField(sf).Value(OptionalValueFrom(v)).Link(ls).MustBuild()
	f2 := NewField(sf).Value(OptionalValueFrom(v)).MustBuild()

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
			Group:    NewGroup().NewID().Fields([]*Field{f}).MustBuild(),
			Expected: true,
		},
		{
			Name:     "false",
			Group:    NewGroup().NewID().Fields([]*Field{f2}).MustBuild(),
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
	f := NewField(sf).Value(OptionalValueFrom(v)).Link(ls).MustBuild()
	f2 := NewField(sf).Value(OptionalValueFrom(v)).MustBuild()

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
			Group:         NewGroup().NewID().Fields([]*Field{f}).MustBuild(),
			Dataset:       dsid,
			DatasetSchema: dssid,
			Expected:      true,
		},
		{
			Name:     "false",
			Group:    NewGroup().NewID().Fields([]*Field{f2}).MustBuild(),
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

func TestGroup_CollectDatasets(t *testing.T) {
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	dsid := NewDatasetID()
	l := NewLink(dsid, NewDatasetSchemaID(), NewDatasetFieldID())
	ls := NewLinks([]*Link{l})
	f := NewField(sf).Value(OptionalValueFrom(v)).Link(ls).MustBuild()

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
			Group:    NewGroup().NewID().Fields([]*Field{f}).MustBuild(),
			Expected: []DatasetID{dsid},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.Group.CollectDatasets()
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
	f := NewField(sf).Value(OptionalValueFrom(v)).Link(ls).MustBuild()

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
			Group:         NewGroup().NewID().Fields([]*Field{f}).MustBuild(),
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
	f := NewField(sf).Value(OptionalValueFrom(v)).MustBuild()
	f2 := NewField(sf).MustBuild()

	tests := []struct {
		Name     string
		Group    *Group
		Expected bool
	}{

		{
			Name:     "true case",
			Group:    NewGroup().NewID().Fields([]*Field{f2}).MustBuild(),
			Expected: true,
		},
		{
			Name:     "false case",
			Group:    NewGroup().NewID().Fields([]*Field{f}).MustBuild(),
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
	f := NewField(sf).Value(OptionalValueFrom(v)).MustBuild()
	f2 := NewField(sf).MustBuild()

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
			Group:    NewGroup().NewID().Fields([]*Field{f, f2}).MustBuild(),
			Expected: []*Field{f},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			tt.Group.Prune()
			assert.Equal(t, tt.Expected, tt.Group.Fields())
		})
	}
}

func TestGroup_GetOrCreateField(t *testing.T) {
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	f := NewField(sf).MustBuild()
	sg := NewSchemaGroup().ID("aa").Schema(MustSchemaID("xx~1.0.0/aa")).Fields([]*SchemaField{sf}).MustBuild()

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
			Group: NewGroup().NewID().Schema(MustSchemaID("xx~1.0.0/aa"), "aa").MustBuild(),
		},
		{
			Name:  "group schema doesn't equal to ps",
			Group: NewGroup().NewID().Schema(MustSchemaID("xx~1.0.0/aaa"), "aa").MustBuild(),
			PS:    NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups([]*SchemaGroup{sg}).MustBuild(),
		},
		{
			Name:  "create field",
			Group: NewGroup().NewID().Schema(MustSchemaID("xx~1.0.0/aa"), "aa").MustBuild(),
			PS:    NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups([]*SchemaGroup{sg}).MustBuild(),
			FID:   "aa",
			Expected: struct {
				Field *Field
				Bool  bool
			}{
				Field: NewField(sf).MustBuild(),
				Bool:  true,
			},
		},
		{
			Name:  "get field",
			Group: NewGroup().NewID().Schema(MustSchemaID("xx~1.0.0/aa"), "aa").Fields([]*Field{f}).MustBuild(),
			PS:    NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups([]*SchemaGroup{sg}).MustBuild(),
			FID:   "aa",
			Expected: struct {
				Field *Field
				Bool  bool
			}{
				Field: NewField(sf).MustBuild(),
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
	f := NewField(sf).Value(OptionalValueFrom(v)).MustBuild()
	f2 := NewField(sf2).MustBuild()

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
			Group:    NewGroup().NewID().Fields([]*Field{f, f2}).MustBuild(),
			Expected: []*Field{f},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			tt.Group.RemoveField(tt.Input)
			assert.Equal(t, tt.Expected, tt.Group.Fields())
		})
	}
}

func TestGroup_FieldIDs(t *testing.T) {
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	sf2 := NewSchemaField().ID("b").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	f := NewField(sf).Value(OptionalValueFrom(v)).MustBuild()
	f2 := NewField(sf2).MustBuild()

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
			Group:    NewGroup().NewID().Fields([]*Field{f, f2}).MustBuild(),
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
	f := NewField(sf).Value(OptionalValueFrom(v)).MustBuild()
	f2 := NewField(sf2).MustBuild()

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
			Group:    NewGroup().NewID().Fields([]*Field{f, f2}).MustBuild(),
			Input:    "a",
			Expected: f,
		},
		{
			Name:     "normal case",
			Group:    NewGroup().NewID().Fields([]*Field{f, f2}).MustBuild(),
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

func TestGroup_UpdateRepresentativeFieldValue(t *testing.T) {
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aa").
		Schema(MustSchemaID("xx~1.0.0/aa")).
		Fields([]*SchemaField{sf}).
		RepresentativeField(FieldID("aa").Ref()).
		MustBuild()
	sg2 := NewSchemaGroup().
		ID("bb").
		Schema(MustSchemaID("xx~1.0.0/bb")).
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
			Group: NewGroup().NewID().Schema(MustSchemaID("xx~1.0.0/aa"), "aa").MustBuild(),
		},
		{
			Name:  "group schema doesn't equal to ps",
			Group: NewGroup().NewID().Schema(MustSchemaID("xx~1.0.0/aaa"), "aa").MustBuild(),
			Args: args{
				Schema: NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups([]*SchemaGroup{sg}).MustBuild(),
			},
		},
		{
			Name:  "invalid property field",
			Group: NewGroup().NewID().Schema(MustSchemaID("xx~1.0.0/aa"), "aa").MustBuild(),
			Args: args{
				Schema: NewSchema().ID(MustSchemaID("xx~1.0.0/bb")).Groups([]*SchemaGroup{sg2}).MustBuild(),
				Value:  ValueTypeString.ValueFrom("abc"),
			},
		},
		{
			Name:  "ok",
			Group: NewGroup().NewID().Schema(MustSchemaID("xx~1.0.0/aa"), "aa").MustBuild(),
			Args: args{
				Schema: NewSchema().ID(MustSchemaID("xx~1.0.0/aa")).Groups([]*SchemaGroup{sg}).MustBuild(),
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
