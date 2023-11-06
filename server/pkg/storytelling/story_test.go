package storytelling

import (
	"testing"
	"time"

	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestStory_SettersGetters(t *testing.T) {

	sId := NewStoryID()
	pId := NewPropertyID()
	sceneID := NewSceneID()
	now := time.Now()

	s := &Story{
		id:                sId,
		property:          pId,
		scene:             sceneID,
		title:             "test",
		alias:             "abc",
		pages:             nil,
		status:            PublishmentStatusPrivate,
		publishedAt:       nil,
		updatedAt:         now,
		panelPosition:     PositionRight,
		isBasicAuthActive: false,
		basicAuthUsername: "user",
		basicAuthPassword: "pass",
		publicTitle:       "public title",
		publicDescription: "public description",
		publicImage:       "/test.jpg",
		publicNoIndex:     true,
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
	assert.Equal(t, PositionRight, s.PanelPosition())
	assert.Equal(t, false, s.IsBasicAuthActive())
	assert.Equal(t, "", s.BasicAuthUsername())
	assert.Equal(t, "", s.BasicAuthPassword())
	assert.Equal(t, "public title", s.PublicTitle())
	assert.Equal(t, "public description", s.PublicDescription())
	assert.Equal(t, "/test.jpg", s.PublicImage())
	assert.Equal(t, true, s.PublicNoIndex())

	util.MockNow(now.Add(1 * time.Hour))
	s.Rename("test2")
	assert.Equal(t, "test2", s.Title())
	assert.Equal(t, now.Add(1*time.Hour), s.UpdatedAt())

	s.SetUpdatedAt(now.Add(2 * time.Hour))
	assert.Equal(t, now.Add(2*time.Hour), s.UpdatedAt())

	s.SetPanelPosition(PositionLeft)
	assert.Equal(t, PositionLeft, s.PanelPosition())

	s.SetBgColor("test")
	assert.Equal(t, "test", s.BgColor())

	err := s.SetBasicAuth(true, nil, nil)
	assert.Equal(t, ErrBasicAuthUserNamePasswordEmpty, err)

	err = s.SetBasicAuth(false, lo.ToPtr("user"), lo.ToPtr("pass"))
	assert.NoError(t, err)
	assert.Equal(t, false, s.IsBasicAuthActive())
	assert.Equal(t, "", s.BasicAuthUsername())
	assert.Equal(t, "", s.BasicAuthPassword())

	err = s.SetBasicAuth(true, lo.ToPtr("user"), lo.ToPtr("pass"))
	assert.NoError(t, err)
	assert.Equal(t, true, s.IsBasicAuthActive())
	assert.Equal(t, "user", s.BasicAuthUsername())
	assert.Equal(t, "pass", s.BasicAuthPassword())

	s.SetPublicTitle("public title 2")
	assert.Equal(t, "public title 2", s.PublicTitle())

	s.SetPublicDescription("public description 2")
	assert.Equal(t, "public description 2", s.PublicDescription())

	s.SetPublicImage("/test2.jpg")
	assert.Equal(t, "/test2.jpg", s.PublicImage())

	s.SetPublicNoIndex(false)
	assert.Equal(t, false, s.PublicNoIndex())
}

func TestStory_ValidateProperties(t *testing.T) {
}
