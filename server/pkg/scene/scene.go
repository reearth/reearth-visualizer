package scene

import (
	"errors"
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

var ErrSceneIsLocked error = errors.New("scene is locked")

type Scene struct {
	id        id.SceneID
	project   id.ProjectID
	workspace accountdomain.WorkspaceID
	widgets   *Widgets
	plugins   *Plugins
	updatedAt time.Time
	property  id.PropertyID
	styles    *StyleList
}

func (s *Scene) ID() id.SceneID {
	if s == nil {
		return id.SceneID{}
	}
	return s.id
}

func (s *Scene) CreatedAt() time.Time {
	if s == nil {
		return time.Time{}
	}
	return s.id.Timestamp()
}

func (s *Scene) Project() id.ProjectID {
	if s == nil {
		return id.ProjectID{}
	}
	return s.project
}

func (s *Scene) Workspace() accountdomain.WorkspaceID {
	if s == nil {
		return accountdomain.WorkspaceID{}
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

func (s *Scene) AddPlugin(plugin *Plugin) bool {
	if s == nil {
		return false
	}
	return s.plugins.Add(plugin)
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
