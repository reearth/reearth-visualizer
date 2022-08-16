package workspace

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTeam_ID(t *testing.T) {
	tid := NewID()
	tm := New().ID(tid).MustBuild()
	assert.Equal(t, tid, tm.ID())
}

func TestTeam_Name(t *testing.T) {
	tm := New().NewID().Name("ttt").MustBuild()
	assert.Equal(t, "ttt", tm.Name())
}

func TestTeam_Members(t *testing.T) {
	m := map[UserID]Role{
		NewUserID(): RoleOwner,
	}
	tm := New().NewID().Members(m).MustBuild()
	assert.Equal(t, m, tm.Members().Members())
}

func TestTeam_IsPersonal(t *testing.T) {
	tm := New().NewID().Personal(true).MustBuild()
	assert.Equal(t, true, tm.IsPersonal())
}

func TestTeam_Rename(t *testing.T) {
	tm := New().NewID().Name("ttt").MustBuild()
	tm.Rename("ccc")
	assert.Equal(t, "ccc", tm.Name())
}
