package cms

import (
	"context"
	"errors"
	"testing"
	"time"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	cmspb "github.com/reearth/reearth-proto/gen/go/cms/v1"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
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

func TestClient_PassesRequestThrough(t *testing.T) {
	wid := accountsID.NewWorkspaceID()
	uid := accountsID.NewUserID()
	want := &cmspb.ListProjectsResponse{
		Projects:   []*cmspb.Project{{Id: "p1", WorkspaceId: wid.String()}},
		TotalCount: 12,
	}
	fake := &fakeCMSClient{listProjectsRes: want}
	c := newClient(fake, Config{Token: "secret", Timeout: time.Second})

	req := &cmspb.ListProjectsRequest{WorkspaceIds: []string{wid.String()}, PageInfo: &cmspb.PageInfo{Page: 2, PageSize: 10}}
	res, err := c.ListProjects(context.Background(), req, &uid)
	require.NoError(t, err)

	assert.Equal(t, []string{"Bearer secret"}, fake.md.Get("authorization"))
	assert.Equal(t, []string{uid.String()}, fake.md.Get("user-id"))
	assert.True(t, fake.hasDeadline)
	assert.Same(t, req, fake.listProjectsReq)
	assert.Same(t, want, res)
}

func TestClient_NoUserID(t *testing.T) {
	fake := &fakeCMSClient{listModelsRes: &cmspb.ListModelsResponse{}}
	c := newClient(fake, Config{Token: "secret"})

	_, err := c.ListModels(context.Background(), &cmspb.ListModelsRequest{ProjectId: "p1"}, nil)
	require.NoError(t, err)

	assert.Empty(t, fake.md.Get("user-id"))
	assert.False(t, fake.hasDeadline)
}

func TestClient_GetProject(t *testing.T) {
	wid := accountsID.NewWorkspaceID()
	req := &cmspb.ProjectRequest{ProjectIdOrAlias: "p1", WorkspaceIdOrAlias: wid.String()}

	t.Run("found", func(t *testing.T) {
		fake := &fakeCMSClient{getProjectRes: &cmspb.ProjectResponse{Project: &cmspb.Project{Id: "p1", WorkspaceId: wid.String()}}}
		c := newClient(fake, Config{})

		p, err := c.GetProject(context.Background(), req, nil)
		require.NoError(t, err)
		assert.Equal(t, "p1", p.GetId())
		assert.Same(t, req, fake.getProjectReq)
	})

	t.Run("empty response", func(t *testing.T) {
		c := newClient(&fakeCMSClient{getProjectRes: &cmspb.ProjectResponse{}}, Config{})

		_, err := c.GetProject(context.Background(), req, nil)
		assert.ErrorIs(t, err, rerror.ErrNotFound)
	})
}

func TestClient_ErrorMapping(t *testing.T) {
	req := &cmspb.ListAssetsRequest{ProjectId: "p1"}

	t.Run("not found", func(t *testing.T) {
		c := newClient(&fakeCMSClient{err: status.Error(codes.NotFound, "nope")}, Config{})

		_, err := c.ListAssets(context.Background(), req, nil)
		assert.ErrorIs(t, err, rerror.ErrNotFound)
	})

	t.Run("other errors are internal and keep the cause", func(t *testing.T) {
		cause := status.Error(codes.Unavailable, "connection refused")
		c := newClient(&fakeCMSClient{err: cause}, Config{})

		_, err := c.ListAssets(context.Background(), req, nil)
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
