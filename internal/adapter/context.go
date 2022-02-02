package adapter

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/user"
)

type ContextKey string

const (
	contextUser     ContextKey = "user"
	contextOperator ContextKey = "operator"
	contextSub      ContextKey = "sub"
	contextUsecases ContextKey = "usecases"
)

func AttachUser(ctx context.Context, u *user.User) context.Context {
	return context.WithValue(ctx, contextUser, u)
}

func AttachOperator(ctx context.Context, o *usecase.Operator) context.Context {
	return context.WithValue(ctx, contextOperator, o)
}

func AttachSub(ctx context.Context, sub string) context.Context {
	return context.WithValue(ctx, contextSub, sub)
}

func AttachUsecases(ctx context.Context, u *interfaces.Container) context.Context {
	ctx = context.WithValue(ctx, contextUsecases, u)
	return ctx
}

func User(ctx context.Context) *user.User {
	if v := ctx.Value(contextUser); v != nil {
		if u, ok := v.(*user.User); ok {
			return u
		}
	}
	return nil
}

func Lang(ctx context.Context, lang *string) string {
	if lang != nil && *lang != "" {
		return *lang
	}

	u := User(ctx)
	if u == nil {
		return "en" // default language
	}

	l := u.Lang()
	if l.IsRoot() {
		return "en" // default language
	}

	return l.String()
}

func Operator(ctx context.Context) *usecase.Operator {
	if v := ctx.Value(contextOperator); v != nil {
		if v2, ok := v.(*usecase.Operator); ok {
			return v2
		}
	}
	return nil
}

func Sub(ctx context.Context) string {
	if v := ctx.Value(contextSub); v != nil {
		if v2, ok := v.(string); ok {
			return v2
		}
	}
	return ""
}

func Usecases(ctx context.Context) *interfaces.Container {
	return ctx.Value(contextUsecases).(*interfaces.Container)
}
