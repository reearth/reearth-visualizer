package repo

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"

	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/stretchr/testify/assert"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

func TestWorkspaceFilter_Merge(t *testing.T) {
	a := workspace.NewID()
	b := workspace.NewID()
	assert.Equal(t, WorkspaceFilter{
		Readable: accountsID.WorkspaceIDList{a, b},
		Writable: accountsID.WorkspaceIDList{b, a},
	}, WorkspaceFilter{
		Readable: accountsID.WorkspaceIDList{a},
		Writable: accountsID.WorkspaceIDList{b},
	}.Merge(WorkspaceFilter{
		Readable: accountsID.WorkspaceIDList{b},
		Writable: accountsID.WorkspaceIDList{a},
	}))
	assert.Equal(t, WorkspaceFilter{Readable: accountsID.WorkspaceIDList{}}, WorkspaceFilter{}.Merge(WorkspaceFilter{Readable: user.WorkspaceIDList{}}))
	assert.Equal(t, WorkspaceFilter{Readable: accountsID.WorkspaceIDList{}}, WorkspaceFilter{Readable: user.WorkspaceIDList{}}.Merge(WorkspaceFilter{}))
	assert.Equal(t, WorkspaceFilter{Writable: accountsID.WorkspaceIDList{}}, WorkspaceFilter{}.Merge(WorkspaceFilter{Writable: user.WorkspaceIDList{}}))
	assert.Equal(t, WorkspaceFilter{Writable: accountsID.WorkspaceIDList{}}, WorkspaceFilter{Writable: user.WorkspaceIDList{}}.Merge(WorkspaceFilter{}))
}

func TestSceneFilter_Merge(t *testing.T) {
	a := id.NewSceneID()
	b := id.NewSceneID()
	assert.Equal(t, SceneFilter{
		Readable: id.SceneIDList{a, b},
		Writable: id.SceneIDList{b, a},
	}, SceneFilter{
		Readable: id.SceneIDList{a, b},
		Writable: id.SceneIDList{b},
	}.Merge(SceneFilter{
		Readable: id.SceneIDList{b},
		Writable: id.SceneIDList{a},
	}))
	assert.Equal(t, SceneFilter{Readable: id.SceneIDList{}}, SceneFilter{}.Merge(SceneFilter{Readable: id.SceneIDList{}}))
	assert.Equal(t, SceneFilter{Readable: id.SceneIDList{}}, SceneFilter{Readable: id.SceneIDList{}}.Merge(SceneFilter{}))
	assert.Equal(t, SceneFilter{Writable: id.SceneIDList{}}, SceneFilter{}.Merge(SceneFilter{Writable: id.SceneIDList{}}))
	assert.Equal(t, SceneFilter{Writable: id.SceneIDList{}}, SceneFilter{Writable: id.SceneIDList{}}.Merge(SceneFilter{}))
}
