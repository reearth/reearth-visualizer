package app

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/app/locales"
	"github.com/reearth/reearth/server/pkg/verror"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/vektah/gqlparser/v2/ast"
	"golang.org/x/text/language"
)

func TestCustomErrorPresenter(t *testing.T) {
	ctx := context.Background()
	ctx = adapter.AttachLang(ctx, language.English)

	// load i18n messages
	i18Bundle := i18n.NewBundle(language.English)
	locales.AddErrorMessages(i18Bundle)

	vErr := &verror.VError{
		Code: locales.ErrKeyUnknown,
		VErr: rerror.WrapE(i18n.T(locales.ErrKeyUnknown), nil),
	}

	vErrHaveWrapped := &verror.VError{
		Code: locales.ErrKeyUnknown,
		VErr: rerror.WrapE(i18n.T(locales.ErrKeyUnknown), errors.New("wrapped error")),
	}

	t.Run("vErr with English language", func(t *testing.T) {
		graphqlErr := customErrorPresenter(ctx, vErr, i18Bundle, false)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "An unknown error occurred.", graphqlErr.Message)
		assert.Equal(t, locales.ErrKeyUnknown, graphqlErr.Extensions["code"])
		assert.Equal(t, nil, graphqlErr.Extensions["system_error"])
	})

	t.Run("vErr with Japanese language", func(t *testing.T) {
		jaCtx := adapter.AttachLang(context.Background(), language.Japanese)
		graphqlErr := customErrorPresenter(jaCtx, vErr, i18Bundle, false)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "不明なエラーが発生しました。", graphqlErr.Message)
		assert.Equal(t, locales.ErrKeyUnknown, graphqlErr.Extensions["code"])
	})

	t.Run("Wrapped vErr with English language", func(t *testing.T) {
		graphqlErr := customErrorPresenter(ctx, vErrHaveWrapped, i18Bundle, false)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "An unknown error occurred.", graphqlErr.Message)
		assert.Equal(t, locales.ErrKeyUnknown, graphqlErr.Extensions["code"])
		assert.Equal(t, nil, graphqlErr.Extensions["system_error"])
	})

	t.Run("Fallback to default GraphQL error", func(t *testing.T) {
		defaultErr := errors.New("default error")
		graphqlErr := customErrorPresenter(ctx, defaultErr, i18Bundle, false)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "default error", graphqlErr.Message)
		assert.Equal(t, nil, graphqlErr.Extensions["system_error"])
	})

	t.Run("Development mode with AppError", func(t *testing.T) {
		graphqlErr := customErrorPresenter(ctx, vErr, i18Bundle, true)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, ast.Path{}, graphqlErr.Path)
		assert.Equal(t, "An unknown error occurred.", graphqlErr.Message)
		assert.Equal(t, locales.ErrKeyUnknown, graphqlErr.Extensions["code"])
		assert.Equal(t, "", graphqlErr.Extensions["system_error"])

	})

	t.Run("Development mode with default error", func(t *testing.T) {
		defaultErr := errors.New("default error")
		graphqlErr := customErrorPresenter(ctx, defaultErr, i18Bundle, true)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "default error", graphqlErr.Message)
		assert.Equal(t, defaultErr.Error(), graphqlErr.Extensions["system_error"])
	})

	t.Run("Development mode with Wrapped vErr ", func(t *testing.T) {
		graphqlErr := customErrorPresenter(ctx, vErrHaveWrapped, i18Bundle, true)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "An unknown error occurred.", graphqlErr.Message)
		assert.Equal(t, locales.ErrKeyUnknown, graphqlErr.Extensions["code"])
		assert.Equal(t, "wrapped error", graphqlErr.Extensions["system_error"])
	})

}
