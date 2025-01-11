package app

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/pkg/apperror"
	"github.com/stretchr/testify/assert"
	"github.com/vektah/gqlparser/v2/ast"
)

func TestCustomErrorPresenter(t *testing.T) {
	// モック用のコンテキストとロケール
	ctx := context.Background()
	ctx = adapter.AttachLang(ctx, "en")

	// アプリケーション固有のエラー
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

		// アサーション: GraphQL エラーの内容を検証
		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "Test message", graphqlErr.Message)
		assert.Equal(t, "test_code", graphqlErr.Extensions["code"])
		assert.Equal(t, "Test description", graphqlErr.Extensions["description"])
		assert.Equal(t, "system error", graphqlErr.Extensions["system_error"])
	})

	t.Run("Fallback to default GraphQL error", func(t *testing.T) {
		defaultErr := errors.New("default error")
		graphqlErr := customErrorPresenter(ctx, defaultErr, false)

		// アサーション: デフォルトのエラーハンドリングを検証
		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "default error", graphqlErr.Message)
		assert.Equal(t, "default error", graphqlErr.Extensions["system_error"])
	})

	t.Run("Development mode with debugging information(Path)", func(t *testing.T) {
		graphqlErr := customErrorPresenter(ctx, appErr, true)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, ast.Path{}, graphqlErr.Path)
		assert.Equal(t, "Test message", graphqlErr.Message)
		assert.Equal(t, "test_code", graphqlErr.Extensions["code"])
		assert.Equal(t, "Test description", graphqlErr.Extensions["description"])
	})
}
