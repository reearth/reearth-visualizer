package migration

import (
	"context"
	"fmt"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func AddCaseInsensitiveSceneAliasIndex(ctx context.Context, c DBClient) error {
	col := c.Database().Collection("scene")
	colScene := c.Collection("scene")

	// Handle empty aliases first
	emptyAliasScenes, err := FindEmptyAliasScenes(ctx, col)
	if err != nil {
		return fmt.Errorf("failed to scan for empty scene aliases: %w", err)
	}
	if len(emptyAliasScenes) > 0 {
		fmt.Printf("Empty scene aliases found: %d scenes\n", len(emptyAliasScenes))
		if err := GenerateAliasesForEmptyScenes(ctx, colScene, emptyAliasScenes); err != nil {
			return fmt.Errorf("failed to generate aliases for empty scenes: %w", err)
		}
		fmt.Println("Generated new aliases for empty scene aliases.")
	}

	duplicates, err := FindDuplicateSceneAliases(ctx, col)
	if err != nil {
		return fmt.Errorf("failed to scan for duplicate scene aliases: %w", err)
	}
	if len(duplicates) > 0 {
		fmt.Println("Duplicate scene aliases found (case-insensitive):")
		for alias, ids := range duplicates {
			fmt.Printf("Alias: %s, Scene IDs: %v\n", alias, ids)
		}
		if err := GenerateNewAliasesForDuplicateScenes(ctx, colScene, duplicates); err != nil {
			return fmt.Errorf("failed to generate new aliases for duplicates: %w", err)
		}
		fmt.Println("Generated new random aliases for duplicate scenes.")
	}

	aliasIndexModel := mongo.IndexModel{
		Keys: map[string]interface{}{
			"alias": 1,
		},
		Options: options.Index().SetCollation(&options.Collation{
			Locale:   "en",
			Strength: 2, // Case-insensitive comparison
		}).SetUnique(true).SetName("alias_case_insensitive_unique"),
	}

	_, err = col.Indexes().CreateOne(ctx, aliasIndexModel)
	if err != nil {
		return fmt.Errorf("failed to create unique index on scene.alias: %w", err)
	}
	fmt.Println("Created unique case-insensitive index on scene.alias")
	return nil
}

// FindDuplicateSceneAliases scans for duplicate scene aliases (case-insensitive)
func FindDuplicateSceneAliases(ctx context.Context, col *mongo.Collection) (map[string][]interface{}, error) {
	pipeline := []interface{}{
		map[string]interface{}{
			"$match": map[string]interface{}{
				"alias": map[string]interface{}{
					"$ne": "",
				},
			},
		},
		map[string]interface{}{
			"$group": map[string]interface{}{
				"_id": map[string]interface{}{
					"$toLower": "$alias",
				},
				"ids":   map[string]interface{}{"$push": "$_id"},
				"count": map[string]interface{}{"$sum": 1},
			},
		},
		map[string]interface{}{
			"$match": map[string]interface{}{
				"count": map[string]interface{}{"$gt": 1},
			},
		},
	}

	cursor, err := col.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	duplicates := make(map[string][]interface{})
	for cursor.Next(ctx) {
		var result struct {
			ID    string        `bson:"_id"`
			IDs   []interface{} `bson:"ids"`
			Count int           `bson:"count"`
		}
		if err := cursor.Decode(&result); err != nil {
			return nil, err
		}
		duplicates[result.ID] = result.IDs
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}
	return duplicates, nil
}

// GenerateNewAliasesForDuplicateScenes assigns new random aliases to scenes with duplicate aliases
func GenerateNewAliasesForDuplicateScenes(ctx context.Context, col *mongox.Collection, duplicates map[string][]interface{}) error {
	var ids []string
	var newRows []interface{}

	for _, sceneIDs := range duplicates {
		// Update all scenes with duplicate aliases
		for _, id := range sceneIDs {
			var doc mongodoc.SceneDocument
			filter := bson.M{"_id": id}
			err := col.Client().FindOne(ctx, filter).Decode(&doc)
			if err != nil {
				return fmt.Errorf("failed to find scene with id %v: %w", id, err)
			}

			oldAlias := doc.Alias
			newAlias := fmt.Sprintf("c-%s", doc.ID)
			doc.Alias = newAlias

			ids = append(ids, doc.ID)
			newRows = append(newRows, doc)
			fmt.Printf("Updated scene %v alias from '%s' to '%s'\n", doc.ID, oldAlias, newAlias)
		}
	}

	if len(ids) > 0 {
		if err := col.SaveAll(ctx, ids, newRows); err != nil {
			return fmt.Errorf("failed to bulk update aliases: %w", err)
		}
	}
	return nil
}

// FindEmptyAliasScenes finds scenes with empty or missing aliases
func FindEmptyAliasScenes(ctx context.Context, col *mongo.Collection) ([]interface{}, error) {
	filter := bson.M{
		"$or": []bson.M{
			{"alias": ""},
			{"alias": bson.M{"$exists": false}},
			{"alias": nil},
		},
	}

	cursor, err := col.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var sceneIDs []interface{}
	for cursor.Next(ctx) {
		var result struct {
			ID interface{} `bson:"_id"`
		}
		if err := cursor.Decode(&result); err != nil {
			return nil, err
		}
		sceneIDs = append(sceneIDs, result.ID)
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}
	return sceneIDs, nil
}

// GenerateAliasesForEmptyScenes assigns new aliases to scenes with empty aliases
func GenerateAliasesForEmptyScenes(ctx context.Context, col *mongox.Collection, sceneIDs []interface{}) error {
	var ids []string
	var newRows []interface{}

	for _, id := range sceneIDs {
		var doc mongodoc.SceneDocument
		filter := bson.M{"_id": id}
		err := col.Client().FindOne(ctx, filter).Decode(&doc)
		if err != nil {
			return fmt.Errorf("failed to find scene with id %v: %w", id, err)
		}

		oldAlias := doc.Alias
		newAlias := fmt.Sprintf("c-%s", doc.ID)
		doc.Alias = newAlias

		ids = append(ids, doc.ID)
		newRows = append(newRows, doc)
		fmt.Printf("Updated scene %v alias from '%s' to '%s'\n", doc.ID, oldAlias, newAlias)
	}

	if len(ids) > 0 {
		if err := col.SaveAll(ctx, ids, newRows); err != nil {
			return fmt.Errorf("failed to bulk update aliases: %w", err)
		}
	}
	return nil
}
