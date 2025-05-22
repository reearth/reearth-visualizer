package storytelling

import (
	"fmt"
	"time"

	"github.com/pkg/errors"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearthx/util"
)

var (
	ErrBasicAuthUserNamePasswordEmpty       = errors.New("basic auth username or password is empty")
	ErrInvalidAlias                   error = errors.New("invalid alias")
)

type Story struct {
	id            id.StoryID
	property      id.PropertyID
	scene         id.SceneID
	title         string
	pages         *PageList
	panelPosition Position
	bgColor       string
	updatedAt     time.Time
	coreSupport   bool

	// publishment
	alias             string
	status            PublishmentStatus
	publishedAt       *time.Time
	publicTitle       string
	publicDescription string
	publicImage       string
	publicNoIndex     bool
	isBasicAuthActive bool
	basicAuthUsername string
	basicAuthPassword string
	enableGa          bool
	trackingID        string
}

func (s *Story) Id() id.StoryID {
	return s.id
}

func (s *Story) Property() id.PropertyID {
	return s.property
}

func (s *Story) Scene() id.SceneID {
	return s.scene
}

func (s *Story) Pages() *PageList {
	if s == nil {
		return nil
	}
	return s.pages
}

func (s *Story) Title() string {
	return s.title
}

func (s *Story) CreatedAt() time.Time {
	return s.id.Timestamp()
}

func (s *Story) UpdatedAt() time.Time {
	return s.updatedAt
}

func (s *Story) CoreSupport() bool {
	return s.coreSupport
}

func (s *Story) SetPanelPosition(panelPosition Position) {
	s.panelPosition = panelPosition
}

func (s *Story) SetBgColor(bgColor string) {
	s.bgColor = bgColor
}

func (s *Story) Rename(name string) {
	s.title = name
	s.updatedAt = util.Now()
}

func (s *Story) SetUpdatedAt(now time.Time) {
	s.updatedAt = now
}

func (s *Story) PanelPosition() Position {
	return s.panelPosition
}

func (s *Story) BgColor() string {
	return s.bgColor
}

func (s *Story) ValidateProperties(pm property.Map) error {
	if pm == nil {
		return nil
	}

	lp := pm[s.property]
	if lp == nil {
		return errors.New("property does not exist")
	}
	if !lp.Schema().Equal(builtin.PropertySchemaIDStory) {
		return errors.New("property has a invalid schema")
	}

	for i, p := range s.Pages().Pages() {
		if err := p.ValidateProperties(pm); err != nil {
			return fmt.Errorf("page[%d](%s): %w", i, p.Id(), err)
		}
	}

	return nil
}

func (s *Story) Properties() id.PropertyIDList {
	if s == nil {
		return nil
	}
	ids := []id.PropertyID{s.property}
	ids = append(ids, s.Property())
	ids = append(ids, s.pages.Properties()...)
	return ids
}

func (s *Story) MatchWithPublicName(name string) bool {
	if s == nil || name == "" || s.status == PublishmentStatusPrivate {
		return false
	}
	return s.alias == name
}

// publishment ---------------------

func (s *Story) Alias() string {
	return s.alias
}

func (s *Story) PublishmentStatus() PublishmentStatus {
	return s.status
}

func (s *Story) PublishedAt() *time.Time {
	return s.publishedAt
}

func (s *Story) IsBasicAuthActive() bool {
	return s.isBasicAuthActive
}

func (s *Story) BasicAuthUsername() string {
	if !s.isBasicAuthActive {
		return ""
	}
	return s.basicAuthUsername
}

func (s *Story) BasicAuthPassword() string {
	if !s.isBasicAuthActive {
		return ""
	}
	return s.basicAuthPassword
}

func (s *Story) PublicTitle() string {
	return s.publicTitle
}

func (s *Story) PublicDescription() string {
	return s.publicDescription
}

func (s *Story) PublicImage() string {
	return s.publicImage
}

func (s *Story) PublicNoIndex() bool {
	return s.publicNoIndex
}

func (s *Story) EnableGa() bool {
	return s.enableGa
}

func (s *Story) TrackingID() string {
	return s.trackingID
}

func (s *Story) UpdateAlias(newAlias string) {
	s.alias = newAlias
}

func (s *Story) UpdatePublishmentStatus(status PublishmentStatus) {
	s.status = status
}

func (s *Story) SetPublishedAt(now time.Time) {
	s.publishedAt = &now
}

func (s *Story) SetPublicTitle(publicTitle string) {
	s.publicTitle = publicTitle
}

func (s *Story) SetPublicDescription(publicDescription string) {
	s.publicDescription = publicDescription
}

func (s *Story) SetPublicImage(publicImage string) {
	s.publicImage = publicImage
}

func (s *Story) SetPublicNoIndex(publicNoIndex bool) {
	s.publicNoIndex = publicNoIndex
}

func (s *Story) SetBasicAuth(isBasicAuthActive bool, basicAuthUsername, basicAuthPassword *string) error {
	s.isBasicAuthActive = isBasicAuthActive
	if !isBasicAuthActive {
		s.basicAuthUsername = ""
		s.basicAuthPassword = ""
		return nil
	}
	if isBasicAuthActive && (basicAuthUsername == nil || basicAuthPassword == nil) {
		return ErrBasicAuthUserNamePasswordEmpty
	}
	s.basicAuthUsername = *basicAuthUsername
	s.basicAuthPassword = *basicAuthPassword
	return nil
}

func (s *Story) SetEnableGa(enableGa bool) {
	s.enableGa = enableGa
}

func (s *Story) SetTrackingID(trackingID string) {
	s.trackingID = trackingID
}
