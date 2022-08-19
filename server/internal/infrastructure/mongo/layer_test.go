package mongo

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func TestLayer_CountByScene(t *testing.T) {
	c := connect(t)(t)
	ctx := context.Background()
	sid := id.NewSceneID()
	sid2 := id.NewSceneID()
	_, _ = c.Collection("layer").InsertMany(ctx, []any{
		bson.M{"id": "a", "scene": sid.String()},
		bson.M{"id": "b", "scene": sid.String()},
		bson.M{"id": "c", "scene": sid.String()},
		bson.M{"id": "d", "scene": "x"},
	})

	r := NewLayer(mongodoc.NewClientWithDatabase(c))
	got, err := r.CountByScene(ctx, sid)
	assert.Equal(t, 3, got)
	assert.NoError(t, err)

	r = r.Filtered(repo.SceneFilter{
		Readable: id.SceneIDList{sid2},
	})
	got, err = r.CountByScene(ctx, sid)
	assert.Equal(t, repo.ErrOperationDenied, err)
	assert.Zero(t, got)
}
