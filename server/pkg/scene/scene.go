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

	// publishment
	alias             string
	publishmentStatus PublishmentStatus
	publishedAt       time.Time
	publicTitle       string
	publicDescription string
	publicImage       string
	publicNoIndex     bool
	isBasicAuthActive bool
	basicAuthUsername string
	basicAuthPassword string
	enableGa          bool
	trackingId        string
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

// publishment ---------------------

func (s *Scene) Alias() string {
	return s.alias
}

func (s *Scene) PublishmentStatus() PublishmentStatus {
	return s.publishmentStatus
}

func (s *Scene) PublishedAt() time.Time {
	return s.publishedAt
}

func (s *Scene) PublicTitle() string {
	return s.publicTitle
}

func (s *Scene) PublicDescription() string {
	return s.publicDescription
}

func (s *Scene) PublicImage() string {
	return s.publicImage
}

func (s *Scene) PublicNoIndex() bool {
	return s.publicNoIndex
}

func (s *Scene) IsBasicAuthActive() bool {
	return s.isBasicAuthActive
}

func (s *Scene) BasicAuthUsername() string {
	return s.basicAuthUsername
}

func (s *Scene) BasicAuthPassword() string {
	return s.basicAuthPassword
}

func (s *Scene) EnableGA() bool {
	return s.enableGa
}

func (s *Scene) TrackingID() string {
	return s.trackingId
}

func (s *Scene) UpdateAlias(alias string) {
	s.alias = alias
}

func (s *Scene) UpdatePublishmentStatus(publishmentStatus PublishmentStatus) {
	s.publishmentStatus = publishmentStatus
}

func (s *Scene) SetPublishedAt(publishedAt time.Time) {
	s.publishedAt = publishedAt
}

func (s *Scene) UpdatePublicTitle(publicTitle string) {
	s.publicTitle = publicTitle
}

func (s *Scene) UpdatePublicDescription(publicDescription string) {
	s.publicDescription = publicDescription
}

func (s *Scene) UpdatePublicImage(publicImage string) {
	s.publicImage = publicImage
}

func (s *Scene) UpdatePublicNoIndex(publicNoIndex bool) {
	s.publicNoIndex = publicNoIndex
}

func (s *Scene) SetIsBasicAuthActive(isBasicAuthActive bool) {
	s.isBasicAuthActive = isBasicAuthActive
}

func (s *Scene) SetBasicAuthUsername(basicAuthUsername string) {
	s.basicAuthUsername = basicAuthUsername
}

func (s *Scene) SetBasicAuthPassword(basicAuthPassword string) {
	s.basicAuthPassword = basicAuthPassword
}

func (s *Scene) UpdateEnableGA(enableGa bool) {
	s.enableGa = enableGa
}

func (s *Scene) UpdateTrackingID(trackingId string) {
	s.trackingId = trackingId
}
