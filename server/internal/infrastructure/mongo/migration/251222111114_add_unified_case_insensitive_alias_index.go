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

func AddUnifiedCaseInsensitiveAliasIndex(ctx context.Context, c DBClient) error {
	sceneCol := c.Database().Collection("scene")
	storytellingCol := c.Database().Collection("storytelling")
	sceneColMongox := c.Collection("scene")
	storytellingColMongox := c.Collection("storytelling")

	// Handle empty aliases for both collections
	fmt.Println("Handling empty aliases...")
	if err := handleEmptyAliases(ctx, sceneCol, sceneColMongox, "scene"); err != nil {
		return fmt.Errorf("failed to handle empty scene aliases: %w", err)
	}
	if err := handleEmptyAliases(ctx, storytellingCol, storytellingColMongox, "storytelling"); err != nil {
		return fmt.Errorf("failed to handle empty storytelling aliases: %w", err)
	}

	// Handle duplicates within each collection
	fmt.Println("Handling duplicates within collections...")
	if err := handleDuplicatesWithinCollection(ctx, sceneCol, sceneColMongox, "scene"); err != nil {
		return fmt.Errorf("failed to handle scene duplicates: %w", err)
	}
	if err := handleDuplicatesWithinCollection(ctx, storytellingCol, storytellingColMongox, "storytelling"); err != nil {
		return fmt.Errorf("failed to handle storytelling duplicates: %w", err)
	}

	// Handle conflicts between collections
	fmt.Println("Checking for cross-collection alias conflicts...")
	if err := handleCrossCollectionConflicts(ctx, sceneCol, storytellingCol, sceneColMongox, storytellingColMongox); err != nil {
		return fmt.Errorf("failed to handle cross-collection conflicts: %w", err)
	}

	// Create unique indexes for both collections
	fmt.Println("Creating unique indexes...")
	if err := createUniqueAliasIndex(ctx, sceneCol, "scene"); err != nil {
		return fmt.Errorf("failed to create scene alias index: %w", err)
	}
	if err := createUniqueAliasIndex(ctx, storytellingCol, "storytelling"); err != nil {
		return fmt.Errorf("failed to create storytelling alias index: %w", err)
	}

	fmt.Println("Successfully created unified case-insensitive alias indexes")
	return nil
}

// handleEmptyAliases finds and assigns new aliases to documents with empty aliases
func handleEmptyAliases(ctx context.Context, col *mongo.Collection, colMongox *mongox.Collection, collectionType string) error {
	emptyAliasIDs, err := findEmptyAliases(ctx, col)
	if err != nil {
		return fmt.Errorf("failed to scan for empty %s aliases: %w", collectionType, err)
	}
	if len(emptyAliasIDs) > 0 {
		fmt.Printf("Empty %s aliases found: %d documents\n", collectionType, len(emptyAliasIDs))
		if err := generateAliasesForEmpty(ctx, colMongox, emptyAliasIDs, collectionType); err != nil {
			return fmt.Errorf("failed to generate aliases for empty %s: %w", collectionType, err)
		}
		fmt.Printf("Generated new aliases for empty %s aliases.\n", collectionType)
	}
	return nil
}

// handleDuplicatesWithinCollection finds and resolves duplicates within a single collection
func handleDuplicatesWithinCollection(ctx context.Context, col *mongo.Collection, colMongox *mongox.Collection, collectionType string) error {
	duplicates, err := findDuplicateAliases(ctx, col)
	if err != nil {
		return fmt.Errorf("failed to scan for duplicate %s aliases: %w", collectionType, err)
	}
	if len(duplicates) > 0 {
		fmt.Printf("Duplicate %s aliases found (case-insensitive):\n", collectionType)
		for alias, ids := range duplicates {
			fmt.Printf("Alias: %s, %s IDs: %v\n", alias, collectionType, ids)
		}
		if err := generateNewAliasesForDuplicates(ctx, colMongox, duplicates, collectionType); err != nil {
			return fmt.Errorf("failed to generate new aliases for duplicate %s: %w", collectionType, err)
		}
		fmt.Printf("Generated new ID-based aliases for duplicate %s.\n", collectionType)
	}
	return nil
}

