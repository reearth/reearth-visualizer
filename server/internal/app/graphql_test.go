package app

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"testing"

	"github.com/hasura/go-graphql-client"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/app/i18n/message/errmsg"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/verror"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/vektah/gqlparser/v2/ast"
	"golang.org/x/text/language"
)

func TestCustomErrorPresenter(t *testing.T) {
	ctx := context.Background()
	ctx = adapter.AttachLang(ctx, language.English)

	vErr := verror.NewVError(errmsg.ErrKeyUnknown, errmsg.ErrorMessages[errmsg.ErrKeyUnknown], nil, nil)
	vErrHaveWrapped := verror.NewVError(errmsg.ErrKeyUnknown, errmsg.ErrorMessages[errmsg.ErrKeyUnknown], nil, errors.New("wrapped error"))

	t.Run("vErr with English language", func(t *testing.T) {
		graphqlErr := customErrorPresenter(ctx, vErr, false)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "An unknown error occurred.", graphqlErr.Message)
		assert.Equal(t, string(errmsg.ErrKeyUnknown), graphqlErr.Extensions["code"])
		assert.Equal(t, nil, graphqlErr.Extensions["system_error"])
	})

	t.Run("vErr with Japanese language", func(t *testing.T) {
		jaCtx := adapter.AttachLang(context.Background(), language.Japanese)
		graphqlErr := customErrorPresenter(jaCtx, vErr, false)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "不明なエラーが発生しました。", graphqlErr.Message)
		assert.Equal(t, string(errmsg.ErrKeyUnknown), graphqlErr.Extensions["code"])
	})

	t.Run("Wrapped vErr with English language", func(t *testing.T) {
		graphqlErr := customErrorPresenter(ctx, vErrHaveWrapped, false)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "An unknown error occurred.", graphqlErr.Message)
		assert.Equal(t, string(errmsg.ErrKeyUnknown), graphqlErr.Extensions["code"])
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
		graphqlErr := customErrorPresenter(ctx, vErr, true)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, ast.Path{}, graphqlErr.Path)
		assert.Equal(t, "An unknown error occurred.", graphqlErr.Message)
		assert.Equal(t, string(errmsg.ErrKeyUnknown), graphqlErr.Extensions["code"])
		assert.Equal(t, "", graphqlErr.Extensions["system_error"])

	})

	t.Run("Development mode with default error", func(t *testing.T) {
		defaultErr := errors.New("default error")
		graphqlErr := customErrorPresenter(ctx, defaultErr, true)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "default error", graphqlErr.Message)
		assert.Equal(t, defaultErr.Error(), graphqlErr.Extensions["system_error"])
	})

	t.Run("Development mode with Wrapped vErr ", func(t *testing.T) {
		graphqlErr := customErrorPresenter(ctx, vErrHaveWrapped, true)

		assert.NotNil(t, graphqlErr)
		assert.Equal(t, "An unknown error occurred.", graphqlErr.Message)
		assert.Equal(t, string(errmsg.ErrKeyUnknown), graphqlErr.Extensions["code"])
		assert.Equal(t, "wrapped error", graphqlErr.Extensions["system_error"])
	})

}

func TestIsHandledError(t *testing.T) {
	t.Run("returns true for handled sentinel errors", func(t *testing.T) {
		assert.True(t, isHandledError(rerror.ErrNotFound))
		assert.True(t, isHandledError(idx.ErrInvalidID))
	})

	t.Run("returns true for wrapped handled errors", func(t *testing.T) {
		assert.True(t, isHandledError(fmt.Errorf("wrapped: %w", rerror.ErrNotFound)))
	})

	t.Run("returns false for unrelated errors", func(t *testing.T) {
		assert.False(t, isHandledError(errors.New("some unexpected error")))
		assert.False(t, isHandledError(rerror.ErrNotImplemented))
		assert.False(t, isHandledError(interfaces.ErrOperationDenied))
		assert.False(t, isHandledError(repo.ErrOperationDenied))
	})
}

// TestCustomErrorPresenter_Severity pins the severity that reaches the log for
// each class of error the presenter sees. The alerting policy counts ERROR
// entries, so this is the behaviour that keeps expected failures from paging.
func TestCustomErrorPresenter_Severity(t *testing.T) {
	log.GCP = true
	t.Cleanup(func() { log.GCP = false })

	tests := []struct {
		name string
		err  error
		want string
	}{
		{name: "not found", err: rerror.ErrNotFound, want: "WARNING"},
		{name: "operation denied stays an error", err: interfaces.ErrOperationDenied, want: "ERROR"},
		{name: "wrapped not found keeps its chain", err: fmt.Errorf("failed to export project: %w", rerror.ErrNotFound), want: "WARNING"},
		{name: "invalid id", err: idx.ErrInvalidID, want: "WARNING"},
		{name: "not found relayed by the accounts api", err: graphql.Errors{{Message: "input: updateWorkspace not found"}}, want: "WARNING"},
		{name: "internal reported by the accounts api", err: graphql.Errors{{Message: "input: createWorkspace internal"}}, want: "ERROR"},
		{name: "anything else is a defect", err: errors.New("boom"), want: "ERROR"},
		{name: "a message-only copy cannot be classified", err: errors.New("failed to export project: " + rerror.ErrNotFound.Error()), want: "ERROR"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			buf := &bytes.Buffer{}
			ctx := log.ContextWith(adapter.AttachLang(context.Background(), language.English), log.NewWithOutput(buf))

			_ = customErrorPresenter(ctx, tt.err, false)

			// The presenter emits the severity decision first, then an
			// unconditional graphqlErr line at WARNING.
			first := strings.SplitN(strings.TrimSpace(buf.String()), "\n", 2)[0]
			var entry struct {
				Severity string `json:"severity"`
				Message  string `json:"message"`
			}
			require.NoError(t, json.Unmarshal([]byte(first), &entry))
			assert.Equal(t, tt.want, entry.Severity, "message was: %s", entry.Message)
		})
	}
}
