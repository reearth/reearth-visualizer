package gqlmodel

import (
	"testing"
	"time"

	cmspb "github.com/reearth/reearth-proto/gen/go/cms/v1"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func TestToCMSProjectConnection(t *testing.T) {
	created := time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)
	res := ToCMSProjectConnection(&cmspb.ListProjectsResponse{
		Projects: []*cmspb.Project{
			{Id: "p1", Name: "Public", Alias: "pub", WorkspaceId: "w1", Visibility: cmspb.Visibility_PUBLIC, CreatedAt: timestamppb.New(created)},
			{Id: "p2", Name: "Private", WorkspaceId: "w1", Visibility: cmspb.Visibility_PRIVATE},
		},
		TotalCount: 12,
	})

	assert.Equal(t, 12, res.TotalCount)
	require.Len(t, res.Nodes, 2)
	assert.Equal(t, &CMSProject{ID: "p1", Name: "Public", Alias: "pub", WorkspaceID: "w1", Public: true, CreatedAt: created}, res.Nodes[0])
	assert.False(t, res.Nodes[1].Public)
	assert.True(t, res.Nodes[1].CreatedAt.IsZero(), "an unset timestamp must not become the Unix epoch")
}

func TestToCMSModelConnection(t *testing.T) {
	res := ToCMSModelConnection(&cmspb.ListModelsResponse{
		Models: []*cmspb.Model{
			{Id: "m1", ProjectId: "p1", Name: "Buildings", Key: "buildings", PublicApiEp: "https://cms.example/api/p/m", EditorUrl: "https://cms.example/edit"},
		},
		TotalCount: 1,
	})

	assert.Equal(t, 1, res.TotalCount)
	require.Len(t, res.Nodes, 1)
	assert.Equal(t, &CMSModel{
		ID: "m1", ProjectID: "p1", Name: "Buildings", Key: "buildings",
		PublicAPIEp: "https://cms.example/api/p/m", EditorURL: "https://cms.example/edit",
	}, res.Nodes[0])
}

func TestToCMSAssetConnection(t *testing.T) {
	res := ToCMSAssetConnection(&cmspb.ListAssetsResponse{
		Assets: []*cmspb.Asset{
			{Id: "a1", ProjectId: "p1", Filename: "roads.geojson", Size: 42, PreviewType: lo.ToPtr("geo"), Url: "https://cms.example/assets/roads.geojson", Public: true},
		},
		TotalCount: 1,
	})

	require.Len(t, res.Nodes, 1)
	assert.Equal(t, &CMSAsset{
		ID: "a1", ProjectID: "p1", Filename: "roads.geojson", Size: 42, PreviewType: lo.ToPtr("geo"),
		URL: "https://cms.example/assets/roads.geojson", Public: true,
	}, res.Nodes[0])
}

func TestToCMSConnection_Nil(t *testing.T) {
	assert.Equal(t, []*CMSProject{}, ToCMSProjectConnection(nil).Nodes)
	assert.Equal(t, []*CMSModel{}, ToCMSModelConnection(nil).Nodes)
	assert.Equal(t, []*CMSAsset{}, ToCMSAssetConnection(nil).Nodes)
}
