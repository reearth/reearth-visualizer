package user

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTeamIDList_Clone(t *testing.T) {
	t1 := NewTeamID()
	t2 := NewTeamID()
	t3 := NewTeamID()
	ids := TeamIDList{t1, t2, t3}
	assert.Equal(t, ids, ids.Clone())
	assert.NotSame(t, ids, ids.Clone())
	assert.Nil(t, TeamIDList(nil).Clone())
}

func TestTeamIDList_Filter(t *testing.T) {
	t1 := NewTeamID()
	t2 := NewTeamID()
	t3 := NewTeamID()
	t4 := NewTeamID()
	assert.Equal(t, TeamIDList{t1}, TeamIDList{t1, t2, t3}.Filter(t1))
	assert.Equal(t, TeamIDList{t1, t3}, TeamIDList{t1, t2, t3}.Filter(t1, t3))
	assert.Equal(t, TeamIDList{}, TeamIDList{t1, t2, t3}.Filter(t4))
	assert.Equal(t, TeamIDList(nil), TeamIDList(nil).Filter(t4))
}

func TestTeamIDList_Includes(t *testing.T) {
	t1 := NewTeamID()
	t2 := NewTeamID()
	t3 := NewTeamID()
	assert.True(t, TeamIDList{t1, t2, t3}.Includes(t1))
	assert.False(t, TeamIDList{t1, t2}.Includes(t3))
	assert.False(t, TeamIDList(nil).Includes(t1))
}

func TestTeamIDList_Len(t *testing.T) {
	t1 := NewTeamID()
	t2 := NewTeamID()
	t3 := NewTeamID()
	assert.Equal(t, 2, TeamIDList{t1, t2}.Len())
	assert.Equal(t, 3, TeamIDList{t1, t2, t3}.Len())
	assert.Equal(t, 0, TeamIDList{}.Len())
	assert.Equal(t, 0, TeamIDList(nil).Len())
}
