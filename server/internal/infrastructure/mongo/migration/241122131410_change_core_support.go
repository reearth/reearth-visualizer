package migration

import (
	"context"

	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

func ChangeCoreSupport(ctx context.Context, c DBClient) error {
	col := c.WithCollection("project")

	return col.Find(ctx, bson.D{}, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {

			log.Infofc(ctx, "migration: ChangeCoreSupport: processing %d documents", len(rows))

			ids := make([]string, 0, len(rows))
			newDocs := make([]interface{}, 0, len(rows))

			for _, row := range rows {

				var doc map[string]interface{}
				if err := bson.Unmarshal(row, &doc); err != nil {
					return err
				}

				if coreSupport, ok := doc["coresupport"]; ok {
					doc["core"] = coreSupport
					delete(doc, "coresupport")
				} else {
					continue
				}

				if id, ok := doc["id"].(string); ok {
					ids = append(ids, id)
					newDocs = append(newDocs, doc)
				}

			}

			if len(ids) > 0 {
				if err := col.SaveAll(ctx, ids, newDocs); err != nil {
					return err
				}
			}

			return nil
		},
	})
}
