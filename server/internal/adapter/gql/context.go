package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/account/accountdomain/user"

	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/samber/lo"
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

func getAcOperator(ctx context.Context) *accountusecase.Operator {
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

func intToInt64(i *int) *int64 {
	if i == nil {
		return nil
	}
	return lo.ToPtr(int64(*i))
}
