package e2e

import (
	"context"
	"net"
	"net/http"
	"sync"
	"testing"
	"time"

	"github.com/gavv/httpexpect/v2"
	cmspb "github.com/reearth/reearth-proto/gen/go/cms/v1"
	"github.com/reearth/reearth/server/internal/app"
	"github.com/reearth/reearth/server/internal/app/otel"
	"github.com/reearth/reearth/server/internal/infrastructure/cms"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

const cmsTestToken = "cms-test-token"

var cmsTestTime = time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)

// fakeCMSServer is a real gRPC server standing in for the CMS internal API, so
// the test covers the wire: metadata, status codes and proto conversion.
type fakeCMSServer struct {
	cmspb.UnimplementedReEarthCMSServer

	// projects by ID; the workspace each belongs to is on the project
	projects map[string]*cmspb.Project
	// failWith makes every call return this error
	failWith error

	mu       sync.Mutex
	calls    []string
	md       []metadata.MD
	lastPage *cmspb.PageInfo
}

func (s *fakeCMSServer) record(ctx context.Context, method string, page *cmspb.PageInfo) {
	md, _ := metadata.FromIncomingContext(ctx)
	s.mu.Lock()
	defer s.mu.Unlock()
	s.calls = append(s.calls, method)
	s.md = append(s.md, md)
	if page != nil {
		s.lastPage = page
	}
}

func (s *fakeCMSServer) ListProjects(ctx context.Context, in *cmspb.ListProjectsRequest) (*cmspb.ListProjectsResponse, error) {
	s.record(ctx, "ListProjects", in.GetPageInfo())
	if s.failWith != nil {
		return nil, s.failWith
	}
	var res []*cmspb.Project
	for _, p := range s.projects {
		for _, w := range in.GetWorkspaceIds() {
			if p.GetWorkspaceId() == w {
				res = append(res, p)
			}
		}
	}
	return &cmspb.ListProjectsResponse{Projects: res, TotalCount: int64(len(res))}, nil
}

// GetProject mimics reearth-cms: an unknown project comes back as
// codes.Unknown "not found", and the workspace argument is not enforced.
func (s *fakeCMSServer) GetProject(ctx context.Context, in *cmspb.ProjectRequest) (*cmspb.ProjectResponse, error) {
	s.record(ctx, "GetProject", nil)
	if s.failWith != nil {
		return nil, s.failWith
	}
	p, ok := s.projects[in.GetProjectIdOrAlias()]
	if !ok {
		return nil, status.Error(codes.Unknown, "not found")
	}
	return &cmspb.ProjectResponse{Project: p}, nil
}

func (s *fakeCMSServer) ListModels(ctx context.Context, in *cmspb.ListModelsRequest) (*cmspb.ListModelsResponse, error) {
	s.record(ctx, "ListModels", in.GetPageInfo())
	return &cmspb.ListModelsResponse{
		Models: []*cmspb.Model{{
			Id:          "model-1",
			ProjectId:   in.GetProjectId(),
			Name:        "Buildings",
			Description: "building footprints",
			Key:         "buildings",
			PublicApiEp: "https://cms.example.com/api/p/proj/buildings",
			EditorUrl:   "https://cms.example.com/editor/model-1",
			CreatedAt:   timestamppb.New(cmsTestTime),
			UpdatedAt:   timestamppb.New(cmsTestTime),
		}},
		TotalCount: 1,
	}, nil
}

func (s *fakeCMSServer) ListAssets(ctx context.Context, in *cmspb.ListAssetsRequest) (*cmspb.ListAssetsResponse, error) {
	s.record(ctx, "ListAssets", in.GetPageInfo())
	preview := "GEO"
	return &cmspb.ListAssetsResponse{
		Assets: []*cmspb.Asset{{
			Id:          "asset-1",
			ProjectId:   in.GetProjectId(),
			Filename:    "data.geojson",
			Size:        1234,
			PreviewType: &preview,
			Url:         "https://cms.example.com/assets/data.geojson",
			Public:      true,
			CreatedAt:   timestamppb.New(cmsTestTime),
		}},
		TotalCount: 1,
	}, nil
}

func (s *fakeCMSServer) callNames() []string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]string(nil), s.calls...)
}

func (s *fakeCMSServer) lastMD() metadata.MD {
	s.mu.Lock()
	defer s.mu.Unlock()
	if len(s.md) == 0 {
		return nil
	}
	return s.md[len(s.md)-1]
}

func startFakeCMS(t *testing.T, s *fakeCMSServer) string {
	t.Helper()
	l, err := net.Listen("tcp", "127.0.0.1:0")
	require.NoError(t, err)
	gs := grpc.NewServer()
	cmspb.RegisterReEarthCMSServer(gs, s)
	go func() { _ = gs.Serve(l) }()
	t.Cleanup(gs.Stop)
	return l.Addr().String()
}

