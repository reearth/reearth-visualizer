package migration

import (
	"context"
	"fmt"

	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

func RemoveLegacyImportStatusFields(ctx context.Context, c DBClient) error {
	metadataCol := c.WithCollection("projectmetadata")

	filter := bson.M{
		"$or": []bson.M{
			{"importstatus": bson.M{"$exists": true}},
			{"importresultlog": bson.M{"$exists": true}},
		},
	}

	if err := metadataCol.Find(ctx, filter, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			for _, row := range rows {
				var doc struct {
					ID           string  `bson:"id"`
					Project      string  `bson:"project"`
					ImportStatus *string `bson:"importstatus"`
				}
				if err := bson.Unmarshal(row, &doc); err != nil {
					log.Errorfc(ctx, "migration: RemoveLegacyImportStatusFields: failed to unmarshal projectmetadata row: %v", err)
					continue
				}
				status := "nil"
				if doc.ImportStatus != nil {
					status = *doc.ImportStatus
				}
				log.Infofc(ctx, "migration: RemoveLegacyImportStatusFields: removing legacy import fields from projectmetadata id=%s project=%s importstatus=%s", doc.ID, doc.Project, status)
			}
			return nil
		},
	}); err != nil {
		return fmt.Errorf("migration: RemoveLegacyImportStatusFields: failed to log matched docs: %w", err)
	}

	if _, err := metadataCol.Client().UpdateMany(ctx, filter, bson.M{
		"$unset": bson.M{"importstatus": "", "importresultlog": ""},
	}); err != nil {
		return fmt.Errorf("migration: RemoveLegacyImportStatusFields: failed to unset legacy import fields: %w", err)
	}

	return nil
}
