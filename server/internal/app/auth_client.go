package app

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"

	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/account/accountusecase/accountinteractor"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"

	"github.com/reearth/reearth-accounts/server/pkg/gqlclient/gqlerror"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
)

type graphqlRequest struct {
	Query         string                 `json:"query"`
	OperationName string                 `json:"operationName"`
	Variables     map[string]interface{} `json:"variables"`
}

func isSignupMutation(req *http.Request) bool {
	if req.Method != http.MethodPost {
		return false
	}

	body, err := io.ReadAll(req.Body)
	if err != nil {
		return false
	}
	req.Body = io.NopCloser(bytes.NewReader(body))

	var gqlReq graphqlRequest
	if err := json.Unmarshal(body, &gqlReq); err != nil {
		return false
	}

	query := strings.ToLower(gqlReq.Query)
	query = strings.ReplaceAll(query, " ", "")
	query = strings.ReplaceAll(query, "\n", "")
	query = strings.ReplaceAll(query, "\t", "")
	query = strings.ReplaceAll(query, "\r", "")

	// Check if it's a mutation
	if !strings.Contains(query, "mutation") {
		return false
	}

	// Check for signup or signupOIDC after mutation keyword
	// This handles both named and anonymous mutations
	return strings.Contains(query, "signup(") || strings.Contains(query, "signupoidc(")
}

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
			authInfo := adapter.GetAuthInfo(ctx)

			// Set JWT token in context for Accounts API authentication
			if authInfo != nil && authInfo.Token != "" {
				ctx = adapter.AttachJwtToken(ctx, authInfo.Token)
				// Update the request context immediately so it's available for GraphQL calls
				c.SetRequest(req.WithContext(ctx))
			}

			var u *user.User

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
			if u == nil {
				if tempId := adapter.UserID(ctx); tempId != nil {
					userID2, err := accountdomain.UserIDFrom(*tempId)
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
			}

			if authInfo != nil {
				if u == nil {
					var err error
					u, err = multiUser.FetchBySub(ctx, authInfo.Sub)
					if err != nil && err != rerror.ErrNotFound {
						return err
					}
				}

				if u != nil {
					auth := user.AuthFrom(authInfo.Sub)
					if err := addAuth0SubToUser(ctx, u, auth, cfg); err != nil {
						return err
					}
				}

			} else {
				log.Errorfc(ctx, "Auth information not found: %s", req.URL.Path)
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

func attachOpMiddlewareMockUser(cfg *ServerConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()

			ctx = adapter.AttachCurrentHost(ctx, cfg.Config.Host)

			authInfo := adapter.GetAuthInfo(ctx)

			var u *user.User

			mockUser, err := cfg.AccountRepos.User.FindByNameOrEmail(ctx, "Mock User")
			if err != nil {
				uId, _ := user.IDFrom(authInfo.Sub)
				mockUser = user.New().
					ID(uId).
					Name(authInfo.Name).
					Email(authInfo.Email).
					MustBuild()
			}

			u = mockUser

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

			// The token is set as is and sent to reearth-accounts for verification.
			token := strings.TrimPrefix(req.Header.Get("Authorization"), "Bearer ")
			ctx = adapter.AttachJwtToken(ctx, token)

			// Skip user loading for signup mutations
			// signup mutations will be handled by reearth-accounts service
			if isSignupMutation(req) {
				log.Debugfc(ctx, "auth: skipping user loading for signup mutation")
				c.SetRequest(req.WithContext(ctx))
				return next(c)
			}

			var u *user.User

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
	if gqlerror.IsUnauthorized(err) {
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

func buildAccountDomainUserFromUserModel(ctx context.Context, userModel *accountsUser.User) (*user.User, error) {
	uId, _ := user.IDFrom(userModel.ID().String())
	wid, _ := workspace.IDFrom(userModel.Workspace().String())

	usermetadata := user.MetadataFrom(
		userModel.Metadata().PhotoURL(),
		userModel.Metadata().Description(),
		userModel.Metadata().Website(),
		userModel.Metadata().Lang(),
		user.Theme(userModel.Metadata().Theme()),
	)

	// Convert auths to user.Auth slice
	auths := make([]user.Auth, 0, len(userModel.Auths()))
	for _, authStr := range userModel.Auths() {
		auths = append(auths, user.AuthFrom(authStr.String()))
	}

	u, err := user.New().
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
