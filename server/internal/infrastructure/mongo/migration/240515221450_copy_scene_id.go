package migration

import (
	"context"
	"fmt"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

type seed struct {
	projectId id.ProjectID
	sceneId   id.SceneID
}

func CopySceneId(ctx context.Context, c DBClient) error {
	col := c.WithCollection("scene")

	var seeds []seed

	err := col.Find(ctx, bson.M{}, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			log.Infofc(ctx, "log: migration: CopySceneId: hit scenes: %d\n", len(rows))

			for _, row := range rows {
				log.Debugfc(ctx, "log: migration: CopySceneId: row: %s\n", row)
				var doc mongodoc.SceneDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					return err
				}

				log.Debugfc(ctx, "log: migration: CopySceneId: doc: %s\n", doc)

				pid, err := id.ProjectIDFrom(doc.Project)
				if err != nil {
					return fmt.Errorf("migration: CopySceneId: project id error: %s\n", err)
				}
				sid, err := id.SceneIDFrom(doc.ID)
				if err != nil {
					return fmt.Errorf("migration: CopySceneId: scene id error: %s\n", err)
				}

				seeds = append(seeds, seed{pid, sid})
			}

			return nil
		},
	})

	if err != nil {
		return err
	}

	col = c.WithCollection("project")
	ids := make([]string, 0, len(seeds))
	newRows := make([]interface{}, 0, len(seeds))

	for _, s := range seeds {
		err := col.Find(ctx, bson.M{"id": s.projectId.String()}, &mongox.BatchConsumer{
			Size: 1000,
			Callback: func(rows []bson.Raw) error {
				if len(rows) == 0 {
					log.Debugfc(ctx, "log: migration: CopySceneId: project not found: %s\n", s.projectId)
					return nil
				}

				if len(rows) > 1 {
					return fmt.Errorf("project found multiple: %s", s.projectId)
				}

				log.Debugfc(ctx, "log: migration: CopySceneId: project found: %s\n", s.projectId)

				p := rows[0]
				var doc mongodoc.ProjectDocument
				if err := bson.Unmarshal(p, &doc); err != nil {
					return fmt.Errorf("project unmarshal error: %s\n", err)
				}

				if doc.Scene != "" {
					log.Debugfc(ctx, "log: migration: CopySceneId: project already has scene: %s\n", doc.Scene)
					return nil
				}

				doc.Scene = s.sceneId.String()
				ids = append(ids, doc.ID)
				newRows = append(newRows, doc)
				return nil
			},
		})

		if err != nil {
			return err
		}
	}

	return col.SaveAll(ctx, ids, newRows)
}