// startServerWithCMS starts the Visualizer GraphQL server with the CMS gateway
// pointed at endpoint, built the same way app/repo.go builds it. An empty
// endpoint leaves the gateway unset, as an unconfigured deployment does.
func startServerWithCMS(t *testing.T, endpoint string) *httpexpect.Expect {
	t.Helper()
	if testing.Short() {
		t.Skip("skipping test in short mode.")
	}

	repos, _, ctx := initRepos(t, true, baseSeeder)
	gateways := initGateway()
	if endpoint != "" {
		c, err := cms.New(cms.Config{Endpoint: endpoint, Token: cmsTestToken, Timeout: 5 * time.Second})
		require.NoError(t, err)
		gateways.CMS = c
	}

	srv := app.NewServer(ctx, &app.ServerConfig{
		Config:          disabledAuthConfig,
		Repos:           repos,
		AccountRepos:    repos.AccountRepos(),
		Gateways:        gateways,
		AccountGateways: initAccountGateway(ctx),
		Debug:           true,
		ServiceName:     otel.OtelVisualizerServiceName,
	})

	l, err := net.Listen("tcp", ":0")
	require.NoError(t, err)
	ch := make(chan error, 1)
	go func() {
		if err := srv.Serve(l); err != http.ErrServerClosed {
			ch <- err
		}
		close(ch)
	}()
	t.Cleanup(func() {
		assert.NoError(t, srv.Shutdown(context.Background()))
		assert.NoError(t, <-ch)
	})

	return httpexpect.Default(t, "http://"+l.Addr().String())
}

const (
	cmsProjectsQuery = `query($workspaceId: ID!, $keyword: String, $page: Int, $pageSize: Int) {
  cmsProjects(workspaceId: $workspaceId, keyword: $keyword, page: $page, pageSize: $pageSize) {
    totalCount
    nodes { id name alias description workspaceId public createdAt updatedAt }
  }
}`
	cmsModelsQuery = `query($workspaceId: ID!, $projectId: ID!) {
  cmsModels(workspaceId: $workspaceId, projectId: $projectId) {
    totalCount
    nodes { id projectId name description key publicApiEp editorUrl createdAt updatedAt }
  }
}`
	cmsAssetsQuery = `query($workspaceId: ID!, $projectId: ID!) {
  cmsAssets(workspaceId: $workspaceId, projectId: $projectId) {
    totalCount
    nodes { id projectId filename size previewType url archiveExtractionStatus public createdAt }
  }
}`
)

func newFakeCMS() *fakeCMSServer {
	return &fakeCMSServer{
		projects: map[string]*cmspb.Project{
			"proj-own": {
				Id:          "proj-own",
				Name:        "Own Project",
				Alias:       "own",
				Description: lo.ToPtr("in the operator's workspace"),
				WorkspaceId: wID.String(),
				Visibility:  cmspb.Visibility_PUBLIC,
				CreatedAt:   timestamppb.New(cmsTestTime),
				UpdatedAt:   timestamppb.New(cmsTestTime),
			},
			"proj-other": {
				Id:          "proj-other",
				Name:        "Other Project",
				Alias:       "other",
				WorkspaceId: wID2.String(),
				Visibility:  cmspb.Visibility_PRIVATE,
			},
		},
	}
}

func cmsRequest(e *httpexpect.Expect, user, query string, vars map[string]any) *httpexpect.Object {
	return Request(e, user, GraphQLRequest{Query: query, Variables: vars}).Object()
}

// go test -v -run TestCMSIntegration ./e2e/...

