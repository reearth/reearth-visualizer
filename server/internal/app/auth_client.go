package app

import (
	"context"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/account/accountusecase/accountinteractor"
	"github.com/reearth/reearthx/appx"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

// load user from db and attach it to context along with operator
// user id can be from debug header or jwt token
// if its new user, create new user and attach it to context
func attachOpMiddleware(cfg *ServerConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		multiUser := accountinteractor.NewMultiUser(cfg.AccountRepos, cfg.AccountGateways, cfg.Config.SignupSecret, cfg.Config.Host_Web, cfg.AccountRepos.Users)
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()

			ctx = adapter.AttachCurrentHost(ctx, cfg.Config.Host)

			// get sub from context
			var authInfo *appx.AuthInfo
			authInfo = adapter.GetAuthInfo(ctx)

			var userID string
			var u *user.User

			if tempId := adapter.UserID(ctx); tempId != nil {
				userID = *tempId
			}

			if adapter.IsMockAuth(ctx) {
				// Create a mock user based on the auth info
				mockUser, err := cfg.AccountRepos.User.FindByNameOrEmail(ctx, "Mock User")
				if err != nil {
					// when creating the first mock user
					uId, _ := user.IDFrom(authInfo.Sub)
					mockUser = user.New().
						ID(uId).
						Name(authInfo.Name).
						Email(authInfo.Email).
						MustBuild()
				}
				u = mockUser

			} else {

				// debug mode
				if cfg.Debug {
					if userID := c.Request().Header.Get("X-Reearth-Debug-User"); userID != "" {
						if uId, err := accountdomain.UserIDFrom(userID); err == nil {
							user2, err := multiUser.FetchByID(ctx, user.IDList{uId})
							if err == nil && len(user2) == 1 {
								u = user2[0]
							}
						}
					}
				}

				// This is from the past, and normally, it is retrieved via Sub. During testing, it is retrieved from the userID in the header.
				if u == nil && userID != "" {

					userID2, err := accountdomain.UserIDFrom(userID)
					if err != nil {
						return err
					}

					u2, err := multiUser.FetchByID(ctx, user.IDList{userID2})
					if err != nil {
						return err
					}

					if len(u2) > 0 {
						u = u2[0]
					} else {
						log.Errorfc(ctx, "User not found id: %s", userID2)
					}

				}

				if authInfo != nil {

					if u == nil {
						var err error
						u, err = multiUser.FetchBySub(ctx, authInfo.Sub)
						if err != nil && err != rerror.ErrNotFound {
							return err
						}
						// find user
					}

					// save a new sub
					if u != nil {
						auth := user.AuthFrom(authInfo.Sub)
						if err := addAuth0SubToUser(ctx, u, auth, cfg); err != nil {
							return err
						}
					}

				} else {
					log.Errorfc(ctx, "Auth information not found: %s", req.URL.Path)
				}

			}

			if u != nil {
				ctx = adapter.AttachUser(ctx, u)
				if u.Name() != "e2e" {
					log.Debugfc(ctx, "auth: user: id=%s name=%s email=%s", u.ID(), u.Name(), u.Email())
				}

				op, err := generateOperator(ctx, cfg, u)
				if err != nil {
					return err
				}

				ctx = adapter.AttachOperator(ctx, op)
				if u.Name() != "e2e" {
					log.Debugfc(ctx, "auth: op: %#v", op)
				}
			} else {
				log.Errorfc(ctx, "User information not found: %s", req.URL.Path)
			}

			c.SetRequest(req.WithContext(ctx))
			return next(c)
		}
	}
}

func generateOperator(ctx context.Context, cfg *ServerConfig, u *user.User) (*usecase.Operator, error) {
	if u == nil {
		return nil, nil
	}

	uid := u.ID()
	workspaces, err := cfg.Repos.Workspace.FindByUser(ctx, uid)
	if err != nil {
		return nil, err
	}
	scenes, err := cfg.Repos.Scene.FindByWorkspace(ctx, workspaces.IDs()...)
	if err != nil {
		return nil, err
	}

	readableWorkspaces := workspaces.FilterByUserRole(uid, workspace.RoleReader).IDs()
	writableWorkspaces := workspaces.FilterByUserRole(uid, workspace.RoleWriter).IDs()
	maintainingWorkspaces := workspaces.FilterByUserRole(uid, workspace.RoleMaintainer).IDs()
	owningWorkspaces := workspaces.FilterByUserRole(uid, workspace.RoleOwner).IDs()
	defaultPolicy := util.CloneRef(cfg.Config.Policy.Default)

	return &usecase.Operator{
		AcOperator: &accountusecase.Operator{
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

func addAuth0SubToUser(ctx context.Context, u *user.User, a user.Auth, cfg *ServerConfig) error {
	if u.AddAuth(a) {
		err := cfg.Repos.User.Save(ctx, u)
		if err != nil {
			return err
		}
	}
	return nil
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
