package storytelling

import (
	"errors"
	"time"

	"github.com/reearth/reearth/server/pkg/alias"
	"github.com/reearth/reearth/server/pkg/id"
)

type StoryBuilder struct {
	s *Story
}

func NewStory() *StoryBuilder {
	return &StoryBuilder{s: &Story{}}
}

func (b *StoryBuilder) Build() (*Story, error) {
	if b.s.id.IsNil() {
		return nil, errors.New("invalid ID StoryBuilder")
	}
	if b.s.alias == "" {
		b.s.alias = alias.ReservedReearthPrefixStory + b.s.id.String()
	}
	if b.s.updatedAt.IsZero() {
		b.s.updatedAt = b.s.CreatedAt()
	}
	if len(b.s.panelPosition) == 0 {
		b.s.panelPosition = PositionLeft
	}
	b.s.coreSupport = true
	return b.s, nil
}

func (b *StoryBuilder) MustBuild() *Story {
	s, err := b.Build()
	if err != nil {
		panic(err)
	}
	return s
}

func (b *StoryBuilder) ID(id id.StoryID) *StoryBuilder {
	b.s.id = id
	return b
}

func (b *StoryBuilder) NewID() *StoryBuilder {
	b.s.id = id.NewStoryID()
	return b
}

func (b *StoryBuilder) Property(property id.PropertyID) *StoryBuilder {
	b.s.property = property
	return b
}

func (b *StoryBuilder) Project(project id.ProjectID) *StoryBuilder {
	b.s.project = project
	return b
}

func (b *StoryBuilder) Scene(scene id.SceneID) *StoryBuilder {
	b.s.scene = scene
	return b
}

func (b *StoryBuilder) Pages(pages *PageList) *StoryBuilder {
	b.s.pages = pages
	return b
}

func (b *StoryBuilder) PanelPosition(position Position) *StoryBuilder {
	b.s.panelPosition = position
	return b
}

func (b *StoryBuilder) BgColor(bgColor string) *StoryBuilder {
	b.s.bgColor = bgColor
	return b
}

func (b *StoryBuilder) Title(title string) *StoryBuilder {
	b.s.title = title
	return b
}

func (b *StoryBuilder) UpdatedAt(at time.Time) *StoryBuilder {
	b.s.updatedAt = at
	return b
}

// publishment ---------------------

func (b *StoryBuilder) Alias(alias string) *StoryBuilder {
	b.s.alias = alias
	return b
}

func (b *StoryBuilder) Status(status PublishmentStatus) *StoryBuilder {
	b.s.status = status
	return b
}

func (b *StoryBuilder) PublishedAt(t *time.Time) *StoryBuilder {
	b.s.publishedAt = t
	return b
}

func (b *StoryBuilder) PublicTitle(title string) *StoryBuilder {
	b.s.publicTitle = title
	return b
}

func (b *StoryBuilder) PublicDescription(description string) *StoryBuilder {
	b.s.publicDescription = description
	return b
}

func (b *StoryBuilder) PublicImage(image string) *StoryBuilder {
	b.s.publicImage = image
	return b
}

func (b *StoryBuilder) PublicNoIndex(noIndex bool) *StoryBuilder {
	b.s.publicNoIndex = noIndex
	return b
}

func (b *StoryBuilder) PublicBasicAuth(active bool, username, password string) *StoryBuilder {
	b.s.isBasicAuthActive = active
	b.s.basicAuthUsername = username
	b.s.basicAuthPassword = password
	return b
}

func (b *StoryBuilder) EnableGa(enableGa bool) *StoryBuilder {
	b.s.enableGa = enableGa
	return b
}

func (b *StoryBuilder) TrackingID(trackingID string) *StoryBuilder {
	b.s.trackingID = trackingID
	return b
}
