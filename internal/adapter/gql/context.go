package gql

import (
	"context"

	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/user"
)

type ContextKey string

const (
	ContextUser     ContextKey = "user"
	ContextOperator ContextKey = "operator"
	ContextSub      ContextKey = "sub"
)

func getUser(ctx context.Context) *user.User {
	if v := ctx.Value(ContextUser); v != nil {
		if u, ok := v.(*user.User); ok {
			return u
		}
	}
	return nil
}

func getLang(ctx context.Context, lang *string) string {
	if lang != nil && *lang != "" {
		return *lang
	}

	u := getUser(ctx)
	if u == nil {
		return "en" // default language
	}

	l := u.Lang()
	if l.IsRoot() {
		return "en" // default language
	}

	return l.String()
}

func getOperator(ctx context.Context) *usecase.Operator {
	if v := ctx.Value(ContextOperator); v != nil {
		if v2, ok := v.(*usecase.Operator); ok {
			return v2
		}
	}
	return nil
}

func getSub(ctx context.Context) string {
	if v := ctx.Value(ContextSub); v != nil {
		if v2, ok := v.(string); ok {
			return v2
		}
	}
	return ""
}
