package migration

import (
	"context"

	"github.com/labstack/gommon/log"
	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/pkg/id"
	"go.mongodb.org/mongo-driver/bson"
)

func SplitSchemaOfProperties(ctx context.Context, c DBClient) error {
	col := c.WithCollection("property")

	return col.Find(ctx, bson.M{
		"schema": bson.M{"$exists": true},
	}, &mongodoc.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			ids := make([]string, 0, len(rows))
			newRows := make([]interface{}, 0, len(rows))

			log.Infof("migration: SplitSchemaOfProperties: hit properties: %d\n", len(rows))

			for _, row := range rows {
				var doc mongodoc.PropertyDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					return err
				}
				if doc.Schema == "" {
					continue
				}

				s, err := id.PropertySchemaIDFrom(doc.Schema)
				if err != nil {
					return err
				}

				doc.Schema = ""
				doc.SchemaPlugin = s.Plugin().String()
				doc.SchemaName = s.ID()

				ids = append(ids, doc.ID)
				newRows = append(newRows, doc)
			}

			return col.SaveAll(ctx, ids, newRows)
		},
	})
}
