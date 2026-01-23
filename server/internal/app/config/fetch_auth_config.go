package config

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/reearth/reearthx/log"
)

type accountsAuthConfigResponse struct {
	Data struct {
		AuthConfig struct {
			Auth0Domain   *string `json:"auth0Domain"`
			Auth0Audience *string `json:"auth0Audience"`
			Auth0ClientID *string `json:"auth0ClientId"`
			AuthProvider  *string `json:"authProvider"`
		} `json:"authConfig"`
	} `json:"data"`
}

// FetchAuthConfigFromAccounts fetches auth configuration from reearth-accounts GraphQL API
func FetchAuthConfigFromAccounts(ctx context.Context, accountsAPIHost string) (*Auth0Config, error) {
	if accountsAPIHost == "" {
		return nil, fmt.Errorf("accounts API host is not configured")
	}

	// GraphQL query to fetch authConfig
	query := map[string]interface{}{
		"query": `query { authConfig { auth0Domain auth0Audience auth0ClientId authProvider } }`,
	}

	queryJSON, err := json.Marshal(query)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal query: %w", err)
	}

	// Create HTTP request
	url := accountsAPIHost + "/api/graphql"
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(queryJSON))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// Execute request with timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch auth config: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("unexpected status code %d: %s", resp.StatusCode, string(body))
	}

	// Parse response
	var result accountsAuthConfigResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	authCfg := &result.Data.AuthConfig

	// Convert to Auth0Config
	auth0Cfg := &Auth0Config{}

	if authCfg.Auth0Domain != nil {
		auth0Cfg.Domain = *authCfg.Auth0Domain
	}

	if authCfg.Auth0Audience != nil {
		auth0Cfg.Audience = *authCfg.Auth0Audience
	}

	if authCfg.Auth0ClientID != nil {
		// Use the client ID for both ClientID and WebClientID
		auth0Cfg.WebClientID = *authCfg.Auth0ClientID
	}

	log.Infof("config: fetched auth config from accounts API: domain=%s, audience=%s",
		auth0Cfg.Domain, auth0Cfg.Audience)

	return auth0Cfg, nil
}
