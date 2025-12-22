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

func AddCaseInsensitiveStorytellingAliasIndex(ctx context.Context, c DBClient) error {
	col := c.Database().Collection("storytelling")
	colStorytelling := c.Collection("storytelling")

	// Handle empty aliases first
	emptyAliasStorytelling, err := FindEmptyAliasStorytelling(ctx, col)
	if err != nil {
		return fmt.Errorf("failed to scan for empty storytelling aliases: %w", err)
	}
	if len(emptyAliasStorytelling) > 0 {
		fmt.Printf("Empty storytelling aliases found: %d storytelling\n", len(emptyAliasStorytelling))
		if err := GenerateAliasesForEmptyStorytelling(ctx, colStorytelling, emptyAliasStorytelling); err != nil {
			return fmt.Errorf("failed to generate aliases for empty storytelling: %w", err)
		}
		fmt.Println("Generated new aliases for empty storytelling aliases.")
	}

	duplicates, err := FindDuplicateStorytellingAliases(ctx, col)
	if err != nil {
		return fmt.Errorf("failed to scan for duplicate storytelling aliases: %w", err)
	}
	if len(duplicates) > 0 {
		fmt.Println("Duplicate storytelling aliases found (case-insensitive):")
		for alias, ids := range duplicates {
			fmt.Printf("Alias: %s, Storytelling IDs: %v\n", alias, ids)
		}
		if err := GenerateNewAliasesForDuplicateStorytelling(ctx, colStorytelling, duplicates); err != nil {
			return fmt.Errorf("failed to generate new aliases for duplicates: %w", err)
		}
		fmt.Println("Generated new random aliases for duplicate storytelling.")
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
		return fmt.Errorf("failed to create unique index on storytelling.alias: %w", err)
	}
	fmt.Println("Created unique case-insensitive index on storytelling.alias")
	return nil
}

// FindDuplicateStorytellingAliases scans for duplicate storytelling aliases (case-insensitive)
func FindDuplicateStorytellingAliases(ctx context.Context, col *mongo.Collection) (map[string][]interface{}, error) {
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

// GenerateNewAliasesForDuplicateStorytelling assigns new random aliases to storytelling with duplicate aliases
func GenerateNewAliasesForDuplicateStorytelling(ctx context.Context, col *mongox.Collection, duplicates map[string][]interface{}) error {
	var ids []string
	var newRows []interface{}

	for _, storytellingIDs := range duplicates {
		// Update all storytelling with duplicate aliases
		for _, id := range storytellingIDs {
			var doc mongodoc.StorytellingDocument
			filter := bson.M{"_id": id}
			err := col.Client().FindOne(ctx, filter).Decode(&doc)
			if err != nil {
				return fmt.Errorf("failed to find storytelling with id %v: %w", id, err)
			}

			oldAlias := doc.Alias
			newAlias := fmt.Sprintf("s-%s", doc.Id)
			doc.Alias = newAlias

			ids = append(ids, doc.Id)
			newRows = append(newRows, doc)
			fmt.Printf("Updated storytelling %v alias from '%s' to '%s'\n", doc.Id, oldAlias, newAlias)
		}
	}

	if len(ids) > 0 {
		if err := col.SaveAll(ctx, ids, newRows); err != nil {
			return fmt.Errorf("failed to bulk update aliases: %w", err)
		}
	}
	return nil
}

// FindEmptyAliasStorytelling finds storytelling with empty or missing aliases
func FindEmptyAliasStorytelling(ctx context.Context, col *mongo.Collection) ([]interface{}, error) {
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

	var storytellingIDs []interface{}
	for cursor.Next(ctx) {
		var result struct {
			ID interface{} `bson:"_id"`
		}
		if err := cursor.Decode(&result); err != nil {
			return nil, err
		}
		storytellingIDs = append(storytellingIDs, result.ID)
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}
	return storytellingIDs, nil
}

// GenerateAliasesForEmptyStorytelling assigns new aliases to storytelling with empty aliases
func GenerateAliasesForEmptyStorytelling(ctx context.Context, col *mongox.Collection, storytellingIDs []interface{}) error {
	var ids []string
	var newRows []interface{}

	for _, id := range storytellingIDs {
		var doc mongodoc.StorytellingDocument
		filter := bson.M{"_id": id}
		err := col.Client().FindOne(ctx, filter).Decode(&doc)
		if err != nil {
			return fmt.Errorf("failed to find storytelling with id %v: %w", id, err)
		}

		oldAlias := doc.Alias
		newAlias := fmt.Sprintf("s-%s", doc.Id)
		doc.Alias = newAlias

		ids = append(ids, doc.Id)
		newRows = append(newRows, doc)
		fmt.Printf("Updated storytelling %v alias from '%s' to '%s'\n", doc.Id, oldAlias, newAlias)
	}

	if len(ids) > 0 {
		if err := col.SaveAll(ctx, ids, newRows); err != nil {
			return fmt.Errorf("failed to bulk update aliases: %w", err)
		}
	}
	return nil
}
