package apperror_test

import (
	"testing"

	"github.com/reearth/reearth/server/internal/locales"
	"github.com/reearth/reearth/server/pkg/apperror"
	"github.com/stretchr/testify/assert"
)

func TestNewAppError(t *testing.T) {
	t.Run("creates AppError with valid key, returns AppError", func(t *testing.T) {
		err := apperror.NewAppError(locales.ErrKeyPkgProjectInvalidAlias, nil)
		assert.NotNil(t, err)
		assert.Equal(t, "invalid_alias", err.LocalesError["en"].Code)
		assert.Equal(t, "Invalid alias name", err.LocalesError["en"].Message)
		assert.Equal(t, "The alias must be 5-32 characters long and can only contain alphanumeric characters, underscores, and hyphens.", err.LocalesError["en"].Description)

		assert.Equal(t, "invalid_alias", err.LocalesError["ja"].Code)
		assert.Equal(t, "無効なエイリアス名です。", err.LocalesError["ja"].Message)
		assert.Equal(t, "エイリアスは5-32文字で、英数字、アンダースコア、ハイフンのみ使用できます。", err.LocalesError["ja"].Description)
		assert.Nil(t, err.SystemError)
	})

	t.Run("creates AppError with fallback to unknown key, occurs panic", func(t *testing.T) {
		err := apperror.NewAppError("non_existent_key", nil)
		assert.NotNil(t, err)
		assert.Equal(t, "unknown", err.LocalesError["en"].Code)
		assert.Equal(t, "An unknown error occurred.", err.LocalesError["en"].Message)
		assert.Equal(t, "An unknown error occurred.", err.LocalesError["en"].Description)
		assert.Equal(t, "unknown", err.LocalesError["ja"].Code)
		assert.Equal(t, "不明なエラーが発生しました。", err.LocalesError["ja"].Message)
		assert.Equal(t, "不明なエラーが発生しました。", err.LocalesError["ja"].Description)
		assert.Nil(t, err.SystemError)
	})
}

func TestErrorMethod(t *testing.T) {
	t.Run("returns a formatted error message", func(t *testing.T) {
		appErr := apperror.NewAppError(locales.ErrKeyPkgProjectInvalidAlias, nil)
		errorMessage := appErr.Error()

		assert.Contains(t, errorMessage, "[en] Invalid alias name")
		assert.Contains(t, errorMessage, "[ja] 無効なエイリアス名です。")
	})
}
