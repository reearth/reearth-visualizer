package migration

import (
	"context"
	"fmt"

	"github.com/reearth/reearthx/log"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const syncProjectAndPropertyIndexesName = "SyncProjectAndPropertyIndexes"

type syncIndex struct {
	collection string
	name       string
	keys       bson.D
	collation  *options.Collation
}

type redundantIndex struct {
	collection string
	field      string
	covering   bson.D
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

func withScene(field string) bson.D {
	return bson.D{{Key: field, Value: 1}, {Key: "scene", Value: 1}}
}

func redundantIndexes() []redundantIndex {
	res := make([]redundantIndex, 0, len(redundantPropertyIndexKeys)+7)
	for _, key := range redundantPropertyIndexKeys {
		covering := withScene(key)
		if key == "scene" {
			covering = bson.D{{Key: "scene", Value: 1}, {Key: "schemaplugin", Value: 1}}
		}
		res = append(res, redundantIndex{"property", key, covering})
	}
	return append(res,
		redundantIndex{"project", "alias", bson.D{{Key: "alias", Value: 1}, {Key: "publishmentstatus", Value: 1}}},
		redundantIndex{"nlsLayer", "scene", bson.D{{Key: "scene", Value: 1}, {Key: "infobox.blocks", Value: 1}}},
		redundantIndex{"nlsLayer", "group.children", withScene("group.children")},
		redundantIndex{"nlsLayer", "infobox.property", withScene("infobox.property")},
		redundantIndex{"nlsLayer", "infobox.blocks.property", withScene("infobox.blocks.property")},
		redundantIndex{"style", "scene", bson.D{{Key: "scene", Value: 1}, {Key: "infobox.fields", Value: 1}}},
		redundantIndex{"storytelling", "alias", bson.D{{Key: "alias", Value: 1}, {Key: "status", Value: 1}}},
	)
}

func syncDroppedIndexes() []syncIndex {
	redundant := redundantIndexes()
	res := make([]syncIndex, 0, len(redundant))
	for _, r := range redundant {
		res = append(res, syncIndex{r.collection, r.field + "_1", bson.D{{Key: r.field, Value: 1}}, nil})
	}
	return res
}

func SyncProjectAndPropertyIndexes(ctx context.Context, c DBClient) error {
	for _, idx := range syncCreatedIndexes {
		if err := createNonUniqueIndex(ctx, c, syncProjectAndPropertyIndexesName, idx.collection, idx.name, idx.keys, idx.collation); err != nil {
			return err
		}
	}
	for _, r := range redundantIndexes() {
		if err := dropRedundantIndexes(ctx, c, syncProjectAndPropertyIndexesName, r); err != nil {
			return err
		}
	}
	return nil
}

func dropRedundantIndexes(ctx context.Context, c DBClient, migrationName string, r redundantIndex) error {
	collection := c.Database().Collection(r.collection)
	keys := bson.D{{Key: r.field, Value: 1}}

	cursor, err := collection.Indexes().List(ctx)
	if err != nil {
		return fmt.Errorf("migration: %s: failed to list indexes on %s: %w", migrationName, r.collection, err)
	}
	var specs []struct {
		Name      string `bson:"name"`
		Key       bson.D `bson:"key"`
		Unique    bool   `bson:"unique"`
		Collation bson.M `bson:"collation,omitempty"`
	}
	if err := cursor.All(ctx, &specs); err != nil {
		return fmt.Errorf("migration: %s: failed to list indexes on %s: %w", migrationName, r.collection, err)
	}

	covered := false
	for _, s := range specs {
		if keysEqual(s.Key, r.covering) && len(s.Collation) == 0 {
			covered = true
			break
		}
	}

	for _, s := range specs {
		if !keysEqual(s.Key, keys) || len(s.Collation) > 0 {
			continue
		}
		if s.Unique {
			log.Warnfc(ctx, "migration: %s: index %s on %s is unique, not dropping", migrationName, s.Name, r.collection)
			continue
		}
		if !covered {
			log.Warnfc(ctx, "migration: %s: covering index %v missing on %s, not dropping %s", migrationName, r.covering, r.collection, s.Name)
			continue
		}
		if _, err := collection.Indexes().DropOne(ctx, s.Name); err != nil {
			return fmt.Errorf("migration: %s: failed to drop index %s on %s: %w", migrationName, s.Name, r.collection, err)
		}
		log.Infofc(ctx, "migration: %s: dropped index on %s: %s", migrationName, r.collection, s.Name)
	}
	return nil
}
