package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGroupBuilder_Build(t *testing.T) {
	iid := NewItemID()
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	f := FieldFrom(sf).Value(OptionalValueFrom(v)).MustBuild()

	type args struct {
		ID          ItemID
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
				SchemaGroup: "a",
				Fields:      []*Field{f},
			},
			Expected: &Group{
				itemBase: itemBase{
					ID:          iid,
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
				SchemaGroup(tt.Args.SchemaGroup).
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
	sf := NewSchemaField().ID("a").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	f := FieldFrom(sf).Value(OptionalValueFrom(v)).MustBuild()

	type args struct {
		ID          ItemID
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
				SchemaGroup: "a",
				Fields:      []*Field{f},
			},
			Expected: &Group{
				itemBase: itemBase{
					ID:          iid,
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
					SchemaGroup(tt.Args.SchemaGroup).
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
	g := NewGroup().NewID().SchemaGroup("x").MustBuild()
	assert.False(t, g.ID().IsEmpty())
}

func TestGroupBuilder_InitGroupFrom(t *testing.T) {
	var sg *SchemaGroup
	assert.Nil(t, InitGroupFrom(sg))
	sg = NewSchemaGroup().ID("a").MustBuild()
	g := InitGroupFrom(sg)
	assert.Equal(t, sg.ID(), g.SchemaGroup())
}
