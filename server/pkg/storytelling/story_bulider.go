package storytelling

import (
	"time"

	"github.com/reearth/reearth/server/pkg/id"
)

type StoryBuilder struct {
	s *Story
}

func NewStory() *StoryBuilder {
	return &StoryBuilder{s: &Story{}}
}

func (b *StoryBuilder) Build() (*Story, error) {
	if b.s.updatedAt.IsZero() {
		b.s.updatedAt = b.s.CreatedAt()
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

func (b *StoryBuilder) Scene(scene id.SceneID) *StoryBuilder {
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
