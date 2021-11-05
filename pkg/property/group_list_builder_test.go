package property

import (
	"errors"
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestGroupListBuilder_Build(t *testing.T) {
	pid := id.NewPropertyItemID()
	scid := id.MustPropertySchemaID("xx~1.0.0/aa")
	groups := []*Group{NewGroup().ID(pid).MustBuild()}
	testCases := []struct {
		Name        string
		Id          id.PropertyItemID
		Schema      id.PropertySchemaID
		SchemaGroup id.PropertySchemaGroupID
		Groups      []*Group
		Expected    struct {
			Id          id.PropertyItemID
			Schema      id.PropertySchemaID
			SchemaGroup id.PropertySchemaGroupID
			Groups      []*Group
		}
		Err error
	}{
		{
			Name:        "success",
			Id:          pid,
			Schema:      scid,
			SchemaGroup: "aa",
			Groups:      groups,
			Expected: struct {
				Id          id.PropertyItemID
				Schema      id.PropertySchemaID
				SchemaGroup id.PropertySchemaGroupID
				Groups      []*Group
			}{
				Id:          pid,
				Schema:      scid,
				SchemaGroup: "aa",
				Groups:      groups,
			},
		},
		{
			Name: "fail invalid id",
			Err:  id.ErrInvalidID,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, err := NewGroupList().ID(tc.Id).Schema(tc.Schema, tc.SchemaGroup).Groups(tc.Groups).Build()
			if err == nil {
				assert.Equal(tt, tc.Expected.Id, res.ID())
				assert.Equal(tt, tc.Expected.SchemaGroup, res.SchemaGroup())
				assert.Equal(tt, tc.Expected.Schema, res.Schema())
				assert.Equal(tt, tc.Expected.Groups, res.Groups())
			} else {
				assert.True(tt, errors.As(tc.Err, &err))
			}
		})
	}
}

func TestGroupListBuilder_NewID(t *testing.T) {
	b := NewGroupList().NewID().MustBuild()
	assert.NotNil(t, b.ID())
}

func TestGroupListBuilder_MustBuild(t *testing.T) {
	pid := id.NewPropertyItemID()
	scid := id.MustPropertySchemaID("xx~1.0.0/aa")
	groups := []*Group{NewGroup().ID(pid).MustBuild()}
	testCases := []struct {
		Name        string
		Fails       bool
		Id          id.PropertyItemID
		Schema      id.PropertySchemaID
		SchemaGroup id.PropertySchemaGroupID
		Groups      []*Group
		Expected    struct {
			Id          id.PropertyItemID
			Schema      id.PropertySchemaID
			SchemaGroup id.PropertySchemaGroupID
			Groups      []*Group
		}
	}{
		{
			Name:        "success",
			Id:          pid,
			Schema:      scid,
			SchemaGroup: "aa",
			Groups:      groups,
			Expected: struct {
				Id          id.PropertyItemID
				Schema      id.PropertySchemaID
				SchemaGroup id.PropertySchemaGroupID
				Groups      []*Group
			}{
				Id:          pid,
				Schema:      scid,
				SchemaGroup: "aa",
				Groups:      groups,
			},
		},
		{
			Name:  "fail invalid id",
			Fails: true,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			var res *GroupList
			if tc.Fails {
				defer func() {
					if r := recover(); r != nil {
						assert.Nil(tt, res)
					}
				}()
				res = NewGroupList().ID(tc.Id).Schema(tc.Schema, tc.SchemaGroup).Groups(tc.Groups).MustBuild()
			} else {
				res = NewGroupList().ID(tc.Id).Schema(tc.Schema, tc.SchemaGroup).Groups(tc.Groups).MustBuild()
				assert.Equal(tt, tc.Expected.Id, res.ID())
				assert.Equal(tt, tc.Expected.SchemaGroup, res.SchemaGroup())
				assert.Equal(tt, tc.Expected.Schema, res.Schema())
				assert.Equal(tt, tc.Expected.Groups, res.Groups())
			}

		})
	}
}

func TestInitGroupListFrom(t *testing.T) {
	testCases := []struct {
		Name           string
		SchemaGroup    *SchemaGroup
		ExpectedSG     id.PropertySchemaGroupID
		ExpectedSchema id.PropertySchemaID
	}{
		{
			Name: "nil schema group",
		},
		{
			Name:           "success",
			SchemaGroup:    NewSchemaGroup().ID("aa").Schema(id.MustPropertySchemaID("xx~1.0.0/aa")).MustBuild(),
			ExpectedSG:     "aa",
			ExpectedSchema: id.MustPropertySchemaID("xx~1.0.0/aa"),
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := InitGroupFrom(tc.SchemaGroup)
			assert.Equal(tt, tc.ExpectedSG, res.SchemaGroup())
			assert.Equal(tt, tc.ExpectedSchema, res.Schema())
		})
	}
}
