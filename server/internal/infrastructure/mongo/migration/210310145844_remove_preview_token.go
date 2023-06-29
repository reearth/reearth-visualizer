package migration

import (
	"context"

	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

func RemovePreviewToken(ctx context.Context, c DBClient) error {
	col := c.WithCollection("project")

	return col.Find(ctx, bson.D{}, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {

			ids := make([]string, 0, len(rows))
			newRows := make([]interface{}, 0, len(rows))

			log.Infofc(ctx, "migration: RemoveProjectPreviewToken: hit projects: %d\n", len(rows))

			for _, row := range rows {
				doc := bson.M{}
				if err := bson.Unmarshal(row, &doc); err != nil {
					return err
				}

				if doc["publishmentstatus"] == "limited" {
					pt := doc["previewtoken"]
					doc["alias"] = pt
				}
				delete(doc, "previewtoken")

				id := doc["id"].(string)
				ids = append(ids, id)
				newRows = append(newRows, doc)
			}

			return col.SaveAll(ctx, ids, newRows)
		},
	})
}
