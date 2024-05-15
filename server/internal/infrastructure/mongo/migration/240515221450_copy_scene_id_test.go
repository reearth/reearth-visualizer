package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func init() {
	mongotest.Env = "REEARTH_DB"
}

func TestCopySceneId(t *testing.T) {
	ctx := context.Background()
	log.Infofc(ctx, "migration: CopySceneId test")

	db := mongotest.Connect(t)(t)
	c := mongox.NewClientWithDatabase(db)

	// arrange
	type seed struct {
		projectId id.ProjectID
		sceneId   id.SceneID
	}
	seed1, seed2, seed3 := seed{
		projectId: id.NewProjectID(),
		sceneId:   id.NewSceneID(),
	}, seed{
		projectId: id.NewProjectID(),
		sceneId:   id.NewSceneID(),
	}, seed{
		projectId: id.NewProjectID(),
		sceneId:   id.NewSceneID(),
	}

	_, _ = db.Collection("project").InsertMany(ctx, []any{
		mongodoc.ProjectDocument{
			ID: seed1.projectId.String(),
		},
		mongodoc.ProjectDocument{
			ID: seed2.projectId.String(),
		},
		mongodoc.ProjectDocument{
			ID: seed3.projectId.String(),
		},
	})

	_, _ = db.Collection("scene").InsertMany(ctx, []any{
		mongodoc.SceneDocument{
			ID:      seed1.sceneId.String(),
			Project: seed1.projectId.String(),
		},
		mongodoc.SceneDocument{
			ID:      seed2.sceneId.String(),
			Project: seed2.projectId.String(),
		},
		mongodoc.SceneDocument{
			ID:      seed3.sceneId.String(),
			Project: seed3.projectId.String(),
		},
	})

	// act
	assert.NoError(t, CopySceneId(ctx, c))

	// assert
	var projects []mongodoc.ProjectDocument
	assert.NoError(t, c.WithCollection("project").Find(ctx, bson.M{}, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			for _, row := range rows {
				var doc mongodoc.ProjectDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					return err
				}
				projects = append(projects, doc)
			}
			return nil
		},
	}))
	assert.Len(t, projects, 3)
	for _, s := range []seed{seed1, seed2, seed3} {
		p, ok := lo.Find(projects, func(doc mongodoc.ProjectDocument) bool {
			return s.projectId.String() == doc.ID
		})
		assert.True(t, ok)
		assert.Equal(t, s.sceneId.String(), p.Scene)
	}
}
