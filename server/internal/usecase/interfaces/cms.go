package interfaces

import (
	"context"
	"errors"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
)

var ErrCMSNotConfigured = errors.New("cms integration is not configured")

const (
	CMSDefaultPageSize = 50
	CMSMaxPageSize     = 100
)

// CMSPageParam is 1-based page pagination. A nil field falls back to the
// first page / CMSDefaultPageSize.
type CMSPageParam struct {
	Page     *int
	PageSize *int
}

// CMS browses the Re:Earth CMS projects, models and assets of a workspace so a
// CMS model or asset can be added as a layer. It is read-only.
type CMS interface {
	FindProjects(ctx context.Context, workspaceID accountsID.WorkspaceID, keyword *string, page CMSPageParam, operator *usecase.Operator) (*gateway.CMSProjectList, error)
	FindModels(ctx context.Context, workspaceID accountsID.WorkspaceID, projectID string, page CMSPageParam, operator *usecase.Operator) (*gateway.CMSModelList, error)
	FindAssets(ctx context.Context, workspaceID accountsID.WorkspaceID, projectID string, page CMSPageParam, operator *usecase.Operator) (*gateway.CMSAssetList, error)
}
