package adapter

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/appx"
	"golang.org/x/text/language"
)

type ContextKey string

const (
	contextUser        ContextKey = "user"
	contextOperator    ContextKey = "operator"
	ContextAuthInfo    ContextKey = "authinfo"
	contextUsecases    ContextKey = "usecases"
	contextMockAuth    ContextKey = "mockauth"
	contextCurrentHost ContextKey = "currenthost"
	contextLang        ContextKey = "lang"
	contextInternal    ContextKey = "Internal"
	contextUserID      ContextKey = "reearth_user"
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

func AttachLang(ctx context.Context, lang language.Tag) context.Context {
	return context.WithValue(ctx, contextLang, lang)
}

func AttachUser(ctx context.Context, u *user.User) context.Context {
	return context.WithValue(ctx, contextUser, u)
}

func AttachOperator(ctx context.Context, o *usecase.Operator) context.Context {
	return context.WithValue(ctx, contextOperator, o)
}

func AttachUsecases(ctx context.Context, u *interfaces.Container) context.Context {
	ctx = context.WithValue(ctx, contextUsecases, u)
	return ctx
}

func AttachMockAuth(ctx context.Context, mockAuth bool) context.Context {
	return context.WithValue(ctx, contextMockAuth, mockAuth)
}

func AttachCurrentHost(ctx context.Context, currentHost string) context.Context {
	return context.WithValue(ctx, contextCurrentHost, currentHost)
}

func AttachInternal(ctx context.Context, isInternal bool) context.Context {
	return context.WithValue(ctx, contextInternal, isInternal)
}

func SetContextJWT(ctx context.Context, token string) context.Context {
	return context.WithValue(ctx, "jwtToken", token)
}

func GetContextJWT(ctx context.Context) string {
	if token, ok := ctx.Value("jwtToken").(string); ok {
		return token
	}
	return ""
}

func User(ctx context.Context) *user.User {
	if v := ctx.Value(contextUser); v != nil {
		if u, ok := v.(*user.User); ok {
			return u
		}
	}
	return nil
}

func UserID(ctx context.Context) *string {
	if cu, ok := ctx.Value(contextUserID).(string); ok {
		return &cu
	}
	return nil
}

func Lang(ctx context.Context, lang *language.Tag) string {
	if lang != nil && !lang.IsRoot() {
		return lang.String()
	}

	if v := ctx.Value(contextLang); v != nil {
		if lang, ok := v.(language.Tag); ok {
			if lang.IsRoot() {
				return defaultLang.String()
			}
			return lang.String()
		}
	}

	return defaultLang.String()
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

func GetAuthInfo(ctx context.Context) *appx.AuthInfo {
	if IsMockAuth(ctx) {
		return &appx.AuthInfo{
			Sub:   user.NewID().String(), // Use it if there is a Mock user in the DB
			Name:  "Mock User",
			Email: "mock@example.com",
		}
	}
	if v := ctx.Value(ContextAuthInfo); v != nil {
		if v2, ok := v.(appx.AuthInfo); ok {
			return &v2
		}
	}
	return nil
}

func Usecases(ctx context.Context) *interfaces.Container {
	if v := ctx.Value(contextUsecases); v != nil {
		if v2, ok := v.(*interfaces.Container); ok {
			return v2
		}
	}
	return nil
}

func IsMockAuth(ctx context.Context) bool {
	if v := ctx.Value(contextMockAuth); v != nil {
		if mockAuth, ok := v.(bool); ok {
			return mockAuth
		}
	}
	return false
}

func IsInternal(ctx context.Context) bool {
	if v := ctx.Value(contextInternal); v != nil {
		return v.(bool)
	}
	return false
}

func CurrentHost(ctx context.Context) string {
	if v := ctx.Value(contextCurrentHost); v != nil {
		if currentHost, ok := v.(string); ok {
			return currentHost
		}
	}
	return ""
}
