package migration

import (
	"context"
	"fmt"

	"github.com/reearth/reearthx/log"
)

const revertSyncProjectAndPropertyIndexesName = "RevertSyncProjectAndPropertyIndexes"

func RevertSyncProjectAndPropertyIndexes(ctx context.Context, c DBClient) error {
	for _, idx := range syncCreatedIndexes {
		if err := dropIndexByName(ctx, c, revertSyncProjectAndPropertyIndexesName, idx.collection, idx.name); err != nil {
			return err
		}
	}
	for _, idx := range syncDroppedIndexes() {
		if err := createNonUniqueIndex(ctx, c, revertSyncProjectAndPropertyIndexesName, idx.collection, idx.name, idx.keys, idx.collation); err != nil {
			return err
		}
	}
	return nil
}

func dropIndexByName(ctx context.Context, c DBClient, migrationName, collectionName, indexName string) error {
	collection := c.Database().Collection(collectionName)

	cursor, err := collection.Indexes().List(ctx)
	if err != nil {
		return fmt.Errorf("migration: %s: failed to list indexes on %s: %w", migrationName, collectionName, err)
	}
	var specs []struct {
		Name string `bson:"name"`
	}
	if err := cursor.All(ctx, &specs); err != nil {
		return fmt.Errorf("migration: %s: failed to list indexes on %s: %w", migrationName, collectionName, err)
	}

	for _, s := range specs {
		if s.Name != indexName {
			continue
		}
		if _, err := collection.Indexes().DropOne(ctx, indexName); err != nil {
			return fmt.Errorf("migration: %s: failed to drop index %s on %s: %w", migrationName, indexName, collectionName, err)
		}
		log.Infofc(ctx, "migration: %s: dropped index on %s: %s", migrationName, collectionName, indexName)
		return nil
	}

	log.Infofc(ctx, "migration: %s: no index named %s on %s, skipping", migrationName, indexName, collectionName)
	return nil
}
