package mongo

import (
	"context"
	"fmt"
	"io"
	"net/url"
	"sync/atomic"
	"testing"
	"time"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/asset"
	pkgfile "github.com/reearth/reearth/server/pkg/file"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
)

func TestFindByID(t *testing.T) {
	tests := []struct {
		Name     string
		Expected struct {
			Name  string
			Asset *asset.Asset
		}
	}{
		{
			Expected: struct {
				Name  string
				Asset *asset.Asset
			}{
				Asset: asset.New().
					NewID().
					CreatedAt(time.Now()).
					Workspace(accountsID.NewWorkspaceID()).
					Name("name").
					Size(10).
					URL("hxxps://https://reearth.io/").
					ContentType("json").
					MustBuild(),
			},
		},
	}

	init := mongotest.Connect(t)

	for _, tc := range tests {
		tc := tc

		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			client := init(t)

			repo := NewAsset(mongox.NewClientWithDatabase(client))
			ctx := context.Background()
			err := repo.Save(ctx, tc.Expected.Asset)
			assert.NoError(t, err)

			got, err := repo.FindByID(ctx, tc.Expected.Asset.ID())
			assert.NoError(t, err)
			assert.Equal(t, tc.Expected.Asset.ID(), got.ID())
			assert.Equal(t, tc.Expected.Asset.CreatedAt(), got.CreatedAt())
			assert.Equal(t, tc.Expected.Asset.Workspace(), got.Workspace())
			assert.Equal(t, tc.Expected.Asset.URL(), got.URL())
			assert.Equal(t, tc.Expected.Asset.Size(), got.Size())
			assert.Equal(t, tc.Expected.Asset.Name(), got.Name())
			assert.Equal(t, tc.Expected.Asset.ContentType(), got.ContentType())
		})
	}
}

func TestAsset_FindByIDs(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()
	ws := accountsID.NewWorkspaceID()

	a1 := asset.New().NewID().Workspace(ws).URL("https://example.com/a1").Size(1).MustBuild()
	a2 := asset.New().NewID().Workspace(ws).URL("https://example.com/a2").Size(1).MustBuild()
	missing := id.NewAssetID()

	r := NewAsset(mongox.NewClientWithDatabase(c))
	require.NoError(t, r.Save(ctx, a1))
	require.NoError(t, r.Save(ctx, a2))

	got, err := r.FindByIDs(ctx, id.AssetIDList{a1.ID(), missing, a2.ID()})
	require.NoError(t, err)
	require.Len(t, got, 3)
	assert.Equal(t, a1.ID(), got[0].ID())
	assert.Nil(t, got[1], "missing id should map to nil in aligned slice")
	assert.Equal(t, a2.ID(), got[2].ID())
}

func TestAsset_Remove(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()
	ws := accountsID.NewWorkspaceID()

	a := asset.New().NewID().Workspace(ws).URL("https://example.com/a").Size(1).MustBuild()
	r := NewAsset(mongox.NewClientWithDatabase(c))
	require.NoError(t, r.Save(ctx, a))

	require.NoError(t, r.Remove(ctx, a.ID()))

	_, err := r.FindByID(ctx, a.ID())
	assert.Error(t, err, "asset should be gone after Remove")
}

// countingFileGateway implements gateway.File and counts RemoveAsset calls.
// Other methods return zero values since RemoveByProjectWithFile only touches
// RemoveAsset.
type countingFileGateway struct {
	removeCount atomic.Int64
}

