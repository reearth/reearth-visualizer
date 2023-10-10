package usecase

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/policy"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/util"
)

type Operator struct {
	AcOperator     *accountusecase.Operator
	ReadableScenes scene.IDList
	WritableScenes scene.IDList
	OwningScenes   scene.IDList
	DefaultPolicy  *policy.ID
}

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
	if r == workspace.RoleOwner {
		return o.AcOperator.OwningWorkspaces
	}
	return nil
}

func (o *Operator) AllReadableWorkspaces() user.WorkspaceIDList {
	return append(o.AcOperator.ReadableWorkspaces, o.AllWritableWorkspaces()...)
}

func (o *Operator) AllWritableWorkspaces() user.WorkspaceIDList {
	return append(o.AcOperator.WritableWorkspaces, o.AllOwningWorkspaces()...)
}

func (o *Operator) AllOwningWorkspaces() user.WorkspaceIDList {
	return o.AcOperator.OwningWorkspaces
}

func (o *Operator) IsReadableWorkspace(ws ...accountdomain.WorkspaceID) bool {
	return o.AllReadableWorkspaces().Intersect(ws).Len() > 0
}

func (o *Operator) IsWritableWorkspace(ws ...accountdomain.WorkspaceID) bool {
	return o.AllWritableWorkspaces().Intersect(ws).Len() > 0
}

func (o *Operator) IsOwningWorkspace(ws ...accountdomain.WorkspaceID) bool {
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

func (o *Operator) AddNewWorkspace(ws accountdomain.WorkspaceID) {
	o.AcOperator.OwningWorkspaces = append(o.AcOperator.OwningWorkspaces, ws)
}

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
