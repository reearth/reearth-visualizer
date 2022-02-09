package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGroupListBuilder_Build(t *testing.T) {
	pid := NewItemID()
	groups := []*Group{NewGroup().ID(pid).SchemaGroup("x").MustBuild()}

	type args struct {
		ID          ItemID
		SchemaGroup SchemaGroupID
		Groups      []*Group
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *GroupList
		Err      error
	}{
		{
			Name: "success",
			Args: args{
				ID:          pid,
				SchemaGroup: "x",
				Groups:      groups,
			},
			Expected: &GroupList{
				itemBase: itemBase{
					ID:          pid,
					SchemaGroup: "x",
				},
				groups: groups,
			},
		},
		{
			Name: "fail invalid group",
			Args: args{
				ID:          pid,
				SchemaGroup: "aa",
				Groups:      groups,
			},
			Err: ErrInvalidGroupInGroupList,
		},
		{
			Name: "fail invalid id",
			Err:  ErrInvalidID,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res, err := NewGroupList().
				ID(tt.Args.ID).
				SchemaGroup(tt.Args.SchemaGroup).
				Groups(tt.Args.Groups).
				Build()
			if tt.Err == nil {
				assert.Equal(t, tt.Expected, res)
			} else {
				assert.Equal(t, tt.Err, err)
			}
		})
	}
}

func TestGroupListBuilder_NewID(t *testing.T) {
	b := NewGroupList().NewID().SchemaGroup("x").MustBuild()
	assert.NotNil(t, b.ID())
}

func TestGroupListBuilder_MustBuild(t *testing.T) {
	pid := NewItemID()
	groups := []*Group{NewGroup().ID(pid).SchemaGroup("x").MustBuild()}

	type args struct {
		ID          ItemID
		SchemaGroup SchemaGroupID
		Groups      []*Group
	}

	tests := []struct {
		Name     string
		Args     args
		Err      error
		Expected *GroupList
	}{
		{
			Name: "success",
			Args: args{
				ID:          pid,
				SchemaGroup: "x",
				Groups:      groups,
			},
			Expected: &GroupList{
				itemBase: itemBase{
					ID:          pid,
					SchemaGroup: "x",
				},
				groups: groups,
			},
		},
		{
			Name: "fail invalid group",
			Args: args{
				ID:          pid,
				SchemaGroup: "aa",
				Groups:      groups,
			},
			Err: ErrInvalidGroupInGroupList,
		},
		{
			Name: "fail invalid id",
			Err:  ErrInvalidID,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			build := func() *GroupList {
				t.Helper()
				return NewGroupList().
					ID(tc.Args.ID).
					SchemaGroup(tc.Args.SchemaGroup).
					Groups(tc.Args.Groups).
					MustBuild()
			}

			if tc.Err != nil {
				assert.PanicsWithValue(t, tc.Err, func() { _ = build() })
			} else {
				assert.Equal(t, tc.Expected, build())
			}
		})
	}
}

func TestInitGroupListFrom(t *testing.T) {
	tests := []struct {
		Name        string
		SchemaGroup *SchemaGroup
		Expected    SchemaGroupID
	}{
		{
			Name: "nil schema group",
		},
		{
			Name:        "success",
			SchemaGroup: NewSchemaGroup().ID("aa").MustBuild(),
			Expected:    "aa",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := InitGroupFrom(tc.SchemaGroup)
			if tc.Expected != "" {
				assert.Equal(t, tc.Expected, res.SchemaGroup())
			} else {
				assert.Nil(t, res)
			}
		})
	}
}
