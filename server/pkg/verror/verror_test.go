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
	// load i18n messages
	i18nBundle := i18n.NewBundle(language.English)
	locales.AddErrorMessages(i18nBundle)

	key := "pkg.project.invalid_alias"
	baseErr := errors.New("base error message")

	ve := verror.NewVError(key, baseErr)
	localizedErr := ve.VErr.LocalizeError(i18n.NewLocalizer(i18nBundle, language.English.String()))

	assert.Equal(t, key, ve.Code, "Code should match the provided key")
	assert.Equal(t, key, ve.Error(), "Error method should return the correct error message")
	assert.Equal(t, localizedErr.Error(), "The alias must be 5-32 characters long and can only contain alphanumeric characters, underscores, and hyphens.", "Error message should include the key and base error message")
	assert.Equal(t, baseErr, ve.VErr.Unwrap(), "Unwrapped error should match the base error")
}
