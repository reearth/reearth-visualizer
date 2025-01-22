package repo

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/i18n/message"
	"github.com/stretchr/testify/assert"
)

func TestRepoErrResourceNotFound(t *testing.T) {
	ctx := context.Background()
	vErr := ErrResourceNotFound
	for _, locale := range i18n.LocaleTypes() {
		assert.NotEqual(t, "", message.ApplyTemplate(ctx, vErr.ErrMsg[locale].Message, vErr.TemplateData, locale))
		assert.NotEqual(t, "", message.ApplyTemplate(ctx, vErr.ErrMsg[locale].Description, vErr.TemplateData, locale))
	}
}
