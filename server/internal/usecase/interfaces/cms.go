package interfaces

import (
	"context"
	"errors"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	cmspb "github.com/reearth/reearth-proto/gen/go/cms/v1"
	"github.com/reearth/reearth/server/internal/usecase"
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
	FindProjects(ctx context.Context, workspaceID accountsID.WorkspaceID, keyword *string, page CMSPageParam, operator *usecase.Operator) (*cmspb.ListProjectsResponse, error)
	FindModels(ctx context.Context, workspaceID accountsID.WorkspaceID, projectID string, page CMSPageParam, operator *usecase.Operator) (*cmspb.ListModelsResponse, error)
	FindAssets(ctx context.Context, workspaceID accountsID.WorkspaceID, projectID string, page CMSPageParam, operator *usecase.Operator) (*cmspb.ListAssetsResponse, error)
}
