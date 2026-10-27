package gateway

import (
	"context"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	cmspb "github.com/reearth/reearth-proto/gen/go/cms/v1"
)

// CMS browses a workspace's Re:Earth CMS projects, models and assets through
// the CMS internal gRPC API. It takes and returns the reearth-proto CMS types
// directly; implementations only add auth metadata and a timeout. IDs are CMS
// IDs, not Visualizer IDs; the workspace ID is shared because both services
// are backed by reearth-accounts.
//
// userID is forwarded to CMS so it can apply that user's read access. It may
// be nil only for calls that are not made on behalf of a user.
type CMS interface {
	ListProjects(ctx context.Context, req *cmspb.ListProjectsRequest, userID *accountsID.UserID) (*cmspb.ListProjectsResponse, error)
	GetProject(ctx context.Context, req *cmspb.ProjectRequest, userID *accountsID.UserID) (*cmspb.Project, error)
	ListModels(ctx context.Context, req *cmspb.ListModelsRequest, userID *accountsID.UserID) (*cmspb.ListModelsResponse, error)
	ListAssets(ctx context.Context, req *cmspb.ListAssetsRequest, userID *accountsID.UserID) (*cmspb.ListAssetsResponse, error)
}
