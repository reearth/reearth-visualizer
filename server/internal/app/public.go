package app

import (
	"context"
	"crypto/subtle"
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsRole "github.com/reearth/reearth-accounts/server/pkg/role"
	accountsUser "github.com/reearth/reearth-accounts/server/pkg/user"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/adapter"
	http1 "github.com/reearth/reearth/server/internal/adapter/http"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/rerror"
)

func Ping() echo.HandlerFunc {
	return func(c echo.Context) error {
		return c.JSON(http.StatusOK, "pong")
	}
}

func Signup(cfg *ServerConfig) echo.HandlerFunc {
	return func(c echo.Context) error {
		var inp http1.SignupInput
		if err := c.Bind(&inp); err != nil {
			return &echo.HTTPError{Code: http.StatusBadRequest, Message: fmt.Errorf("failed to parse request body: %w", err)}
		}

		ctx := c.Request().Context()

		// Mock auth mode: create user in local repos
		if cfg.Config.UseMockAuth() {
			return signupMockUser(ctx, c, cfg, inp)
		}

		// Call reearth-accounts service for signup
		if cfg.AccountsAPIClient != nil {
			var u *accountsUser.User
			var err error

			// Check if this is OIDC signup (sub is provided)
			if inp.Sub != nil && *inp.Sub != "" {
				// Use SignupOIDC for OIDC-based signup
				secret := ""
				if inp.Secret != nil {
					secret = *inp.Secret
				}
				u, err = cfg.AccountsAPIClient.UserRepo.SignupOIDC(ctx, inp.Name,
					inp.Email, *inp.Sub, secret)
			} else {
				// Use regular Signup for password-based signup
				userID := ""
				if inp.UserID != nil {
					userID = inp.UserID.String()
				}
				workspaceID := ""
				if inp.WorkspaceID != nil {
					workspaceID = inp.WorkspaceID.String()
				}
				secret := ""
				if inp.Secret != nil {
					secret = *inp.Secret
				}
				u, err = cfg.AccountsAPIClient.UserRepo.Signup(ctx, userID, inp.Name,
					inp.Email, inp.Password, secret, workspaceID, false)
			}

			if err != nil {
				return &echo.HTTPError{Code: http.StatusInternalServerError, Message: fmt.Sprintf("signup failed: %v", err)}
			}

			return c.JSON(http.StatusOK, http1.SignupOutput{
				ID:    u.ID().String(),
				Name:  u.Name(),
				Email: u.Email(),
			})
		}

		return &echo.HTTPError{Code: http.StatusInternalServerError, Message: "accounts API client not configured"}
	}
}

func PublishedMetadata() echo.HandlerFunc {
	return func(c echo.Context) error {
		name := c.Param("name")
		if name == "" {
			return rerror.ErrNotFound
		}

		contr, err := publishedController(c)
		if err != nil {
			return err
		}

		res, err := contr.Metadata(c.Request().Context(), name)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, res)
	}
}

func PublishedData(pattern string, useParam bool) echo.HandlerFunc {
	return func(c echo.Context) error {
		alias := resolveAlias(c, pattern, useParam)
		if alias == "" {
			return rerror.ErrNotFound
		}

		contr, err := publishedController(c)
		if err != nil {
			return err
		}

		r, err := contr.Data(c.Request().Context(), alias)
		if err != nil {
			return err
		}

		return c.Stream(http.StatusOK, "application/json", r)
	}
}

func PublishedIndex(pattern string, useParam bool) echo.HandlerFunc {
	return PublishedIndexMiddleware(pattern, useParam, true)(nil)
}

func WebConfigHandler(authCfg *config.AuthConfig, webCfg map[string]any, published string) echo.HandlerFunc {
	return func(c echo.Context) error {
		cfg := map[string]any{}
		if authCfg != nil {
			if authCfg.ISS != "" {
				cfg["auth0Domain"] = strings.TrimSuffix(authCfg.ISS, "/")
			}
			if authCfg.ClientID != nil {
				cfg["auth0ClientId"] = *authCfg.ClientID
			}
			if len(authCfg.AUD) > 0 {
				cfg["auth0Audience"] = authCfg.AUD[0]
			}
		}
		if published != "" {
			cfg["published"] = published
		}

		for k, v := range webCfg {
			cfg[k] = v
		}

		return c.JSON(http.StatusOK, cfg)
	}
}

