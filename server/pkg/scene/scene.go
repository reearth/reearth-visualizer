package scene

import (
	"errors"
	"time"

	"github.com/reearth/reearth/server/pkg/id"
)

var ErrSceneIsLocked error = errors.New("scene is locked")

type Scene struct {
	id        ID
	project   ProjectID
	workspace WorkspaceID
	widgets   *Widgets
	plugins   *Plugins
	updatedAt time.Time
	property  id.PropertyID
	styles    *StyleList
}

func (s *Scene) ID() ID {
	if s == nil {
		return ID{}
	}
	return s.id
}

func (s *Scene) CreatedAt() time.Time {
	if s == nil {
		return time.Time{}
	}
	return s.id.Timestamp()
}

func (s *Scene) Project() ProjectID {
	if s == nil {
		return ProjectID{}
	}
	return s.project
}

func (s *Scene) Workspace() WorkspaceID {
	if s == nil {
		return WorkspaceID{}
	}
	return s.workspace
}

func (s *Scene) Property() id.PropertyID {
	if s == nil {
		return id.PropertyID{}
	}
	return s.property
}

func (s *Scene) Widgets() *Widgets {
	if s == nil {
		return nil
	}
	return s.widgets
}

func (s *Scene) Plugins() *Plugins {
	if s == nil {
		return nil
	}
	return s.plugins
}

func (s *Scene) PluginIds() []id.PluginID {
	if s == nil {
		return nil
	}
	var pluginIDs []id.PluginID
	for _, plugin := range s.plugins.Plugins() {
		pluginIDs = append(pluginIDs, plugin.Plugin())
	}
	return pluginIDs
}

func (s *Scene) UpdatedAt() time.Time {
	if s == nil {
		return time.Time{}
	}
	return s.updatedAt
}

func (s *Scene) SetUpdatedAt(updatedAt time.Time) {
	if s == nil {
		return
	}
	s.updatedAt = updatedAt
}

func (s *Scene) Properties() []id.PropertyID {
	if s == nil {
		return nil
	}
	ids := []id.PropertyID{s.property}
	ids = append(ids, s.plugins.Properties()...)
	ids = append(ids, s.widgets.Properties()...)
	return ids
}
