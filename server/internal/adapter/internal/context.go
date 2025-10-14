package internal

import (
	"context"

	"github.com/reearth/reearth/server/pkg/user"
	"github.com/reearth/reearthx/appx"
)

type userKey struct{}
type jwtTokenKey struct{}

func GetContextUser(ctx context.Context) *user.User {
	u, _ := ctx.Value(userKey{}).(*user.User)
	return u
}

func SetContextUser(ctx context.Context, u *user.User) context.Context {
	return context.WithValue(ctx, userKey{}, u)
}

func GetContextJWT(ctx context.Context) string {
	t, _ := ctx.Value(jwtTokenKey{}).(string)
	return t
}

func SetContextJWT(ctx context.Context, token string) context.Context {
	return context.WithValue(ctx, jwtTokenKey{}, token)
}

// TODO: Remove this function once the migration to accounts server is complete.
func GetContextAuthInfo(ctx context.Context) *appx.AuthInfo {
	if authInfo, ok := ctx.Value("authinfo").(appx.AuthInfo); ok {
		return &authInfo
	}
	return nil
}
