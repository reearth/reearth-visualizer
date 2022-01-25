package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGroupListBuilder_Build(t *testing.T) {
	pid := NewItemID()
	groups := []*Group{NewGroup().ID(pid).MustBuild()}

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
				SchemaGroup: "aa",
				Groups:      groups,
			},
			Expected: &GroupList{
				itemBase: itemBase{
					ID:          pid,
					SchemaGroup: "aa",
				},
				groups: groups,
			},
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
	b := NewGroupList().NewID().MustBuild()
	assert.NotNil(t, b.ID())
}

func TestGroupListBuilder_MustBuild(t *testing.T) {
	pid := NewItemID()
	groups := []*Group{NewGroup().ID(pid).MustBuild()}

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
				SchemaGroup: "aa",
				Groups:      groups,
			},
			Expected: &GroupList{
				itemBase: itemBase{
					ID:          pid,
					SchemaGroup: "aa",
				},
				groups: groups,
			},
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
		ExpectedSG  SchemaGroupID
	}{
		{
			Name: "nil schema group",
		},
		{
			Name:        "success",
			SchemaGroup: NewSchemaGroup().ID("aa").MustBuild(),
			ExpectedSG:  "aa",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := InitGroupFrom(tc.SchemaGroup)
			assert.Equal(t, tc.ExpectedSG, res.SchemaGroup())
		})
	}
}
