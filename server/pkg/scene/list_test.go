package scene

import (
	"testing"

	"github.com/reearth/reearthx/account/accountdomain"
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

func TestList_FilterByWorkspace(t *testing.T) {
	tid1 := accountdomain.NewWorkspaceID()
	tid2 := accountdomain.NewWorkspaceID()
	t1 := &Scene{id: NewID(), workspace: tid1}
	t2 := &Scene{id: NewID(), workspace: tid2}

	assert.Equal(t, List{t1}, List{t1, t2}.FilterByWorkspace(tid1))
	assert.Equal(t, List{t2}, List{t1, t2}.FilterByWorkspace(tid2))
	assert.Equal(t, List{t1, t2}, List{t1, t2}.FilterByWorkspace(tid1, tid2))
	assert.Equal(t, List{}, List{t1, t2}.FilterByWorkspace(accountdomain.NewWorkspaceID()))
	assert.Equal(t, List(nil), List(nil).FilterByWorkspace(tid1))
}

func TestList_IDs(t *testing.T) {
	sid1 := NewID()
	sid2 := NewID()
	t1 := &Scene{id: sid1}
	t2 := &Scene{id: sid2}

	assert.Equal(t, []ID{sid1, sid2}, List{t1, t2}.IDs())
	assert.Equal(t, []ID{}, List{}.IDs())
	assert.Equal(t, []ID(nil), List(nil).IDs())
}
