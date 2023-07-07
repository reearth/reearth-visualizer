package mongodoc

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/storytelling"
	"golang.org/x/exp/slices"
)

type StorytellingDocument struct {
}

type StorytellingConsumer = Consumer[*StorytellingDocument, *storytelling.Story]

func NewStorytellingConsumer(scenes []id.SceneID) *StorytellingConsumer {
	return NewConsumer[*StorytellingDocument, *storytelling.Story](func(a *storytelling.Story) bool {
		return scenes == nil || slices.Contains(scenes, a.Scene())
	})
}

func NewStorytelling(story *storytelling.Story) (*StorytellingDocument, string) {
	sId := story.Id().String()

	return &StorytellingDocument{}, sId
}

func NewStorytellings(story *storytelling.StoryList) ([]any, []string) {
	return []any{}, []string{}
}

func (d *StorytellingDocument) Model() (*storytelling.Story, error) {
	return &storytelling.Story{}, nil
}
