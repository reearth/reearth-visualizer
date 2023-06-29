package workspace

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestList_FilterByID(t *testing.T) {
	tid1 := NewID()
	tid2 := NewID()
	t1 := &Workspace{id: tid1}
	t2 := &Workspace{id: tid2}

	assert.Equal(t, List{t1}, List{t1, t2}.FilterByID(tid1))
	assert.Equal(t, List{t2}, List{t1, t2}.FilterByID(tid2))
	assert.Equal(t, List{t1, t2}, List{t1, t2}.FilterByID(tid1, tid2))
	assert.Equal(t, List{}, List{t1, t2}.FilterByID(NewID()))
	assert.Equal(t, List(nil), List(nil).FilterByID(tid1))
}

func TestList_FilterByUserRole(t *testing.T) {
	uid := NewUserID()
	tid1 := NewID()
	tid2 := NewID()
	t1 := &Workspace{
		id: tid1,
		members: &Members{
			members: map[UserID]Role{
				uid: RoleReader,
			},
		},
	}
	t2 := &Workspace{
		id: tid2,
		members: &Members{
			members: map[UserID]Role{
				uid: RoleOwner,
			},
		},
	}

	assert.Equal(t, List{t1}, List{t1, t2}.FilterByUserRole(uid, RoleReader))
	assert.Equal(t, List{}, List{t1, t2}.FilterByUserRole(uid, RoleWriter))
	assert.Equal(t, List{t2}, List{t1, t2}.FilterByUserRole(uid, RoleOwner))
	assert.Equal(t, List(nil), List(nil).FilterByUserRole(uid, RoleOwner))
}

func TestList_FilterByUserRoleIncluding(t *testing.T) {
	uid := NewUserID()
	tid1 := NewID()
	tid2 := NewID()
	t1 := &Workspace{
		id: tid1,
		members: &Members{
			members: map[UserID]Role{
				uid: RoleReader,
			},
		},
	}
	t2 := &Workspace{
		id: tid2,
		members: &Members{
			members: map[UserID]Role{
				uid: RoleOwner,
			},
		},
	}

	assert.Equal(t, List{t1, t2}, List{t1, t2}.FilterByUserRoleIncluding(uid, RoleReader))
	assert.Equal(t, List{t2}, List{t1, t2}.FilterByUserRoleIncluding(uid, RoleWriter))
	assert.Equal(t, List{t2}, List{t1, t2}.FilterByUserRoleIncluding(uid, RoleOwner))
	assert.Equal(t, List(nil), List(nil).FilterByUserRoleIncluding(uid, RoleOwner))
}
func TestList_IDs(t *testing.T) {
	tid1 := NewID()
	tid2 := NewID()
	t1 := &Workspace{id: tid1}
	t2 := &Workspace{id: tid2}

	assert.Equal(t, []ID{tid1, tid2}, List{t1, t2}.IDs())
	assert.Equal(t, []ID{}, List{}.IDs())
	assert.Equal(t, []ID(nil), List(nil).IDs())
}
