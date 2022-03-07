package scene

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestList_FilterByID(t *testing.T) {
	sid1 := NewID()
	sid2 := NewID()
	t1 := &Scene{id: sid1}
	t2 := &Scene{id: sid2}

	assert.Equal(t, List{t1}, List{t1, t2}.FilterByID(sid1))
	assert.Equal(t, List{t2}, List{t1, t2}.FilterByID(sid2))
	assert.Equal(t, List{t1, t2}, List{t1, t2}.FilterByID(sid1, sid2))
	assert.Equal(t, List{}, List{t1, t2}.FilterByID(NewID()))
	assert.Equal(t, List(nil), List(nil).FilterByID(sid1))
}

func TestList_FilterByTeam(t *testing.T) {
	tid1 := NewTeamID()
	tid2 := NewTeamID()
	t1 := &Scene{id: NewID(), team: tid1}
	t2 := &Scene{id: NewID(), team: tid2}

	assert.Equal(t, List{t1}, List{t1, t2}.FilterByTeam(tid1))
	assert.Equal(t, List{t2}, List{t1, t2}.FilterByTeam(tid2))
	assert.Equal(t, List{t1, t2}, List{t1, t2}.FilterByTeam(tid1, tid2))
	assert.Equal(t, List{}, List{t1, t2}.FilterByTeam(NewTeamID()))
	assert.Equal(t, List(nil), List(nil).FilterByTeam(tid1))
}

func TestTeamList_IDs(t *testing.T) {
	sid1 := NewID()
	sid2 := NewID()
	t1 := &Scene{id: sid1}
	t2 := &Scene{id: sid2}

	assert.Equal(t, []ID{sid1, sid2}, List{t1, t2}.IDs())
	assert.Equal(t, []ID{}, List{}.IDs())
	assert.Equal(t, []ID(nil), List(nil).IDs())
}
