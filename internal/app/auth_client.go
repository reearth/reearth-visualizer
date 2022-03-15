package app

import (
	"context"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-backend/internal/adapter"
	"github.com/reearth/reearth-backend/internal/usecase"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/rerror"
	"github.com/reearth/reearth-backend/pkg/user"
)

func authMiddleware(cfg *ServerConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()

			var sub, userID string
			var u *user.User

			// get sub from context
			if s, ok := ctx.Value(contextAuth0Sub).(string); ok {
				sub = s
			}
			if u, ok := ctx.Value(contextUser).(string); ok {
				userID = u
			}

			// debug mode
			if cfg.Debug {
				if userID := c.Request().Header.Get(debugUserHeader); userID != "" {
					if id, err := id.UserIDFrom(userID); err == nil {
						user2, err := cfg.Repos.User.FindByID(ctx, id)
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

			if u == nil && sub != "" {
				var err error
				// find user
				u, err = cfg.Repos.User.FindByAuth0Sub(ctx, sub)
				if err != nil && err != rerror.ErrNotFound {
					return err
				}
			}

			// save a new sub
			if u != nil && sub != "" {
				if err := addAuth0SubToUser(ctx, u, user.AuthFromAuth0Sub(sub), cfg); err != nil {
					return err
				}
			}

			if sub != "" {
				ctx = adapter.AttachSub(ctx, sub)
			}

			if u != nil {
				op, err := generateOperator(ctx, cfg, u)
				if err != nil {
					return err
				}

				ctx = adapter.AttachUser(ctx, u)
				ctx = adapter.AttachOperator(ctx, op)
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
	teams, err := cfg.Repos.Team.FindByUser(ctx, uid)
	if err != nil {
		return nil, err
	}
	scenes, err := cfg.Repos.Scene.FindByTeam(ctx, teams.IDs()...)
	if err != nil {
		return nil, err
	}

	readableTeams := teams.FilterByUserRole(uid, user.RoleReader).IDs()
	writableTeams := teams.FilterByUserRole(uid, user.RoleWriter).IDs()
	owningTeams := teams.FilterByUserRole(uid, user.RoleOwner).IDs()

	return &usecase.Operator{
		User:           uid,
		ReadableTeams:  readableTeams,
		WritableTeams:  writableTeams,
		OwningTeams:    owningTeams,
		ReadableScenes: scenes.FilterByTeam(readableTeams...).IDs(),
		WritableScenes: scenes.FilterByTeam(writableTeams...).IDs(),
		OwningScenes:   scenes.FilterByTeam(owningTeams...).IDs(),
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
