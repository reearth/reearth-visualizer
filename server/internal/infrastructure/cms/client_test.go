package cms

import (
	"context"
	"errors"
	"testing"
	"time"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	cmspb "github.com/reearth/reearth-proto/gen/go/cms/v1"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type fakeCMSClient struct {
	cmspb.ReEarthCMSClient

	md          metadata.MD
	hasDeadline bool

	listProjectsReq *cmspb.ListProjectsRequest
	getProjectReq   *cmspb.ProjectRequest
	listModelsReq   *cmspb.ListModelsRequest
	listAssetsReq   *cmspb.ListAssetsRequest

	listProjectsRes *cmspb.ListProjectsResponse
	getProjectRes   *cmspb.ProjectResponse
	listModelsRes   *cmspb.ListModelsResponse
	listAssetsRes   *cmspb.ListAssetsResponse
	err             error
}

func (f *fakeCMSClient) record(ctx context.Context) {
	f.md, _ = metadata.FromOutgoingContext(ctx)
	_, f.hasDeadline = ctx.Deadline()
}

func (f *fakeCMSClient) ListProjects(ctx context.Context, in *cmspb.ListProjectsRequest, _ ...grpc.CallOption) (*cmspb.ListProjectsResponse, error) {
	f.record(ctx)
	f.listProjectsReq = in
	return f.listProjectsRes, f.err
}

func (f *fakeCMSClient) GetProject(ctx context.Context, in *cmspb.ProjectRequest, _ ...grpc.CallOption) (*cmspb.ProjectResponse, error) {
	f.record(ctx)
	f.getProjectReq = in
	return f.getProjectRes, f.err
}

func (f *fakeCMSClient) ListModels(ctx context.Context, in *cmspb.ListModelsRequest, _ ...grpc.CallOption) (*cmspb.ListModelsResponse, error) {
	f.record(ctx)
	f.listModelsReq = in
	return f.listModelsRes, f.err
}

func (f *fakeCMSClient) ListAssets(ctx context.Context, in *cmspb.ListAssetsRequest, _ ...grpc.CallOption) (*cmspb.ListAssetsResponse, error) {
	f.record(ctx)
	f.listAssetsReq = in
	return f.listAssetsRes, f.err
}

func TestClient_ListProjects(t *testing.T) {
	wid := accountsID.NewWorkspaceID()
	uid := accountsID.NewUserID()
	created := time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)
	fake := &fakeCMSClient{
		listProjectsRes: &cmspb.ListProjectsResponse{
			Projects: []*cmspb.Project{
				{Id: "p1", Name: "Public", Alias: "pub", WorkspaceId: wid.String(), Visibility: cmspb.Visibility_PUBLIC, CreatedAt: timestamppb.New(created)},
				{Id: "p2", Name: "Private", WorkspaceId: wid.String(), Visibility: cmspb.Visibility_PRIVATE},
			},
			TotalCount: 12,
		},
	}
	c := newClient(fake, Config{Token: "secret", Timeout: time.Second})

	keyword := "city"
	res, err := c.ListProjects(context.Background(), wid, &keyword, gateway.CMSPage{Page: 2, PageSize: 10}, &uid)
	require.NoError(t, err)

	assert.Equal(t, []string{"Bearer secret"}, fake.md.Get("authorization"))
	assert.Equal(t, []string{uid.String()}, fake.md.Get("user-id"))
	assert.True(t, fake.hasDeadline)

	assert.Equal(t, []string{wid.String()}, fake.listProjectsReq.GetWorkspaceIds())
	assert.Equal(t, "city", fake.listProjectsReq.GetKeyword())
	assert.False(t, fake.listProjectsReq.GetPublicOnly())
	assert.Equal(t, int32(2), fake.listProjectsReq.GetPageInfo().GetPage())
	assert.Equal(t, int32(10), fake.listProjectsReq.GetPageInfo().GetPageSize())

	assert.Equal(t, int64(12), res.TotalCount)
	require.Len(t, res.Projects, 2)
	assert.Equal(t, &gateway.CMSProject{ID: "p1", Name: "Public", Alias: "pub", WorkspaceID: wid.String(), Public: true, CreatedAt: created}, res.Projects[0])
	assert.False(t, res.Projects[1].Public)
}

func TestClient_NoUserID(t *testing.T) {
	fake := &fakeCMSClient{listModelsRes: &cmspb.ListModelsResponse{}}
	c := newClient(fake, Config{Token: "secret"})

	_, err := c.ListModels(context.Background(), "p1", gateway.CMSPage{Page: 1, PageSize: 10}, nil)
	require.NoError(t, err)

	assert.Empty(t, fake.md.Get("user-id"))
	assert.False(t, fake.hasDeadline)
}

