package usecase

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/policy"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsUsecase "github.com/reearth/reearth-accounts/server/pkg/usecase"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearthx/util"
)

type Operator struct {
	AcOperator        *accountsUsecase.Operator
	ReadableScenes    id.SceneIDList
	WritableScenes    id.SceneIDList
	MaintainingScenes id.SceneIDList
	OwningScenes      id.SceneIDList
	DefaultPolicy     *policy.ID
}

func (o *Operator) Workspaces(r accountsWorkspace.Role) accountsID.WorkspaceIDList {
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

func (o *Operator) AllReadableWorkspaces() accountsID.WorkspaceIDList {
	return o.AcOperator.AllReadableWorkspaces()
}

func (o *Operator) AllWritableWorkspaces() accountsID.WorkspaceIDList {
	return o.AcOperator.AllWritableWorkspaces()
}

func (o *Operator) AllMaintainingWorkspace() accountsID.WorkspaceIDList {
	return o.AcOperator.AllMaintainingWorkspaces()
}

func (o *Operator) AllOwningWorkspaces() accountsID.WorkspaceIDList {
	return o.AcOperator.AllOwningWorkspaces()
}

func (o *Operator) IsReadableWorkspace(ws ...accountsID.WorkspaceID) bool {
	return o.AcOperator.IsReadableWorkspace(ws...)
}

func (o *Operator) IsWritableWorkspace(ws ...accountsID.WorkspaceID) bool {
	return o.AcOperator.IsWritableWorkspace(ws...)
}

func (o *Operator) IsMaintainingWorkspace(ws ...accountsID.WorkspaceID) bool {
	return o.AcOperator.IsMaintainingWorkspace(ws...)
}

func (o *Operator) IsOwningWorkspace(ws ...accountsID.WorkspaceID) bool {
	return o.AcOperator.IsOwningWorkspace(ws...)
}

func (o *Operator) AllReadableScenes() id.SceneIDList {
	return append(o.ReadableScenes, o.AllWritableScenes()...)
}

func (o *Operator) AllWritableScenes() id.SceneIDList {
	return append(o.WritableScenes, o.AllMaintainingScenes()...)
}

func (o *Operator) AllMaintainingScenes() id.SceneIDList {
	return append(o.MaintainingScenes, o.AllOwningScenes()...)
}

func (o *Operator) AllOwningScenes() id.SceneIDList {
	return o.OwningScenes
}

func (o *Operator) IsReadableScene(scene ...id.SceneID) bool {
	return o.AllReadableScenes().Has(scene...)
}

func (o *Operator) IsWritableScene(scene ...id.SceneID) bool {
	return o.AllWritableScenes().Has(scene...)
}

func (o *Operator) IsMaintainingScene(scene ...id.SceneID) bool {
	return o.AllMaintainingScenes().Has(scene...)
}

func (o *Operator) IsOwningScene(scene ...id.SceneID) bool {
	return o.AllOwningScenes().Has(scene...)
}

func (o *Operator) AddNewWorkspace(ws accountsID.WorkspaceID) {
	o.AcOperator.OwningWorkspaces = append(o.AcOperator.OwningWorkspaces, ws)
}

func (o *Operator) AddNewScene(ws accountsID.WorkspaceID, scene id.SceneID) {
	if o.IsOwningWorkspace(ws) {
		o.OwningScenes = append(o.OwningScenes, scene)
	} else if o.IsWritableWorkspace(ws) {
		o.WritableScenes = append(o.WritableScenes, scene)
	}
}

func (o *Operator) Policy(p *policy.ID) *policy.ID {
	if p == nil && o.DefaultPolicy != nil && *o.DefaultPolicy != "" {
		return util.CloneRef(o.DefaultPolicy)
	}
	if p != nil && *p == "" {
		return nil
	}
	return p
}
