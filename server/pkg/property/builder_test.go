package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestBuilder_New(t *testing.T) {
	b := New()
	assert.NotNil(t, b)
}

func TestBuilder_ID(t *testing.T) {
	pid := NewID()
	p := New().ID(pid).Scene(NewSceneID()).Schema(MustSchemaID("xxx~1.1.1/aa")).MustBuild()
	assert.Equal(t, pid, p.ID())
}

func TestBuilder_NewID(t *testing.T) {
	p := New().NewID().Scene(NewSceneID()).Schema(MustSchemaID("xxx~1.1.1/aa")).MustBuild()
	assert.False(t, p.ID().IsEmpty())
}

func TestBuilder_Schema(t *testing.T) {
	p := New().NewID().Scene(NewSceneID()).Schema(MustSchemaID("xxx~1.1.1/aa")).MustBuild()
	assert.Equal(t, MustSchemaID("xxx~1.1.1/aa"), p.Schema())
}

func TestBuilder_Scene(t *testing.T) {
	sid := NewSceneID()
	p := New().NewID().Scene(sid).Schema(MustSchemaID("xxx~1.1.1/aa")).MustBuild()
	assert.Equal(t, sid, p.Scene())
}

func TestBuilder_Items(t *testing.T) {
	iid := NewItemID()
	propertySchemaField1ID := FieldID("a")
	propertySchemaGroup1ID := SchemaGroupID("A")

	tests := []struct {
		Name            string
		Input, Expected []Item
	}{
		{
			Name:     "has nil item",
			Input:    []Item{nil},
			Expected: []Item{},
		},
		{
			Name: "has duplicated item",
			Input: []Item{
				NewGroup().ID(iid).SchemaGroup(propertySchemaGroup1ID).
					Fields([]*Field{
						NewField(propertySchemaField1ID).
							Value(OptionalValueFrom(ValueTypeString.ValueFrom("xxx"))).
							MustBuild(),
					}).MustBuild(),
				NewGroup().ID(iid).SchemaGroup(propertySchemaGroup1ID).
					Fields([]*Field{
						NewField(propertySchemaField1ID).
							Value(OptionalValueFrom(ValueTypeString.ValueFrom("xxx"))).
							MustBuild(),
					}).MustBuild(),
			},
			Expected: []Item{NewGroup().ID(iid).SchemaGroup(propertySchemaGroup1ID).
				Fields([]*Field{
					NewField(propertySchemaField1ID).
						Value(OptionalValueFrom(ValueTypeString.ValueFrom("xxx"))).
						MustBuild(),
				}).MustBuild()},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := New().NewID().
				Scene(NewSceneID()).
				Schema(MustSchemaID("xxx~1.1.1/aa")).
				Items(tt.Input).
				MustBuild()
			assert.Equal(t, tt.Expected, res.Items())
		})
	}
}

func TestBuilder_Build(t *testing.T) {
	pid := NewID()
	sid := NewSceneID()
	scid := MustSchemaID("xxx~1.1.1/aa")
	iid := NewItemID()
	propertySchemaField1ID := FieldID("a")
	propertySchemaGroup1ID := SchemaGroupID("A")

	type args struct {
		ID     ID
		Scene  SceneID
		Schema SchemaID
		Items  []Item
	}

	tests := []struct {
		Name     string
		Args     args
		Err      error
		Expected *Property
	}{
		{
			Name: "success",
			Args: args{
				ID:     pid,
				Scene:  sid,
				Schema: scid,
				Items: []Item{
					&Group{
						itemBase: itemBase{
							ID:          iid,
							SchemaGroup: propertySchemaGroup1ID,
						},
						fields: []*Field{
							{
								field: propertySchemaField1ID,
								v:     OptionalValueFrom(ValueTypeString.ValueFrom("xxx")),
							},
						},
					},
				},
			},
			Expected: &Property{
				id:     pid,
				scene:  sid,
				schema: scid,
				items: []Item{
					&Group{
						itemBase: itemBase{
							ID:          iid,
							SchemaGroup: propertySchemaGroup1ID,
						},
						fields: []*Field{
							{
								field: propertySchemaField1ID,
								v:     OptionalValueFrom(ValueTypeString.ValueFrom("xxx")),
							},
						},
					},
				},
			},
		},
		{
			Name: "fail invalid id",
			Args: args{
				ID: ID{},
			},
			Err: ErrInvalidID,
		},
		{
			Name: "fail invalid scene",
			Args: args{
				ID: pid,
			},
			Err: ErrInvalidSceneID,
		},
		{
			Name: "fail invalid schema",
			Args: args{
				ID:    pid,
				Scene: sid,
			},
			Err: ErrInvalidPropertySchemaID,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res, err := New().
				ID(tt.Args.ID).
				Items(tt.Args.Items).
				Scene(tt.Args.Scene).
				Schema(tt.Args.Schema).
				Build()
			if tt.Err == nil {
				assert.Nil(t, err)
				assert.Equal(t, tt.Expected, res)
			} else {
				assert.Nil(t, res)
				assert.Equal(t, tt.Err, err)
			}
		})
	}
}
