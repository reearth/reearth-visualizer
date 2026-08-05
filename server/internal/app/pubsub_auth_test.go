package app

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/stretchr/testify/assert"
)

func TestVerifyPushRequestToken(t *testing.T) {
	newReq := func(authHeader string) *http.Request {
		req := httptest.NewRequest(http.MethodPost, "/api/storage-event", nil)
		if authHeader != "" {
			req.Header.Set("Authorization", authHeader)
		}
		return req
	}

	t.Run("disabled when no service accounts are configured", func(t *testing.T) {
		cfg := &ServerConfig{Config: &config.Config{}}
		err := verifyPushRequestToken(context.Background(), cfg, newReq(""))
		assert.NoError(t, err, "verification must be a no-op until PubSubPushServiceAccounts is configured, so local dev and existing tests keep working")
	})

	t.Run("rejects a missing token once configured", func(t *testing.T) {
		cfg := &ServerConfig{Config: &config.Config{
			PubSubPushServiceAccounts: []string{"pubsub-push@example.iam.gserviceaccount.com"},
		}}
		err := verifyPushRequestToken(context.Background(), cfg, newReq(""))
		assert.Error(t, err)
	})

	t.Run("rejects a malformed token once configured", func(t *testing.T) {
		cfg := &ServerConfig{Config: &config.Config{
			PubSubPushServiceAccounts: []string{"pubsub-push@example.iam.gserviceaccount.com"},
		}}
		err := verifyPushRequestToken(context.Background(), cfg, newReq("Bearer not-a-real-jwt"))
		assert.Error(t, err)
	})
}
