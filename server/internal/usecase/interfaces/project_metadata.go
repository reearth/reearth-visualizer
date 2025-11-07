package interfaces

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
)

type CreateProjectMetadataParam struct {
	ProjectID   id.ProjectID
	WorkspaceID accountdomain.WorkspaceID
	Readme      *string
	License     *string
	Topics      *[]string
	StarCount   *int64
	StarredBy   *[]string
}

type UpdateProjectMetadataParam struct {
	ID        id.ProjectID
	Readme    *string
	License   *string
	Topics    *[]string
	StarCount *int64
	StarredBy *[]string
}

type UpdateProjectMetadataByAnyUserParam struct {
	ID        id.ProjectID
	StarCount *int64
	StarredBy *[]string
}

type ProjectMetadata interface {
	Fetch(context.Context, []id.ProjectID, *usecase.Operator) ([]*project.ProjectMetadata, error)
	FindByProjectID(context.Context, id.ProjectID, *usecase.Operator) (*project.ProjectMetadata, error)
	Update(context.Context, UpdateProjectMetadataParam, *usecase.Operator) (*project.ProjectMetadata, error)
	Create(context.Context, CreateProjectMetadataParam, *usecase.Operator) (*project.ProjectMetadata, error)
	UpdateProjectMetadataByAnyUser(ctx context.Context, p UpdateProjectMetadataByAnyUserParam) (*project.ProjectMetadata, error)
	FindProjectByIDByAnyUser(ctx context.Context, pid id.ProjectID) (*project.ProjectMetadata, error)
}
