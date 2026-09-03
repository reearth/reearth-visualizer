package apperr

import (
	"context"
	"errors"
	"fmt"
	"testing"

	graphql "github.com/hasura/go-graphql-client"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
)

func TestClass_ExpectedPolicy(t *testing.T) {
	// The one place the logging policy lives. Expected classes log at WARN.
	expected := map[ErrorClass]bool{
		ClassNotFound:         true,
		ClassAlreadyExists:    true,
		ClassInvalidInput:     true,
		ClassCanceled:         true,
		ClassPermissionDenied: true,  // denials are expected (WARN)
		ClassUnexpected:       false, // a defect
	}
	for c, want := range expected {
		assert.Equalf(t, want, c.Expected(), "class %s", c)
	}
}

func TestClass_StringIsStable(t *testing.T) {
	// The name is the client-facing code; pin it so a refactor cannot rename it.
	assert.Equal(t, "internal", ClassUnexpected.String())
	assert.Equal(t, "not_found", ClassNotFound.String())
	assert.Equal(t, "permission_denied", ClassPermissionDenied.String())
	assert.Equal(t, "internal", ErrorClass(999).String()) // unknown falls back safely
}

func TestError_WrapsAndFormats(t *testing.T) {
	e := NotFound("story not found", rerror.ErrNotFound)

	assert.Equal(t, ClassNotFound, e.Class)
	assert.Equal(t, "story not found: not found", e.Error())
	assert.ErrorIs(t, e, rerror.ErrNotFound, "errors.Is must see through the wrapper")

	// A typed error with no message or cause still prints something.
	assert.Equal(t, "invalid_input", (&Error{Class: ClassInvalidInput}).Error())
}

func TestClassify(t *testing.T) {
	tests := []struct {
		name string
		err  error
		want ErrorClass
	}{
		{"nil", nil, ClassUnexpected},
		{"our typed error", NotFound("x", nil), ClassNotFound},
		{"our typed error wrapped", fmt.Errorf("outer: %w", PermissionDenied("no", nil)), ClassPermissionDenied},
		{"rerror not found", rerror.ErrNotFound, ClassNotFound},
		{"rerror not found wrapped", fmt.Errorf("load: %w", rerror.ErrNotFound), ClassNotFound},
		{"rerror already exists", rerror.ErrAlreadyExists, ClassAlreadyExists},
		{"rerror invalid params", rerror.ErrInvalidParams, ClassInvalidInput},
		{"idx invalid id", idx.ErrInvalidID, ClassInvalidInput},
		{"operation denied sentinel", ErrOperationDenied, ClassPermissionDenied},
		{"context canceled", context.Canceled, ClassCanceled},
		{"plain error is a defect", errors.New("boom"), ClassUnexpected},
		{"message-only copy cannot be classified", errors.New("load: " + rerror.ErrNotFound.Error()), ClassUnexpected},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, Classify(tt.err))
			assert.Equal(t, tt.want.Expected(), Expected(tt.err))
		})
	}
}

func TestClassify_Upstream(t *testing.T) {
	// Accounts GraphQL errors carry only a message.
	tests := []struct {
		name string
		err  error
		want ErrorClass
	}{
		{"not found", graphql.Errors{{Message: "input: updateWorkspace not found"}}, ClassNotFound},
		{"invalid user name", graphql.Errors{{Message: "input: createWorkspace invalid user name"}}, ClassInvalidInput},
		{"business rule", graphql.Errors{{Message: "input: removeUserFromWorkspace owner user cannot leave from the workspace"}}, ClassInvalidInput},
		{"operation denied", graphql.Errors{{Message: "input: deleteWorkspace operation denied"}}, ClassPermissionDenied},
		{"internal stays a defect", graphql.Errors{{Message: "input: createWorkspace internal"}}, ClassUnexpected},
		{"mixed list is a defect", graphql.Errors{{Message: "updateWorkspace not found"}, {Message: "createWorkspace internal"}}, ClassUnexpected},
		{"single error value", graphql.Error{Message: "input: findUserByAlias not found"}, ClassNotFound},
		{"empty list", graphql.Errors{}, ClassUnexpected},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, Classify(tt.err))
			assert.Equal(t, tt.want.Expected(), Expected(tt.err))
		})
	}
}
