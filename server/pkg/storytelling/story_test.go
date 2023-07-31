package storytelling

import (
	"testing"
	"time"

	"github.com/reearth/reearthx/util"
	"github.com/stretchr/testify/assert"
)

func TestStory_SettersGetters(t *testing.T) {

	sId := NewStoryID()
	pId := NewPropertyID()
	sceneID := NewSceneID()
	now := time.Now()

	s := &Story{
		id:          sId,
		property:    pId,
		scene:       sceneID,
		title:       "test",
		alias:       "abc",
		pages:       nil,
		status:      PublishmentStatusPrivate,
		publishedAt: nil,
		updatedAt:   now,
	}

	assert.Equal(t, sId, s.Id())
	assert.Equal(t, pId, s.Property())
	assert.Equal(t, sceneID, s.Scene())
	assert.Equal(t, "test", s.Title())
	assert.Equal(t, "abc", s.Alias())
	assert.Equal(t, PublishmentStatusPrivate, s.Status())
	assert.Equal(t, now, s.UpdatedAt())
	assert.Nil(t, s.Pages())
	assert.Nil(t, s.PublishedAt())
	assert.Equal(t, sId.Timestamp(), s.CreatedAt())

	util.MockNow(now.Add(1 * time.Hour))
	s.Rename("test2")
	assert.Equal(t, "test2", s.Title())
	assert.Equal(t, now.Add(1*time.Hour), s.UpdatedAt())

	s.SetUpdatedAt(now.Add(2 * time.Hour))
	assert.Equal(t, now.Add(2*time.Hour), s.UpdatedAt())

}

func TestStory_ValidateProperties(t *testing.T) {
}
