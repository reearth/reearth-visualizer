package workspace

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestBuilder_ID(t *testing.T) {
	tid := NewID()
	tm := New().ID(tid).MustBuild()
	assert.Equal(t, tid, tm.ID())
}

func TestBuilder_Members(t *testing.T) {
	m := map[UserID]Role{NewUserID(): RoleOwner}
	tm := New().NewID().Members(m).MustBuild()
	assert.Equal(t, m, tm.Members().Members())
}

func TestBuilder_Personal(t *testing.T) {
	tm := New().NewID().Personal(true).MustBuild()
	assert.True(t, tm.IsPersonal())
}

func TestBuilder_Name(t *testing.T) {
	tm := New().NewID().Name("xxx").MustBuild()
	assert.Equal(t, "xxx", tm.Name())
}

func TestBuilder_NewID(t *testing.T) {
	tm := New().NewID().MustBuild()
	assert.NotNil(t, tm.ID())
}

func TestBuilder_Policy(t *testing.T) {
	tm := New().NewID().Policy(PolicyID("aaa").Ref()).MustBuild()
	assert.Equal(t, PolicyID("aaa").Ref(), tm.Policy())
}

func TestBuilder_Build(t *testing.T) {
	tid := NewID()
	uid := NewUserID()

	type args struct {
		ID       ID
		Name     string
		Personal bool
		Members  map[UserID]Role
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Workspace
		Err      error
	}{
		{
			Name: "success create workspace",
			Args: args{
				ID:       tid,
				Name:     "xxx",
				Personal: true,
				Members:  map[UserID]Role{uid: RoleOwner},
			},
			Expected: &Workspace{
				id:   tid,
				name: "xxx",
				members: &Members{
					members: map[UserID]Role{uid: RoleOwner},
					fixed:   true,
				},
			},
		}, {
			Name: "success create workspace with nil members",
			Args: args{
				ID:   tid,
				Name: "xxx",
			},
			Expected: &Workspace{
				id:   tid,
				name: "xxx",
				members: &Members{
					members: map[UserID]Role{},
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
			res, err := New().
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

func TestBuilder_MustBuild(t *testing.T) {
	tid := NewID()
	uid := NewUserID()

	type args struct {
		ID       ID
		Name     string
		Personal bool
		Members  map[UserID]Role
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Workspace
		Err      error
	}{
		{
			Name: "success create workspace",
			Args: args{
				ID:       tid,
				Name:     "xxx",
				Personal: true,
				Members:  map[UserID]Role{uid: RoleOwner},
			},
			Expected: &Workspace{
				id:   tid,
				name: "xxx",
				members: &Members{
					members: map[UserID]Role{uid: RoleOwner},
					fixed:   true,
				},
			},
		}, {
			Name: "success create workspace with nil members",
			Args: args{
				ID:   tid,
				Name: "xxx",
			},
			Expected: &Workspace{
				id:   tid,
				name: "xxx",
				members: &Members{
					members: map[UserID]Role{},
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

			build := func() *Workspace {
				t.Helper()
				return New().ID(tt.Args.ID).Members(tt.Args.Members).Personal(tt.Args.Personal).Name(tt.Args.Name).MustBuild()
			}

			if tt.Err != nil {
				assert.PanicsWithValue(t, tt.Err, func() { _ = build() })
			} else {
				assert.Equal(t, tt.Expected, build())
			}
		})
	}
}
