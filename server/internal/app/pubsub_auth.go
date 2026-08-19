package app

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"slices"
	"strings"

	"google.golang.org/api/idtoken"
)

// verifyPushRequestToken checks that a request against /api/import-project or
// /api/storage-event carries a valid Google-signed OIDC token issued to one of the
// configured caller service accounts (SEC-02).
//
// Verification is only skipped when cfg.Config.DisablePubSubPushAuth is explicitly set --
// the case for local dev and every existing test, none of which have a real Pub/Sub push
// subscription or Cloud Function signing tokens. An empty PubSubPushServiceAccounts on its
// own does NOT disable verification: with the flag left off, every request is rejected
// outright (the allow-list has nothing to match), so a missing/misconfigured value in
// production fails closed instead of silently reopening SEC-02. Once configured, a request
// without a valid token naming an allowed service account is rejected outright, before
// anything in the body (which is otherwise fully attacker-controlled) is trusted for
// anything.
func verifyPushRequestToken(ctx context.Context, cfg *ServerConfig, req *http.Request) error {
	if cfg.Config.DisablePubSubPushAuth {
		return nil
	}
	allowed := cfg.Config.PubSubPushServiceAccounts

	token := strings.TrimPrefix(req.Header.Get("Authorization"), "Bearer ")
	if token == "" {
		return errors.New("missing push authorization token")
	}

	payload, err := idtoken.Validate(ctx, token, cfg.Config.Host)
	if err != nil {
		return fmt.Errorf("invalid push token: %w", err)
	}

	email, _ := payload.Claims["email"].(string)
	emailVerified, _ := payload.Claims["email_verified"].(bool)
	if !emailVerified || email == "" || !slices.Contains(allowed, email) {
		return fmt.Errorf("push token not issued to an allowed service account")
	}

	return nil
}
