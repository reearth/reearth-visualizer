package repo

import (
	"errors"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/scene"
	"github.com/reearth/reearth-backend/pkg/user"
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
	Team           Team
	Transaction    Transaction
	User           User
}

func (c Container) Filtered(team TeamFilter, scene SceneFilter) Container {
	return Container{
		Asset:          c.Asset.Filtered(team),
		AuthRequest:    c.AuthRequest,
		Config:         c.Config,
		DatasetSchema:  c.DatasetSchema.Filtered(scene),
		Dataset:        c.Dataset.Filtered(scene),
		Layer:          c.Layer.Filtered(scene),
		Lock:           c.Lock,
		Plugin:         c.Plugin.Filtered(scene),
		Project:        c.Project.Filtered(team),
		PropertySchema: c.PropertySchema.Filtered(scene),
		Property:       c.Property.Filtered(scene),
		Scene:          c.Scene.Filtered(team),
		SceneLock:      c.SceneLock,
		Tag:            c.Tag.Filtered(scene),
		Team:           c.Team,
		Transaction:    c.Transaction,
		User:           c.User,
	}
}

type TeamFilter struct {
	Readable user.TeamIDList
	Writable user.TeamIDList
}

func TeamFilterFromOperator(o *usecase.Operator) TeamFilter {
	return TeamFilter{
		Readable: o.AllReadableTeams(),
		Writable: o.AllWritableTeams(),
	}
}

func (f TeamFilter) Clone() TeamFilter {
	return TeamFilter{
		Readable: f.Readable.Clone(),
		Writable: f.Writable.Clone(),
	}
}

func (f TeamFilter) Merge(g TeamFilter) TeamFilter {
	var r, w user.TeamIDList
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
	return TeamFilter{
		Readable: r,
		Writable: w,
	}
}

func (f TeamFilter) CanRead(id user.TeamID) bool {
	return f.Readable == nil || f.Readable.Includes(id)
}

func (f TeamFilter) CanWrite(id user.TeamID) bool {
	return f.Writable == nil || f.Writable.Includes(id)
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
	return f.Readable == nil || f.Readable.Includes(id)
}

func (f SceneFilter) CanWrite(id scene.ID) bool {
	return f.Writable == nil || f.Writable.Includes(id)
}
