package scene

import (
	"errors"
	"time"

	"github.com/reearth/reearth-backend/pkg/id"
)

var ErrSceneIsLocked error = errors.New("scene is locked")

type Scene struct {
	id                id.SceneID
	project           id.ProjectID
	team              id.TeamID
	rootLayer         id.LayerID
	widgetSystem      *WidgetSystem
	widgetAlignSystem *WidgetAlignSystem
	pluginSystem      *PluginSystem
	updatedAt         time.Time
	property          id.PropertyID
	clusters          *ClusterList
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
	return id.ID(s.id).Timestamp()
}

func (s *Scene) Project() id.ProjectID {
	if s == nil {
		return id.ProjectID{}
	}
	return s.project
}

func (s *Scene) Team() id.TeamID {
	if s == nil {
		return id.TeamID{}
	}
	return s.team
}

func (s *Scene) Property() id.PropertyID {
	if s == nil {
		return id.PropertyID{}
	}
	return s.property
}

func (s *Scene) RootLayer() id.LayerID {
	if s == nil {
		return id.LayerID{}
	}
	return s.rootLayer
}

func (s *Scene) WidgetSystem() *WidgetSystem {
	if s == nil {
		return nil
	}
	return s.widgetSystem
}

func (s *Scene) WidgetAlignSystem() *WidgetAlignSystem {
	if s == nil {
		return nil
	}
	return s.widgetAlignSystem
}

func (s *Scene) PluginSystem() *PluginSystem {
	if s == nil {
		return nil
	}
	return s.pluginSystem
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

func (s *Scene) IsTeamIncluded(teams []id.TeamID) bool {
	if s == nil || teams == nil {
		return false
	}
	for _, t := range teams {
		if t == s.team {
			return true
		}
	}
	return false
}

func (s *Scene) Properties() []id.PropertyID {
	if s == nil {
		return nil
	}
	ids := []id.PropertyID{s.property}
	ids = append(ids, s.pluginSystem.Properties()...)
	ids = append(ids, s.widgetSystem.Properties()...)
	return ids
}

func (s *Scene) Clusters() *ClusterList {
	if s == nil {
		return nil
	}
	return s.clusters
}
