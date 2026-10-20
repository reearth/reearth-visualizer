package cms

import (
	"context"
	"crypto/tls"
	"fmt"
	"time"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	cmspb "github.com/reearth/reearth-proto/gen/go/cms/v1"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearthx/rerror"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/keepalive"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type Config struct {
	Endpoint string
	Token    string
	UseTLS   bool
	Timeout  time.Duration
}

type Client struct {
	client  cmspb.ReEarthCMSClient
	token   string
	timeout time.Duration
}

var _ gateway.CMS = (*Client)(nil)

func New(cfg Config) (*Client, error) {
	creds := insecure.NewCredentials()
	if cfg.UseTLS {
		creds = credentials.NewTLS(&tls.Config{MinVersion: tls.VersionTLS12})
	}

	conn, err := grpc.NewClient(
		cfg.Endpoint,
		grpc.WithTransportCredentials(creds),
		// Time must not be below the CMS server's keepalive EnforcementPolicy.MinTime
		// (gRPC-Go default 5m), or CMS answers the pings with GOAWAY and the
		// connection churns.
		grpc.WithKeepaliveParams(keepalive.ClientParameters{
			Time:                5 * time.Minute,
			Timeout:             20 * time.Second,
			PermitWithoutStream: true,
		}),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create CMS gRPC client: %w", err)
	}

	return newClient(cmspb.NewReEarthCMSClient(conn), cfg), nil
}

func newClient(c cmspb.ReEarthCMSClient, cfg Config) *Client {
	return &Client{
		client:  c,
		token:   cfg.Token,
		timeout: cfg.Timeout,
	}
}

func (c *Client) ListProjects(ctx context.Context, workspaceID accountsID.WorkspaceID, keyword *string, page gateway.CMSPage, userID *accountsID.UserID) (*gateway.CMSProjectList, error) {
	ctx, cancel := c.callContext(ctx, userID)
	defer cancel()

	res, err := c.client.ListProjects(ctx, &cmspb.ListProjectsRequest{
		WorkspaceIds: []string{workspaceID.String()},
		Keyword:      keyword,
		PageInfo:     toPageInfo(page),
	})
	if err != nil {
		return nil, mapError(ctx, "list projects", err)
	}

	projects := make([]*gateway.CMSProject, 0, len(res.GetProjects()))
	for _, p := range res.GetProjects() {
		projects = append(projects, toProject(p))
	}
	return &gateway.CMSProjectList{Projects: projects, TotalCount: res.GetTotalCount()}, nil
}

func (c *Client) GetProject(ctx context.Context, workspaceID accountsID.WorkspaceID, projectID string, userID *accountsID.UserID) (*gateway.CMSProject, error) {
	ctx, cancel := c.callContext(ctx, userID)
	defer cancel()

	res, err := c.client.GetProject(ctx, &cmspb.ProjectRequest{
		ProjectIdOrAlias:   projectID,
		WorkspaceIdOrAlias: workspaceID.String(),
	})
	if err != nil {
		return nil, mapError(ctx, "get project", err)
	}
	if res.GetProject() == nil {
		return nil, rerror.ErrNotFound
	}
	return toProject(res.GetProject()), nil
}

func (c *Client) ListModels(ctx context.Context, projectID string, page gateway.CMSPage, userID *accountsID.UserID) (*gateway.CMSModelList, error) {
	ctx, cancel := c.callContext(ctx, userID)
	defer cancel()

	res, err := c.client.ListModels(ctx, &cmspb.ListModelsRequest{
		ProjectId: projectID,
		PageInfo:  toPageInfo(page),
	})
	if err != nil {
		return nil, mapError(ctx, "list models", err)
	}

	models := make([]*gateway.CMSModel, 0, len(res.GetModels()))
	for _, m := range res.GetModels() {
		models = append(models, toModel(m))
	}
	return &gateway.CMSModelList{Models: models, TotalCount: res.GetTotalCount()}, nil
}

func (c *Client) ListAssets(ctx context.Context, projectID string, page gateway.CMSPage, userID *accountsID.UserID) (*gateway.CMSAssetList, error) {
	ctx, cancel := c.callContext(ctx, userID)
	defer cancel()

	res, err := c.client.ListAssets(ctx, &cmspb.ListAssetsRequest{
		ProjectId: projectID,
		PageInfo:  toPageInfo(page),
	})
	if err != nil {
		return nil, mapError(ctx, "list assets", err)
	}

	assets := make([]*gateway.CMSAsset, 0, len(res.GetAssets()))
	for _, a := range res.GetAssets() {
		assets = append(assets, toAsset(a))
	}
	return &gateway.CMSAssetList{Assets: assets, TotalCount: res.GetTotalCount()}, nil
}

// callContext attaches the service token and the acting user, and bounds the
// call so a stuck CMS cannot hold a GraphQL request open indefinitely.
func (c *Client) callContext(ctx context.Context, userID *accountsID.UserID) (context.Context, context.CancelFunc) {
	md := metadata.Pairs("authorization", "Bearer "+c.token)
	if userID != nil {
		md.Append("user-id", userID.String())
	}
	ctx = metadata.NewOutgoingContext(ctx, md)

	if c.timeout <= 0 {
		return ctx, func() {}
	}
	if deadline, ok := ctx.Deadline(); ok && time.Until(deadline) <= c.timeout {
		return ctx, func() {}
	}
	return context.WithTimeout(ctx, c.timeout)
}

// mapError turns a CMS gRPC error into a reearthx error. Anything other than
// not-found is wrapped as internal so the CMS error text is logged but never
// reaches the GraphQL response.
func mapError(ctx context.Context, op string, err error) error {
	if isNotFound(err) {
		return rerror.ErrNotFound
	}
	return rerror.ErrInternalByWithContext(ctx, fmt.Errorf("cms: failed to %s: %w", op, err))
}

// isNotFound accepts both codes.NotFound and codes.Unknown with the exact
// message "not found": reearth-cms returns reearthx rerror.ErrNotFound without
// translating it to a gRPC status code. The message match is exact and scoped
// to codes.Unknown so that unrelated failures are not reported as not-found.
// TestIsNotFound pins both shapes.
func isNotFound(err error) bool {
	st, ok := status.FromError(err)
	if !ok {
		return false
	}
	return st.Code() == codes.NotFound || (st.Code() == codes.Unknown && st.Message() == "not found")
}

func toPageInfo(p gateway.CMSPage) *cmspb.PageInfo {
	return &cmspb.PageInfo{
		Page:     int32(p.Page),
		PageSize: int32(p.PageSize),
	}
}

func toProject(p *cmspb.Project) *gateway.CMSProject {
	return &gateway.CMSProject{
		ID:          p.GetId(),
		Name:        p.GetName(),
		Alias:       p.GetAlias(),
		Description: p.GetDescription(),
		WorkspaceID: p.GetWorkspaceId(),
		Public:      p.GetVisibility() == cmspb.Visibility_PUBLIC,
		CreatedAt:   toTime(p.GetCreatedAt()),
		UpdatedAt:   toTime(p.GetUpdatedAt()),
	}
}

func toModel(m *cmspb.Model) *gateway.CMSModel {
	return &gateway.CMSModel{
		ID:                m.GetId(),
		ProjectID:         m.GetProjectId(),
		Name:              m.GetName(),
		Description:       m.GetDescription(),
		Key:               m.GetKey(),
		PublicAPIEndpoint: m.GetPublicApiEp(),
		EditorURL:         m.GetEditorUrl(),
		CreatedAt:         toTime(m.GetCreatedAt()),
		UpdatedAt:         toTime(m.GetUpdatedAt()),
	}
}

func toAsset(a *cmspb.Asset) *gateway.CMSAsset {
	return &gateway.CMSAsset{
		ID:                      a.GetId(),
		ProjectID:               a.GetProjectId(),
		Filename:                a.GetFilename(),
		Size:                    a.GetSize(),
		PreviewType:             a.GetPreviewType(),
		URL:                     a.GetUrl(),
		ArchiveExtractionStatus: a.GetArchiveExtractionStatus(),
		Public:                  a.GetPublic(),
		CreatedAt:               toTime(a.GetCreatedAt()),
	}
}

func toTime(t *timestamppb.Timestamp) time.Time {
	if t == nil {
		return time.Time{}
	}
	return t.AsTime()
}
