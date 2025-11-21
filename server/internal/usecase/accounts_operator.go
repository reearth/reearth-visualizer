package usecase

import (
	"github.com/reearth/reearth/server/pkg/id"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsUsecase "github.com/reearth/reearth-accounts/server/pkg/usecase"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

type AccountsOperator struct {
	AcOperator        *accountsUsecase.Operator
	ReadableScenes    id.SceneIDList
	WritableScenes    id.SceneIDList
	MaintainingScenes id.SceneIDList
	OwningScenes      id.SceneIDList
}

func (o *AccountsOperator) Workspaces(r accountsWorkspace.Role) accountsID.WorkspaceIDList {
	if o == nil {
		return nil
	}
	if r == accountsWorkspace.RoleReader {
		return o.AcOperator.ReadableWorkspaces
	}
	if r == accountsWorkspace.RoleWriter {
		return o.AcOperator.WritableWorkspaces
	}
	if r == accountsWorkspace.RoleMaintainer {
		return o.AcOperator.MaintainableWorkspaces
	}
	if r == accountsWorkspace.RoleOwner {
		return o.AcOperator.OwningWorkspaces
	}
	return nil
}

func (o *AccountsOperator) AllReadableWorkspaces() accountsID.WorkspaceIDList {
	return o.AcOperator.AllReadableWorkspaces()
}

func (o *AccountsOperator) AllWritableWorkspaces() accountsID.WorkspaceIDList {
	return o.AcOperator.AllWritableWorkspaces()
}

func (o *AccountsOperator) AllMaintainingWorkspace() accountsID.WorkspaceIDList {
	return o.AcOperator.AllMaintainingWorkspaces()
}

func (o *AccountsOperator) AllOwningWorkspaces() accountsID.WorkspaceIDList {
	return o.AcOperator.AllOwningWorkspaces()
}

func (o *AccountsOperator) IsReadableWorkspace(ws ...accountsID.WorkspaceID) bool {
	return o.AcOperator.IsReadableWorkspace(ws...)
}

func (o *AccountsOperator) IsWritableWorkspace(ws ...accountsID.WorkspaceID) bool {
	return o.AcOperator.IsWritableWorkspace(ws...)
}

func (o *AccountsOperator) IsMaintainingWorkspace(ws ...accountsID.WorkspaceID) bool {
	return o.AcOperator.IsMaintainingWorkspace(ws...)
}

func (o *AccountsOperator) IsOwningWorkspace(ws ...accountsID.WorkspaceID) bool {
	return o.AcOperator.IsOwningWorkspace(ws...)
}

func (o *AccountsOperator) AllReadableScenes() id.SceneIDList {
	return append(o.ReadableScenes, o.AllWritableScenes()...)
}

func (o *AccountsOperator) AllWritableScenes() id.SceneIDList {
	return append(o.WritableScenes, o.AllMaintainingScenes()...)
}

func (o *AccountsOperator) AllMaintainingScenes() id.SceneIDList {
	return append(o.MaintainingScenes, o.AllOwningScenes()...)
}

func (o *AccountsOperator) AllOwningScenes() id.SceneIDList {
	return o.OwningScenes
}

func (o *AccountsOperator) IsReadableScene(scene ...id.SceneID) bool {
	return o.AllReadableScenes().Has(scene...)
}

func (o *AccountsOperator) IsWritableScene(scene ...id.SceneID) bool {
	return o.AllWritableScenes().Has(scene...)
}

func (o *AccountsOperator) IsMaintainingScene(scene ...id.SceneID) bool {
	return o.AllMaintainingScenes().Has(scene...)
}

func (o *AccountsOperator) IsOwningScene(scene ...id.SceneID) bool {
	return o.AllOwningScenes().Has(scene...)
}

func (o *AccountsOperator) AddNewWorkspace(ws accountsID.WorkspaceID) {
	o.AcOperator.OwningWorkspaces = append(o.AcOperator.OwningWorkspaces, ws)
}

func (o *AccountsOperator) AddNewScene(ws accountsID.WorkspaceID, scene id.SceneID) {
	if o.IsOwningWorkspace(ws) {
		o.OwningScenes = append(o.OwningScenes, scene)
	} else if o.IsWritableWorkspace(ws) {
		o.WritableScenes = append(o.WritableScenes, scene)
	}
}
