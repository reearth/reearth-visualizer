package interfaces

import (
	"archive/zip"
	"context"
	"errors"
	"net/url"

	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
	"github.com/spf13/afero"
)

type CreateProjectParam struct {
	WorkspaceID accountdomain.WorkspaceID
	Visualizer  visualizer.Visualizer
	Name        *string
	Description *string
	ImageURL    *url.URL
	Alias       *string
	Archived    *bool
	Core        *bool
}

type UpdateProjectParam struct {
	ID                id.ProjectID
	Name              *string
	Description       *string
	Alias             *string
	Archived          *bool
	IsBasicAuthActive *bool
	BasicAuthUsername *string
	BasicAuthPassword *string
	ImageURL          *url.URL
	PublicTitle       *string
	PublicDescription *string
	PublicImage       *string
	PublicNoIndex     *bool
	DeletePublicImage bool
	DeleteImageURL    bool
	EnableGa          *bool
	TrackingID        *string
	SceneID           *id.SceneID
	Starred           *bool
	Deleted           *bool
}

type PublishProjectParam struct {
	ID     id.ProjectID
	Alias  *string
	Status project.PublishmentStatus
}

var (
	ErrProjectAliasIsNotSet    error = errors.New("project alias is not set")
	ErrProjectAliasAlreadyUsed error = errors.New("project alias is already used by another project")
)

type Project interface {
	Fetch(context.Context, []id.ProjectID, *usecase.Operator) ([]*project.Project, error)
	FindByWorkspace(context.Context, accountdomain.WorkspaceID, *string, *project.SortType, *usecasex.Pagination, *usecase.Operator) ([]*project.Project, *usecasex.PageInfo, error)
	FindStarredByWorkspace(context.Context, accountdomain.WorkspaceID, *usecase.Operator) ([]*project.Project, error)
	FindDeletedByWorkspace(context.Context, accountdomain.WorkspaceID, *usecase.Operator) ([]*project.Project, error)
	Create(context.Context, CreateProjectParam, *usecase.Operator) (*project.Project, error)
	Update(context.Context, UpdateProjectParam, *usecase.Operator) (*project.Project, error)
	Publish(context.Context, PublishProjectParam, *usecase.Operator) (*project.Project, error)
	CheckAlias(context.Context, string) (bool, error)
	Delete(context.Context, id.ProjectID, *usecase.Operator) error
	ExportProject(context.Context, id.ProjectID, *zip.Writer, *usecase.Operator) (*project.Project, error)
	ImportProject(context.Context, string, map[string]interface{}) (*project.Project, usecasex.Tx, error)
	UploadExportProjectZip(context.Context, *zip.Writer, afero.File, map[string]interface{}, *project.Project) error
}
