package repo

import (
	"context"
	"time"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
)

type ProjectMetadata interface {
	Filtered(WorkspaceFilter) ProjectMetadata
	FindByProjectID(context.Context, id.ProjectID) (*project.ProjectMetadata, error)
	FindByProjectIDList(context.Context, id.ProjectIDList) ([]*project.ProjectMetadata, error)
	Save(context.Context, *project.ProjectMetadata) error
	Remove(context.Context, id.ProjectID) error
	ClaimImport(ctx context.Context, pid id.ProjectID, staleAfter time.Duration) (claimed bool, err error)
}
