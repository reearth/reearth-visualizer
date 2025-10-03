package gqlmodel

import (
	"strings"
	"testing"

	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func TestToMe(t *testing.T) {
	uid := user.NewID()
	wid := user.NewWorkspaceID()
	photoURL := "https://example.com/photo.jpg"

	t.Run("with photoURL", func(t *testing.T) {
		metadata := user.NewMetadata()
		metadata.SetPhotoURL(photoURL)
		metadata.SetLang(language.English)
		metadata.SetTheme(user.ThemeDark)

		u := user.New().
			ID(uid).
			Workspace(wid).
			Name("Test User").
			Email("test@example.com").
			Metadata(metadata).
			MustBuild()

		me := ToMe(u)

		assert.NotNil(t, me)
		assert.Equal(t, IDFrom(uid), me.ID)
		assert.Equal(t, "Test User", me.Name)
		assert.Equal(t, "test@example.com", me.Email)
		assert.Equal(t, language.English, me.Lang)
		assert.Equal(t, strings.ToLower(string(ThemeDark)), string(me.Theme))
		assert.NotNil(t, me.Metadata)
		assert.NotNil(t, me.Metadata.PhotoURL)
		assert.Equal(t, photoURL, *me.Metadata.PhotoURL)
	})

	t.Run("without photoURL", func(t *testing.T) {
		metadata := user.NewMetadata()
		metadata.SetLang(language.Japanese)
		metadata.SetTheme(user.ThemeLight)

		u := user.New().
			ID(uid).
			Workspace(wid).
			Name("Test User").
			Email("test@example.com").
			Metadata(metadata).
			MustBuild()

		me := ToMe(u)

		assert.NotNil(t, me)
		assert.Equal(t, IDFrom(uid), me.ID)
		assert.Equal(t, "Test User", me.Name)
		assert.Equal(t, "test@example.com", me.Email)
		assert.Equal(t, language.Japanese, me.Lang)
		assert.Equal(t, strings.ToLower(string(ThemeLight)), string(me.Theme))
		assert.Nil(t, me.Metadata) // Metadata should be nil when photoURL is empty
	})

	t.Run("nil user", func(t *testing.T) {
		me := ToMe(nil)
		assert.Nil(t, me)
	})
}
