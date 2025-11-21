package gql

import (
	"context"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/account/accountdomain/user"

	"github.com/reearth/reearthx/account/accountusecase"
	"golang.org/x/text/language"

	accountsRepo "github.com/reearth/reearth-accounts/server/pkg/repo"
	accountsUsecase "github.com/reearth/reearth-accounts/server/pkg/usecase"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
)

type ContextKey string

const (
	contextLoaders     ContextKey = "loaders"
	contextDataloaders ContextKey = "dataloaders"
)

func AttachUsecases(ctx context.Context, u *interfaces.Container, au *accountsRepo.Container, enableDataLoaders bool) context.Context {
	loaders := NewLoaders(u)
	dataloaders := loaders.DataLoadersWith(ctx, enableDataLoaders)

	ctx = adapter.AttachUsecases(ctx, u)
	ctx = adapter.AttachAccountsUsecases(ctx, au)
	ctx = context.WithValue(ctx, contextLoaders, loaders)
	ctx = context.WithValue(ctx, contextDataloaders, dataloaders)

	return ctx
}

func getUser(ctx context.Context) *user.User {
	return adapter.User(ctx)
}

func getAccountsUser(ctx context.Context) *accountsUser.User {
	return adapter.AccountsUser(ctx)
}

func getLang(ctx context.Context, lang *language.Tag) string {
	return adapter.Lang(ctx, lang)
}

// reearth-visualizer Operator
func getOperator(ctx context.Context) *usecase.Operator {
	return adapter.Operator(ctx)
}

// reearthx Operator
func getAcOperator(ctx context.Context) *accountusecase.Operator {
	if op := getOperator(ctx); op != nil {
		return op.AcOperator
	}
	return nil
}

// reearth-accounts Operator
func getAccountsOperator(ctx context.Context) *accountsUsecase.Operator {
	if op := getOperator(ctx); op != nil {
		return op.AccountsOperator
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