// handleCrossCollectionConflicts identifies and resolves alias conflicts between scene and storytelling collections
func handleCrossCollectionConflicts(ctx context.Context, sceneCol, storytellingCol *mongo.Collection, _, storytellingColMongox *mongox.Collection) error {
	conflicts, err := findCrossCollectionConflicts(ctx, sceneCol, storytellingCol)
	if err != nil {
		return err
	}

	if len(conflicts) > 0 {
		fmt.Printf("Cross-collection alias conflicts found: %d aliases\n", len(conflicts))
		for alias, conflict := range conflicts {
			fmt.Printf("Conflicting alias: %s (scenes: %v, storytelling: %v)\n", alias, conflict.SceneIDs, conflict.StorytellingIDs)
		}

		// Resolve conflicts by updating storytelling aliases (keeping scene aliases as primary)
		if err := resolveCrossCollectionConflicts(ctx, storytellingColMongox, conflicts); err != nil {
			return fmt.Errorf("failed to resolve cross-collection conflicts: %w", err)
		}
		fmt.Println("Resolved cross-collection alias conflicts.")
	}
	return nil
}

type aliasConflict struct {
	SceneIDs        []interface{}
	StorytellingIDs []interface{}
}

// findCrossCollectionConflicts finds aliases that exist in both collections (case-insensitive)
func findCrossCollectionConflicts(ctx context.Context, sceneCol, storytellingCol *mongo.Collection) (map[string]*aliasConflict, error) {
	// Get all scene aliases
	sceneAliases, err := getAllAliases(ctx, sceneCol)
	if err != nil {
		return nil, fmt.Errorf("failed to get scene aliases: %w", err)
	}

	// Get all storytelling aliases
	storytellingAliases, err := getAllAliases(ctx, storytellingCol)
	if err != nil {
		return nil, fmt.Errorf("failed to get storytelling aliases: %w", err)
	}

	// Find conflicts (case-insensitive)
	conflicts := make(map[string]*aliasConflict)

	for alias, sceneIDs := range sceneAliases {
		lowerAlias := fmt.Sprintf("%s", alias) // Convert to string for consistent comparison
		for storyAlias, storyIDs := range storytellingAliases {
			lowerStoryAlias := fmt.Sprintf("%s", storyAlias)
			if lowerAlias == lowerStoryAlias {
				conflicts[lowerAlias] = &aliasConflict{
					SceneIDs:        sceneIDs,
					StorytellingIDs: storyIDs,
				}
			}
		}
	}

	return conflicts, nil
}

// getAllAliases gets all aliases from a collection grouped by lowercase alias
func getAllAliases(ctx context.Context, col *mongo.Collection) (map[interface{}][]interface{}, error) {
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
				"ids": map[string]interface{}{"$push": "$_id"},
			},
		},
	}

	cursor, err := col.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	aliases := make(map[interface{}][]interface{})
	for cursor.Next(ctx) {
		var result struct {
			ID  interface{}   `bson:"_id"`
			IDs []interface{} `bson:"ids"`
		}
		if err := cursor.Decode(&result); err != nil {
			return nil, err
		}
		aliases[result.ID] = result.IDs
	}
	return aliases, cursor.Err()
}

// resolveCrossCollectionConflicts updates storytelling aliases that conflict with scene aliases
func resolveCrossCollectionConflicts(ctx context.Context, storytellingCol *mongox.Collection, conflicts map[string]*aliasConflict) error {
	var ids []string
	var newRows []interface{}

	for _, conflict := range conflicts {
		// Update all storytelling documents with conflicting aliases
		for _, id := range conflict.StorytellingIDs {
			var doc mongodoc.StorytellingDocument
			filter := bson.M{"_id": id}
			err := storytellingCol.Client().FindOne(ctx, filter).Decode(&doc)
			if err != nil {
				return fmt.Errorf("failed to find storytelling with id %v: %w", id, err)
			}

			oldAlias := doc.Alias
			newAlias := fmt.Sprintf("s-%s", doc.Id)
			doc.Alias = newAlias

			ids = append(ids, doc.Id)
			newRows = append(newRows, doc)
			fmt.Printf("Updated storytelling %v alias from '%s' to '%s' (conflict resolution)\n", doc.Id, oldAlias, newAlias)
		}
	}

	if len(ids) > 0 {
		if err := storytellingCol.SaveAll(ctx, ids, newRows); err != nil {
			return fmt.Errorf("failed to bulk update conflicting aliases: %w", err)
		}
	}
	return nil
}

// findEmptyAliases finds documents with empty or missing aliases
func findEmptyAliases(ctx context.Context, col *mongo.Collection) ([]interface{}, error) {
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

	var docIDs []interface{}
	for cursor.Next(ctx) {
		var result struct {
			ID interface{} `bson:"_id"`
		}
		if err := cursor.Decode(&result); err != nil {
			return nil, err
		}
		docIDs = append(docIDs, result.ID)
	}
	return docIDs, cursor.Err()
}

