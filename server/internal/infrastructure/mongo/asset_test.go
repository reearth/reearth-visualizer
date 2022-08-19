package mongo

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/asset"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
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
					Workspace(id.NewWorkspaceID()).
					Name("name").
					Size(10).
					URL("hxxps://https://reearth.io/").
					ContentType("json").
					MustBuild(),
			},
		},
	}

	init := connect(t)

	for _, tc := range tests {
		tc := tc

		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			client := init(t)

			repo := NewAsset(mongodoc.NewClientWithDatabase(client))
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

func TestAsset_TotalSizeByWorkspace(t *testing.T) {
	c := connect(t)(t)
	ctx := context.Background()
	wid := id.NewWorkspaceID()
	wid2 := id.NewWorkspaceID()
	_, _ = c.Collection("asset").InsertMany(ctx, []any{
		bson.M{"id": "x", "team": wid.String(), "size": 10000000},
		bson.M{"id": "y", "team": wid.String(), "size": 1},
		bson.M{"id": "z", "team": "x", "size": 1},
	})

	r := NewAsset(mongodoc.NewClientWithDatabase(c))
	got, err := r.TotalSizeByWorkspace(ctx, wid)
	assert.Equal(t, int64(10000001), got)
	assert.NoError(t, err)

	r = r.Filtered(repo.WorkspaceFilter{
		Readable: id.WorkspaceIDList{wid2},
	})
	got, err = r.TotalSizeByWorkspace(ctx, wid)
	assert.Equal(t, repo.ErrOperationDenied, err)
	assert.Zero(t, got)
}
