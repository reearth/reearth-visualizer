package migration

import (
	"context"
	"fmt"

	"github.com/reearth/reearthx/log"
	"go.mongodb.org/mongo-driver/bson"
)

const syncProjectAndPropertyIndexesName = "SyncProjectAndPropertyIndexes"

var redundantPropertyIndexKeys = []string{
	"scene",
	"fields.links.schema",
	"fields.links.dataset",
	"items.fields.links.schema",
	"items.fields.links.dataset",
	"items.groups.fields.links.schema",
	"items.groups.fields.links.dataset",
}

func SyncProjectAndPropertyIndexes(ctx context.Context, c DBClient) error {
	if err := createNonUniqueIndex(ctx, c, syncProjectAndPropertyIndexesName, "project", "project_coresupport_workspace_updatedat_id", bson.D{
		{Key: "coresupport", Value: 1},
		{Key: "workspace", Value: 1},
		{Key: "updatedat", Value: -1},
		{Key: "id", Value: -1},
	}, nil); err != nil {
		return err
	}
	if err := createNonUniqueIndex(ctx, c, syncProjectAndPropertyIndexesName, "project", "project_coresupport_deleted_workspace_updatedat_id", bson.D{
		{Key: "coresupport", Value: 1},
		{Key: "deleted", Value: 1},
		{Key: "workspace", Value: 1},
		{Key: "updatedat", Value: -1},
		{Key: "id", Value: -1},
	}, nil); err != nil {
		return err
	}

	for _, key := range redundantPropertyIndexKeys {
		if err := dropIndexWithKeys(ctx, c, syncProjectAndPropertyIndexesName, "property", bson.D{{Key: key, Value: 1}}); err != nil {
			return err
		}
	}
	return dropIndexWithKeys(ctx, c, syncProjectAndPropertyIndexesName, "project", bson.D{{Key: "alias", Value: 1}})
}

func dropIndexWithKeys(ctx context.Context, c DBClient, migrationName, collectionName string, keys bson.D) error {
	collection := c.Database().Collection(collectionName)

	exists, name, err := indexWithKeysExists(ctx, collection, keys, nil)
	if err != nil {
		return fmt.Errorf("migration: %s: failed to list indexes on %s: %w", migrationName, collectionName, err)
	}
	if !exists {
		log.Infofc(ctx, "migration: %s: no index with keys %v on %s, skipping", migrationName, keys, collectionName)
		return nil
	}

	if _, err := collection.Indexes().DropOne(ctx, name); err != nil {
		return fmt.Errorf("migration: %s: failed to drop index %s on %s: %w", migrationName, name, collectionName, err)
	}
	log.Infofc(ctx, "migration: %s: dropped index on %s: %s", migrationName, collectionName, name)
	return nil
}
