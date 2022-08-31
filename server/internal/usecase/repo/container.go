package repo

import (
	"errors"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/user"
	"github.com/reearth/reearthx/usecasex"
)

var (
	ErrOperationDenied = errors.New("operation denied")
)

type Container struct {
	Asset          Asset
	AuthRequest    AuthRequest
	Config         Config
	DatasetSchema  DatasetSchema
	Dataset        Dataset
	Layer          Layer
	Lock           Lock
	Plugin         Plugin
	Project        Project
	PropertySchema PropertySchema
	Property       Property
	Scene          Scene
	SceneLock      SceneLock
	Tag            Tag
	Workspace      Workspace
	User           User
	Policy         Policy
	Transaction    usecasex.Transaction
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
		Lock:           c.Lock,
		Plugin:         c.Plugin.Filtered(scene),
		Policy:         c.Policy,
		Project:        c.Project.Filtered(workspace),
		PropertySchema: c.PropertySchema.Filtered(scene),
		Property:       c.Property.Filtered(scene),
		Scene:          c.Scene.Filtered(workspace),
		SceneLock:      c.SceneLock,
		Tag:            c.Tag.Filtered(scene),
		Transaction:    c.Transaction,
		User:           c.User,
		Workspace:      c.Workspace,
	}
}

type WorkspaceFilter struct {
	Readable user.WorkspaceIDList
	Writable user.WorkspaceIDList
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
	var r, w user.WorkspaceIDList
	if f.Readable != nil || g.Readable != nil {
		if f.Readable == nil {
			r = append(g.Readable[:0:0], g.Readable...)
		} else {
			r = append(f.Readable, g.Readable...)
		}
	}
	if f.Writable != nil || g.Writable != nil {
		if f.Writable == nil {
			w = append(g.Writable[:0:0], g.Writable...)
		} else {
			w = append(f.Writable, g.Writable...)
		}
	}
	return WorkspaceFilter{
		Readable: r,
		Writable: w,
	}
}

func (f WorkspaceFilter) CanRead(id user.WorkspaceID) bool {
	return f.Readable == nil || f.Readable.Has(id)
}

func (f WorkspaceFilter) CanWrite(id user.WorkspaceID) bool {
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
			r = append(g.Readable[:0:0], g.Readable...)
		} else {
			r = append(f.Readable, g.Readable...)
		}
	}
	if f.Writable != nil || g.Writable != nil {
		if f.Writable == nil {
			w = append(g.Writable[:0:0], g.Writable...)
		} else {
			w = append(f.Writable, g.Writable...)
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
