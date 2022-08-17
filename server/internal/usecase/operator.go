package usecase

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/user"
	"github.com/reearth/reearth/server/pkg/workspace"
)

type Operator struct {
	User               user.ID
	ReadableWorkspaces user.WorkspaceIDList
	WritableWorkspaces user.WorkspaceIDList
	OwningWorkspaces   user.WorkspaceIDList
	ReadableScenes     scene.IDList
	WritableScenes     scene.IDList
	OwningScenes       scene.IDList
}

func (o *Operator) Workspaces(r workspace.Role) user.WorkspaceIDList {
	if o == nil {
		return nil
	}
	if r == workspace.RoleReader {
		return o.ReadableWorkspaces
	}
	if r == workspace.RoleWriter {
		return o.WritableWorkspaces
	}
	if r == workspace.RoleOwner {
		return o.OwningWorkspaces
	}
	return nil
}

func (o *Operator) AllReadableWorkspaces() user.WorkspaceIDList {
	return append(o.ReadableWorkspaces, o.AllWritableWorkspaces()...)
}

func (o *Operator) AllWritableWorkspaces() user.WorkspaceIDList {
	return append(o.WritableWorkspaces, o.AllOwningWorkspaces()...)
}

func (o *Operator) AllOwningWorkspaces() user.WorkspaceIDList {
	return o.OwningWorkspaces
}

func (o *Operator) IsReadableWorkspace(ws ...id.WorkspaceID) bool {
	return o.AllReadableWorkspaces().Intersect(ws).Len() > 0
}

func (o *Operator) IsWritableWorkspace(ws ...id.WorkspaceID) bool {
	return o.AllWritableWorkspaces().Intersect(ws).Len() > 0
}

func (o *Operator) IsOwningWorkspace(ws ...id.WorkspaceID) bool {
	return o.AllOwningWorkspaces().Intersect(ws).Len() > 0
}

func (o *Operator) AllReadableScenes() scene.IDList {
	return append(o.ReadableScenes, o.AllWritableScenes()...)
}

func (o *Operator) AllWritableScenes() scene.IDList {
	return append(o.WritableScenes, o.AllOwningScenes()...)
}

func (o *Operator) AllOwningScenes() scene.IDList {
	return o.OwningScenes
}

func (o *Operator) IsReadableScene(scene ...id.SceneID) bool {
	return o.AllReadableScenes().Has(scene...)
}

func (o *Operator) IsWritableScene(scene ...id.SceneID) bool {
	return o.AllWritableScenes().Has(scene...)
}

func (o *Operator) IsOwningScene(scene ...id.SceneID) bool {
	return o.AllOwningScenes().Has(scene...)
}

func (o *Operator) AddNewWorkspace(ws id.WorkspaceID) {
	o.OwningWorkspaces = append(o.OwningWorkspaces, ws)
}

func (o *Operator) AddNewScene(ws id.WorkspaceID, scene id.SceneID) {
	if o.IsOwningWorkspace(ws) {
		o.OwningScenes = append(o.OwningScenes, scene)
	} else if o.IsWritableWorkspace(ws) {
		o.WritableScenes = append(o.WritableScenes, scene)
	}
}
