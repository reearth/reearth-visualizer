package repo

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/user"
	"github.com/stretchr/testify/assert"
)

func TestWorkspaceFilter_Merge(t *testing.T) {
	a := user.NewWorkspaceID()
	b := user.NewWorkspaceID()
	assert.Equal(t, WorkspaceFilter{
		Readable: user.WorkspaceIDList{a, b},
		Writable: user.WorkspaceIDList{b, a},
	}, WorkspaceFilter{
		Readable: user.WorkspaceIDList{a},
		Writable: user.WorkspaceIDList{b},
	}.Merge(WorkspaceFilter{
		Readable: user.WorkspaceIDList{b},
		Writable: user.WorkspaceIDList{a},
	}))
	assert.Equal(t, WorkspaceFilter{Readable: user.WorkspaceIDList{}}, WorkspaceFilter{}.Merge(WorkspaceFilter{Readable: user.WorkspaceIDList{}}))
	assert.Equal(t, WorkspaceFilter{Readable: user.WorkspaceIDList{}}, WorkspaceFilter{Readable: user.WorkspaceIDList{}}.Merge(WorkspaceFilter{}))
	assert.Equal(t, WorkspaceFilter{Writable: user.WorkspaceIDList{}}, WorkspaceFilter{}.Merge(WorkspaceFilter{Writable: user.WorkspaceIDList{}}))
	assert.Equal(t, WorkspaceFilter{Writable: user.WorkspaceIDList{}}, WorkspaceFilter{Writable: user.WorkspaceIDList{}}.Merge(WorkspaceFilter{}))
}

func TestSceneFilter_Merge(t *testing.T) {
	a := scene.NewID()
	b := scene.NewID()
	assert.Equal(t, SceneFilter{
		Readable: scene.IDList{a, b},
		Writable: scene.IDList{b, a},
	}, SceneFilter{
		Readable: scene.IDList{a},
		Writable: scene.IDList{b},
	}.Merge(SceneFilter{
		Readable: scene.IDList{b},
		Writable: scene.IDList{a},
	}))
	assert.Equal(t, SceneFilter{Readable: scene.IDList{}}, SceneFilter{}.Merge(SceneFilter{Readable: scene.IDList{}}))
	assert.Equal(t, SceneFilter{Readable: scene.IDList{}}, SceneFilter{Readable: scene.IDList{}}.Merge(SceneFilter{}))
	assert.Equal(t, SceneFilter{Writable: scene.IDList{}}, SceneFilter{}.Merge(SceneFilter{Writable: scene.IDList{}}))
	assert.Equal(t, SceneFilter{Writable: scene.IDList{}}, SceneFilter{Writable: scene.IDList{}}.Merge(SceneFilter{}))
}
