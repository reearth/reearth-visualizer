package usecase

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/util"

	accountsUsecase "github.com/reearth/reearth-accounts/server/pkg/usecase"
)

// Deprecated: This function is deprecated and will be replaced by AccountsOperator in the future.
type Operator struct {
	AcOperator        *accountusecase.Operator
	AccountsOperator  *accountsUsecase.Operator
	ReadableScenes    id.SceneIDList
	WritableScenes    id.SceneIDList
	MaintainingScenes id.SceneIDList
	OwningScenes      id.SceneIDList
	DefaultPolicy     *policy.ID
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.Workspaces in the future.
func (o *Operator) Workspaces(r workspace.Role) accountdomain.WorkspaceIDList {
	if o == nil {
		return nil
	}
	if r == workspace.RoleReader {
		return o.AcOperator.ReadableWorkspaces
	}
	if r == workspace.RoleWriter {
		return o.AcOperator.WritableWorkspaces
	}
	if r == workspace.RoleMaintainer {
		return o.AcOperator.MaintainableWorkspaces
	}
	if r == workspace.RoleOwner {
		return o.AcOperator.OwningWorkspaces
	}
	return nil
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.AllReadableWorkspaces in the future.
func (o *Operator) AllReadableWorkspaces() user.WorkspaceIDList {
	return o.AcOperator.AllReadableWorkspaces()
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.AllWritableWorkspaces in the future.
func (o *Operator) AllWritableWorkspaces() user.WorkspaceIDList {
	return o.AcOperator.AllWritableWorkspaces()
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.AllMaintainingWorkspace in the future.
func (o *Operator) AllMaintainingWorkspace() user.WorkspaceIDList {
	return o.AcOperator.AllMaintainingWorkspaces()
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.AllOwningWorkspaces in the future.
func (o *Operator) AllOwningWorkspaces() user.WorkspaceIDList {
	return o.AcOperator.AllOwningWorkspaces()
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.IsReadableWorkspace in the future.
func (o *Operator) IsReadableWorkspace(ws ...accountdomain.WorkspaceID) bool {
	return o.AcOperator.IsReadableWorkspace(ws...)
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.IsWritableWorkspace in the future.
func (o *Operator) IsWritableWorkspace(ws ...accountdomain.WorkspaceID) bool {
	return o.AcOperator.IsWritableWorkspace(ws...)
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.IsMaintainingWorkspace in the future.
func (o *Operator) IsMaintainingWorkspace(ws ...accountdomain.WorkspaceID) bool {
	return o.AcOperator.IsMaintainingWorkspace(ws...)
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.IsOwningWorkspace in the future.
func (o *Operator) IsOwningWorkspace(ws ...accountdomain.WorkspaceID) bool {
	return o.AcOperator.IsOwningWorkspace(ws...)
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.AllReadableScenes in the future.
func (o *Operator) AllReadableScenes() id.SceneIDList {
	return append(o.ReadableScenes, o.AllWritableScenes()...)
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.AllWritableScenes in the future.
func (o *Operator) AllWritableScenes() id.SceneIDList {
	return append(o.WritableScenes, o.AllMaintainingScenes()...)
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.AllMaintainingScenes in the future.
func (o *Operator) AllMaintainingScenes() id.SceneIDList {
	return append(o.MaintainingScenes, o.AllOwningScenes()...)
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.AllOwningScenes in the future.
func (o *Operator) AllOwningScenes() id.SceneIDList {
	return o.OwningScenes
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.IsReadableScene in the future.
func (o *Operator) IsReadableScene(scene ...id.SceneID) bool {
	return o.AllReadableScenes().Has(scene...)
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.IsWritableScene in the future.
func (o *Operator) IsWritableScene(scene ...id.SceneID) bool {
	return o.AllWritableScenes().Has(scene...)
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.IsMaintainingScene in the future.
func (o *Operator) IsMaintainingScene(scene ...id.SceneID) bool {
	return o.AllMaintainingScenes().Has(scene...)
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.IsOwningScene in the future.
func (o *Operator) IsOwningScene(scene ...id.SceneID) bool {
	return o.AllOwningScenes().Has(scene...)
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.AddNewWorkspace in the future.
func (o *Operator) AddNewWorkspace(ws accountdomain.WorkspaceID) {
	o.AcOperator.OwningWorkspaces = append(o.AcOperator.OwningWorkspaces, ws)
}

// Deprecated: This function is deprecated and will be replaced by AccountsOperator.AddNewScene in the future.
func (o *Operator) AddNewScene(ws accountdomain.WorkspaceID, scene id.SceneID) {
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
