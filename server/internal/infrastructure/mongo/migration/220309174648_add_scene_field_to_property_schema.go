package migration

import (
	"context"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

func AddSceneFieldToPropertySchema(ctx context.Context, c DBClient) error {
	col := c.WithCollection("propertySchema")

	return col.Find(ctx, bson.M{}, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			ids := make([]string, 0, len(rows))
			newRows := make([]interface{}, 0, len(rows))

			log.Infofc(ctx, "migration: AddSceneFieldToPropertySchema: hit property schemas: %d\n", len(rows))

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
