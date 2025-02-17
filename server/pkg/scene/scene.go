package scene

import (
	"errors"
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
)

var ErrSceneIsLocked error = errors.New("scene is locked")

type Scene struct {
	id        ID
	project   id.ProjectID
	workspace accountdomain.WorkspaceID
	rootLayer LayerID
	widgets   *Widgets
	plugins   *Plugins
	updatedAt time.Time
	property  PropertyID
	clusters  *ClusterList
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

func (s *Scene) Property() PropertyID {
	if s == nil {
		return PropertyID{}
	}
	return s.property
}

func (s *Scene) RootLayer() LayerID {
	if s == nil {
		return LayerID{}
	}
	return s.rootLayer
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

func (s *Scene) Properties() []PropertyID {
	if s == nil {
		return nil
	}
	ids := []PropertyID{s.property}
	ids = append(ids, s.plugins.Properties()...)
	ids = append(ids, s.widgets.Properties()...)
	ids = append(ids, s.clusters.Properties()...)
	return ids
}

func (s *Scene) Clusters() *ClusterList {
	if s == nil {
		return nil
	}
	return s.clusters
}
