package domain

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearthx/rerror"
)

type HTTPDomainChecker struct {
	endpoint string
	token    string
	client   *http.Client
}

func NewHTTPDomainChecker(endpoint, token string, timeoutSeconds int) *HTTPDomainChecker {
	return &HTTPDomainChecker{
		endpoint: endpoint,
		token:    token,
		client: &http.Client{
			Timeout: time.Duration(timeoutSeconds) * time.Second,
		},
	}
}

func (h *HTTPDomainChecker) CheckDomain(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("failed to marshal domain check request: %w", err))
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, h.endpoint, bytes.NewBuffer(body))
	if err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("failed to create domain check request: %w", err))
	}

	httpReq.Header.Set("Content-Type", "application/json")
	if h.token != "" {
		httpReq.Header.Set("Authorization", "Bearer "+h.token)
	}

	resp, err := h.client.Do(httpReq)
	if err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("domain check request failed: %w", err))
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		return nil, rerror.ErrInternalBy(fmt.Errorf("domain check returned status %d", resp.StatusCode))
	}

	var domainResp gateway.DomainCheckResponse
	if err := json.NewDecoder(resp.Body).Decode(&domainResp); err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("failed to decode domain check response: %w", err))
	}

	return &domainResp, nil
}
