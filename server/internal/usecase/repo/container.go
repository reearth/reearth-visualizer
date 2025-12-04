package repo

import (
	"errors"

	"github.com/reearth/reearth/server/internal/app/i18n/message/errmsg"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/verror"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/authserver"
	"github.com/reearth/reearthx/usecasex"
)

var (
	ErrOperationDenied  = errors.New("operation denied")
	ErrResourceNotFound = verror.NewVError(errmsg.ErrKeyUsecaseRepoResourceNotFound, errmsg.ErrorMessages[errmsg.ErrKeyUsecaseRepoResourceNotFound], nil, nil)
)

type Container struct {
	Asset           Asset
	AuthRequest     authserver.RequestRepo
	Config          Config
	NLSLayer        NLSLayer
	Style           Style
	Lock            Lock
	Plugin          Plugin
	Project         Project
	ProjectMetadata ProjectMetadata
	PropertySchema  PropertySchema
	Property        Property
	Scene           Scene
	SceneLock       SceneLock
	Workspace       accountrepo.Workspace
	User            accountrepo.User
	Storytelling    Storytelling
	Transaction     usecasex.Transaction
	Extensions      []id.PluginID
	Role            accountrepo.Role        // TODO: Delete this once the permission check migration is complete.
	Permittable     accountrepo.Permittable // TODO: Delete this once the permission check migration is complete.
}

func (c *Container) AccountRepos() *accountrepo.Container {
	return &accountrepo.Container{
		Workspace:   c.Workspace,
		User:        c.User,
		Role:        c.Role,        // TODO: Delete this once the permission check migration is complete.
		Permittable: c.Permittable, // TODO: Delete this once the permission check migration is complete.
		// TODO: Policy: c.Policy,
		Transaction: c.Transaction,
	}
}

func (c *Container) Filtered(workspace WorkspaceFilter, scene SceneFilter) *Container {
	if c == nil {
		return c
	}
	return &Container{
		Asset:           c.Asset.Filtered(workspace),
		AuthRequest:     c.AuthRequest,
		Config:          c.Config,
		NLSLayer:        c.NLSLayer.Filtered(scene),
		Style:           c.Style.Filtered(scene),
		Lock:            c.Lock,
		Plugin:          c.Plugin.Filtered(scene),
		Storytelling:    c.Storytelling.Filtered(scene),
		Project:         c.Project.Filtered(workspace),
		ProjectMetadata: c.ProjectMetadata.Filtered(workspace),
		PropertySchema:  c.PropertySchema.Filtered(scene),
		Property:        c.Property.Filtered(scene),
		Scene:           c.Scene.Filtered(workspace),
		SceneLock:       c.SceneLock,
		Transaction:     c.Transaction,
		User:            c.User,
		Workspace:       c.Workspace,
		Extensions:      c.Extensions,
	}
}

type WorkspaceFilter struct {
	Readable accountdomain.WorkspaceIDList
	Writable accountdomain.WorkspaceIDList
}

func WorkspaceFilterFromOperator(o *usecase.Operator) WorkspaceFilter {
	return WorkspaceFilter{
		Readable: o.AllReadableWorkspaces(),
		Writable: o.AllWritableWorkspaces(),
	}
}

func (f WorkspaceFilter) Clone() WorkspaceFilter {
	return WorkspaceFilter{
		Readable: f.Readable.Clone(),
		Writable: f.Writable.Clone(),
	}
}

func (f WorkspaceFilter) Merge(g WorkspaceFilter) WorkspaceFilter {
	var r, w accountdomain.WorkspaceIDList
	if f.Readable != nil || g.Readable != nil {
		if f.Readable == nil {
			r = g.Readable.Clone()
		} else {
			r = f.Readable.AddUniq(g.Readable...)
		}
	}

	if f.Writable != nil || g.Writable != nil {
		if f.Writable == nil {
			w = g.Writable.Clone()
		} else {
			w = f.Writable.AddUniq(g.Writable...)
		}
	}

	return WorkspaceFilter{
		Readable: r,
		Writable: w,
	}
}

func (f WorkspaceFilter) CanRead(id accountdomain.WorkspaceID) bool {
	return f.Readable == nil || f.Readable.Has(id)
}

func (f WorkspaceFilter) CanWrite(id accountdomain.WorkspaceID) bool {
	return f.Writable == nil || f.Writable.Has(id)
}

type SceneFilter struct {
	Readable id.SceneIDList
	Writable id.SceneIDList
}

func SceneFilterFromOperator(o *usecase.Operator) SceneFilter {
	return SceneFilter{
		Readable: o.AllReadableScenes(),
		Writable: o.AllWritableScenes(),
	}
}

func (f SceneFilter) Merge(g SceneFilter) SceneFilter {
	var r, w id.SceneIDList

	if f.Readable != nil || g.Readable != nil {
		if f.Readable == nil {
			r = g.Readable.Clone()
		} else {
			r = f.Readable.AddUniq(g.Readable...)
		}
	}

	if f.Writable != nil || g.Writable != nil {
		if f.Writable == nil {
			w = g.Writable.Clone()
		} else {
			w = f.Writable.AddUniq(g.Writable...)
		}
	}

	return SceneFilter{
		Readable: r,
		Writable: w,
	}
}

func (f SceneFilter) Clone() SceneFilter {
	return SceneFilter{
		Readable: f.Readable.Clone(),
		Writable: f.Writable.Clone(),
	}
}

func (f SceneFilter) CanRead(id id.SceneID) bool {
	return f.Readable == nil || f.Readable.Has(id)
}

func (f SceneFilter) CanWrite(id id.SceneID) bool {
	return f.Writable == nil || f.Writable.Has(id)
}
