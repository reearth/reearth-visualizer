package repo

import (
	"errors"

	"github.com/reearth/reearth/server/internal/app/i18n/message/errmsg"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/verror"
	"github.com/reearth/reearthx/usecasex"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsRepo "github.com/reearth/reearth-accounts/server/pkg/repo"
)

var (
	ErrOperationDenied  = errors.New("operation denied")
	ErrResourceNotFound = verror.NewVError(errmsg.ErrKeyUsecaseRepoResourceNotFound, errmsg.ErrorMessages[errmsg.ErrKeyUsecaseRepoResourceNotFound], nil, nil)
)

type Container struct {
	Asset           Asset
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
	Storytelling    Storytelling
	Transaction     usecasex.Transaction
	Extensions      []id.PluginID

	Workspace   accountsRepo.Workspace
	User        accountsRepo.User
	Role        accountsRepo.Role
	Permittable accountsRepo.Permittable
}

func (c *Container) AccountRepos() *accountsRepo.Container {
	return &accountsRepo.Container{
		Workspace:   c.Workspace,
		User:        c.User,
		Role:        c.Role,
		Permittable: c.Permittable,
		Transaction: c.Transaction,
	}
}

func (c *Container) Filtered(workspace WorkspaceFilter, scene SceneFilter) *Container {
	if c == nil {
		return c
	}
	return &Container{
		Asset:           c.Asset.Filtered(workspace),
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
		Extensions:      c.Extensions,

		User:        c.User,
		Workspace:   c.Workspace,
		Role:        c.Role,
		Permittable: c.Permittable,
	}
}

type WorkspaceFilter struct {
	Readable accountsID.WorkspaceIDList
	Writable accountsID.WorkspaceIDList
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
	var r, w accountsID.WorkspaceIDList
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

func (f WorkspaceFilter) CanRead(id accountsID.WorkspaceID) bool {
	return f.Readable == nil || f.Readable.Has(id)
}

func (f WorkspaceFilter) CanWrite(id accountsID.WorkspaceID) bool {
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
