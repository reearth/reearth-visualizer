package migration

import (
	"context"
	"fmt"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// AddUnifiedCaseInsensitiveAliasIndex creates case-insensitive unique indexes on alias fields
// for both scene and storytelling collections, ensuring global alias uniqueness.
//
// The migration handles:
// 1. Empty/missing aliases: Generates new aliases with format "{prefix}-{id}"
// 2. Whitespace-only aliases: Treated as empty and replaced with generated aliases
// 3. Within-collection duplicates: All duplicates get new generated aliases 
// 4. Cross-collection conflicts: Scene aliases take priority, storytelling aliases are updated
// 5. Index creation: Creates case-insensitive unique indexes on both collections
//
// Alias generation uses prefixes: "c-" for scenes, "s-" for storytelling
func AddUnifiedCaseInsensitiveAliasIndex(ctx context.Context, c DBClient) error {
	sceneCol := c.Database().Collection("scene")
	storytellingCol := c.Database().Collection("storytelling")
	sceneColMongox := c.Collection("scene")
	storytellingColMongox := c.Collection("storytelling")

	// Handle empty aliases for both collections
	log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Handling empty aliases...")
	if err := handleEmptyAliases(ctx, sceneCol, sceneColMongox, "scene"); err != nil {
		return fmt.Errorf("failed to handle empty scene aliases: %w", err)
	}
	if err := handleEmptyAliases(ctx, storytellingCol, storytellingColMongox, "storytelling"); err != nil {
		return fmt.Errorf("failed to handle empty storytelling aliases: %w", err)
	}

	// Handle duplicates within each collection
	log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Handling duplicates within collections...")
	if err := handleDuplicatesWithinCollection(ctx, sceneCol, sceneColMongox, "scene"); err != nil {
		return fmt.Errorf("failed to handle scene duplicates: %w", err)
	}
	if err := handleDuplicatesWithinCollection(ctx, storytellingCol, storytellingColMongox, "storytelling"); err != nil {
		return fmt.Errorf("failed to handle storytelling duplicates: %w", err)
	}

	// Handle conflicts between collections
	log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Checking for cross-collection alias conflicts...")
	if err := handleCrossCollectionConflicts(ctx, sceneCol, storytellingCol, sceneColMongox, storytellingColMongox); err != nil {
		return fmt.Errorf("failed to handle cross-collection conflicts: %w", err)
	}

	// Create unique indexes for both collections
	log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Creating unique indexes...")
	if err := createUniqueAliasIndex(ctx, sceneCol, "scene"); err != nil {
		return fmt.Errorf("failed to create scene alias index: %w", err)
	}
	if err := createUniqueAliasIndex(ctx, storytellingCol, "storytelling"); err != nil {
		return fmt.Errorf("failed to create storytelling alias index: %w", err)
	}

	log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Successfully created unified case-insensitive alias indexes")
	return nil
}

// handleEmptyAliases finds and assigns new aliases to documents with empty, missing, or whitespace-only aliases
func handleEmptyAliases(ctx context.Context, col *mongo.Collection, colMongox *mongox.Collection, collectionType string) error {
	emptyAliasIDs, err := findEmptyAliases(ctx, col)
	if err != nil {
		return fmt.Errorf("failed to scan for empty %s aliases: %w", collectionType, err)
	}
	if len(emptyAliasIDs) > 0 {
		log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Empty %s aliases found: %d documents", collectionType, len(emptyAliasIDs))
		if err := generateAliasesForEmpty(ctx, colMongox, emptyAliasIDs, collectionType); err != nil {
			return fmt.Errorf("failed to generate aliases for empty %s: %w", collectionType, err)
		}
		log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Generated new aliases for empty %s aliases", collectionType)
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
		log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Duplicate %s aliases found (case-insensitive)", collectionType)
		for alias, ids := range duplicates {
			log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Alias: %s, %s IDs: %v", alias, collectionType, ids)
		}
		if err := generateNewAliasesForDuplicates(ctx, colMongox, duplicates, collectionType); err != nil {
			return fmt.Errorf("failed to generate new aliases for duplicate %s: %w", collectionType, err)
		}
		log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Generated new ID-based aliases for duplicate %s", collectionType)
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
		log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Cross-collection alias conflicts found: %d aliases", len(conflicts))
		for alias, conflict := range conflicts {
			log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Conflicting alias: %s (scenes: %v, storytelling: %v)", alias, conflict.SceneIDs, conflict.StorytellingIDs)
		}

		// Resolve conflicts by updating storytelling aliases (keeping scene aliases as primary)
		if err := resolveCrossCollectionConflicts(ctx, storytellingColMongox, conflicts); err != nil {
			return fmt.Errorf("failed to resolve cross-collection conflicts: %w", err)
		}
		log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Resolved cross-collection alias conflicts")
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
	// Collect all storytelling document IDs that need to be updated
	var allStorytellingIDs []interface{}
	for _, conflict := range conflicts {
		allStorytellingIDs = append(allStorytellingIDs, conflict.StorytellingIDs...)
	}

	if len(allStorytellingIDs) == 0 {
		return nil
	}

	var ids []string
	var newRows []interface{}

	// Fetch all storytelling documents in a single query
	filter := bson.M{"_id": bson.M{"$in": allStorytellingIDs}}
	cursor, err := storytellingCol.Client().Find(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to find storytelling documents for conflict resolution: %w", err)
	}
	defer cursor.Close(ctx)

	var stories []mongodoc.StorytellingDocument
	if err := cursor.All(ctx, &stories); err != nil {
		return fmt.Errorf("failed to decode storytelling documents: %w", err)
	}

	for _, doc := range stories {
		oldAlias := doc.Alias
		newAlias := fmt.Sprintf("s-%s", doc.Id)
		doc.Alias = newAlias

		ids = append(ids, doc.Id)
		newRows = append(newRows, doc)
		log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Updated storytelling %v alias from '%s' to '%s' (conflict resolution)", doc.Id, oldAlias, newAlias)
	}

	if len(ids) > 0 {
		if err := storytellingCol.SaveAll(ctx, ids, newRows); err != nil {
			return fmt.Errorf("failed to bulk update conflicting aliases: %w", err)
		}
	}
	return nil
}

// findEmptyAliases finds documents with empty, missing, or whitespace-only aliases
func findEmptyAliases(ctx context.Context, col *mongo.Collection) ([]interface{}, error) {
	filter := bson.M{
		"$or": []bson.M{
			{"alias": ""},
			{"alias": bson.M{"$exists": false}},
			{"alias": nil},
			{"alias": bson.M{"$regex": "^\\s*$"}}, // Matches empty string or whitespace-only
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
	if len(docIDs) == 0 {
		return nil
	}

	prefix := getAliasPrefix(collectionType)
	var ids []string
	var newRows []interface{}

	// Fetch all documents in a single query
	filter := bson.M{"_id": bson.M{"$in": docIDs}}
	cursor, err := col.Client().Find(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to find %s documents for empty alias processing: %w", collectionType, err)
	}
	defer cursor.Close(ctx)

	// Process all documents based on collection type
	if collectionType == "scene" {
		var scenes []mongodoc.SceneDocument
		if err := cursor.All(ctx, &scenes); err != nil {
			return fmt.Errorf("failed to decode scene documents: %w", err)
		}

		for _, doc := range scenes {
			oldAlias := doc.Alias
			newAlias := fmt.Sprintf("%s-%s", prefix, doc.ID)
			doc.Alias = newAlias
			ids = append(ids, doc.ID)
			newRows = append(newRows, doc)
			log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Updated scene %v alias from '%s' to '%s'", doc.ID, oldAlias, newAlias)
		}
	} else {
		var stories []mongodoc.StorytellingDocument
		if err := cursor.All(ctx, &stories); err != nil {
			return fmt.Errorf("failed to decode storytelling documents: %w", err)
		}

		for _, doc := range stories {
			oldAlias := doc.Alias
			newAlias := fmt.Sprintf("%s-%s", prefix, doc.Id)
			doc.Alias = newAlias
			ids = append(ids, doc.Id)
			newRows = append(newRows, doc)
			log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Updated storytelling %v alias from '%s' to '%s'", doc.Id, oldAlias, newAlias)
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
	// Collect all document IDs that need to be updated
	var allDocIDs []interface{}
	for _, docIDs := range duplicates {
		allDocIDs = append(allDocIDs, docIDs...)
	}

	if len(allDocIDs) == 0 {
		return nil
	}

	prefix := getAliasPrefix(collectionType)
	var ids []string
	var newRows []interface{}

	// Fetch all documents in a single query
	filter := bson.M{"_id": bson.M{"$in": allDocIDs}}
	cursor, err := col.Client().Find(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to find %s documents for duplicate processing: %w", collectionType, err)
	}
	defer cursor.Close(ctx)

	// Process all documents based on collection type
	if collectionType == "scene" {
		var scenes []mongodoc.SceneDocument
		if err := cursor.All(ctx, &scenes); err != nil {
			return fmt.Errorf("failed to decode scene documents: %w", err)
		}

		for _, doc := range scenes {
			oldAlias := doc.Alias
			newAlias := fmt.Sprintf("%s-%s", prefix, doc.ID)
			doc.Alias = newAlias
			ids = append(ids, doc.ID)
			newRows = append(newRows, doc)
			log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Updated scene %v alias from '%s' to '%s'", doc.ID, oldAlias, newAlias)
		}
	} else {
		var stories []mongodoc.StorytellingDocument
		if err := cursor.All(ctx, &stories); err != nil {
			return fmt.Errorf("failed to decode storytelling documents: %w", err)
		}

		for _, doc := range stories {
			oldAlias := doc.Alias
			newAlias := fmt.Sprintf("%s-%s", prefix, doc.Id)
			doc.Alias = newAlias
			ids = append(ids, doc.Id)
			newRows = append(newRows, doc)
			log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Updated storytelling %v alias from '%s' to '%s'", doc.Id, oldAlias, newAlias)
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
	log.Infofc(ctx, "migration: AddUnifiedCaseInsensitiveAliasIndex: Created unique case-insensitive index on %s.alias", collectionType)
	return nil
}
