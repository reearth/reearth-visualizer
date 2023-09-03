package storytelling

import (
	"testing"

	"github.com/reearth/reearthx/util"
	"github.com/stretchr/testify/assert"
)

func TestStoryBuilder(t *testing.T) {
	b := NewStory()
	assert.Equal(t, &StoryBuilder{s: &Story{}}, b)

	s, err := b.Build()
	assert.Nil(t, s)
	assert.ErrorIs(t, ErrInvalidID, err)

	assert.PanicsWithError(t, ErrInvalidID.Error(), func() {
		b.MustBuild()
	})

	b = b.NewID()
	assert.False(t, b.s.id.IsEmpty())

	storyID := NewStoryID()
	propertyID := NewPropertyID()
	sceneID := NewSceneID()

	b = b.ID(storyID).
		Scene(sceneID).
		Title("title").
		Alias("alias").
		Property(propertyID).
		Pages(nil).
		Status(PublishmentStatusPrivate).
		PublishedAt(nil).
		PublicTitle("public title").
		PublicDescription("public description").
		PublicImage("/test.jpg").
		PublicNoIndex(true).
		PublicBasicAuth(true, "user", "pass")

	s, err = b.Build()
	assert.NoError(t, err)
	assert.Equal(t, &Story{
		id:                storyID,
		property:          propertyID,
		scene:             sceneID,
		title:             "title",
		alias:             "alias",
		pages:             nil,
		status:            PublishmentStatusPrivate,
		panelPosition:     PositionLeft,
		publishedAt:       nil,
		updatedAt:         storyID.Timestamp(),
		publicTitle:       "public title",
		publicDescription: "public description",
		publicImage:       "/test.jpg",
		publicNoIndex:     true,
		isBasicAuthActive: true,
		basicAuthUsername: "user",
		basicAuthPassword: "pass",
	}, s)

	now := util.Now()
	b = b.UpdatedAt(now)
	b = b.PanelPosition(PositionRight)
	s, err = b.Build()
	assert.NoError(t, err)
	assert.Equal(t, s.updatedAt, now)
	assert.Equal(t, s.panelPosition, PositionRight)

	assert.NotPanics(t, func() {
		b.MustBuild()
	})

}
