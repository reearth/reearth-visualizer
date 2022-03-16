package app

import (
	"context"
	"fmt"
	"net/url"
	"time"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-backend/pkg/log"
)

type contextKey string

const (
	debugUserHeader            = "X-Reearth-Debug-User"
	contextAuth0Sub contextKey = "auth0Sub"
	contextUser     contextKey = "reearth_user"
)

type MultiValidator []*validator.Validator

func NewMultiValidator(providers []AuthConfig) (MultiValidator, error) {
	validators := make([]*validator.Validator, 0, len(providers))
	for _, p := range providers {

		issuerURL, err := url.Parse(p.ISS)
		if err != nil {
			return nil, fmt.Errorf("failed to parse the issuer url: %w", err)
		}

		provider := jwks.NewCachingProvider(issuerURL, time.Duration(*p.TTL)*time.Minute)

		algorithm := validator.SignatureAlgorithm(*p.ALG)

		v, err := validator.New(
			provider.KeyFunc,
			algorithm,
			p.ISS,
			p.AUD,
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

	jwtValidator, err := NewMultiValidator(cfg.Config.Auth)
	if err != nil {
		log.Fatalf("failed to set up the validator: %v", err)
	}

	middleware := jwtmiddleware.New(jwtValidator.ValidateToken, jwtmiddleware.WithCredentialsOptional(true))

	return echo.WrapMiddleware(middleware.CheckJWT)
}

// load claim from ctx and inject the user sub into ctx
func parseJwtMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			ctx := req.Context()

			rawClaims := ctx.Value(jwtmiddleware.ContextKey{})
			if claims, ok := rawClaims.(*validator.ValidatedClaims); ok {

				// attach sub and access token to context
				ctx = context.WithValue(ctx, contextAuth0Sub, claims.RegisteredClaims.Subject)
			}

			c.SetRequest(req.WithContext(ctx))
			return next(c)
		}
	}
}
