package gql

import (
	"context"

	"github.com/reearth/reearth-accounts/server/pkg/gqlclient"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"golang.org/x/text/language"
)

type ContextKey string

const (
	contextLoaders     ContextKey = "loaders"
	contextDataloaders ContextKey = "dataloaders"
)

func AttachUsecases(ctx context.Context, u *interfaces.Container, accountsClient *gqlclient.Client, enableDataLoaders bool) context.Context {
	loaders := NewLoaders(u, accountsClient)
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

func getAcOperator(ctx context.Context) *accountsWorkspace.Operator {
	if op := getOperator(ctx); op != nil {
		return op.AcOperator
	}
	return nil
}

func usecases(ctx context.Context) *interfaces.Container {
	return adapter.Usecases(ctx)
}

func loaders(ctx context.Context) *Loaders {
	l, ok := ctx.Value(contextLoaders).(*Loaders)
	if !ok || l == nil {
		panic("gql: loaders not attached to context — AttachUsecases middleware may be misconfigured")
	}
	return l
}

func dataloaders(ctx context.Context) *DataLoaders {
	dl, ok := ctx.Value(contextDataloaders).(*DataLoaders)
	if !ok || dl == nil {
		panic("gql: dataloaders not attached to context — AttachUsecases middleware may be misconfigured")
	}
	return dl
}
