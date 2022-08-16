package user

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewMembers(t *testing.T) {
	m := NewMembers()
	assert.NotNil(t, m)
	assert.IsType(t, &Members{}, m)
}

func TestNewMembersWith(t *testing.T) {
	uid := NewID()
	m := NewMembersWith(map[ID]Role{uid: RoleOwner})
	assert.NotNil(t, m)
	assert.Equal(t, map[ID]Role{uid: RoleOwner}, m.Members())
}

func TestMembers_ContainsUser(t *testing.T) {
	uid1 := NewID()
	uid2 := NewID()

	tests := []struct {
		Name     string
		M        *Members
		UID      ID
		Expected bool
	}{
		{
			Name:     "existing user",
			M:        NewMembersWith(map[ID]Role{uid1: RoleOwner, uid2: RoleReader}),
			UID:      uid1,
			Expected: true,
		},
		{
			Name:     "not existing user",
			M:        NewMembersWith(map[ID]Role{uid2: RoleReader}),
			UID:      uid1,
			Expected: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.M.ContainsUser(tt.UID)
			assert.Equal(t, tt.Expected, res)
		})
	}
}

func TestCopyMembers(t *testing.T) {
	uid := NewID()
	m := NewMembersWith(map[ID]Role{uid: RoleOwner})
	m2 := CopyMembers(m)
	assert.Equal(t, m, m2)
}

func TestMembers_Count(t *testing.T) {
	m := NewMembersWith(map[ID]Role{NewID(): RoleOwner})
	assert.Equal(t, len(m.Members()), m.Count())
}

func TestMembers_GetRole(t *testing.T) {
	uid := NewID()
	m := NewMembersWith(map[ID]Role{uid: RoleOwner})
	assert.Equal(t, RoleOwner, m.GetRole(uid))
}

func TestMembers_IsOnlyOwner(t *testing.T) {
	uid := NewID()
	m := NewMembersWith(map[ID]Role{uid: RoleOwner, NewID(): RoleReader})
	assert.True(t, m.IsOnlyOwner(uid))
}

func TestMembers_Leave(t *testing.T) {
	uid := NewID()

	tests := []struct {
		Name string
		M    *Members
		UID  ID
		err  error
	}{
		{
			Name: "success user left",
			M:    NewMembersWith(map[ID]Role{uid: RoleWriter, NewID(): RoleOwner}),
			UID:  uid,
			err:  nil,
		},
		{
			Name: "fail personal team",
			M:    NewFixedMembers(uid),
			UID:  uid,
			err:  ErrCannotModifyPersonalTeam,
		},
		{
			Name: "fail user not in the team",
			M:    NewMembersWith(map[ID]Role{uid: RoleWriter, NewID(): RoleOwner}),
			UID:  NewID(),
			err:  ErrTargetUserNotInTheTeam,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			err := tt.M.Leave(tt.UID)
			if tt.err == nil {
				assert.False(t, tt.M.ContainsUser(tt.UID))
			} else {
				assert.Equal(t, tt.err, err)
			}
		})
	}
}

func TestMembers_Members(t *testing.T) {
	uid := NewID()
	m := NewMembersWith(map[ID]Role{uid: RoleOwner})
	assert.Equal(t, map[ID]Role{uid: RoleOwner}, m.Members())
}

func TestMembers_UpdateRole(t *testing.T) {
	uid := NewID()

	tests := []struct {
		Name              string
		M                 *Members
		UID               ID
		NewRole, Expected Role
		err               error
	}{
		{
			Name:     "success role updated",
			M:        NewMembersWith(map[ID]Role{uid: RoleWriter}),
			UID:      uid,
			NewRole:  RoleOwner,
			Expected: RoleOwner,
			err:      nil,
		},
		{
			Name:     "nil role",
			M:        NewMembersWith(map[ID]Role{uid: RoleOwner}),
			UID:      uid,
			NewRole:  "",
			Expected: RoleOwner,
			err:      nil,
		},
		{
			Name:    "fail personal team",
			M:       NewFixedMembers(uid),
			UID:     uid,
			NewRole: RoleOwner,
			err:     ErrCannotModifyPersonalTeam,
		},
		{
			Name:    "fail user not in the team",
			M:       NewMembersWith(map[ID]Role{uid: RoleOwner}),
			UID:     NewID(),
			NewRole: RoleOwner,
			err:     ErrTargetUserNotInTheTeam,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			err := tt.M.UpdateRole(tt.UID, tt.NewRole)
			if tt.err == nil {
				assert.Equal(t, tt.Expected, tt.M.GetRole(tt.UID))
			} else {
				assert.Equal(t, tt.err, err)
			}
		})
	}
}

func TestMembers_Join(t *testing.T) {
	uid := NewID()
	uid2 := NewID()

	tests := []struct {
		Name                   string
		M                      *Members
		UID                    ID
		JoinRole, ExpectedRole Role
		err                    error
	}{
		{
			Name:         "success join user",
			M:            NewMembersWith(map[ID]Role{uid: RoleWriter}),
			UID:          uid2,
			JoinRole:     "xxx",
			ExpectedRole: "xxx",
			err:          nil,
		},
		{
			Name:         "success join user",
			M:            NewMembersWith(map[ID]Role{uid: RoleWriter}),
			UID:          uid2,
			JoinRole:     "",
			ExpectedRole: RoleReader,
			err:          nil,
		},
		{
			Name:     "fail personal team",
			M:        NewFixedMembers(uid),
			UID:      uid2,
			JoinRole: "xxx",
			err:      ErrCannotModifyPersonalTeam,
		},
		{
			Name:     "fail user already joined",
			M:        NewMembersWith(map[ID]Role{uid: RoleOwner}),
			UID:      uid,
			JoinRole: "",
			err:      ErrUserAlreadyJoined,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			err := tt.M.Join(tt.UID, tt.JoinRole)
			if tt.err == nil {
				assert.True(t, tt.M.ContainsUser(tt.UID))
				assert.Equal(t, tt.ExpectedRole, tt.M.GetRole(tt.UID))
			} else {
				assert.Equal(t, tt.err, err)
			}
		})
	}
}

func TestMembers_UsersByRole(t *testing.T) {
	uid := NewID()
	uid2 := NewID()

	tests := []struct {
		Name     string
		M        *Members
		Role     Role
		Expected []ID
		err      error
	}{
		{
			Name:     "success join user",
			M:        NewMembersWith(map[ID]Role{uid: "xxx", uid2: "xxx"}),
			Role:     "xxx",
			Expected: []ID{uid2, uid},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.M.UsersByRole(tt.Role)
			assert.Equal(t, tt.Expected, res)
		})
	}
}

func TestMembers_Fixed(t *testing.T) {
	tests := []struct {
		name   string
		target *Members
		want   bool
	}{
		{
			name: "true",
			target: &Members{
				fixed: true,
			},
			want: true,
		},
		{
			name:   "empty",
			target: &Members{},
			want:   false,
		},
		{
			name: "nil",
			want: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Fixed())
		})
	}
}
