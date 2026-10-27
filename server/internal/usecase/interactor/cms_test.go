package interactor

import (
	"context"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	cmspb "github.com/reearth/reearth-proto/gen/go/cms/v1"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type fakeCMSGateway struct {
	projects map[string]*cmspb.Project

	calls           []string
	listProjectsReq *cmspb.ListProjectsRequest
	getProjectReq   *cmspb.ProjectRequest
	lastPage        *cmspb.PageInfo
	lastUserID      *accountsID.UserID
}

func (f *fakeCMSGateway) ListProjects(_ context.Context, req *cmspb.ListProjectsRequest, userID *accountsID.UserID) (*cmspb.ListProjectsResponse, error) {
	f.calls = append(f.calls, "ListProjects")
	f.listProjectsReq, f.lastPage, f.lastUserID = req, req.GetPageInfo(), userID
	return &cmspb.ListProjectsResponse{TotalCount: 3}, nil
}

func (f *fakeCMSGateway) GetProject(_ context.Context, req *cmspb.ProjectRequest, userID *accountsID.UserID) (*cmspb.Project, error) {
	f.calls = append(f.calls, "GetProject")
	f.getProjectReq, f.lastUserID = req, userID
	p, ok := f.projects[req.GetProjectIdOrAlias()]
	if !ok {
		return nil, rerror.ErrNotFound
	}
	return p, nil
}

func (f *fakeCMSGateway) ListModels(_ context.Context, req *cmspb.ListModelsRequest, userID *accountsID.UserID) (*cmspb.ListModelsResponse, error) {
	f.calls = append(f.calls, "ListModels")
	f.lastPage, f.lastUserID = req.GetPageInfo(), userID
	return &cmspb.ListModelsResponse{TotalCount: 1}, nil
}

func (f *fakeCMSGateway) ListAssets(_ context.Context, req *cmspb.ListAssetsRequest, userID *accountsID.UserID) (*cmspb.ListAssetsResponse, error) {
	f.calls = append(f.calls, "ListAssets")
	f.lastPage, f.lastUserID = req.GetPageInfo(), userID
	return &cmspb.ListAssetsResponse{TotalCount: 2}, nil
}

func cmsReader(ws accountsID.WorkspaceID) (*usecase.Operator, accountsID.UserID) {
	uid := accountsID.NewUserID()
	return &usecase.Operator{
		AcOperator: &accountsWorkspace.Operator{
			User:               &uid,
			ReadableWorkspaces: accountsID.WorkspaceIDList{ws},
		},
	}, uid
}

func TestCMS_FindProjects(t *testing.T) {
	ctx := context.Background()
	ws := accountsID.NewWorkspaceID()
	op, uid := cmsReader(ws)

	t.Run("forwards the operator's user and defaults the page", func(t *testing.T) {
		g := &fakeCMSGateway{}
		keyword := "city"
		res, err := NewCMS(&gateway.Container{CMS: g}).FindProjects(ctx, ws, &keyword, interfaces.CMSPageParam{}, op)
		require.NoError(t, err)

		assert.Equal(t, int64(3), res.GetTotalCount())
		assert.Equal(t, &uid, g.lastUserID)
		assert.Equal(t, []string{ws.String()}, g.listProjectsReq.GetWorkspaceIds())
		assert.Equal(t, "city", g.listProjectsReq.GetKeyword())
		assert.False(t, g.listProjectsReq.GetPublicOnly())
		assert.Equal(t, int32(1), g.lastPage.GetPage())
		assert.Equal(t, int32(interfaces.CMSDefaultPageSize), g.lastPage.GetPageSize())
	})

	t.Run("caps the page size", func(t *testing.T) {
		g := &fakeCMSGateway{}
		_, err := NewCMS(&gateway.Container{CMS: g}).FindProjects(ctx, ws, nil, interfaces.CMSPageParam{Page: lo.ToPtr(3), PageSize: lo.ToPtr(1000)}, op)
		require.NoError(t, err)

		assert.Equal(t, int32(3), g.lastPage.GetPage())
		assert.Equal(t, int32(interfaces.CMSMaxPageSize), g.lastPage.GetPageSize())
	})

	t.Run("not configured", func(t *testing.T) {
		_, err := NewCMS(&gateway.Container{}).FindProjects(ctx, ws, nil, interfaces.CMSPageParam{}, op)
		assert.ErrorIs(t, err, interfaces.ErrCMSNotConfigured)
	})

	t.Run("denies without an operator", func(t *testing.T) {
		g := &fakeCMSGateway{}
		_, err := NewCMS(&gateway.Container{CMS: g}).FindProjects(ctx, ws, nil, interfaces.CMSPageParam{}, nil)
		assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
		assert.Empty(t, g.calls)
	})

	t.Run("denies an operator without a user", func(t *testing.T) {
		g := &fakeCMSGateway{}
		noUser := &usecase.Operator{AcOperator: &accountsWorkspace.Operator{ReadableWorkspaces: accountsID.WorkspaceIDList{ws}}}
		_, err := NewCMS(&gateway.Container{CMS: g}).FindProjects(ctx, ws, nil, interfaces.CMSPageParam{}, noUser)
		assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
		assert.Empty(t, g.calls)
	})

	t.Run("denies a workspace the operator cannot read", func(t *testing.T) {
		g := &fakeCMSGateway{}
		_, err := NewCMS(&gateway.Container{CMS: g}).FindProjects(ctx, accountsID.NewWorkspaceID(), nil, interfaces.CMSPageParam{}, op)
		assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
		assert.Empty(t, g.calls)
	})
}

func TestCMS_FindModelsAndAssets(t *testing.T) {
	ctx := context.Background()
	ws := accountsID.NewWorkspaceID()
	op, uid := cmsReader(ws)
	newGateway := func() *fakeCMSGateway {
		return &fakeCMSGateway{projects: map[string]*cmspb.Project{
			"own":   {Id: "own", WorkspaceId: ws.String()},
			"other": {Id: "other", WorkspaceId: accountsID.NewWorkspaceID().String()},
		}}
	}

	find := map[string]func(uc interfaces.CMS, projectID string) (int64, error){
		"models": func(uc interfaces.CMS, projectID string) (int64, error) {
			res, err := uc.FindModels(ctx, ws, projectID, interfaces.CMSPageParam{}, op)
			if err != nil {
				return 0, err
			}
			return res.GetTotalCount(), nil
		},
		"assets": func(uc interfaces.CMS, projectID string) (int64, error) {
			res, err := uc.FindAssets(ctx, ws, projectID, interfaces.CMSPageParam{}, op)
			if err != nil {
				return 0, err
			}
			return res.GetTotalCount(), nil
		},
	}

	for name, f := range find {
		t.Run(name+": project in the workspace", func(t *testing.T) {
			g := newGateway()
			total, err := f(NewCMS(&gateway.Container{CMS: g}), "own")
			require.NoError(t, err)

			assert.NotZero(t, total)
			assert.Equal(t, "GetProject", g.calls[0])
			assert.Len(t, g.calls, 2)
			assert.Equal(t, ws.String(), g.getProjectReq.GetWorkspaceIdOrAlias())
			assert.Equal(t, &uid, g.lastUserID)
		})

		t.Run(name+": project in another workspace", func(t *testing.T) {
			g := newGateway()
			_, err := f(NewCMS(&gateway.Container{CMS: g}), "other")
			assert.ErrorIs(t, err, rerror.ErrNotFound)
			assert.Equal(t, []string{"GetProject"}, g.calls)
		})

		t.Run(name+": unknown project", func(t *testing.T) {
			g := newGateway()
			_, err := f(NewCMS(&gateway.Container{CMS: g}), "missing")
			assert.ErrorIs(t, err, rerror.ErrNotFound)
			assert.Equal(t, []string{"GetProject"}, g.calls)
		})
	}

	t.Run("denies a workspace the operator cannot read before calling CMS", func(t *testing.T) {
		g := newGateway()
		_, err := NewCMS(&gateway.Container{CMS: g}).FindAssets(ctx, accountsID.NewWorkspaceID(), "own", interfaces.CMSPageParam{}, op)
		assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
		assert.Empty(t, g.calls)
	})
}
