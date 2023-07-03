package storytelling

import "github.com/reearth/reearth/server/pkg/id"

type StoryBuilder struct {
	s *Story
}

func NewStory() *StoryBuilder {
	return &StoryBuilder{s: &Story{}}
}

func (b *StoryBuilder) Build() (*Story, error) {
	return b.s, nil
}

func (b *StoryBuilder) MustBuild() *Story {
	s, err := b.Build()
	if err != nil {
		panic(err)
	}
	return s
}

func (b *StoryBuilder) ID(id id.StorytellingID) *StoryBuilder {
	b.s.id = id
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

func (b *StoryBuilder) Pages(pages []Page) *StoryBuilder {
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