// generateAliasesForEmpty assigns new aliases to documents with empty aliases
func generateAliasesForEmpty(ctx context.Context, col *mongox.Collection, docIDs []interface{}, collectionType string) error {
	var ids []string
	var newRows []interface{}
	prefix := getAliasPrefix(collectionType)

	for _, id := range docIDs {
		filter := bson.M{"_id": id}

		if collectionType == "scene" {
			var doc mongodoc.SceneDocument
			err := col.Client().FindOne(ctx, filter).Decode(&doc)
			if err != nil {
				return fmt.Errorf("failed to find scene with id %v: %w", id, err)
			}
			oldAlias := doc.Alias
			newAlias := fmt.Sprintf("%s-%s", prefix, doc.ID)
			doc.Alias = newAlias
			ids = append(ids, doc.ID)
			newRows = append(newRows, doc)
			fmt.Printf("Updated scene %v alias from '%s' to '%s'\n", doc.ID, oldAlias, newAlias)
		} else {
			var doc mongodoc.StorytellingDocument
			err := col.Client().FindOne(ctx, filter).Decode(&doc)
			if err != nil {
				return fmt.Errorf("failed to find storytelling with id %v: %w", id, err)
			}
			oldAlias := doc.Alias
			newAlias := fmt.Sprintf("%s-%s", prefix, doc.Id)
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

// findDuplicateAliases scans for duplicate aliases within a collection (case-insensitive)
func findDuplicateAliases(ctx context.Context, col *mongo.Collection) (map[string][]interface{}, error) {
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
	return duplicates, cursor.Err()
}

// generateNewAliasesForDuplicates assigns new aliases to documents with duplicate aliases
func generateNewAliasesForDuplicates(ctx context.Context, col *mongox.Collection, duplicates map[string][]interface{}, collectionType string) error {
	var ids []string
	var newRows []interface{}
	prefix := getAliasPrefix(collectionType)

	for _, docIDs := range duplicates {
		for _, id := range docIDs {
			filter := bson.M{"_id": id}

			if collectionType == "scene" {
				var doc mongodoc.SceneDocument
				err := col.Client().FindOne(ctx, filter).Decode(&doc)
				if err != nil {
					return fmt.Errorf("failed to find scene with id %v: %w", id, err)
				}
				oldAlias := doc.Alias
				newAlias := fmt.Sprintf("%s-%s", prefix, doc.ID)
				doc.Alias = newAlias
				ids = append(ids, doc.ID)
				newRows = append(newRows, doc)
				fmt.Printf("Updated scene %v alias from '%s' to '%s'\n", doc.ID, oldAlias, newAlias)
			} else {
				var doc mongodoc.StorytellingDocument
				err := col.Client().FindOne(ctx, filter).Decode(&doc)
				if err != nil {
					return fmt.Errorf("failed to find storytelling with id %v: %w", id, err)
				}
				oldAlias := doc.Alias
				newAlias := fmt.Sprintf("%s-%s", prefix, doc.Id)
				doc.Alias = newAlias
				ids = append(ids, doc.Id)
				newRows = append(newRows, doc)
				fmt.Printf("Updated storytelling %v alias from '%s' to '%s'\n", doc.Id, oldAlias, newAlias)
			}
		}
	}

	if len(ids) > 0 {
		if err := col.SaveAll(ctx, ids, newRows); err != nil {
			return fmt.Errorf("failed to bulk update aliases: %w", err)
		}
	}
	return nil
}

// getAliasPrefix returns the appropriate prefix for each collection type
func getAliasPrefix(collectionType string) string {
	switch collectionType {
	case "scene":
		return "c"
	case "storytelling":
		return "s"
	default:
		return "x"
	}
}

// createUniqueAliasIndex creates the case-insensitive unique index on the alias field
func createUniqueAliasIndex(ctx context.Context, col *mongo.Collection, collectionType string) error {
	aliasIndexModel := mongo.IndexModel{
		Keys: map[string]interface{}{
			"alias": 1,
		},
		Options: options.Index().SetCollation(&options.Collation{
			Locale:   "en",
			Strength: 2, // Case-insensitive comparison
		}).SetUnique(true).SetName("alias_case_insensitive_unique"),
	}

	_, err := col.Indexes().CreateOne(ctx, aliasIndexModel)
	if err != nil {
		return fmt.Errorf("failed to create unique index on %s.alias: %w", collectionType, err)
	}
	fmt.Printf("Created unique case-insensitive index on %s.alias\n", collectionType)
	return nil
}
