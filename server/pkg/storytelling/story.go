package storytelling

import (
	"fmt"
	"time"

	"github.com/pkg/errors"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearthx/util"
)

var ErrBasicAuthUserNamePasswordEmpty = errors.New("basic auth username or password is empty")

type Story struct {
	id            StoryID
	property      PropertyID
	scene         SceneID
	title         string
	pages         *PageList
	panelPosition Position
	updatedAt     time.Time

	alias             string
	status            PublishmentStatus
	publishedAt       *time.Time
	isBasicAuthActive bool
	basicAuthUsername string
	basicAuthPassword string
	publicTitle       string
	publicDescription string
	publicImage       string
	publicNoIndex     bool
}

func (s *Story) Id() StoryID {
	return s.id
}

func (s *Story) Property() PropertyID {
	return s.property
}

func (s *Story) Scene() SceneID {
	return s.scene
}

func (s *Story) Pages() *PageList {
	return s.pages
}

func (s *Story) Title() string {
	return s.title
}

func (s *Story) Alias() string {
	return s.alias
}

func (s *Story) Status() PublishmentStatus {
	return s.status
}

func (s *Story) PublishedAt() *time.Time {
	return s.publishedAt
}

func (s *Story) CreatedAt() time.Time {
	return s.id.Timestamp()
}

func (s *Story) UpdatedAt() time.Time {
	return s.updatedAt
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

func (s *Story) SetPublicDescription(publicDescription string) {
	s.publicDescription = publicDescription
}

func (s *Story) SetPublicImage(publicImage string) {
	s.publicImage = publicImage
}

func (s *Story) SetPublicNoIndex(publicNoIndex bool) {
	s.publicNoIndex = publicNoIndex
}

func (s *Story) SetPanelPosition(panelPosition Position) {
	s.panelPosition = panelPosition
}

func (s *Story) Rename(name string) {
	s.title = name
	s.updatedAt = util.Now()
}

func (s *Story) SetUpdatedAt(now time.Time) {
	s.updatedAt = now
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

func (s *Story) SetPublicTitle(publicTitle string) {
	s.publicTitle = publicTitle
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

func (s *Story) PanelPosition() Position {
	return s.panelPosition
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
