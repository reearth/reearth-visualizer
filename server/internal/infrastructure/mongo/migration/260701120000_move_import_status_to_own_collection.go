package migration

import (
	"context"
	"fmt"
	"time"

	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const moveImportStatusToOwnCollectionName = "MoveImportStatusToOwnCollection"

// projectImportTTLSeconds controls how long a projectimport document
// survives, counted from its last update, before MongoDB's background TTL
// monitor deletes it. Import status/logs are only useful while an import is
// in flight or shortly after it finishes, unlike projectmetadata's other
// fields (readme/license/topics/stars) which live indefinitely. 1 month is
// a starting point; change this one constant to adjust it.
const projectImportTTLSeconds = int32(30 * 24 * 60 * 60)

func MoveImportStatusToOwnCollection(ctx context.Context, c DBClient) error {
	if err := createProjectImportIndexes(ctx, c); err != nil {
		return err
	}
	return migrateImportStatusData(ctx, c)
}

// createProjectImportIndexes sets up the projectimport collection: a unique
// index on project (one import doc per project, upserted in place on every
// status transition) and a TTL index on updatedat that auto-expires stale
// entries. Both are created with fixed names, so re-running this migration
// with the same index specs is a no-op rather than an error.
func createProjectImportIndexes(ctx context.Context, c DBClient) error {
	col := c.Database().Collection("projectimport")

	unique := true
	if _, err := col.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "project", Value: 1}},
		Options: options.Index().SetName("projectimport_project").SetUnique(unique),
	}); err != nil {
		return fmt.Errorf("migration: %s: failed to create unique index on project: %w", moveImportStatusToOwnCollectionName, err)
	}

	if _, err := col.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "updatedat", Value: 1}},
		Options: options.Index().SetName("projectimport_updatedat_ttl").SetExpireAfterSeconds(projectImportTTLSeconds),
	}); err != nil {
		return fmt.Errorf("migration: %s: failed to create TTL index on updatedat: %w", moveImportStatusToOwnCollectionName, err)
	}

	return nil
}

// migrateImportStatusData copies importstatus/importresultlog off every
// projectmetadata document that has them into the new projectimport
// collection. It deliberately leaves the legacy fields on projectmetadata
// in place: the application dual-writes both collections for now, and a
// later migration will $unset the legacy fields once dual-write has proven
// stable in production.
func migrateImportStatusData(ctx context.Context, c DBClient) error {
	metadataCol := c.WithCollection("projectmetadata")
	importCol := c.Database().Collection("projectimport")

	filter := bson.M{
		"$or": []bson.M{
			{"importstatus": bson.M{"$exists": true, "$ne": nil}},
			{"importresultlog": bson.M{"$exists": true, "$ne": nil}},
		},
	}

	return metadataCol.Find(ctx, filter, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			now := time.Now().UTC()
			var writes []mongo.WriteModel
			var migratedCount int

			for _, row := range rows {
				var doc struct {
					Project         string          `bson:"project"`
					ImportStatus    *string         `bson:"importstatus"`
					ImportResultLog *map[string]any `bson:"importresultlog"`
				}
				if err := bson.Unmarshal(row, &doc); err != nil {
					log.Errorfc(ctx, "migration: %s: failed to unmarshal projectmetadata row: %v", moveImportStatusToOwnCollectionName, err)
					continue
				}
				if doc.Project == "" {
					continue
				}

				writes = append(writes, mongo.NewUpdateOneModel().
					SetFilter(bson.M{"project": doc.Project}).
					SetUpdate(bson.M{"$set": bson.M{
						"project":   doc.Project,
						"status":    doc.ImportStatus,
						"resultlog": doc.ImportResultLog,
						"updatedat": now,
					}}).
					SetUpsert(true))
				migratedCount++
			}

			if len(writes) > 0 {
				if _, err := importCol.BulkWrite(ctx, writes); err != nil {
					return fmt.Errorf("migration: %s: failed to upsert projectimport docs: %w", moveImportStatusToOwnCollectionName, err)
				}
				log.Infofc(ctx, "migration: %s: copied import status/log for %d projects into projectimport", moveImportStatusToOwnCollectionName, migratedCount)
			}

			return nil
		},
	})
}
