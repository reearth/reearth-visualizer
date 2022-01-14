package user

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTeamBuilder_ID(t *testing.T) {
	tid := NewTeamID()
	tm := NewTeam().ID(tid).MustBuild()
	assert.Equal(t, tid, tm.ID())
}

func TestTeamBuilder_Members(t *testing.T) {
	m := map[ID]Role{NewID(): RoleOwner}
	tm := NewTeam().NewID().Members(m).MustBuild()
	assert.Equal(t, m, tm.Members().Members())
}

func TestTeamBuilder_Personal(t *testing.T) {
	tm := NewTeam().NewID().Personal(true).MustBuild()
	assert.True(t, tm.IsPersonal())
}

func TestTeamBuilder_Name(t *testing.T) {
	tm := NewTeam().NewID().Name("xxx").MustBuild()
	assert.Equal(t, "xxx", tm.Name())
}

func TestTeamBuilder_NewID(t *testing.T) {
	tm := NewTeam().NewID().MustBuild()
	assert.NotNil(t, tm.ID())
}

func TestTeamBuilder_Build(t *testing.T) {
	tid := NewTeamID()
	testCases := []struct {
		Name, UserName string
		TID            TeamID
		Personal       bool
		Members        map[ID]Role
		Expected       *Team
		err            error
	}{
		{
			Name:     "success create team",
			UserName: "xxx",
			TID:      tid,
			Personal: true,
			Expected: NewTeam().ID(tid).Members(map[ID]Role{NewID(): RoleOwner}).Personal(true).Name("xxx").MustBuild(),
			err:      nil,
		}, {
			Name:     "success create team with nil members",
			UserName: "xxx",
			Members:  nil,
			Expected: NewTeam().ID(tid).MustBuild(),
			err:      nil,
		},
		{
			Name:     "fail invalid id",
			Expected: nil,
			err:      ErrInvalidID,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, err := NewTeam().ID(tc.TID).Members(tc.Members).Personal(tc.Personal).Name(tc.UserName).Build()
			if err == nil {
				assert.Equal(tt, tc.Expected, res)
			} else {
				assert.True(tt, errors.As(tc.err, &err))
			}
		})
	}
}

func TestTeamBuilder_MustBuild(t *testing.T) {
	tid := NewTeamID()
	testCases := []struct {
		Name, UserName string
		TID            TeamID
		Personal       bool
		Members        map[ID]Role
		Expected       *Team
		err            error
	}{
		{
			Name:     "success create team",
			UserName: "xxx",
			TID:      tid,
			Personal: true,
			Expected: NewTeam().ID(tid).Members(map[ID]Role{NewID(): RoleOwner}).Personal(true).Name("xxx").MustBuild(),
			err:      nil,
		}, {
			Name:     "success create team with nil members",
			UserName: "xxx",
			Members:  nil,
			Expected: NewTeam().ID(tid).MustBuild(),
			err:      nil,
		},
		{
			Name:     "fail invalid id",
			Expected: nil,
			err:      ErrInvalidID,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			var res *Team
			defer func() {
				if r := recover(); r == nil {
					assert.Equal(tt, tc.Expected, res)
				}
			}()
			res = NewTeam().ID(tc.TID).Members(tc.Members).Personal(tc.Personal).Name(tc.UserName).MustBuild()
		})
	}
}
