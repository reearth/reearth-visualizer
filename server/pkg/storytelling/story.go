package storytelling

import (
	"fmt"
	"time"

	"github.com/pkg/errors"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearthx/util"
)

type Story struct {
	id          StoryID
	property    PropertyID
	scene       SceneID
	title       string
	alias       string
	pages       *PageList
	status      PublishmentStatus
	publishedAt *time.Time
	updatedAt   time.Time
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

func (s *Story) Rename(name string) {
	s.title = name
	s.updatedAt = util.Now()
}

func (s *Story) SetUpdatedAt(now time.Time) {
	s.updatedAt = now
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
