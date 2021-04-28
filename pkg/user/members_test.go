package user

import (
	"errors"
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestNewMembers(t *testing.T) {
	m := NewMembers()
	assert.NotNil(t, m)
	assert.IsType(t, &Members{}, m)
}

func TestNewMembersWith(t *testing.T) {
	uid := id.NewUserID()
	m := NewMembersWith(map[id.UserID]Role{uid: RoleOwner})
	assert.NotNil(t, m)
	assert.Equal(t, map[id.UserID]Role{uid: RoleOwner}, m.Members())
}

func TestMembers_ContainsUser(t *testing.T) {
	uid1 := id.NewUserID()
	uid2 := id.NewUserID()
	testCases := []struct {
		Name     string
		M        *Members
		UID      id.UserID
		Expected bool
	}{
		{
			Name:     "existing user",
			M:        NewMembersWith(map[id.UserID]Role{uid1: RoleOwner, uid2: RoleReader}),
			UID:      uid1,
			Expected: true,
		},
		{
			Name:     "not existing user",
			M:        NewMembersWith(map[id.UserID]Role{uid2: RoleReader}),
			UID:      uid1,
			Expected: false,
		},
	}
	for _, tc := range testCases {
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.M.ContainsUser(tc.UID)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}

func TestCopyMembers(t *testing.T) {
	uid := id.NewUserID()
	m := NewMembersWith(map[id.UserID]Role{uid: RoleOwner})
	m2 := CopyMembers(m)
	assert.Equal(t, m, m2)
}

func TestMembers_Count(t *testing.T) {
	m := NewMembersWith(map[id.UserID]Role{id.NewUserID(): RoleOwner})
	assert.Equal(t, len(m.Members()), m.Count())
}

func TestMembers_GetRole(t *testing.T) {
	uid := id.NewUserID()
	m := NewMembersWith(map[id.UserID]Role{uid: RoleOwner})
	assert.Equal(t, RoleOwner, m.GetRole(uid))
}

func TestMembers_IsOnlyOwner(t *testing.T) {
	uid := id.NewUserID()
	m := NewMembersWith(map[id.UserID]Role{uid: RoleOwner, id.NewUserID(): RoleReader})
	assert.True(t, m.IsOnlyOwner(uid))
}

func TestMembers_Leave(t *testing.T) {
	uid := id.NewUserID()
	testCases := []struct {
		Name string
		M    *Members
		UID  id.UserID
		err  error
	}{
		{
			Name: "success user left",
			M:    NewMembersWith(map[id.UserID]Role{uid: RoleWriter, id.NewUserID(): RoleOwner}),
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
			M:    NewMembersWith(map[id.UserID]Role{uid: RoleWriter, id.NewUserID(): RoleOwner}),
			UID:  id.NewUserID(),
			err:  ErrTargetUserNotInTheTeam,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			err := tc.M.Leave(tc.UID)
			if err == nil {
				assert.False(tt, tc.M.ContainsUser(tc.UID))
			} else {
				assert.True(tt, errors.As(tc.err, &err))
			}
		})
	}
}

func TestMembers_Members(t *testing.T) {
	uid := id.NewUserID()
	m := NewMembersWith(map[id.UserID]Role{uid: RoleOwner})
	assert.Equal(t, map[id.UserID]Role{uid: RoleOwner}, m.Members())
}

func TestMembers_UpdateRole(t *testing.T) {
	uid := id.NewUserID()
	testCases := []struct {
		Name              string
		M                 *Members
		UID               id.UserID
		NewRole, Expected Role
		err               error
	}{
		{
			Name:     "success role updated",
			M:        NewMembersWith(map[id.UserID]Role{uid: RoleWriter}),
			UID:      uid,
			NewRole:  RoleOwner,
			Expected: RoleOwner,
			err:      nil,
		},
		{
			Name:     "nil role",
			M:        NewMembersWith(map[id.UserID]Role{uid: RoleOwner}),
			UID:      uid,
			NewRole:  "",
			Expected: RoleOwner,
			err:      nil,
		},
		{
			Name:    "fail personal team",
			M:       NewFixedMembers(uid),
			UID:     uid,
			NewRole: Role("xxx"),
			err:     ErrCannotModifyPersonalTeam,
		},
		{
			Name:    "fail user not in the team",
			M:       NewMembersWith(map[id.UserID]Role{uid: RoleOwner}),
			UID:     id.NewUserID(),
			NewRole: "",
			err:     ErrTargetUserNotInTheTeam,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			err := tc.M.UpdateRole(tc.UID, tc.NewRole)
			if err == nil {
				assert.Equal(tt, tc.Expected, tc.M.GetRole(tc.UID))
			} else {
				assert.True(tt, errors.As(tc.err, &err))
			}
		})
	}
}

func TestMembers_Join(t *testing.T) {
	uid := id.NewUserID()
	uid2 := id.NewUserID()
	testCases := []struct {
		Name                   string
		M                      *Members
		UID                    id.UserID
		JoinRole, ExpectedRole Role
		err                    error
	}{
		{
			Name:         "success join user",
			M:            NewMembersWith(map[id.UserID]Role{uid: RoleWriter}),
			UID:          uid2,
			JoinRole:     "xxx",
			ExpectedRole: "xxx",
			err:          nil,
		},
		{
			Name:         "success join user",
			M:            NewMembersWith(map[id.UserID]Role{uid: RoleWriter}),
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
			M:        NewMembersWith(map[id.UserID]Role{uid: RoleOwner}),
			UID:      uid,
			JoinRole: "",
			err:      ErrUserAlreadyJoined,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			err := tc.M.Join(tc.UID, tc.JoinRole)
			if err == nil {
				assert.True(tt, tc.M.ContainsUser(tc.UID))
				assert.Equal(tt, tc.ExpectedRole, tc.M.GetRole(tc.UID))
			} else {
				assert.True(tt, errors.As(tc.err, &err))
			}
		})
	}
}

func TestMembers_UsersByRole(t *testing.T) {
	uid := id.NewUserID()
	uid2 := id.NewUserID()
	testCases := []struct {
		Name     string
		M        *Members
		Role     Role
		Expected []id.UserID
		err      error
	}{
		{
			Name:     "success join user",
			M:        NewMembersWith(map[id.UserID]Role{uid: "xxx", uid2: "xxx"}),
			Role:     "xxx",
			Expected: []id.UserID{uid2, uid},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := tc.M.UsersByRole(tc.Role)
			assert.Equal(tt, tc.Expected, res)
		})
	}
}
