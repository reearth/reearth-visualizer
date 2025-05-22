package interfaces

import (
	"archive/zip"
	"context"
	"errors"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
)

type AssetFilterType string

const (
	AssetFilterDate AssetFilterType = "DATE"
	AssetFilterSize AssetFilterType = "SIZE"
	AssetFilterName AssetFilterType = "NAME"
)

type CreateAssetParam struct {
	WorkspaceID accountdomain.WorkspaceID
	ProjectID   *id.ProjectID
	CoreSupport bool
	File        *file.File
}

var (
	ErrCreateAssetFailed error = errors.New("failed to create asset")
)

type Asset interface {
	Fetch(context.Context, []id.AssetID, *usecase.Operator) ([]*asset.Asset, error)
	FindByWorkspaceProject(context.Context, accountdomain.WorkspaceID, *id.ProjectID, *string, *asset.SortType, *usecasex.Pagination, *usecase.Operator) ([]*asset.Asset, *usecasex.PageInfo, error)
	Create(context.Context, CreateAssetParam, *usecase.Operator) (*asset.Asset, error)
	Update(context.Context, id.AssetID, *id.ProjectID, *usecase.Operator) (id.AssetID, *id.ProjectID, error)
	Remove(context.Context, id.AssetID, *usecase.Operator) (id.AssetID, error)
	ImportAssetFiles(context.Context, map[string]*zip.File, *[]byte, *project.Project, *usecase.Operator) (*[]byte, error)
}
