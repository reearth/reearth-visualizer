package apperr

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/hasura/go-graphql-client"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func TestIsExpected(t *testing.T) {
	tests := []struct {
		name string
		err  error
		want bool
	}{
		{name: "nil", err: nil, want: false},
		{name: "not found", err: rerror.ErrNotFound, want: true},
		{name: "not found raw", err: rerror.ErrNotFoundRaw, want: true},
		{name: "already exists", err: rerror.ErrAlreadyExists, want: true},
		{name: "invalid params", err: rerror.ErrInvalidParams, want: true},
		{name: "invalid id", err: idx.ErrInvalidID, want: true},
		{name: "operation denied stays a defect-level log", err: ErrOperationDenied, want: false},
		{name: "context canceled", err: context.Canceled, want: true},
		{name: "wrapped not found", err: fmt.Errorf("Fail ExportProject: %w", rerror.ErrNotFound), want: true},
		{name: "doubly wrapped not found", err: fmt.Errorf("outer: %w", fmt.Errorf("inner: %w", rerror.ErrNotFound)), want: true},
		{name: "unexpected", err: errors.New("boom"), want: false},
		{name: "not implemented is a defect", err: rerror.ErrNotImplemented, want: false},
		{name: "message-only copy breaks the chain", err: errors.New("Fail ExportProject :" + rerror.ErrNotFound.Error()), want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, IsExpected(tt.err))
		})
	}
}

func TestIsExpectedUpstream(t *testing.T) {
	// gqlgen wraps a resolver error the way the presenter sees it.
	wrap := func(err error) error {
		return &gqlerror.Error{Err: err, Message: "input: updateWorkspace " + err.Error()}
	}

	tests := []struct {
		name string
		err  error
		want bool
	}{
		{name: "nil", err: nil, want: false},
		{
			name: "not found from the accounts api",
			err:  wrap(graphql.Errors{{Message: "input: updateWorkspace not found"}}),
			want: true,
		},
		{
			name: "operation denied from the accounts api is not downgraded",
			err:  wrap(graphql.Errors{{Message: "input: deleteWorkspace operation denied"}}),
			want: false,
		},
		{
			name: "business rule from the accounts api",
			err:  wrap(graphql.Errors{{Message: "input: removeUserFromWorkspace owner user cannot leave from the workspace"}}),
			want: true,
		},
		{
			name: "internal from the accounts api stays an error",
			err:  wrap(graphql.Errors{{Message: "input: createWorkspace internal"}}),
			want: false,
		},
		{
			name: "a mixed list is only expected if every entry is",
			err: wrap(graphql.Errors{
				{Message: "input: updateWorkspace not found"},
				{Message: "input: createWorkspace internal"},
			}),
			want: false,
		},
		{
			name: "single error value",
			err:  graphql.Error{Message: "input: findUserByAlias not found"},
			want: true,
		},
		{
			name: "our own errors are not matched by message",
			err:  errors.New("failed to find project: not found"),
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, IsExpectedUpstream(tt.err))
		})
	}
}
