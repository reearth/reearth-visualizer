package app

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"os"
	"strconv"

	"github.com/caos/oidc/pkg/op"
	"github.com/golang/gddo/httputil/header"
	"github.com/gorilla/mux"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-backend/internal/usecase/interactor"
	"github.com/reearth/reearth-backend/internal/usecase/interfaces"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/user"
)

const (
	loginEndpoint  = "api/login"
	logoutEndpoint = "api/logout"
	jwksEndpoint   = ".well-known/jwks.json"
	authProvider   = "reearth"
)

func authEndPoints(ctx context.Context, e *echo.Echo, r *echo.Group, cfg *ServerConfig) {
	userUsecase := interactor.NewUser(cfg.Repos, cfg.Gateways, cfg.Config.SignupSecret, cfg.Config.Host_Web)

	domain := cfg.Config.AuthServeDomainURL()
	if domain == nil || domain.String() == "" {
		log.Panicf("auth: not valid auth domain: %s", domain)
	}
	domain.Path = "/"

	config := &op.Config{
		Issuer:                domain.String(),
		CryptoKey:             sha256.Sum256([]byte(cfg.Config.AuthSrv.Key)),
		GrantTypeRefreshToken: true,
	}

	var dn *interactor.AuthDNConfig = nil
	if cfg.Config.AuthSrv.DN != nil {
		dn = &interactor.AuthDNConfig{
			CommonName:         cfg.Config.AuthSrv.DN.CN,
			Organization:       cfg.Config.AuthSrv.DN.O,
			OrganizationalUnit: cfg.Config.AuthSrv.DN.OU,
			Country:            cfg.Config.AuthSrv.DN.C,
			Locality:           cfg.Config.AuthSrv.DN.L,
			Province:           cfg.Config.AuthSrv.DN.ST,
			StreetAddress:      cfg.Config.AuthSrv.DN.Street,
			PostalCode:         cfg.Config.AuthSrv.DN.PostalCode,
		}
	}

	storage, err := interactor.NewAuthStorage(
		ctx,
		&interactor.StorageConfig{
			Domain:       domain.String(),
			ClientDomain: cfg.Config.Host_Web,
			Debug:        cfg.Debug,
			DN:           dn,
		},
		cfg.Repos.AuthRequest,
		cfg.Repos.Config,
		userUsecase.GetUserBySubject,
	)
	if err != nil {
		log.Fatalf("auth: init failed: %s\n", err)
	}

	handler, err := op.NewOpenIDProvider(
		ctx,
		config,
		storage,
		op.WithHttpInterceptors(jsonToFormHandler()),
		op.WithHttpInterceptors(setURLVarsHandler()),
		op.WithCustomEndSessionEndpoint(op.NewEndpoint(logoutEndpoint)),
		op.WithCustomKeysEndpoint(op.NewEndpoint(jwksEndpoint)),
	)
	if err != nil {
		log.Fatalf("auth: init failed: %s\n", err)
	}

	router := handler.HttpHandler().(*mux.Router)

	if err := router.Walk(muxToEchoMapper(r)); err != nil {
		log.Fatalf("auth: walk failed: %s\n", err)
	}

	// Actual login endpoint
	r.POST(loginEndpoint, login(ctx, domain, storage, userUsecase))

	r.GET(logoutEndpoint, logout())

	// used for auth0/auth0-react; the logout endpoint URL is hard-coded
	// can be removed when the mentioned issue is solved
	// https://github.com/auth0/auth0-spa-js/issues/845
	r.GET("v2/logout", logout())

	debugMsg := ""
	if dev, ok := os.LookupEnv(op.OidcDevMode); ok {
		if isDev, _ := strconv.ParseBool(dev); isDev {
			debugMsg = " with debug mode"
		}
	}
	log.Infof("auth: oidc server started%s at %s", debugMsg, domain.String())
}

func setURLVarsHandler() func(handler http.Handler) http.Handler {
	return func(handler http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path != "/authorize/callback" {
				handler.ServeHTTP(w, r)
				return
			}

			r2 := mux.SetURLVars(r, map[string]string{"id": r.URL.Query().Get("id")})
			handler.ServeHTTP(w, r2)
		})
	}
}

