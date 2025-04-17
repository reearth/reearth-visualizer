package project

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/alias"
	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/i18n/message"
	"github.com/stretchr/testify/assert"
)

func TestErrInvalidAlias(t *testing.T) {
	ctx := context.Background()
	vErr := alias.ErrInvalidProjectAlias.AddTemplateData("aliasName", "test")
	for _, locale := range i18n.LocaleTypes() {
		assert.NotEqual(t, "", message.ApplyTemplate(ctx, vErr.ErrMsg[locale].Message, vErr.TemplateData, locale))
		assert.NotEqual(t, "", message.ApplyTemplate(ctx, vErr.ErrMsg[locale].Description, vErr.TemplateData, locale))
	}
}
