package user

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTeamList_FilterByID(t *testing.T) {
	tid1 := NewTeamID()
	tid2 := NewTeamID()
	t1 := &Team{id: tid1}
	t2 := &Team{id: tid2}

	assert.Equal(t, TeamList{t1}, TeamList{t1, t2}.FilterByID(tid1))
	assert.Equal(t, TeamList{t2}, TeamList{t1, t2}.FilterByID(tid2))
	assert.Equal(t, TeamList{t1, t2}, TeamList{t1, t2}.FilterByID(tid1, tid2))
	assert.Equal(t, TeamList{}, TeamList{t1, t2}.FilterByID(NewTeamID()))
	assert.Equal(t, TeamList(nil), TeamList(nil).FilterByID(tid1))
}

func TestTeamList_FilterByUserRole(t *testing.T) {
	uid := NewID()
	tid1 := NewTeamID()
	tid2 := NewTeamID()
	t1 := &Team{
		id: tid1,
		members: &Members{
			members: map[ID]Role{
				uid: RoleReader,
			},
		},
	}
	t2 := &Team{
		id: tid2,
		members: &Members{
			members: map[ID]Role{
				uid: RoleOwner,
			},
		},
	}

	assert.Equal(t, TeamList{t1}, TeamList{t1, t2}.FilterByUserRole(uid, RoleReader))
	assert.Equal(t, TeamList{}, TeamList{t1, t2}.FilterByUserRole(uid, RoleWriter))
	assert.Equal(t, TeamList{t2}, TeamList{t1, t2}.FilterByUserRole(uid, RoleOwner))
	assert.Equal(t, TeamList(nil), TeamList(nil).FilterByUserRole(uid, RoleOwner))
}

func TestTeamList_FilterByUserRoleIncluding(t *testing.T) {
	uid := NewID()
	tid1 := NewTeamID()
	tid2 := NewTeamID()
	t1 := &Team{
		id: tid1,
		members: &Members{
			members: map[ID]Role{
				uid: RoleReader,
			},
		},
	}
	t2 := &Team{
		id: tid2,
		members: &Members{
			members: map[ID]Role{
				uid: RoleOwner,
			},
		},
	}

	assert.Equal(t, TeamList{t1, t2}, TeamList{t1, t2}.FilterByUserRoleIncluding(uid, RoleReader))
	assert.Equal(t, TeamList{t2}, TeamList{t1, t2}.FilterByUserRoleIncluding(uid, RoleWriter))
	assert.Equal(t, TeamList{t2}, TeamList{t1, t2}.FilterByUserRoleIncluding(uid, RoleOwner))
	assert.Equal(t, TeamList(nil), TeamList(nil).FilterByUserRoleIncluding(uid, RoleOwner))
}
func TestTeamList_IDs(t *testing.T) {
	tid1 := NewTeamID()
	tid2 := NewTeamID()
	t1 := &Team{id: tid1}
	t2 := &Team{id: tid2}

	assert.Equal(t, []TeamID{tid1, tid2}, TeamList{t1, t2}.IDs())
	assert.Equal(t, []TeamID{}, TeamList{}.IDs())
	assert.Equal(t, []TeamID(nil), TeamList(nil).IDs())
}
