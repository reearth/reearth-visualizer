package migration

import (
	"context"

	"github.com/labstack/gommon/log"
	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/pkg/id"
	"go.mongodb.org/mongo-driver/bson"
)

func AddSceneWidgetId(ctx context.Context, c DBClient) error {
	col := c.WithCollection("scene")

	return col.Find(ctx, bson.D{}, &mongodoc.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {

			ids := make([]string, 0, len(rows))
			newRows := make([]interface{}, 0, len(rows))

			log.Infof("migration: AddSceneWidgetId: hit scenes: %d\n", len(rows))

			for _, row := range rows {
				var doc mongodoc.SceneDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					return err
				}

				widgets := make([]mongodoc.SceneWidgetDocument, 0, len(doc.Widgets))
				for _, w := range doc.Widgets {
					if w.ID == "" {
						w.ID = id.New().String()
					}
					widgets = append(widgets, w)
				}
				doc.Widgets = widgets

				ids = append(ids, doc.ID)
				newRows = append(newRows, doc)
			}

			return col.SaveAll(ctx, ids, newRows)
		},
	})
}
