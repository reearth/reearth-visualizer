package app

import (
	"context"
	"errors"
	"fmt"

	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase"

	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"

	accountsGqlError "github.com/reearth/reearth-accounts/server/pkg/gqlclient/gqlerror"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	accountsUsecase "github.com/reearth/reearth-accounts/server/pkg/usecase"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
)

func attachOpMiddlewareMockUser(cfg *ServerConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()

			ctx = adapter.AttachCurrentHost(ctx, cfg.Config.Host)

			authInfo := adapter.GetAuthInfo(ctx)

			var u *accountsUser.User

			// Check for debug user header first (for e2e tests)
			if cfg.Debug {
				if userID := req.Header.Get("X-Reearth-Debug-User"); userID != "" {
					uid, err := accountsID.UserIDFrom(userID)
					if err == nil {
						u, err = cfg.Repos.User.FindByID(ctx, uid)
						if err != nil {
							log.Warnfc(ctx, "auth: debug user not found: %s", userID)
						}
					}
				}
			}

			// Fallback to mock user if debug user not found
			if u == nil {
				var err error
				u, err = cfg.Repos.User.FindByNameOrEmail(ctx, "Mock User")
				if err != nil {
					uId, _ := accountsID.UserIDFrom(authInfo.Sub)
					u = accountsUser.New().
						ID(uId).
						Name(authInfo.Name).
						Email(authInfo.Email).
						MustBuild()
				}
			}

			if u != nil {
				ctx = adapter.AttachUser(ctx, u)
				log.Debugfc(ctx, "auth: user: id=%s name=%s email=%s", u.ID(), u.Name(), u.Email())

				op, err := generateOperator(ctx, cfg, u)
				if err != nil {
					return err
				}

				ctx = adapter.AttachOperator(ctx, op)
				log.Debugfc(ctx, "auth: op: %#v", op)

			} else {
				log.Errorfc(ctx, "Mock user information not found: %s", req.URL.Path)
			}

			c.SetRequest(req.WithContext(ctx))
			return next(c)
		}
	}
}

func attachOpMiddlewareReearthAccounts(cfg *ServerConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()

			ctx = adapter.AttachCurrentHost(ctx, cfg.Config.Host)

			// Skip authentication for signup endpoints
			if req.URL.Path == "/api/signup" {
				log.Debugfc(ctx, "auth: skipping authentication for signup endpoint")
				c.SetRequest(req.WithContext(ctx))
				return next(c)
			}

			// The token is set as is and sent to reearth-accounts for verification.
			token := strings.TrimPrefix(req.Header.Get("Authorization"), "Bearer ")
			ctx = adapter.AttachJwtToken(ctx, token)

			var u *accountsUser.User

			// debug mode
			if cfg.Debug {

				if userID := req.Header.Get("X-Reearth-Debug-User"); userID != "" {

					userModel, err := cfg.AccountsAPIClient.UserRepo.FindByID(ctx, userID)
					if err != nil {
						return handleAccountsAPIError(ctx, fmt.Errorf("(FindByID): %w, %s", err, userID))
					}

					if userModel != nil {
						u, err = buildAccountDomainUserFromUserModel(ctx, userModel)
						if err != nil {
							log.Errorfc(ctx, "accounts API: failed to build user in debug mode: %v", err)
							return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
						}
					}

				}

			}

			if u == nil {

				userModel, err := cfg.AccountsAPIClient.UserRepo.FindMe(ctx)
				if err != nil {
					return handleAccountsAPIError(ctx, fmt.Errorf("(FindMe): %w, %s", err, req.URL.Path))
				}

				if userModel != nil {
					u, err = buildAccountDomainUserFromUserModel(ctx, userModel)
					if err != nil {
						log.Errorfc(ctx, "accounts API: failed to build user: %v", err)
						return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
					}
				}

			}

			if u != nil {
				ctx = adapter.AttachUser(ctx, u)
				log.Debugfc(ctx, "auth: user: id=%s name=%s email=%s", u.ID(), u.Name(), u.Email())

				op, err := generateOperator(ctx, cfg, u)
				if err != nil {
					return err
				}

				ctx = adapter.AttachOperator(ctx, op)
				log.Debugfc(ctx, "auth: op: %#v", op)

			} else {
				log.Errorfc(ctx, "User information not found: %s", req.URL.Path)
			}

			c.SetRequest(req.WithContext(ctx))
			return next(c)
		}
	}
}

