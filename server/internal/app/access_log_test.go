package app

import (
	"bytes"
	"context"
	"testing"

	"github.com/99designs/gqlgen/graphql"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearthx/log"
	"github.com/stretchr/testify/assert"
	"github.com/vektah/gqlparser/v2/ast"
)

func testAccessLogUser() *accountsUser.User {
	return accountsUser.New().NewID().
		Name("test").Email("secret-email@example.com").
		Workspace(accountsID.NewWorkspaceID()).
		MustBuild()
}

func withOperation(ctx context.Context, name string, op ast.Operation, vars map[string]any) context.Context {
	return graphql.WithOperationContext(ctx, &graphql.OperationContext{
		OperationName: name,
		Operation:     &ast.OperationDefinition{Operation: op, Name: name},
		Variables:     vars,
	})
}

func runAccessLogger(ctx context.Context) string {
	var buf bytes.Buffer
	ctx = log.ContextWith(ctx, log.NewWithOutput(&buf))
	accessLogger()(ctx, func(ctx context.Context) graphql.ResponseHandler {
		return func(ctx context.Context) *graphql.Response { return &graphql.Response{} }
	})
	return buf.String()
}

func TestAccessLogger_Query(t *testing.T) {
	u := testAccessLogUser()
	ctx := adapter.AttachUser(context.Background(), u)
	ctx = withOperation(ctx, "GetProjects", ast.Query, map[string]any{
		"workspaceId": "ws-1",
		"keyword":     "secret-keyword",
	})

	out := runAccessLogger(ctx)

	assert.Contains(t, out, accessLogMessage)
	assert.Contains(t, out, u.ID().String())
	assert.Contains(t, out, "GetProjects")
	assert.Contains(t, out, "query")
	assert.Contains(t, out, "ws-1")
	assert.NotContains(t, out, "secret-email@example.com")
	assert.NotContains(t, out, "secret-keyword")
}

func TestAccessLogger_Mutation(t *testing.T) {
	ctx := adapter.AttachUser(context.Background(), testAccessLogUser())
	ctx = withOperation(ctx, "UpdateProject", ast.Mutation, map[string]any{
		"input": map[string]any{"projectId": "p-1", "name": "secret-name"},
	})

	out := runAccessLogger(ctx)

	assert.Contains(t, out, "UpdateProject")
	assert.Contains(t, out, "mutation")
	assert.NotContains(t, out, "workspace_id")
	assert.NotContains(t, out, "secret-name")
}

func TestAccessLogger_SkipsUnauthenticated(t *testing.T) {
	ctx := withOperation(context.Background(), "GetProjects", ast.Query, nil)

	assert.Empty(t, runAccessLogger(ctx))
}

func TestAccessLogFields_NoOperationContext(t *testing.T) {
	ctx := adapter.AttachUser(context.Background(), testAccessLogUser())

	assert.Nil(t, accessLogFields(ctx))
}

func TestWorkspaceIDFromVariables(t *testing.T) {
	tests := []struct {
		name string
		vars map[string]any
		want string
	}{
		{"top level", map[string]any{"workspaceId": "ws-1"}, "ws-1"},
		{"inside input", map[string]any{"input": map[string]any{"workspaceId": "ws-2"}}, "ws-2"},
		{"missing", map[string]any{"projectId": "p-1"}, ""},
		{"not a string", map[string]any{"workspaceId": 1}, ""},
		{"nil", nil, ""},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, workspaceIDFromVariables(tt.vars))
		})
	}
}
