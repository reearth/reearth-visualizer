package app

import (
	"context"
	"fmt"
	"net/url"
	"strings"
	"time"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

type contextKey string

const (
	debugUserHeader            = "X-Reearth-Debug-User"
	contextUser     contextKey = "reearth_user"
	defaultJWTTTL              = 5 // minutes
)

type customClaims struct {
	Name          string `json:"name"`
	Nickname      string `json:"nickname"`
	Email         string `json:"email"`
	EmailVerified *bool  `json:"email_verified"`
}

func (c *customClaims) Validate(_ context.Context) error {
	return nil
}

type MultiValidator []*validator.Validator

func NewMultiValidator(providers []config.AuthConfig) (MultiValidator, error) {
	validators := make([]*validator.Validator, 0, len(providers))
	for _, p := range providers {
		issuerURL, err := url.Parse(p.ISS)
		if err != nil {
			return nil, fmt.Errorf("failed to parse the issuer url: %w", err)
		}
		if issuerURL.Path == "" {
			issuerURL.Path = "/"
		}

		ttl := time.Duration(lo.FromPtrOr(p.TTL, defaultJWTTTL)) * time.Minute
		var opts []jwks.ProviderOption
		if p.JWKSURI != nil && *p.JWKSURI != "" {
			u, err := url.Parse(*p.JWKSURI)
			if err != nil {
				return nil, fmt.Errorf("failed to parse the jwks uri: %w", err)
			}
			opts = append(opts, jwks.WithCustomJWKSURI(u))
		}
		provider := jwks.NewCachingProvider(issuerURL, ttl, opts...)

		alg := "RS256"
		if p.ALG != nil && *p.ALG != "" {
			alg = *p.ALG
		}
		algorithm := validator.SignatureAlgorithm(alg)

		var aud []string
		if p.AUD != nil {
			aud = p.AUD
		} else {
			aud = []string{}
		}

		v, err := validator.New(
			provider.KeyFunc,
			algorithm,
			issuerURL.String(),
			aud,
			validator.WithCustomClaims(func() validator.CustomClaims {
				return &customClaims{}
			}),
		)
		if err != nil {
			return nil, err
		}
		validators = append(validators, v)
	}
	return validators, nil
}

// ValidateToken Trys to validate the token with each validator
// NOTE: the last validation error only is returned
func (mv MultiValidator) ValidateToken(ctx context.Context, tokenString string) (res interface{}, err error) {
	for _, v := range mv {
		res, err = v.ValidateToken(ctx, tokenString)
		if err == nil {
			return
		}
	}
	return
}

// Validate the access token and inject the user clams into ctx
func jwtEchoMiddleware(cfg *ServerConfig) echo.MiddlewareFunc {
	jwtValidator, err := NewMultiValidator(cfg.Config.Auths())
	if err != nil {
		log.Fatalf("failed to set up the validator: %v", err)
	}

	middleware := jwtmiddleware.New(jwtValidator.ValidateToken, jwtmiddleware.WithCredentialsOptional(true))

	return echo.WrapMiddleware(middleware.CheckJWT)
}

// load claim from ctx and inject the user sub into ctx
func loadAuthInfoMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()

			rawClaims := ctx.Value(jwtmiddleware.ContextKey{})
			if claims, ok := rawClaims.(*validator.ValidatedClaims); ok {
				// attach auth info to context
				customClaims := claims.CustomClaims.(*customClaims)
				name := customClaims.Nickname
				if name == "" {
					name = customClaims.Name
				}
				ctx = adapter.AttachAuthInfo(ctx, adapter.AuthInfo{
					Token:         strings.TrimPrefix(c.Request().Header.Get("Authorization"), "Bearer "),
					Sub:           claims.RegisteredClaims.Subject,
					Iss:           claims.RegisteredClaims.Issuer,
					Name:          name,
					Email:         customClaims.Email,
					EmailVerified: customClaims.EmailVerified,
				})
			}

			c.SetRequest(req.WithContext(ctx))
			return next(c)
		}
	}
}
