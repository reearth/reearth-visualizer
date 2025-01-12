package app

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/pkg/apperror"
	"github.com/stretchr/testify/assert"
	"github.com/vektah/gqlparser/v2/ast"
	"golang.org/x/text/language"
)

func TestCustomErrorPresenter(t *testing.T) {
	ctx := context.Background()
	ctx = adapter.AttachLang(ctx, language.English)

	appErr := &apperror.AppError{
		LocalesError: map[string]*apperror.LocalesError{
			"en": {
				Code:        "test_code",
				Message:     "Test message",
				Description: "Test description",
			},
		},
		SystemError: errors.New("system error"),
	}

	t.Run("AppError with English language", func(t *testing.T) {
		graphqlErr := customErrorPresenter(ctx, appErr, false)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "Test message", graphqlErr.Message)
		assert.Equal(t, "test_code", graphqlErr.Extensions["code"])
		assert.Equal(t, "Test description", graphqlErr.Extensions["description"])
		assert.Equal(t, nil, graphqlErr.Extensions["system_error"])
	})

	t.Run("Fallback to default GraphQL error", func(t *testing.T) {
		defaultErr := errors.New("default error")
		graphqlErr := customErrorPresenter(ctx, defaultErr, false)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "default error", graphqlErr.Message)
		assert.Equal(t, nil, graphqlErr.Extensions["system_error"])
	})

	t.Run("Development mode with AppError", func(t *testing.T) {
		graphqlErr := customErrorPresenter(ctx, appErr, true)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, ast.Path{}, graphqlErr.Path)
		assert.Equal(t, "Test message", graphqlErr.Message)
		assert.Equal(t, "test_code", graphqlErr.Extensions["code"])
		assert.Equal(t, "Test description", graphqlErr.Extensions["description"])
	})

	t.Run("Development mode with default error", func(t *testing.T) {
		defaultErr := errors.New("default error")
		graphqlErr := customErrorPresenter(ctx, defaultErr, true)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "default error", graphqlErr.Message)
		assert.Equal(t, defaultErr.Error(), graphqlErr.Extensions["system_error"])
	})

}
