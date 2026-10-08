package apiv1

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/apperr"
	"github.com/reearth/reearth/server/pkg/i18n/message"
	"github.com/reearth/reearth/server/pkg/verror"
	"github.com/reearth/reearthx/log"
	"golang.org/x/text/language"
)

// apiError is an error with an HTTP status and a code from the Error schema.
type apiError struct {
	status  int
	code    ErrorErrorCode
	message string
}

func (e *apiError) Error() string { return e.message }

func invalidInput(format string, args ...any) error {
	return &apiError{status: http.StatusBadRequest, code: ErrorErrorCodeInvalidInput, message: fmt.Sprintf(format, args...)}
}

func notFound(what string) error {
	return &apiError{status: http.StatusNotFound, code: ErrorErrorCodeNotFound, message: what + " not found"}
}

func conflict(format string, args ...any) error {
	return &apiError{status: http.StatusConflict, code: ErrorErrorCodeConflict, message: fmt.Sprintf(format, args...)}
}

var errUnauthorized = &apiError{status: http.StatusUnauthorized, code: ErrorErrorCodeUnauthorized, message: "unauthorized"}

// RequireOperator rejects requests that the auth middleware could not attach
// a user to. The other APIs let such requests through and fail later; this
// API answers them with 401 up front.
func RequireOperator(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		if _, op := usecases(c.Request().Context()); op == nil {
			return errUnauthorized
		}
		return next(c)
	}
}

// ErrorHandler writes every error as the Error schema. Expected failures are
// answered with their class's status; anything else is logged and hidden
// behind a generic 500.
func ErrorHandler(err error, c echo.Context) {
	if c.Response().Committed {
		return
	}
	status, code, msg := toResponse(c.Request().Context(), err)
	if status == http.StatusInternalServerError {
		log.Errorfc(c.Request().Context(), "api v1: %s %s: %+v", c.Request().Method, c.Path(), err)
	}
	var body Error
	body.Error.Code = code
	body.Error.Message = msg
	if err := c.JSON(status, body); err != nil {
		log.Errorfc(c.Request().Context(), "api v1: write error response: %v", err)
	}
}

func toResponse(ctx context.Context, err error) (int, ErrorErrorCode, string) {
	var ae *apiError
	if errors.As(err, &ae) {
		return ae.status, ae.code, ae.message
	}

	// Validation errors from the usecases, such as an invalid or taken
	// project alias. Their messages are written for users.
	var ve *verror.VError
	if errors.As(err, &ve) && ve.Err == nil {
		msg := ve.Error()
		if m, ok := ve.ErrMsg[language.English]; ok {
			msg = message.ApplyTemplate(ctx, m.Message, ve.TemplateData, language.English)
		}
		switch {
		case ve.Key == repo.ErrResourceNotFound.Key:
			return http.StatusNotFound, ErrorErrorCodeNotFound, msg
		case strings.HasSuffix(string(ve.Key), "already_exists"), strings.HasSuffix(string(ve.Key), "already_used"):
			return http.StatusConflict, ErrorErrorCodeConflict, msg
		}
		return http.StatusBadRequest, ErrorErrorCodeInvalidInput, msg
	}

	// Errors from echo itself: bad JSON, bad parameters, unknown routes.
	var he *echo.HTTPError
	if errors.As(err, &he) {
		msg := http.StatusText(he.Code)
		if m, ok := he.Message.(string); ok {
			msg = m
		}
		switch he.Code {
		case http.StatusBadRequest:
			return he.Code, ErrorErrorCodeInvalidInput, msg
		case http.StatusUnauthorized:
			return he.Code, ErrorErrorCodeUnauthorized, msg
		case http.StatusForbidden:
			return he.Code, ErrorErrorCodePermissionDenied, msg
		case http.StatusNotFound, http.StatusMethodNotAllowed:
			return http.StatusNotFound, ErrorErrorCodeNotFound, msg
		}
		if he.Code < http.StatusInternalServerError {
			return he.Code, ErrorErrorCodeInvalidInput, msg
		}
		return http.StatusInternalServerError, ErrorErrorCodeInternal, "internal server error"
	}

	switch apperr.Classify(err) {
	case apperr.ClassNotFound:
		return http.StatusNotFound, ErrorErrorCodeNotFound, "not found"
	case apperr.ClassAlreadyExists:
		return http.StatusConflict, ErrorErrorCodeConflict, err.Error()
	case apperr.ClassInvalidInput:
		return http.StatusBadRequest, ErrorErrorCodeInvalidInput, err.Error()
	case apperr.ClassPermissionDenied:
		return http.StatusForbidden, ErrorErrorCodePermissionDenied, "permission denied"
	}
	return http.StatusInternalServerError, ErrorErrorCodeInternal, "internal server error"
}
