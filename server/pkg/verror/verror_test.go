package verror_test

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth/server/pkg/i18n/message"
	"github.com/reearth/reearth/server/pkg/i18n/message/errmsg"
	"github.com/reearth/reearth/server/pkg/verror"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func TestNewVError(t *testing.T) {
	errmsg.ErrorMessages = map[message.ErrKey]map[language.Tag]message.ErrorMessage{
		errmsg.ErrKeyPkgProjectInvalidAlias: {
			language.English: {
				Message:     "Invalid alias name: {{.aliasName}}",
				Description: "The alias '{{.aliasName}}' must be {{.minLength}}-{{.maxLength}} characters long.",
			},
		},
	}

	templateData := map[language.Tag]map[string]interface{}{
		language.English: {
			"aliasName": "test_alias",
			"minLength": 5,
			"maxLength": 32,
		},
	}

	err := errors.New("underlying error")
	ve := verror.NewVError(errmsg.ErrKeyPkgProjectInvalidAlias, errmsg.ErrorMessages[errmsg.ErrKeyPkgProjectInvalidAlias], templateData, err)

	assert.Equal(t, "invalid_alias", ve.GetErrCode())
	assert.Equal(t, errmsg.ErrorMessages["pkg.project.invalid_alias"], ve.ErrMsg)
	assert.Equal(t, templateData, ve.TemplateData)
	assert.Equal(t, err, ve.Err)
}

func TestAddTemplateData(t *testing.T) {
	ve := verror.NewVError(errmsg.ErrKeyPkgProjectInvalidAlias, errmsg.ErrorMessages[errmsg.ErrKeyPkgProjectInvalidAlias], nil, nil)

	ve.AddTemplateData("key1", "value1")
	ve.AddTemplateData("key2", 123)

	expectedData := map[language.Tag]map[string]interface{}{
		language.English: {
			"key1": "value1",
			"key2": 123,
		},
		language.Japanese: {
			"key1": "value1",
			"key2": 123,
		},
	}
	assert.Equal(t, expectedData, ve.TemplateData)
}

func TestApplyTemplate(t *testing.T) {
	templateString := "Invalid alias name: {{.aliasName}}, must be between {{.minLength}} and {{.maxLength}} characters."
	data := map[language.Tag]map[string]interface{}{
		language.English: {
			"aliasName": "test_alias",
			"minLength": 5,
			"maxLength": 32,
		},
	}

	ctx := context.Background()
	result := message.ApplyTemplate(ctx, templateString, data, language.English)
	expected := "Invalid alias name: test_alias, must be between 5 and 32 characters."
	assert.Equal(t, expected, result)
}

func TestError(t *testing.T) {
	en := language.English
	errmsg.ErrorMessages = map[message.ErrKey]map[language.Tag]message.ErrorMessage{
		errmsg.ErrKeyPkgProjectInvalidAlias: {
			en: {
				Message:     "Invalid alias name: {{.aliasName}}",
				Description: "The alias '{{.aliasName}}' must be {{.minLength}}-{{.maxLength}} characters long.",
			},
		},
	}

	templateData := map[language.Tag]map[string]interface{}{
		en: {
			"aliasName": "test_alias",
			"minLength": 5,
			"maxLength": 32,
		},
	}

	ve := verror.NewVError(errmsg.ErrKeyPkgProjectInvalidAlias, errmsg.ErrorMessages[errmsg.ErrKeyPkgProjectInvalidAlias], templateData, nil)

	ctx := context.Background()
	msg := message.ApplyTemplate(ctx, ve.ErrMsg[en].Message, templateData, en)
	assert.Equal(t, "Invalid alias name: test_alias", msg)
}

func TestUnwrap(t *testing.T) {
	underlyingErr := errors.New("underlying error")
	ve := verror.NewVError(errmsg.ErrKeyPkgProjectInvalidAlias, errmsg.ErrorMessages[errmsg.ErrKeyPkgProjectInvalidAlias], nil, underlyingErr)

	assert.Equal(t, underlyingErr, ve.Unwrap())
}