func handleAccountsAPIError(ctx context.Context, err error) error {
	if accountsGqlError.IsUnauthorized(err) {
		log.Warnfc(ctx, "accounts API: unauthorized: %s", err.Error())
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	if errors.Is(err, rerror.ErrNotFound) {
		log.Warnfc(ctx, "accounts API: user not found: %s", err.Error())
		return echo.NewHTTPError(http.StatusNotFound, "user not found")
	}

	log.Errorfc(ctx, "accounts API: failed to fetch user: %s", err.Error())
	return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch user from accounts API")
}

func buildAccountDomainUserFromUserModel(ctx context.Context, userModel *accountsUser.User) (*accountsUser.User, error) {
	uId, _ := accountsID.UserIDFrom(userModel.ID().String())
	wid, _ := accountsID.WorkspaceIDFrom(userModel.Workspace().String())

	usermetadata := accountsUser.MetadataFrom(
		userModel.Metadata().PhotoURL(),
		userModel.Metadata().Description(),
		userModel.Metadata().Website(),
		userModel.Metadata().Lang(),
		accountsUser.Theme(userModel.Metadata().Theme()),
	)

	// Convert auths to user.Auth slice
	auths := make([]accountsUser.Auth, 0, len(userModel.Auths()))
	for _, authStr := range userModel.Auths() {
		auths = append(auths, accountsUser.AuthFrom(authStr.String()))
	}

	u, err := accountsUser.New().
		ID(uId).
		Name(userModel.Name()).
		Alias(userModel.Alias()).
		Email(userModel.Email()).
		Metadata(usermetadata).
		Workspace(wid).
		Auths(auths).
		Build()

	if err != nil {
		log.Errorfc(ctx, "accounts API: failed to build user: %v", err)
		return nil, err
	}

	return u, nil
}

func generateOperator(ctx context.Context, cfg *ServerConfig, u *accountsUser.User) (*usecase.Operator, error) {
	if u == nil {
		return nil, nil
	}

	uid := u.ID()
	workspaces, err := cfg.Repos.Workspace.FindByUser(ctx, uid)
	if err != nil {
		return nil, err
	}

	wsList := accountsWorkspace.List(workspaces)
	scenes, err := cfg.Repos.Scene.FindByWorkspace(ctx, wsList.IDs()...)
	if err != nil {
		return nil, err
	}

	readableWorkspaces := wsList.FilterByUserRole(uid, accountsWorkspace.RoleReader).IDs()
	writableWorkspaces := wsList.FilterByUserRole(uid, accountsWorkspace.RoleWriter).IDs()
	maintainingWorkspaces := wsList.FilterByUserRole(uid, accountsWorkspace.RoleMaintainer).IDs()
	owningWorkspaces := wsList.FilterByUserRole(uid, accountsWorkspace.RoleOwner).IDs()
	defaultPolicy := util.CloneRef(cfg.Config.Policy.Default)

	return &usecase.Operator{
		AcOperator: &accountsUsecase.Operator{
			User:                   &uid,
			ReadableWorkspaces:     readableWorkspaces,
			WritableWorkspaces:     writableWorkspaces,
			MaintainableWorkspaces: maintainingWorkspaces,
			OwningWorkspaces:       owningWorkspaces,
			DefaultPolicy:          defaultPolicy,
		},
		ReadableScenes:    scenes.FilterByWorkspace(readableWorkspaces...).IDs(),
		WritableScenes:    scenes.FilterByWorkspace(writableWorkspaces...).IDs(),
		MaintainingScenes: scenes.FilterByWorkspace(maintainingWorkspaces...).IDs(),
		OwningScenes:      scenes.FilterByWorkspace(owningWorkspaces...).IDs(),
		DefaultPolicy:     defaultPolicy,
	}, nil
}

func AuthRequiredMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := c.Request().Context()
			if adapter.Operator(ctx) == nil {
				return echo.ErrUnauthorized
			}
			return next(c)
		}
	}
}
