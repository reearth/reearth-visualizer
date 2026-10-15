package mongodoc

import (
	"testing"
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestStorytellingDocument_FirstPublishedAt_RoundTrip(t *testing.T) {
	first := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)

	for name, value := range map[string]*time.Time{"set": &first, "legacy (nil)": nil} {
		t.Run(name, func(t *testing.T) {
			doc := StorytellingDocument{
				Id:               id.NewStoryID().String(),
				Property:         id.NewPropertyID().String(),
				Scene:            id.NewSceneID().String(),
				FirstPublishedAt: value,
			}

			story, err := doc.Model()
			assert.NoError(t, err)
			assert.Equal(t, value, story.FirstPublishedAt())

			back, _ := NewStorytelling(story)
			assert.Equal(t, value, back.FirstPublishedAt)
		})
	}
}
