package scene

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

func TestList_FilterByID(t *testing.T) {
	sid1 := id.NewSceneID()
	sid2 := id.NewSceneID()
	t1 := &Scene{id: sid1}
	t2 := &Scene{id: sid2}

	assert.Equal(t, List{t1}, List{t1, t2}.FilterByID(sid1))
	assert.Equal(t, List{t2}, List{t1, t2}.FilterByID(sid2))
	assert.Equal(t, List{t1, t2}, List{t1, t2}.FilterByID(sid1, sid2))
	assert.Equal(t, List{}, List{t1, t2}.FilterByID(id.NewSceneID()))
	assert.Equal(t, List(nil), List(nil).FilterByID(sid1))
}

func TestList_FilterByWorkspace(t *testing.T) {
	tid1 := accountsID.NewWorkspaceID()
	tid2 := accountsID.NewWorkspaceID()
	t1 := &Scene{id: id.NewSceneID(), workspace: tid1}
	t2 := &Scene{id: id.NewSceneID(), workspace: tid2}

	assert.Equal(t, List{t1}, List{t1, t2}.FilterByWorkspace(tid1))
	assert.Equal(t, List{t2}, List{t1, t2}.FilterByWorkspace(tid2))
	assert.Equal(t, List{t1, t2}, List{t1, t2}.FilterByWorkspace(tid1, tid2))
	assert.Equal(t, List{}, List{t1, t2}.FilterByWorkspace(accountsID.NewWorkspaceID()))
	assert.Equal(t, List(nil), List(nil).FilterByWorkspace(tid1))
}

func TestList_IDs(t *testing.T) {
	sid1 := id.NewSceneID()
	sid2 := id.NewSceneID()
	t1 := &Scene{id: sid1}
	t2 := &Scene{id: sid2}

	assert.Equal(t, []id.SceneID{sid1, sid2}, List{t1, t2}.IDs())
	assert.Equal(t, []id.SceneID{}, List{}.IDs())
	assert.Equal(t, []id.SceneID(nil), List(nil).IDs())
}