func jsonToFormHandler() func(handler http.Handler) http.Handler {
	return func(handler http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path != "/oauth/token" {
				handler.ServeHTTP(w, r)
				return
			}

			if r.Header.Get("Content-Type") != "" {
				value, _ := header.ParseValueAndParams(r.Header, "Content-Type")
				if value != "application/json" {
					// Content-Type header is not application/json
					handler.ServeHTTP(w, r)
					return
				}
			}

			if err := r.ParseForm(); err != nil {
				return
			}

			var result map[string]string

			if err := json.NewDecoder(r.Body).Decode(&result); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			for key, value := range result {
				r.Form.Set(key, value)
			}

			handler.ServeHTTP(w, r)
		})
	}
}

func muxToEchoMapper(r *echo.Group) func(route *mux.Route, router *mux.Router, ancestors []*mux.Route) error {
	return func(route *mux.Route, router *mux.Router, ancestors []*mux.Route) error {
		path, err := route.GetPathTemplate()
		if err != nil {
			return err
		}

		methods, err := route.GetMethods()
		if err != nil {
			r.Any(path, echo.WrapHandler(route.GetHandler()))
			return nil
		}

		for _, method := range methods {
			r.Add(method, path, echo.WrapHandler(route.GetHandler()))
		}

		return nil
	}
}

type loginForm struct {
	Email         string `json:"username" form:"username"`
	Password      string `json:"password" form:"password"`
	AuthRequestID string `json:"id" form:"id"`
}

func login(ctx context.Context, url *url.URL, storage op.Storage, userUsecase interfaces.User) func(ctx echo.Context) error {
	return func(ec echo.Context) error {
		request := new(loginForm)
		err := ec.Bind(request)
		if err != nil {
			log.Errorln("auth: filed to parse login request")
			return ec.Redirect(
				http.StatusFound,
				redirectURL(url, "/login", "", "Bad request!"),
			)
		}

		if _, err := storage.AuthRequestByID(ctx, request.AuthRequestID); err != nil {
			log.Errorf("auth: filed to parse login request: %s\n", err)
			return ec.Redirect(
				http.StatusFound,
				redirectURL(url, "/login", "", "Bad request!"),
			)
		}

		if len(request.Email) == 0 || len(request.Password) == 0 {
			log.Errorln("auth: one of credentials are not provided")
			return ec.Redirect(
				http.StatusFound,
				redirectURL(url, "/login", request.AuthRequestID, "Bad request!"),
			)
		}

		// check user credentials from db
		u, err := userUsecase.GetUserByCredentials(ctx, interfaces.GetUserByCredentials{
			Email:    request.Email,
			Password: request.Password,
		})
		var auth *user.Auth
		if err == nil {
			auth = u.GetAuthByProvider(authProvider)
			if auth == nil {
				err = errors.New("The account is not signed up with Re:Earth")
			}
		}
		if err != nil {
			log.Errorf("auth: wrong credentials: %s\n", err)
			return ec.Redirect(
				http.StatusFound,
				redirectURL(url, "/login", request.AuthRequestID, "Login failed; Invalid user ID or password."),
			)
		}

		// Complete the auth request && set the subject
		err = storage.(*interactor.AuthStorage).CompleteAuthRequest(ctx, request.AuthRequestID, auth.Sub)
		if err != nil {
			log.Errorf("auth: failed to complete the auth request: %s\n", err)
			return ec.Redirect(
				http.StatusFound,
				redirectURL(url, "/login", request.AuthRequestID, "Bad request!"),
			)
		}

		return ec.Redirect(
			http.StatusFound,
			redirectURL(url, "/authorize/callback", request.AuthRequestID, ""),
		)
	}
}

func logout() func(ec echo.Context) error {
	return func(ec echo.Context) error {
		u := ec.QueryParam("returnTo")
		return ec.Redirect(http.StatusTemporaryRedirect, u)
	}
}

func redirectURL(u *url.URL, p string, requestID, err string) string {
	v := cloneURL(u)
	if p == "" {
		p = "/login"
	}
	v.Path = p
	queryValues := u.Query()
	queryValues.Set("id", requestID)
	if err != "" {
		queryValues.Set("error", err)
	}
	v.RawQuery = queryValues.Encode()
	return v.String()
}

func cloneURL(u *url.URL) *url.URL {
	return &url.URL{
		Scheme: u.Scheme,
		Opaque: u.Opaque,
		User:   u.User,
		Host:   u.Host,
		Path:   u.Path,
	}
}
