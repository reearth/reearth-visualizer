package verror_test

import (
	"errors"
	"testing"

	"github.com/reearth/reearth/server/pkg/locales"
	"github.com/reearth/reearth/server/pkg/verror"
	"github.com/reearth/reearthx/i18n"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func TestNewVError(t *testing.T) {
	tests := []struct {
		name     string
		lang     language.Tag
		expected string
	}{
		{
			name: "English localization",
			lang: language.English,
			// Use a constant from locales package instead of hardcoding
			expected: "The alias must be 5-32 characters long and can only contain alphanumeric characters, underscores, and hyphens.",
		},
		{
			name:     "Japanese localization",
			lang:     language.Japanese,
			expected: "エイリアスは5-32文字で、英数字、アンダースコア、ハイフンのみ使用できます。",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			i18nBundle := i18n.NewBundle(tt.lang)
			locales.AddErrorMessages(i18nBundle)

			key := "pkg.project.invalid_alias"
			baseErr := errors.New("base error message")

			ve := verror.NewVError(key, baseErr)
			localizedErr := ve.VErr.LocalizeError(i18n.NewLocalizer(i18nBundle, tt.lang.String()))

			assert.Equal(t, key, ve.Code, "Code should match the provided key")
			assert.Equal(t, key, ve.Error(), "Error method should return the error code")
			assert.Equal(t, tt.expected, localizedErr.Error(), "Localized error message should match the expected translation")
			assert.Equal(t, baseErr, ve.VErr.Unwrap(), "Unwrapped error should match the base error")
		})
	}
}
