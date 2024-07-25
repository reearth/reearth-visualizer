package repo

import (
	"errors"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/authserver"
	"github.com/reearth/reearthx/usecasex"
)

var (
	ErrOperationDenied = errors.New("operation denied")
)

type Container struct {
	Asset          Asset
	AuthRequest    authserver.RequestRepo
	Config         Config
	DatasetSchema  DatasetSchema
	Dataset        Dataset
	Layer          Layer
	NLSLayer       NLSLayer
	Style          Style
	Lock           Lock
	Plugin         Plugin
	Project        Project
	PropertySchema PropertySchema
	Property       Property
	Scene          Scene
	SceneLock      SceneLock
	Tag            Tag
	Workspace      accountrepo.Workspace
	User           accountrepo.User
	Policy         Policy
	Storytelling   Storytelling
	Transaction    usecasex.Transaction
	Extensions     []plugin.ID
}

func (c *Container) AccountRepos() *accountrepo.Container {
	return &accountrepo.Container{
		Workspace: c.Workspace,
		User:      c.User,
		// TODO: Policy: c.Policy,
		Transaction: c.Transaction,
	}
}

func (c *Container) Filtered(workspace WorkspaceFilter, scene SceneFilter) *Container {
	if c == nil {
		return c
	}
	return &Container{
		Asset:          c.Asset.Filtered(workspace),
		AuthRequest:    c.AuthRequest,
		Config:         c.Config,
		DatasetSchema:  c.DatasetSchema.Filtered(scene),
		Dataset:        c.Dataset.Filtered(scene),
		Layer:          c.Layer.Filtered(scene),
		NLSLayer:       c.NLSLayer.Filtered(scene),
		Style:          c.Style.Filtered(scene),
		Lock:           c.Lock,
		Plugin:         c.Plugin.Filtered(scene),
		Policy:         c.Policy,
		Storytelling:   c.Storytelling.Filtered(scene),
		Project:        c.Project.Filtered(workspace),
		PropertySchema: c.PropertySchema.Filtered(scene),
		Property:       c.Property.Filtered(scene),
		Scene:          c.Scene.Filtered(workspace),
		SceneLock:      c.SceneLock,
		Tag:            c.Tag.Filtered(scene),
		Transaction:    c.Transaction,
		User:           c.User,
		Workspace:      c.Workspace,
		Extensions:     c.Extensions,
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
	Readable scene.IDList
	Writable scene.IDList
}

func SceneFilterFromOperator(o *usecase.Operator) SceneFilter {
	return SceneFilter{
		Readable: o.AllReadableScenes(),
		Writable: o.AllWritableScenes(),
	}
}

func (f SceneFilter) Merge(g SceneFilter) SceneFilter {
	var r, w scene.IDList

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

func (f SceneFilter) CanRead(id scene.ID) bool {
	return f.Readable == nil || f.Readable.Has(id)
}

func (f SceneFilter) CanWrite(id scene.ID) bool {
	return f.Writable == nil || f.Writable.Has(id)
}
