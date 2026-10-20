package gateway

import (
	"context"
	"time"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

// CMS browses a workspace's Re:Earth CMS projects, models and assets through
// the CMS internal gRPC API. IDs are CMS IDs, not Visualizer IDs; the workspace
// ID is shared because both services are backed by reearth-accounts.
//
// userID is forwarded to CMS so it can apply that user's read access. It may
// be nil only for calls that are not made on behalf of a user.
type CMS interface {
	ListProjects(ctx context.Context, workspaceID accountsID.WorkspaceID, keyword *string, page CMSPage, userID *accountsID.UserID) (*CMSProjectList, error)
	GetProject(ctx context.Context, workspaceID accountsID.WorkspaceID, projectID string, userID *accountsID.UserID) (*CMSProject, error)
	ListModels(ctx context.Context, projectID string, page CMSPage, userID *accountsID.UserID) (*CMSModelList, error)
	ListAssets(ctx context.Context, projectID string, page CMSPage, userID *accountsID.UserID) (*CMSAssetList, error)
}

// CMSPage is CMS's page-based pagination. Page is 1-based.
type CMSPage struct {
	Page     int
	PageSize int
}

type CMSProject struct {
	ID          string
	Name        string
	Alias       string
	Description string
	WorkspaceID string
	Public      bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type CMSProjectList struct {
	Projects   []*CMSProject
	TotalCount int64
}

type CMSModel struct {
	ID          string
	ProjectID   string
	Name        string
	Description string
	Key         string
	// PublicAPIEndpoint is the model's CMS Public API URL. CMS serves the
	// model's items as GeoJSON at this URL with ".geojson" appended.
	PublicAPIEndpoint string
	EditorURL         string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

type CMSModelList struct {
	Models     []*CMSModel
	TotalCount int64
}

type CMSAsset struct {
	ID                      string
	ProjectID               string
	Filename                string
	Size                    uint64
	PreviewType             string
	URL                     string
	ArchiveExtractionStatus string
	Public                  bool
	CreatedAt               time.Time
}

type CMSAssetList struct {
	Assets     []*CMSAsset
	TotalCount int64
}