func PublishedIndexMiddleware(pattern string, useParam, errorIfNotFound bool) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			contr, err := publishedController(c)
			if err != nil {
				return err
			}

			alias := resolveAlias(c, pattern, useParam)
			if alias == "" && (next != nil || errorIfNotFound) {
				if errorIfNotFound {
					return rerror.ErrNotFound
				}
				if next != nil {
					return next(c)
				}
			}

			index, err := contr.Index(c.Request().Context(), alias, &url.URL{
				Scheme: "http",
				Host:   c.Request().Host,
				Path:   c.Request().URL.Path,
			})
			if err != nil {
				return err
			}
			if index == "" {
				return rerror.ErrNotFound
			}

			return c.HTML(http.StatusOK, index)
		}
	}
}

func signupMockUser(ctx context.Context, c echo.Context, cfg *ServerConfig, inp http1.SignupInput) error {
	name := inp.Name
	if name == "" && inp.Username != "" {
		name = inp.Username
	}

	// Generate IDs upfront so user and workspace can reference each other
	uID := accountsID.NewUserID()
	wsID := accountsID.NewWorkspaceID()

	// Create user with workspace reference (required for MongoDB deserialization)
	u, err := accountsUser.New().
		ID(uID).
		Name(name).
		Email(inp.Email).
		Workspace(wsID).
		Build()
	if err != nil {
		return &echo.HTTPError{Code: http.StatusBadRequest, Message: fmt.Sprintf("failed to create user: %v", err)}
	}

	// Create workspace for the user using builder pattern (same as test seeder)
	ws := accountsWorkspace.New().
		ID(wsID).
		Name(name).
		Members(map[accountsUser.ID]accountsWorkspace.Member{
			uID: {Role: accountsRole.RoleOwner, InvitedBy: uID},
		}).
		MustBuild()

	if err := cfg.AccountRepos.Workspace.Save(ctx, ws); err != nil {
		return &echo.HTTPError{Code: http.StatusInternalServerError, Message: fmt.Sprintf("failed to save workspace: %v", err)}
	}

	if err := cfg.AccountRepos.User.Save(ctx, u); err != nil {
		return &echo.HTTPError{Code: http.StatusInternalServerError, Message: fmt.Sprintf("failed to save user: %v", err)}
	}

	return c.JSON(http.StatusOK, http1.SignupOutput{
		ID:    u.ID().String(),
		Name:  u.Name(),
		Email: u.Email(),
	})
}

func MockUser() echo.HandlerFunc {
	return func(c echo.Context) error {
		return c.JSON(http.StatusOK, http1.SignupOutput{
			ID:    "mock-user-id",
			Name:  "Demo User",
			Email: "mock@example.com",
		})
	}
}

type keyType struct{}

func PublishedAuthMiddleware() echo.MiddlewareFunc {
	key := keyType{}
	return middleware.BasicAuthWithConfig(middleware.BasicAuthConfig{
		Validator: func(user string, password string, c echo.Context) (bool, error) {
			md, ok := c.Request().Context().Value(key).(interfaces.PublishedMetadata)
			if !ok {
				return true, echo.ErrNotFound
			}
			return !md.IsBasicAuthActive || subtle.ConstantTimeCompare([]byte(user), []byte(md.BasicAuthUsername)) == 1 && subtle.ConstantTimeCompare([]byte(password), []byte(md.BasicAuthPassword)) == 1, nil
		},
		Skipper: func(c echo.Context) bool {
			name := c.Param("name")
			if name == "" {
				return true
			}

			contr, err := publishedController(c)
			if err != nil {
				return false
			}

			md, err := contr.Metadata(c.Request().Context(), name)
			if err != nil {
				return true
			}

			c.SetRequest(c.Request().WithContext(context.WithValue(c.Request().Context(), key, md)))
			return !md.IsBasicAuthActive
		},
	})
}

func publishedController(c echo.Context) (*http1.PublishedController, error) {
	uc := adapter.Usecases(c.Request().Context())
	if uc.Published == nil {
		return nil, rerror.ErrNotFound
	}
	return http1.NewPublishedController(uc.Published), nil
}

func resolveAlias(c echo.Context, pattern string, useParam bool) (a string) {
	if useParam {
		a = c.Param("name")
	}
	if a == "" {
		a = getAliasFromHost(c.Request().Host, pattern)
	}
	return
}

func getAliasFromHost(host, pattern string) string {
	if host == "" || pattern == "" || !strings.Contains(pattern, "{}") {
		return ""
	}

	const placeholder = "<>"
	pattern = strings.TrimPrefix(strings.TrimPrefix(pattern, "https://"), "http://")
	pattern = strings.ReplaceAll(pattern, "{}", placeholder)
	re, err := regexp.Compile(strings.ReplaceAll(regexp.QuoteMeta(pattern), placeholder, "(.+?)"))
	if err != nil {
		return ""
	}

	m := re.FindStringSubmatch(host)
	if len(m) <= 1 {
		return ""
	}

	return m[1]
}
