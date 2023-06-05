package adapter

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearth/server/pkg/user"
	acuser "github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase"
	"golang.org/x/text/language"
)

type ContextKey string

const (
	contextUser     ContextKey = "user"
	contextOperator ContextKey = "operator"
	contextAuthInfo ContextKey = "authinfo"
	contextUsecases ContextKey = "usecases"
)

var defaultLang = language.English

type AuthInfo struct {
	Token         string
	Sub           string
	Iss           string
	Name          string
	Email         string
	EmailVerified *bool
}

func AttachUser(ctx context.Context, u *user.User) context.Context {
	return context.WithValue(ctx, contextUser, u)
}

func AttachAcUser(ctx context.Context, u *acuser.User) context.Context {
	return context.WithValue(ctx, contextUser, u)
}

func AttachOperator(ctx context.Context, o *usecase.Operator) context.Context {
	return context.WithValue(ctx, contextOperator, o)
}

func AttachAcOperator(ctx context.Context, o *accountusecase.Operator) context.Context {
	return context.WithValue(ctx, contextOperator, o)
}

func AttachAuthInfo(ctx context.Context, a AuthInfo) context.Context {
	return context.WithValue(ctx, contextAuthInfo, a)
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

func AcUser(ctx context.Context) *acuser.User {
	if v := ctx.Value(contextUser); v != nil {
		if u, ok := v.(*acuser.User); ok {
			return u
		}
	}
	return nil
}

func Lang(ctx context.Context, lang *language.Tag) string {
	if lang != nil && !lang.IsRoot() {
		return lang.String()
	}

	u := User(ctx)
	if u == nil {
		return defaultLang.String()
	}

	l := u.Lang()
	if l.IsRoot() {
		return defaultLang.String()
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

func AcOperator(ctx context.Context) *accountusecase.Operator {
	if v := ctx.Value(contextOperator); v != nil {
		if v2, ok := v.(*accountusecase.Operator); ok {
			return v2
		}
	}
	return nil
}

func GetAuthInfo(ctx context.Context) *AuthInfo {
	if v := ctx.Value(contextAuthInfo); v != nil {
		if v2, ok := v.(AuthInfo); ok {
			return &v2
		}
	}
	return nil
}

func Usecases(ctx context.Context) *interfaces.Container {
	return ctx.Value(contextUsecases).(*interfaces.Container)
}