func TestCMSIntegration(t *testing.T) {
	fake := newFakeCMS()
	e := startServerWithCMS(t, startFakeCMS(t, fake))

	t.Run("projects: owner lists the workspace's projects", func(t *testing.T) {
		res := cmsRequest(e, uID.String(), cmsProjectsQuery, map[string]any{"workspaceId": wID.String()})
		res.NotContainsKey("errors")
		conn := res.Path("$.data.cmsProjects").Object()
		conn.HasValue("totalCount", 1)
		nodes := conn.Value("nodes").Array()
		nodes.Length().IsEqual(1)
		p := nodes.Value(0).Object()
		p.HasValue("id", "proj-own")
		p.HasValue("name", "Own Project")
		p.HasValue("alias", "own")
		p.HasValue("workspaceId", wID.String())
		p.HasValue("public", true)
		p.HasValue("createdAt", cmsTestTime.Format(time.RFC3339))

		md := fake.lastMD()
		assert.Equal(t, []string{"Bearer " + cmsTestToken}, md.Get("authorization"))
		assert.Equal(t, []string{uID.String()}, md.Get("user-id"))
		assert.Equal(t, int32(1), fake.lastPage.GetPage())
		assert.Equal(t, int32(50), fake.lastPage.GetPageSize())
	})

	t.Run("projects: page size is capped", func(t *testing.T) {
		res := cmsRequest(e, uID.String(), cmsProjectsQuery, map[string]any{"workspaceId": wID.String(), "page": 2, "pageSize": 500})
		res.NotContainsKey("errors")
		assert.Equal(t, int32(2), fake.lastPage.GetPage())
		assert.Equal(t, int32(100), fake.lastPage.GetPageSize())
	})

	t.Run("projects: a reader of the workspace can browse", func(t *testing.T) {
		res := cmsRequest(e, uID3.String(), cmsProjectsQuery, map[string]any{"workspaceId": wID.String()})
		res.NotContainsKey("errors")
		res.Path("$.data.cmsProjects.totalCount").IsEqual(1)
		assert.Equal(t, []string{uID3.String()}, fake.lastMD().Get("user-id"))
	})

	t.Run("projects: a non-member is denied without calling CMS", func(t *testing.T) {
		before := len(fake.callNames())
		res := cmsRequest(e, uID2.String(), cmsProjectsQuery, map[string]any{"workspaceId": wID.String()})
		res.Value("errors").Array().NotEmpty()
		assert.Len(t, fake.callNames(), before)
	})

	t.Run("models: project in the workspace", func(t *testing.T) {
		res := cmsRequest(e, uID.String(), cmsModelsQuery, map[string]any{"workspaceId": wID.String(), "projectId": "proj-own"})
		res.NotContainsKey("errors")
		m := res.Path("$.data.cmsModels.nodes[0]").Object()
		m.HasValue("id", "model-1")
		m.HasValue("projectId", "proj-own")
		m.HasValue("key", "buildings")
		m.HasValue("publicApiEp", "https://cms.example.com/api/p/proj/buildings")
		m.HasValue("editorUrl", "https://cms.example.com/editor/model-1")
		calls := fake.callNames()
		assert.Equal(t, []string{"GetProject", "ListModels"}, calls[len(calls)-2:])
	})

	t.Run("assets: project in the workspace", func(t *testing.T) {
		res := cmsRequest(e, uID.String(), cmsAssetsQuery, map[string]any{"workspaceId": wID.String(), "projectId": "proj-own"})
		res.NotContainsKey("errors")
		a := res.Path("$.data.cmsAssets.nodes[0]").Object()
		a.HasValue("id", "asset-1")
		a.HasValue("filename", "data.geojson")
		a.HasValue("size", 1234)
		a.HasValue("previewType", "GEO")
		a.HasValue("public", true)
		a.Value("archiveExtractionStatus").IsNull()
	})

	t.Run("models/assets: project of another workspace is not found", func(t *testing.T) {
		for _, q := range []string{cmsModelsQuery, cmsAssetsQuery} {
			before := len(fake.callNames())
			res := cmsRequest(e, uID.String(), q, map[string]any{"workspaceId": wID.String(), "projectId": "proj-other"})
			res.Value("errors").Array().Value(0).Object().Value("message").String().Contains("not found")
			assert.Equal(t, []string{"GetProject"}, fake.callNames()[before:], "must not list a foreign project")
		}
	})

	t.Run("models: unknown project is not found", func(t *testing.T) {
		res := cmsRequest(e, uID.String(), cmsModelsQuery, map[string]any{"workspaceId": wID.String(), "projectId": "nope"})
		res.Value("errors").Array().Value(0).Object().Value("message").String().Contains("not found")
	})
}

func TestCMSIntegration_CMSFailureIsNotLeaked(t *testing.T) {
	fake := newFakeCMS()
	fake.failWith = status.Error(codes.Internal, "mongo: secret-connection-detail")
	e := startServerWithCMS(t, startFakeCMS(t, fake))

	res := cmsRequest(e, uID.String(), cmsProjectsQuery, map[string]any{"workspaceId": wID.String()})
	msg := res.Value("errors").Array().Value(0).Object().Value("message").String()
	msg.NotContains("secret-connection-detail")
	msg.NotContains("not found")
}

func TestCMSIntegration_Unreachable(t *testing.T) {
	// Grab a free port and close it, so nothing is listening there.
	l, err := net.Listen("tcp", "127.0.0.1:0")
	require.NoError(t, err)
	addr := l.Addr().String()
	require.NoError(t, l.Close())

	e := startServerWithCMS(t, addr)
	res := cmsRequest(e, uID.String(), cmsProjectsQuery, map[string]any{"workspaceId": wID.String()})
	res.Value("errors").Array().NotEmpty()
	res.Value("data").IsNull()
}

func TestCMSIntegration_NotConfigured(t *testing.T) {
	e := startServerWithCMS(t, "")
	res := cmsRequest(e, uID.String(), cmsProjectsQuery, map[string]any{"workspaceId": wID.String()})
	res.Value("errors").Array().Value(0).Object().Value("message").String().Contains("cms integration is not configured")
}
