package policy

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase/gateway"
)

type PermissiveChecker struct{}

func NewPermissiveChecker() *PermissiveChecker {
	return &PermissiveChecker{}
}

func (p *PermissiveChecker) CheckPolicy(ctx context.Context, req gateway.PolicyCheckRequest) (*gateway.PolicyCheckResponse, error) {
	return &gateway.PolicyCheckResponse{
		Allowed:      true,
		CheckType:    req.CheckType,
		CurrentLimit: "unlimited",
		Message:      "No restrictions in OSS version",
		Value:        req.Value,
	}, nil
}