func (c *countingFileGateway) RemoveAsset(_ context.Context, _ *url.URL) error {
	c.removeCount.Add(1)
	return nil
}
func (c *countingFileGateway) ReadAsset(_ context.Context, _ string) (io.ReadCloser, error) {
	return nil, nil
}
func (c *countingFileGateway) UploadAsset(_ context.Context, _ *pkgfile.File) (*url.URL, int64, error) {
	return nil, 0, nil
}
func (c *countingFileGateway) UploadAssetFromURL(_ context.Context, _ *url.URL) (*url.URL, int64, error) {
	return nil, 0, nil
}
func (c *countingFileGateway) ReadPluginFile(_ context.Context, _ id.PluginID, _ string) (io.ReadCloser, error) {
	return nil, nil
}
func (c *countingFileGateway) UploadPluginFile(_ context.Context, _ id.PluginID, _ *pkgfile.File) error {
	return nil
}
func (c *countingFileGateway) RemovePlugin(_ context.Context, _ id.PluginID) error { return nil }
func (c *countingFileGateway) UploadBuiltScene(_ context.Context, _ io.Reader, _ string) error {
	return nil
}
func (c *countingFileGateway) ReadBuiltSceneFile(_ context.Context, _ string) (io.ReadCloser, error) {
	return nil, nil
}
func (c *countingFileGateway) MoveBuiltScene(_ context.Context, _, _ string) error { return nil }
func (c *countingFileGateway) RemoveBuiltScene(_ context.Context, _ string) error  { return nil }
func (c *countingFileGateway) UploadStory(_ context.Context, _ io.Reader, _ string) error {
	return nil
}
func (c *countingFileGateway) ReadStoryFile(_ context.Context, _ string) (io.ReadCloser, error) {
	return nil, nil
}
func (c *countingFileGateway) MoveStory(_ context.Context, _, _ string) error { return nil }
func (c *countingFileGateway) RemoveStory(_ context.Context, _ string) error  { return nil }
func (c *countingFileGateway) ReadExportProjectZip(_ context.Context, _ string) (io.ReadCloser, error) {
	return nil, nil
}
func (c *countingFileGateway) UploadExportProjectZip(_ context.Context, _ afero.File) error {
	return nil
}
func (c *countingFileGateway) RemoveExportProjectZip(_ context.Context, _ string) error { return nil }
func (c *countingFileGateway) GenerateSignedUploadUrl(_ context.Context, _ string) (*string, int, *string, error) {
	return nil, 0, nil, nil
}
func (c *countingFileGateway) ReadImportProjectZip(_ context.Context, _ string) (io.ReadCloser, error) {
	return nil, nil
}
func (c *countingFileGateway) RemoveImportProjectZip(_ context.Context, _ string) error { return nil }

func TestAsset_RemoveByProjectWithFile(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()
	ws := accountsID.NewWorkspaceID()
	target := id.NewProjectID()
	other := id.NewProjectID()

	// Span three batches so the pagination loop is exercised.
	totalTarget := removeByProjectBatchSize*2 + 37
	docs := make([]any, 0, totalTarget+10)
	for i := 0; i < totalTarget; i++ {
		docs = append(docs, bson.M{
			"id":          id.NewAssetID().String(),
			"workspace":   ws.String(),
			"project":     target.String(),
			"coresupport": true,
			"url":         fmt.Sprintf("https://example.com/target-%d", i),
			"size":        1,
			"createdat":   time.Now(),
		})
	}
	for i := 0; i < 10; i++ {
		docs = append(docs, bson.M{
			"id":          id.NewAssetID().String(),
			"workspace":   ws.String(),
			"project":     other.String(),
			"coresupport": true,
			"url":         fmt.Sprintf("https://example.com/other-%d", i),
			"size":        1,
			"createdat":   time.Now(),
		})
	}
	_, err := c.Collection("asset").InsertMany(ctx, docs)
	require.NoError(t, err)

	r := NewAsset(mongox.NewClientWithDatabase(c))
	gw := &countingFileGateway{}

	require.NoError(t, r.RemoveByProjectWithFile(ctx, target, gw))

	remainingTarget, err := c.Collection("asset").CountDocuments(ctx, bson.M{"project": target.String()})
	require.NoError(t, err)
	assert.Equal(t, int64(0), remainingTarget, "target project's assets must all be removed")

	remainingOther, err := c.Collection("asset").CountDocuments(ctx, bson.M{"project": other.String()})
	require.NoError(t, err)
	assert.Equal(t, int64(10), remainingOther, "unrelated project's assets must be untouched")

	assert.Equal(t, int64(totalTarget), gw.removeCount.Load(), "RemoveAsset should be called once per deleted asset")
}

func TestAsset_TotalSizeByWorkspace(t *testing.T) {
	c := mongotest.Connect(t)(t)
	ctx := context.Background()
	wid := accountsID.NewWorkspaceID()
	wid2 := accountsID.NewWorkspaceID()
	_, _ = c.Collection("asset").InsertMany(ctx, []any{
		bson.M{"id": "x", "workspace": wid.String(), "size": 10000000},
		bson.M{"id": "y", "workspace": wid.String(), "size": 1},
		bson.M{"id": "z", "workspace": "x", "size": 1},
	})

	r := NewAsset(mongox.NewClientWithDatabase(c))
	got, err := r.TotalSizeByWorkspace(ctx, wid)
	assert.Equal(t, int64(10000001), got)
	assert.NoError(t, err)

	r2 := r.Filtered(repo.WorkspaceFilter{
		Readable: accountsID.WorkspaceIDList{wid2},
	})
	got, err = r2.TotalSizeByWorkspace(ctx, wid)
	assert.Equal(t, repo.ErrOperationDenied, err)
	assert.Zero(t, got)
}
