package property

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGroupListBuilder_Build(t *testing.T) {
	pid := NewItemID()
	scid := MustSchemaID("xx~1.0.0/aa")
	groups := []*Group{NewGroup().ID(pid).MustBuild()}
	testCases := []struct {
		Name        string
		Id          ItemID
		Schema      SchemaID
		SchemaGroup SchemaGroupID
		Groups      []*Group
		Expected    struct {
			Id          ItemID
			Schema      SchemaID
			SchemaGroup SchemaGroupID
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
				Id          ItemID
				Schema      SchemaID
				SchemaGroup SchemaGroupID
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
			Err:  ErrInvalidID,
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
	pid := NewItemID()
	scid := MustSchemaID("xx~1.0.0/aa")
	groups := []*Group{NewGroup().ID(pid).MustBuild()}
	testCases := []struct {
		Name        string
		Fails       bool
		Id          ItemID
		Schema      SchemaID
		SchemaGroup SchemaGroupID
		Groups      []*Group
		Expected    struct {
			Id          ItemID
			Schema      SchemaID
			SchemaGroup SchemaGroupID
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
				Id          ItemID
				Schema      SchemaID
				SchemaGroup SchemaGroupID
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
		ExpectedSG     SchemaGroupID
		ExpectedSchema SchemaID
	}{
		{
			Name: "nil schema group",
		},
		{
			Name:           "success",
			SchemaGroup:    NewSchemaGroup().ID("aa").Schema(MustSchemaID("xx~1.0.0/aa")).MustBuild(),
			ExpectedSG:     "aa",
			ExpectedSchema: MustSchemaID("xx~1.0.0/aa"),
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
