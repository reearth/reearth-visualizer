package user

import (
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
	uid := NewID()

	type args struct {
		ID       TeamID
		Name     string
		Personal bool
		Members  map[ID]Role
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Team
		Err      error
	}{
		{
			Name: "success create team",
			Args: args{
				ID:       tid,
				Name:     "xxx",
				Personal: true,
				Members:  map[ID]Role{uid: RoleOwner},
			},
			Expected: &Team{
				id:   tid,
				name: "xxx",
				members: &Members{
					members: map[ID]Role{uid: RoleOwner},
					fixed:   true,
				},
			},
		}, {
			Name: "success create team with nil members",
			Args: args{
				ID:   tid,
				Name: "xxx",
			},
			Expected: &Team{
				id:   tid,
				name: "xxx",
				members: &Members{
					members: map[ID]Role{},
					fixed:   false,
				},
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
			res, err := NewTeam().
				ID(tt.Args.ID).
				Members(tt.Args.Members).
				Personal(tt.Args.Personal).
				Name(tt.Args.Name).
				Build()
			if tt.Err == nil {
				assert.Equal(t, tt.Expected, res)
			} else {
				assert.Equal(t, tt.Err, err)
			}
		})
	}
}

func TestTeamBuilder_MustBuild(t *testing.T) {
	tid := NewTeamID()
	uid := NewID()

	type args struct {
		ID       TeamID
		Name     string
		Personal bool
		Members  map[ID]Role
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Team
		Err      error
	}{
		{
			Name: "success create team",
			Args: args{
				ID:       tid,
				Name:     "xxx",
				Personal: true,
				Members:  map[ID]Role{uid: RoleOwner},
			},
			Expected: &Team{
				id:   tid,
				name: "xxx",
				members: &Members{
					members: map[ID]Role{uid: RoleOwner},
					fixed:   true,
				},
			},
		}, {
			Name: "success create team with nil members",
			Args: args{
				ID:   tid,
				Name: "xxx",
			},
			Expected: &Team{
				id:   tid,
				name: "xxx",
				members: &Members{
					members: map[ID]Role{},
					fixed:   false,
				},
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

			build := func() *Team {
				t.Helper()
				return NewTeam().ID(tt.Args.ID).Members(tt.Args.Members).Personal(tt.Args.Personal).Name(tt.Args.Name).MustBuild()
			}

			if tt.Err != nil {
				assert.PanicsWithValue(t, tt.Err, func() { _ = build() })
			} else {
				assert.Equal(t, tt.Expected, build())
			}
		})
	}
}
