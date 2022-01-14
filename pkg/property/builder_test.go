package property

import (
	"errors"
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
	assert.False(t, p.ID().IsNil())
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
	propertySchemaID := MustSchemaID("xxx~1.1.1/aa")
	propertySchemaField1ID := FieldID("a")
	propertySchemaGroup1ID := SchemaGroupID("A")

	testCases := []struct {
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
				NewGroup().ID(iid).Schema(propertySchemaID, propertySchemaGroup1ID).
					Fields([]*Field{
						NewFieldUnsafe().
							FieldUnsafe(propertySchemaField1ID).
							ValueUnsafe(OptionalValueFrom(ValueTypeString.ValueFrom("xxx"))).
							Build(),
					}).MustBuild(),
				NewGroup().ID(iid).Schema(propertySchemaID, propertySchemaGroup1ID).
					Fields([]*Field{
						NewFieldUnsafe().
							FieldUnsafe(propertySchemaField1ID).
							ValueUnsafe(OptionalValueFrom(ValueTypeString.ValueFrom("xxx"))).
							Build(),
					}).MustBuild(),
			},
			Expected: []Item{NewGroup().ID(iid).Schema(propertySchemaID, propertySchemaGroup1ID).
				Fields([]*Field{
					NewFieldUnsafe().
						FieldUnsafe(propertySchemaField1ID).
						ValueUnsafe(OptionalValueFrom(ValueTypeString.ValueFrom("xxx"))).
						Build(),
				}).MustBuild()},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := New().NewID().
				Scene(NewSceneID()).
				Schema(MustSchemaID("xxx~1.1.1/aa")).
				Items(tc.Input).
				MustBuild()
			assert.Equal(tt, tc.Expected, res.Items())
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

	testCases := []struct {
		Name     string
		Id       ID
		Scene    SceneID
		Schema   SchemaID
		Items    []Item
		Err      error
		Expected struct {
			Id     ID
			Scene  SceneID
			Schema SchemaID
			Items  []Item
		}
	}{
		{
			Name:   "success",
			Id:     pid,
			Scene:  sid,
			Schema: scid,
			Items: []Item{
				NewGroup().ID(iid).Schema(scid, propertySchemaGroup1ID).
					Fields([]*Field{
						NewFieldUnsafe().
							FieldUnsafe(propertySchemaField1ID).
							ValueUnsafe(OptionalValueFrom(ValueTypeString.ValueFrom("xxx"))).
							Build(),
					}).MustBuild()},
			Expected: struct {
				Id     ID
				Scene  SceneID
				Schema SchemaID
				Items  []Item
			}{
				Id:     pid,
				Scene:  sid,
				Schema: scid,
				Items: []Item{
					NewGroup().ID(iid).Schema(scid, propertySchemaGroup1ID).
						Fields([]*Field{
							NewFieldUnsafe().
								FieldUnsafe(propertySchemaField1ID).
								ValueUnsafe(OptionalValueFrom(ValueTypeString.ValueFrom("xxx"))).
								Build(),
						}).MustBuild()},
			},
		},
		{
			Name:  "fail invalid id",
			Id:    ID{},
			Items: nil,
			Err:   ErrInvalidID,
		},
		{
			Name:  "fail invalid scene",
			Id:    pid,
			Items: nil,
			Err:   ErrInvalidSceneID,
		},
		{
			Name:  "fail invalid schema",
			Id:    pid,
			Scene: sid,
			Items: nil,
			Err:   ErrInvalidPropertySchemaID,
		},
		{
			Name:   "fail invalid item",
			Id:     pid,
			Scene:  sid,
			Schema: scid,
			Items: []Item{
				NewGroup().ID(iid).Schema(MustSchemaID("zzz~1.1.1/aa"), propertySchemaGroup1ID).
					Fields([]*Field{
						NewFieldUnsafe().
							FieldUnsafe(propertySchemaField1ID).
							ValueUnsafe(OptionalValueFrom(ValueTypeString.ValueFrom("xxx"))).
							Build(),
					}).MustBuild()},
			Err: ErrInvalidItem,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, err := New().ID(tc.Id).Items(tc.Items).Scene(tc.Scene).Schema(tc.Schema).Build()
			if err == nil {
				assert.Equal(tt, tc.Expected.Id, res.ID())
				assert.Equal(tt, tc.Expected.Schema, res.Schema())
				assert.Equal(tt, tc.Expected.Items, res.Items())
				assert.Equal(tt, tc.Expected.Scene, res.Scene())
			} else {
				assert.True(tt, errors.As(tc.Err, &err))
			}
		})
	}
}
