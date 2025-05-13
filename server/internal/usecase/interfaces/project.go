package interfaces

import (
	"archive/zip"
	"context"
	"errors"
	"net/url"

	"github.com/reearth/reearth/server/internal/app/i18n/message/errmsg"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/pkg/i18n/message"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/project"
	"github.com/reearth/reearth/server/pkg/verror"
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
	CoreSupport *bool
	Visibility  *string
}

type UpdateProjectParam struct {
	ID             id.ProjectID
	Name           *string
	Description    *string
	Archived       *bool
	ImageURL       *url.URL
	DeleteImageURL bool
	SceneID        *id.SceneID
	Starred        *bool
	Deleted        *bool
	Visibility     *string

	// publishment
	PublicTitle       *string
	PublicDescription *string
	PublicImage       *string
	PublicNoIndex     *bool
	DeletePublicImage bool
	IsBasicAuthActive *bool
	BasicAuthUsername *string
	BasicAuthPassword *string
	EnableGa          *bool
	TrackingID        *string
}

type PublishProjectParam struct {
	ID     id.ProjectID
	Alias  *string
	Status project.PublishmentStatus
}

var (
	ErrProjectAliasIsNotSet    error = errors.New("project alias is not set")
	ErrProjectAliasAlreadyUsed       = verror.NewVError(
		errmsg.ErrKeyUsecaseInterfaceProjectAliasAlreadyUsed,
		errmsg.ErrorMessages[errmsg.ErrKeyUsecaseInterfaceProjectAliasAlreadyUsed],
		message.MultiLocaleTemplateData(map[string]any{}),
		nil,
	)
)

type Project interface {
	Fetch(context.Context, []id.ProjectID, *usecase.Operator) ([]*project.Project, error)
	FindByWorkspace(context.Context, accountdomain.WorkspaceID, *string, *project.SortType, *usecasex.Pagination, *usecase.Operator) ([]*project.Project, *usecasex.PageInfo, error)
	FindStarredByWorkspace(context.Context, accountdomain.WorkspaceID, *usecase.Operator) ([]*project.Project, error)
	FindDeletedByWorkspace(context.Context, accountdomain.WorkspaceID, *usecase.Operator) ([]*project.Project, error)

	FindActiveById(context.Context, id.ProjectID, *usecase.Operator) (*project.Project, error)
	FindVisibilityByWorkspace(context.Context, accountdomain.WorkspaceID, bool, *usecase.Operator) ([]*project.Project, error)

	Create(context.Context, CreateProjectParam, *usecase.Operator) (*project.Project, error)
	Update(context.Context, UpdateProjectParam, *usecase.Operator) (*project.Project, error)
	Delete(context.Context, id.ProjectID, *usecase.Operator) error

	Publish(context.Context, PublishProjectParam, *usecase.Operator) (*project.Project, error)
	CheckAlias(context.Context, string, *id.ProjectID) (bool, error)

	ExportProjectData(context.Context, id.ProjectID, *zip.Writer, *usecase.Operator) (*project.Project, error)
	ImportProjectData(context.Context, string, *[]byte, *usecase.Operator) (*project.Project, error)
	UploadExportProjectZip(context.Context, *zip.Writer, afero.File, map[string]any, *project.Project) error
}
