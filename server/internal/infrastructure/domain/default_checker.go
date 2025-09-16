package domain

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
)

type DefaultChecker struct{}

func NewDefaultChecker() *DefaultChecker {
	return &DefaultChecker{}
}

// DefaultChecker is a default checker that always disallows
func (p *DefaultChecker) CheckDomain(ctx context.Context, req gateway.DomainCheckRequest) (*gateway.DomainCheckResponse, error) {
	return &gateway.DomainCheckResponse{
		Allowed: false,
	}, nil
}
