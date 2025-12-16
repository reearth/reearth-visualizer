package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"

	"golang.org/x/text/language"

	accountsUsecase "github.com/reearth/reearth-accounts/server/pkg/usecase"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

type ContextKey string

const (
	contextLoaders     ContextKey = "loaders"
	contextDataloaders ContextKey = "dataloaders"
)

func AttachUsecases(ctx context.Context, u *interfaces.Container, enableDataLoaders bool) context.Context {
	loaders := NewLoaders(u)
	dataloaders := loaders.DataLoadersWith(ctx, enableDataLoaders)

	ctx = adapter.AttachUsecases(ctx, u)
	ctx = context.WithValue(ctx, contextLoaders, loaders)
	ctx = context.WithValue(ctx, contextDataloaders, dataloaders)

	return ctx
}

func getUser(ctx context.Context) *accountsUser.User {
	return adapter.User(ctx)
}

func getLang(ctx context.Context, lang *language.Tag) string {
	return adapter.Lang(ctx, lang)
}

func getOperator(ctx context.Context) *usecase.Operator {
	return adapter.Operator(ctx)
}

func getAcOperator(ctx context.Context) *accountsUsecase.Operator {
	if op := getOperator(ctx); op != nil {
		return op.AcOperator
	}
	return nil
}

func usecases(ctx context.Context) *interfaces.Container {
	return adapter.Usecases(ctx)
}

func loaders(ctx context.Context) *Loaders {
	return ctx.Value(contextLoaders).(*Loaders)
}

func dataloaders(ctx context.Context) *DataLoaders {
	return ctx.Value(contextDataloaders).(*DataLoaders)
}

// findWorkspaceFromListByID finds a workspace from a list by ID
func findWorkspaceFromListByID(workspaces accountsWorkspace.List, workspaceID string) *accountsWorkspace.Workspace {
	for _, ws := range workspaces {
		if ws.ID().String() == workspaceID {
			return ws
		}
	}
	return nil
}
