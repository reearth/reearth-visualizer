package migration

import (
	"context"

	"github.com/labstack/gommon/log"
	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/pkg/id"
	"go.mongodb.org/mongo-driver/bson"
)

func AddSceneFieldToPropertySchema(ctx context.Context, c DBClient) error {
	col := c.WithCollection("propertySchema")

	return col.Find(ctx, bson.M{}, &mongodoc.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			ids := make([]string, 0, len(rows))
			newRows := make([]interface{}, 0, len(rows))

			log.Infof("migration: AddSceneFieldToPropertySchema: hit property schemas: %d\n", len(rows))

			for _, row := range rows {
				var doc mongodoc.PropertySchemaDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					return err
				}

				s, err := id.PropertySchemaIDFrom(doc.ID)
				if err != nil || s.Plugin().Scene() == nil {
					continue
				}

				doc.Scene = s.Plugin().Scene().StringRef()
				ids = append(ids, doc.ID)
				newRows = append(newRows, doc)
			}

			return col.SaveAll(ctx, ids, newRows)
		},
	})
}
