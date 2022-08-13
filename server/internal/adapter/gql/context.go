package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/adapter"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/user"
	"golang.org/x/text/language"
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

func getUser(ctx context.Context) *user.User {
	return adapter.User(ctx)
}

func getLang(ctx context.Context, lang *language.Tag) string {
	return adapter.Lang(ctx, lang)
}

func getOperator(ctx context.Context) *usecase.Operator {
	return adapter.Operator(ctx)
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
