package interactor

import (
	"context"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	cmspb "github.com/reearth/reearth-proto/gen/go/cms/v1"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/rerror"
)

type CMS struct {
	cms gateway.CMS
}

func NewCMS(g *gateway.Container) interfaces.CMS {
	return &CMS{cms: g.CMS}
}

func (i *CMS) FindProjects(ctx context.Context, workspaceID accountsID.WorkspaceID, keyword *string, page interfaces.CMSPageParam, operator *usecase.Operator) (*cmspb.ListProjectsResponse, error) {
	if err := i.authorize(workspaceID, operator); err != nil {
		return nil, err
	}
	return i.cms.ListProjects(ctx, &cmspb.ListProjectsRequest{
		WorkspaceIds: []string{workspaceID.String()},
		Keyword:      keyword,
		PageInfo:     toCMSPageInfo(page),
	}, operator.AcOperator.User)
}

func (i *CMS) FindModels(ctx context.Context, workspaceID accountsID.WorkspaceID, projectID string, page interfaces.CMSPageParam, operator *usecase.Operator) (*cmspb.ListModelsResponse, error) {
	if err := i.authorizeProject(ctx, workspaceID, projectID, operator); err != nil {
		return nil, err
	}
	return i.cms.ListModels(ctx, &cmspb.ListModelsRequest{
		ProjectId: projectID,
		PageInfo:  toCMSPageInfo(page),
	}, operator.AcOperator.User)
}

func (i *CMS) FindAssets(ctx context.Context, workspaceID accountsID.WorkspaceID, projectID string, page interfaces.CMSPageParam, operator *usecase.Operator) (*cmspb.ListAssetsResponse, error) {
	if err := i.authorizeProject(ctx, workspaceID, projectID, operator); err != nil {
		return nil, err
	}
	return i.cms.ListAssets(ctx, &cmspb.ListAssetsRequest{
		ProjectId: projectID,
		PageInfo:  toCMSPageInfo(page),
	}, operator.AcOperator.User)
}

// authorize requires a signed-in operator who can read the workspace. It does
// not use Run*/checkPermission, because those let a nil operator through and
// every call here is made on behalf of the user.
func (i *CMS) authorize(workspaceID accountsID.WorkspaceID, operator *usecase.Operator) error {
	if i.cms == nil {
		return interfaces.ErrCMSNotConfigured
	}
	if operator == nil || operator.AcOperator == nil || operator.AcOperator.User == nil {
		return interfaces.ErrOperationDenied
	}
	if !operator.IsReadableWorkspace(workspaceID) {
		return interfaces.ErrOperationDenied
	}
	return nil
}

// authorizeProject additionally checks that the CMS project belongs to the
// workspace. ListModels and ListAssets take only a project ID, so without this
// a reader of one workspace could browse any CMS project by guessing its ID.
func (i *CMS) authorizeProject(ctx context.Context, workspaceID accountsID.WorkspaceID, projectID string, operator *usecase.Operator) error {
	if err := i.authorize(workspaceID, operator); err != nil {
		return err
	}
	p, err := i.cms.GetProject(ctx, &cmspb.ProjectRequest{
		ProjectIdOrAlias:   projectID,
		WorkspaceIdOrAlias: workspaceID.String(),
	}, operator.AcOperator.User)
	if err != nil {
		return err
	}
	if p.GetWorkspaceId() != workspaceID.String() {
		return rerror.ErrNotFound
	}
	return nil
}

func toCMSPageInfo(p interfaces.CMSPageParam) *cmspb.PageInfo {
	page := 1
	if p.Page != nil && *p.Page > 1 {
		page = *p.Page
	}
	size := interfaces.CMSDefaultPageSize
	if p.PageSize != nil && *p.PageSize > 0 {
		size = min(*p.PageSize, interfaces.CMSMaxPageSize)
	}
	return &cmspb.PageInfo{Page: int32(page), PageSize: int32(size)}
}
