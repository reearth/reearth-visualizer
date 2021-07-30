package app

import (
	"context"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-backend/internal/graphql"
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

			// attach sub
			ctx = context.WithValue(ctx, graphql.ContextSub, sub)

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

				// Auth0 accounts are already merged into one so it doesn't need to fetch more info from Auth0
				//
				// if u == nil && token != "" {
				// 	// user not found by sub

				// 	// fetch user profile from Auth0
				// 	data, err := cfg.Gateways.Authenticator.FetchUser(token)
				// 	if err != nil {
				// 		return err
				// 	}

				// 	// if !data.EmailVerified {
				// 	// 	return errors.New("email is not verified")
				// 	// }

				// 	u, err = cfg.Repos.User.FindByEmail(ctx, data.Email)
				// 	if err != nil && err != rerror.ErrNotFound {
				// 		return err
				// 	}
				// 	if u == nil {
				// 		return rerror.ErrUserNotFound
				// 	}
				// }
			}

			// save a new sub
			if u != nil && sub != "" {
				if err := addAuth0SubToUser(ctx, u, user.AuthFromAuth0Sub(sub), cfg); err != nil {
					return err
				}
			}

			// attach operator
			op, err := generateOperator(ctx, cfg, u)
			if err != nil {
				return err
			}
			ctx = context.WithValue(ctx, graphql.ContextOperator, op)

			// attach user
			ctx = context.WithValue(ctx, graphql.ContextUser, u)

			c.SetRequest(req.WithContext(ctx))
			return next(c)
		}
	}
}

func generateOperator(ctx context.Context, cfg *ServerConfig, u *user.User) (*usecase.Operator, error) {
	if u == nil {
		return nil, nil
	}
	teams, err := cfg.Repos.Team.FindByUser(ctx, u.ID())
	if err != nil {
		return nil, err
	}
	return usecase.OperatorFrom(u.ID(), teams), nil
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
