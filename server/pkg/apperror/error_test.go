package apperror_test

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/apperror"
	"github.com/stretchr/testify/assert"
)

func TestNewAppError(t *testing.T) {
	t.Run("creates AppError with valid key, returns AppError", func(t *testing.T) {
		err := apperror.NewAppError("pkg.project.invalid_alias", nil)
		assert.NotNil(t, err)
		assert.Equal(t, "invalid_alias", err.LocalesError["en"].Code)
		assert.Equal(t, "Invalid alias name", err.LocalesError["en"].Message)
		assert.Equal(t, "無効なエイリアス名です。", err.LocalesError["ja"].Message)
		assert.Nil(t, err.SystemError)
	})

	t.Run("creates AppError with fallback to unknown key, occurs panic", func(t *testing.T) {
		assert.Panics(t, func() {
			_ = apperror.NewAppError("non_existent_key", nil)
		})
	})
}

func TestErrorMethod(t *testing.T) {
	t.Run("returns a formatted error message", func(t *testing.T) {
		appErr := apperror.NewAppError("pkg.project.invalid_alias", nil)
		errorMessage := appErr.Error()

		assert.Contains(t, errorMessage, "[en] Invalid alias name")
		assert.Contains(t, errorMessage, "[ja] 無効なエイリアス名です。")
	})
}
