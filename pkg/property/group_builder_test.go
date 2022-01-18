package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGroupBuilder_Build(t *testing.T) {
	iid := NewItemID()
	sid := MustSchemaID("xx~1.0.0/aa")
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	f := NewField(sf).Value(OptionalValueFrom(v)).MustBuild()

	type args struct {
		ID          ItemID
		Schema      SchemaID
		SchemaGroup SchemaGroupID
		Fields      []*Field
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Group
		Err      error
	}{
		{
			Name: "fail invalid id",
			Err:  ErrInvalidID,
		},
		{
			Name: "success",
			Args: args{
				ID:          iid,
				Schema:      sid,
				SchemaGroup: "a",
				Fields:      []*Field{f},
			},
			Expected: &Group{
				itemBase: itemBase{
					ID:          iid,
					Schema:      sid,
					SchemaGroup: "a",
				},
				fields: []*Field{f},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res, err := NewGroup().
				ID(tt.Args.ID).
				Fields(tt.Args.Fields).
				Schema(tt.Args.Schema, tt.Args.SchemaGroup).
				Build()
			if tt.Err == nil {
				assert.Equal(t, tt.Expected, res)
			} else {
				assert.Equal(t, tt.Err, err)
			}
		})
	}
}

func TestGroupBuilder_MustBuild(t *testing.T) {
	iid := NewItemID()
	sid := MustSchemaID("xx~1.0.0/aa")
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	f := NewField(sf).Value(OptionalValueFrom(v)).MustBuild()

	type args struct {
		ID          ItemID
		Schema      SchemaID
		SchemaGroup SchemaGroupID
		Fields      []*Field
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Group
		Err      error
	}{
		{
			Name: "fail invalid id",
			Err:  ErrInvalidID,
		},
		{
			Name: "success",
			Args: args{
				ID:          iid,
				Schema:      sid,
				SchemaGroup: "a",
				Fields:      []*Field{f},
			},
			Expected: &Group{
				itemBase: itemBase{
					ID:          iid,
					Schema:      sid,
					SchemaGroup: "a",
				},
				fields: []*Field{f},
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()

			build := func() *Group {
				t.Helper()
				return NewGroup().
					ID(tt.Args.ID).
					Fields(tt.Args.Fields).
					Schema(tt.Args.Schema, tt.Args.SchemaGroup).
					MustBuild()
			}

			if tt.Err != nil {
				assert.PanicsWithValue(t, tt.Err, func() { _ = build() })
			} else {
				assert.Equal(t, tt.Expected, build())
			}
		})
	}
}

func TestGroupBuilder_NewID(t *testing.T) {
	g := NewGroup().NewID().MustBuild()
	assert.False(t, g.ID().IsNil())
}

func TestGroupBuilder_InitGroupFrom(t *testing.T) {
	var sg *SchemaGroup
	assert.Nil(t, InitGroupFrom(sg))
	sg = NewSchemaGroup().ID("a").Schema(MustSchemaID("xx~1.0.0/aa")).MustBuild()
	g := InitGroupFrom(sg)
	assert.Equal(t, sg.ID(), g.SchemaGroup())
	assert.Equal(t, sg.Schema(), g.Schema())
}
