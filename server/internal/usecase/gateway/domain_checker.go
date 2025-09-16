package gateway

import (
	"context"
)

type DomainCheckRequest struct {
	Domain string `json:"domain"`
}

type DomainCheckResponse struct {
	Allowed bool
}

type DomainChecker interface {
	CheckDomain(ctx context.Context, req DomainCheckRequest) (*DomainCheckResponse, error)
}