func TestClient_GetProject(t *testing.T) {
	wid := accountsID.NewWorkspaceID()

	t.Run("found", func(t *testing.T) {
		fake := &fakeCMSClient{getProjectRes: &cmspb.ProjectResponse{Project: &cmspb.Project{Id: "p1", WorkspaceId: wid.String()}}}
		c := newClient(fake, Config{})

		p, err := c.GetProject(context.Background(), wid, "p1", nil)
		require.NoError(t, err)
		assert.Equal(t, "p1", p.ID)
		assert.Equal(t, "p1", fake.getProjectReq.GetProjectIdOrAlias())
		assert.Equal(t, wid.String(), fake.getProjectReq.GetWorkspaceIdOrAlias())
	})

	t.Run("empty response", func(t *testing.T) {
		c := newClient(&fakeCMSClient{getProjectRes: &cmspb.ProjectResponse{}}, Config{})

		_, err := c.GetProject(context.Background(), wid, "p1", nil)
		assert.ErrorIs(t, err, rerror.ErrNotFound)
	})
}

func TestClient_ListModels(t *testing.T) {
	fake := &fakeCMSClient{
		listModelsRes: &cmspb.ListModelsResponse{
			Models: []*cmspb.Model{
				{Id: "m1", ProjectId: "p1", Name: "Buildings", Key: "buildings", PublicApiEp: "https://cms.example/api/p/m", EditorUrl: "https://cms.example/edit"},
			},
			TotalCount: 1,
		},
	}
	c := newClient(fake, Config{})

	res, err := c.ListModels(context.Background(), "p1", gateway.CMSPage{Page: 1, PageSize: 50}, nil)
	require.NoError(t, err)

	assert.Equal(t, "p1", fake.listModelsReq.GetProjectId())
	assert.Equal(t, int32(50), fake.listModelsReq.GetPageInfo().GetPageSize())
	require.Len(t, res.Models, 1)
	assert.Equal(t, "https://cms.example/api/p/m", res.Models[0].PublicAPIEndpoint)
	assert.Equal(t, "https://cms.example/edit", res.Models[0].EditorURL)
	assert.Equal(t, "buildings", res.Models[0].Key)
}

func TestClient_ListAssets(t *testing.T) {
	preview := "geo"
	fake := &fakeCMSClient{
		listAssetsRes: &cmspb.ListAssetsResponse{
			Assets: []*cmspb.Asset{
				{Id: "a1", ProjectId: "p1", Filename: "roads.geojson", Size: 42, PreviewType: &preview, Url: "https://cms.example/assets/roads.geojson", Public: true},
			},
			TotalCount: 1,
		},
	}
	c := newClient(fake, Config{})

	res, err := c.ListAssets(context.Background(), "p1", gateway.CMSPage{Page: 1, PageSize: 50}, nil)
	require.NoError(t, err)

	assert.Equal(t, "p1", fake.listAssetsReq.GetProjectId())
	require.Len(t, res.Assets, 1)
	assert.Equal(t, &gateway.CMSAsset{
		ID: "a1", ProjectID: "p1", Filename: "roads.geojson", Size: 42, PreviewType: "geo",
		URL: "https://cms.example/assets/roads.geojson", Public: true,
	}, res.Assets[0])
}

func TestClient_ErrorMapping(t *testing.T) {
	t.Run("not found", func(t *testing.T) {
		c := newClient(&fakeCMSClient{err: status.Error(codes.NotFound, "nope")}, Config{})

		_, err := c.ListAssets(context.Background(), "p1", gateway.CMSPage{Page: 1, PageSize: 1}, nil)
		assert.ErrorIs(t, err, rerror.ErrNotFound)
	})

	t.Run("other errors are internal and keep the cause", func(t *testing.T) {
		cause := status.Error(codes.Unavailable, "connection refused")
		c := newClient(&fakeCMSClient{err: cause}, Config{})

		_, err := c.ListAssets(context.Background(), "p1", gateway.CMSPage{Page: 1, PageSize: 1}, nil)
		require.Error(t, err)
		assert.NotErrorIs(t, err, rerror.ErrNotFound)
		assert.True(t, rerror.IsInternal(err))
		assert.ErrorIs(t, err, cause)
	})
}

func TestIsNotFound(t *testing.T) {
	tests := []struct {
		name string
		err  error
		want bool
	}{
		{"codes.NotFound", status.Error(codes.NotFound, "project not found"), true},
		{"reearthx not found over codes.Unknown", status.Error(codes.Unknown, "not found"), true},
		{"codes.Unknown with a longer message", status.Error(codes.Unknown, "item not found in cache"), false},
		{"same message under another code", status.Error(codes.Internal, "not found"), false},
		{"not a status error", errors.New("not found"), false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, isNotFound(tt.err))
		})
	}
}
