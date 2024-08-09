package app

import (
	"context"
	"errors"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	authconfig "github.com/reearth/reearth/server/pkg/config"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/authserver"
	"github.com/reearth/reearthx/rerror"
	"github.com/zitadel/oidc/v3/pkg/oidc"
)

var ErrInvalidEmailORPassword = errors.New("wrong email or password")

func authServer(ctx context.Context, e *echo.Echo, cfg *config.AuthSrvConfig, repos *repo.Container) {
	if cfg.Disabled {
		return
	}

	authserver.Endpoint(ctx, authserver.EndpointConfig{
		Issuer:          cfg.Issuer,
		URL:             cfg.DomainURL(),
		WebURL:          cfg.UIDomainURL(),
		DefaultClientID: config.AuthServerDefaultClientID,
		Dev:             cfg.Dev,
		Key:             cfg.Key,
		DN:              cfg.DN.AuthServerDNConfig(),
		UserRepo:        &authServerUser{User: repos.User},
		ConfigRepo:      &authServerConfig{Config: repos.Config},
		RequestRepo:     repos.AuthRequest,
	}, e.Group(""))
}

type authServerUser struct {
	User accountrepo.User
}

func (r *authServerUser) Sub(ctx context.Context, email, password, authRequestID string) (string, error) {
	u, err := r.User.FindByNameOrEmail(ctx, email)
	if err != nil {
		if errors.Is(rerror.ErrNotFound, err) {
			return "", ErrInvalidEmailORPassword
		}
		return "", err
	}

	ok, err := u.MatchPassword(password)
	if err != nil {
		return "", err
	}

	if !ok {
		return "", ErrInvalidEmailORPassword
	}

	a := u.Auths().GetByProvider(user.ProviderReearth)
	if a == nil || a.Sub == "" {
		return "", ErrInvalidEmailORPassword
	}

	return a.Sub, nil
}

func (r *authServerUser) Info(ctx context.Context, sub string, scopes []string, ui oidc.UserInfoSetter) error {
	u, err := r.User.FindBySub(ctx, sub)
	if err != nil {
		return err
	}

	ui.SetEmail(u.Email(), u.Verification().IsVerified())
	ui.SetLocale(u.Lang())
	ui.SetName(u.Name())
	return nil
}

type authServerConfig struct {
	Config repo.Config
}

func (c *authServerConfig) Load(ctx context.Context) (*authserver.Config, error) {
	cfg, err := c.Config.LockAndLoad(ctx)
	if err != nil {
		return nil, err
	}
	if cfg == nil || cfg.Auth == nil {
		return nil, nil
	}

	return &authserver.Config{
		Cert: cfg.Auth.Cert,
		Key:  cfg.Auth.Key,
	}, nil
}

func (c *authServerConfig) Save(ctx context.Context, cfg *authserver.Config) error {
	if cfg == nil {
		return nil
	}
	return c.Config.SaveAuth(ctx, &authconfig.Auth{
		Cert: cfg.Cert,
		Key:  cfg.Key,
	})
}

func (c *authServerConfig) Unlock(ctx context.Context) error {
	return c.Config.Unlock(ctx)
}
