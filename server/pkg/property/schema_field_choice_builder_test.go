package property

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/stretchr/testify/assert"
)

func TestSchemaFieldChoiceBuilder_Build(t *testing.T) {
	t.Run("valid build", func(t *testing.T) {
		title := i18n.StringFrom("Title")
		builder := NewSchemaFieldChoice().
			Key("key1").
			Title(title).
			Icon("icon1")

		result, err := builder.Build()

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, "key1", result.Key)
		assert.Equal(t, "Title", result.Title.String())
		assert.Equal(t, "icon1", result.Icon)
	})

	t.Run("missing key should return error", func(t *testing.T) {
		title := i18n.StringFrom("Title")
		builder := NewSchemaFieldChoice().
			Title(title).
			Icon("icon1")

		result, err := builder.Build()

		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestSchemaFieldChoiceBuilder_MustBuild(t *testing.T) {
	t.Run("valid must build", func(t *testing.T) {
		title := i18n.StringFrom("Title")
		builder := NewSchemaFieldChoice().
			Key("key1").
			Title(title).
			Icon("icon1")

		result := builder.MustBuild()

		assert.NotNil(t, result)
		assert.Equal(t, "key1", result.Key)
		assert.Equal(t, "Title", result.Title.String())
		assert.Equal(t, "icon1", result.Icon)
	})

	t.Run("must build should panic on missing key", func(t *testing.T) {
		defer func() {
			if r := recover(); r == nil {
				t.Errorf("expected panic, but did not occur")
			}
		}()

		NewSchemaFieldChoice().
			Title(i18n.StringFrom("Title")).
			Icon("icon1").
			MustBuild()
	})
}
