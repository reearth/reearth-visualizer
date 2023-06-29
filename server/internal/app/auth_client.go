package app

import (
	"context"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/user"
	"github.com/reearth/reearth/server/pkg/workspace"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

type contextKey string

const (
	debugUserHeader            = "X-Reearth-Debug-User"
	contextUser     contextKey = "reearth_user"
)

// load user from db and attach it to context along with operator
// user id can be from debug header or jwt token
// if its new user, create new user and attach it to context
func attachOpMiddleware(cfg *ServerConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()

			var userID string
			var u *user.User

			// get sub from context
			au := adapter.GetAuthInfo(ctx)
			if u, ok := ctx.Value(contextUser).(string); ok {
				userID = u
			}

			// debug mode
			if cfg.Debug {
				if userID := c.Request().Header.Get(debugUserHeader); userID != "" {
					if uId, err := id.UserIDFrom(userID); err == nil {
						user2, err := cfg.Repos.User.FindByID(ctx, uId)
						if err == nil && user2 != nil {
							u = user2
						}
					}
				}
			}

			if u == nil && userID != "" {
				if userID2, err := id.UserIDFrom(userID); err == nil {
					u, err = cfg.Repos.User.FindByID(ctx, userID2)
					if err != nil && err != rerror.ErrNotFound {
						return err
					}
				} else {
					return err
				}
			}

			if u == nil && au != nil {
				var err error
				// find user
				u, err = cfg.Repos.User.FindByAuth0Sub(ctx, au.Sub)
				if err != nil && err != rerror.ErrNotFound {
					return err
				}
			}

			// save a new sub
			if u != nil && au != nil {
				if err := addAuth0SubToUser(ctx, u, user.AuthFrom(au.Sub), cfg); err != nil {
					return err
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
	owningWorkspaces := workspaces.FilterByUserRole(uid, workspace.RoleOwner).IDs()

	return &usecase.Operator{
		User:               uid,
		ReadableWorkspaces: readableWorkspaces,
		WritableWorkspaces: writableWorkspaces,
		OwningWorkspaces:   owningWorkspaces,
		ReadableScenes:     scenes.FilterByWorkspace(readableWorkspaces...).IDs(),
		WritableScenes:     scenes.FilterByWorkspace(writableWorkspaces...).IDs(),
		OwningScenes:       scenes.FilterByWorkspace(owningWorkspaces...).IDs(),
		DefaultPolicy:      util.CloneRef(cfg.Config.Policy.Default),
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
