package accounts

import (
	"bytes"
	"io"
	"net/http"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/adapter/internal"
	"github.com/reearth/reearthx/log"
)

type DynamicAuthTransport struct{}

func (t DynamicAuthTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	var token string

	// During the migration period to accounts server, this transport handles both:
	// - JWT tokens set directly in context (new auth middleware)
	// - JWT tokens extracted from AuthInfo (legacy auth middleware)
	// TODO: Remove authInfo handling once the migration is complete
	if jwtToken := adapter.GetContextJWT(req.Context()); jwtToken != "" {
		token = jwtToken
	} else if jwtToken := internal.GetContextJWT(req.Context()); jwtToken != "" {
		token = jwtToken
	} else if authInfo := internal.GetContextAuthInfo(req.Context()); authInfo != nil && authInfo.Token != "" {
		token = authInfo.Token
	}

	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
		log.Debugfc(req.Context(), "[Accounts API] Setting Authorization header with token (length: %d)", len(token))
	} else {
		log.Warnfc(req.Context(), "[Accounts API] No JWT token found in context")
	}

	// Log request
	if req.Body != nil {
		bodyBytes, err := io.ReadAll(req.Body)
		if err == nil {
			log.Debugfc(req.Context(), "[Accounts API] Request to %s: %s", req.URL.String(), string(bodyBytes))
			// Restore the body for the actual request
			req.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}
	} else {
		log.Debugfc(req.Context(), "[Accounts API] Request to %s (no body)", req.URL.String())
	}

	resp, err := http.DefaultTransport.RoundTrip(req)
	if err != nil {
		log.Errorfc(req.Context(), "[Accounts API] Request failed: %v", err)
		return nil, err
	}

	// Log response
	if resp.Body != nil {
		bodyBytes, err := io.ReadAll(resp.Body)
		if err == nil {
			log.Debugfc(req.Context(), "[Accounts API] Response status %d: %s", resp.StatusCode, string(bodyBytes))
			// Restore the body for the caller
			resp.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}
	}

	return resp, nil
}
