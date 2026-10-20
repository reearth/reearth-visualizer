package interactor

import (
	"context"
	"testing"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	accountsWorkspace "github.com/reearth/reearth-accounts/server/pkg/workspace"
	"github.com/reearth/reearth/server/internal/usecase"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearth/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type fakeCMSGateway struct {
	projects map[string]*gateway.CMSProject

	calls      []string
	lastPage   gateway.CMSPage
	lastUserID *accountsID.UserID
}

func (f *fakeCMSGateway) ListProjects(_ context.Context, _ accountsID.WorkspaceID, _ *string, page gateway.CMSPage, userID *accountsID.UserID) (*gateway.CMSProjectList, error) {
	f.calls = append(f.calls, "ListProjects")
	f.lastPage, f.lastUserID = page, userID
	return &gateway.CMSProjectList{TotalCount: 3}, nil
}

func (f *fakeCMSGateway) GetProject(_ context.Context, _ accountsID.WorkspaceID, projectID string, userID *accountsID.UserID) (*gateway.CMSProject, error) {
	f.calls = append(f.calls, "GetProject")
	f.lastUserID = userID
	p, ok := f.projects[projectID]
	if !ok {
		return nil, rerror.ErrNotFound
	}
	return p, nil
}

func (f *fakeCMSGateway) ListModels(_ context.Context, _ string, page gateway.CMSPage, userID *accountsID.UserID) (*gateway.CMSModelList, error) {
	f.calls = append(f.calls, "ListModels")
	f.lastPage, f.lastUserID = page, userID
	return &gateway.CMSModelList{TotalCount: 1}, nil
}

func (f *fakeCMSGateway) ListAssets(_ context.Context, _ string, page gateway.CMSPage, userID *accountsID.UserID) (*gateway.CMSAssetList, error) {
	f.calls = append(f.calls, "ListAssets")
	f.lastPage, f.lastUserID = page, userID
	return &gateway.CMSAssetList{TotalCount: 2}, nil
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
		res, err := NewCMS(&gateway.Container{CMS: g}).FindProjects(ctx, ws, nil, interfaces.CMSPageParam{}, op)
		require.NoError(t, err)

		assert.Equal(t, int64(3), res.TotalCount)
		assert.Equal(t, &uid, g.lastUserID)
		assert.Equal(t, gateway.CMSPage{Page: 1, PageSize: interfaces.CMSDefaultPageSize}, g.lastPage)
	})

	t.Run("caps the page size", func(t *testing.T) {
		g := &fakeCMSGateway{}
		_, err := NewCMS(&gateway.Container{CMS: g}).FindProjects(ctx, ws, nil, interfaces.CMSPageParam{Page: lo.ToPtr(3), PageSize: lo.ToPtr(1000)}, op)
		require.NoError(t, err)

		assert.Equal(t, gateway.CMSPage{Page: 3, PageSize: interfaces.CMSMaxPageSize}, g.lastPage)
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
		return &fakeCMSGateway{projects: map[string]*gateway.CMSProject{
			"own":   {ID: "own", WorkspaceID: ws.String()},
			"other": {ID: "other", WorkspaceID: accountsID.NewWorkspaceID().String()},
		}}
	}

	find := map[string]func(uc interfaces.CMS, projectID string) (int64, error){
		"models": func(uc interfaces.CMS, projectID string) (int64, error) {
			res, err := uc.FindModels(ctx, ws, projectID, interfaces.CMSPageParam{}, op)
			if err != nil {
				return 0, err
			}
			return res.TotalCount, nil
		},
		"assets": func(uc interfaces.CMS, projectID string) (int64, error) {
			res, err := uc.FindAssets(ctx, ws, projectID, interfaces.CMSPageParam{}, op)
			if err != nil {
				return 0, err
			}
			return res.TotalCount, nil
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
