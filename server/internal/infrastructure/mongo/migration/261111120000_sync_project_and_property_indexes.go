package migration

import (
	"context"
	"fmt"

	"github.com/reearth/reearthx/log"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const syncProjectAndPropertyIndexesName = "SyncProjectAndPropertyIndexes"

type syncIndex struct {
	collection string
	name       string
	keys       bson.D
	collation  *options.Collation
}

var syncCreatedIndexes = []syncIndex{
	{"project", "project_coresupport_workspace_updatedat_id", bson.D{{Key: "coresupport", Value: 1}, {Key: "workspace", Value: 1}, {Key: "updatedat", Value: -1}, {Key: "id", Value: -1}}, projectQueryCollation},
	{"project", "project_coresupport_deleted_workspace_updatedat_id", bson.D{{Key: "coresupport", Value: 1}, {Key: "deleted", Value: 1}, {Key: "workspace", Value: 1}, {Key: "updatedat", Value: -1}, {Key: "id", Value: -1}}, projectQueryCollation},
	{"project", "project_coresupport_starred_workspace_updatedat_id", bson.D{{Key: "coresupport", Value: 1}, {Key: "starred", Value: 1}, {Key: "workspace", Value: 1}, {Key: "updatedat", Value: -1}, {Key: "id", Value: -1}}, projectQueryCollation},
	{"project", "project_coresupport_workspace_id", bson.D{{Key: "coresupport", Value: 1}, {Key: "workspace", Value: 1}, {Key: "id", Value: 1}}, projectQueryCollation},
	{"asset", "asset_coresupport_project_id_url", bson.D{{Key: "coresupport", Value: 1}, {Key: "project", Value: 1}, {Key: "id", Value: 1}, {Key: "url", Value: 1}}, nil},
}

var redundantPropertyIndexKeys = []string{
	"scene",
	"fields.links.schema",
	"fields.links.dataset",
	"items.fields.links.schema",
	"items.fields.links.dataset",
	"items.groups.fields.links.schema",
	"items.groups.fields.links.dataset",
}

func syncDroppedIndexes() []syncIndex {
	res := make([]syncIndex, 0, len(redundantPropertyIndexKeys)+1)
	for _, key := range redundantPropertyIndexKeys {
		res = append(res, syncIndex{"property", key + "_1", bson.D{{Key: key, Value: 1}}, nil})
	}
	return append(res, syncIndex{"project", "alias_1", bson.D{{Key: "alias", Value: 1}}, nil})
}

func SyncProjectAndPropertyIndexes(ctx context.Context, c DBClient) error {
	for _, idx := range syncCreatedIndexes {
		if err := createNonUniqueIndex(ctx, c, syncProjectAndPropertyIndexesName, idx.collection, idx.name, idx.keys, idx.collation); err != nil {
			return err
		}
	}
	for _, idx := range syncDroppedIndexes() {
		if err := dropIndexWithKeys(ctx, c, syncProjectAndPropertyIndexesName, idx.collection, idx.keys); err != nil {
			return err
		}
	}
	return nil
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

	unique, err := indexIsUnique(ctx, collection, name)
	if err != nil {
		return fmt.Errorf("migration: %s: failed to list indexes on %s: %w", migrationName, collectionName, err)
	}
	if unique {
		log.Warnfc(ctx, "migration: %s: index %s on %s is unique, not dropping", migrationName, name, collectionName)
		return nil
	}

	if _, err := collection.Indexes().DropOne(ctx, name); err != nil {
		return fmt.Errorf("migration: %s: failed to drop index %s on %s: %w", migrationName, name, collectionName, err)
	}
	log.Infofc(ctx, "migration: %s: dropped index on %s: %s", migrationName, collectionName, name)
	return nil
}

func indexIsUnique(ctx context.Context, col *mongo.Collection, name string) (bool, error) {
	cursor, err := col.Indexes().List(ctx)
	if err != nil {
		return false, err
	}
	var specs []struct {
		Name   string `bson:"name"`
		Unique bool   `bson:"unique"`
	}
	if err := cursor.All(ctx, &specs); err != nil {
		return false, err
	}
	for _, s := range specs {
		if s.Name == name {
			return s.Unique, nil
		}
	}
	return false, nil
}
