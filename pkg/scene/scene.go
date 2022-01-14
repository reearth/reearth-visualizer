package scene

import (
	"errors"
	"time"
)

var ErrSceneIsLocked error = errors.New("scene is locked")

type Scene struct {
	id                ID
	project           ProjectID
	team              TeamID
	rootLayer         LayerID
	widgetSystem      *WidgetSystem
	widgetAlignSystem *WidgetAlignSystem
	pluginSystem      *PluginSystem
	updatedAt         time.Time
	property          PropertyID
	clusters          *ClusterList
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
	return createdAt(s.id)
}

func (s *Scene) Project() ProjectID {
	if s == nil {
		return ProjectID{}
	}
	return s.project
}

func (s *Scene) Team() TeamID {
	if s == nil {
		return TeamID{}
	}
	return s.team
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

func (s *Scene) IsTeamIncluded(teams []TeamID) bool {
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

func (s *Scene) Properties() []PropertyID {
	if s == nil {
		return nil
	}
	ids := []PropertyID{s.property}
	ids = append(ids, s.pluginSystem.Properties()...)
	ids = append(ids, s.widgetSystem.Properties()...)
	ids = append(ids, s.clusters.Properties()...)
	return ids
}

func (s *Scene) Clusters() *ClusterList {
	if s == nil {
		return nil
	}
	return s.clusters
}
