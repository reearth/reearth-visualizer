package interfaces

import (
	"context"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
)

type ProjectMetadata interface {
	Fetch(context.Context, []id.ProjectID, *usecase.Operator) ([]*project.ProjectMetadata, error)
	FindByProjectID(context.Context, id.ProjectID, *usecase.Operator) (*project.ProjectMetadata, error)
	Update(context.Context, UpdateProjectMetadataParam, *usecase.Operator) (*project.ProjectMetadata, error)
	Create(context.Context, CreateProjectMetadataParam, *usecase.Operator) (*project.ProjectMetadata, error)
	PatchStarCountForAnyUser(ctx context.Context, p UpdateProjectMetadataParam) (*project.ProjectMetadata, error)
	CreateMetadataByAnyUser(ctx context.Context, p CreateProjectMetadataParam) (*project.ProjectMetadata, error)
	FindByProjectIDAsAnyUsr(ctx context.Context, pid id.ProjectID) (*project.ProjectMetadata, error)
}
