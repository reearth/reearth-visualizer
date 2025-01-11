package apperror

import (
	"fmt"
	"strings"

	"github.com/reearth/reearth/server/internal/locales"
)

type LocalesError struct {
	Code        string
	Message     string
	Description string
}

type AppError struct {
	LocalesError map[string]*LocalesError
	SystemError  error
}

func buildLocalesError(localesErrors map[string]*locales.Error) map[string]*LocalesError {
	localesError := make(map[string]*LocalesError)
	for lang, locale := range localesErrors {
		localesError[lang] = &LocalesError{
			Code:        locale.Code,
			Message:     locale.Message,
			Description: locale.Description,
		}
	}
	return localesError
}

func NewAppError(key string, err error) *AppError {
	localesErrors, loadErr := locales.LoadError(key)
	if loadErr != nil {
		panic(loadErr)
	}

	return &AppError{
		LocalesError: buildLocalesError(localesErrors),
		SystemError:  err,
	}
}

func (e *AppError) Error() string {
	var errorMessage []string
	for locale, err := range e.LocalesError {
		errorMessage = append(errorMessage, fmt.Sprintf("[%s] %s", locale, err.Message))
	}
	return strings.Join(errorMessage, ",")
}

func (e *AppError) Unwrap() error {
	return e.SystemError
}
