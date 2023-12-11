package storytelling

import (
	"time"
)

type StoryBuilder struct {
	s *Story
}

func NewStory() *StoryBuilder {
	return &StoryBuilder{s: &Story{}}
}

func (b *StoryBuilder) Build() (*Story, error) {
	if b.s.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.s.updatedAt.IsZero() {
		b.s.updatedAt = b.s.CreatedAt()
	}
	if len(b.s.panelPosition) == 0 {
		b.s.panelPosition = PositionLeft
	}
	return b.s, nil
}

func (b *StoryBuilder) MustBuild() *Story {
	s, err := b.Build()
	if err != nil {
		panic(err)
	}
	return s
}

func (b *StoryBuilder) ID(id StoryID) *StoryBuilder {
	b.s.id = id
	return b
}

func (b *StoryBuilder) NewID() *StoryBuilder {
	b.s.id = NewStoryID()
	return b
}

func (b *StoryBuilder) Property(property PropertyID) *StoryBuilder {
	b.s.property = property
	return b
}

func (b *StoryBuilder) Scene(scene SceneID) *StoryBuilder {
	b.s.scene = scene
	return b
}

func (b *StoryBuilder) Pages(pages *PageList) *StoryBuilder {
	b.s.pages = pages
	return b
}

func (b *StoryBuilder) Status(status PublishmentStatus) *StoryBuilder {
	b.s.status = status
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

func (b *StoryBuilder) Alias(alias string) *StoryBuilder {
	b.s.alias = alias
	return b
}

func (b *StoryBuilder) Title(title string) *StoryBuilder {
	b.s.title = title
	return b
}

func (b *StoryBuilder) PublishedAt(t *time.Time) *StoryBuilder {
	b.s.publishedAt = t
	return b
}

func (b *StoryBuilder) UpdatedAt(at time.Time) *StoryBuilder {
	b.s.updatedAt = at
	return b
}

func (b *StoryBuilder) PublicBasicAuth(active bool, username, password string) *StoryBuilder {
	b.s.isBasicAuthActive = active
	b.s.basicAuthUsername = username
	b.s.basicAuthPassword = password
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
