package migration

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
)

// Scene represents the scene document structure
type Scene struct {
	ID      string `bson:"id"`
	Project string `bson:"project"`
	Team    string `bson:"team"`
	Alias   string `bson:"alias"`
}

// Project represents the project document structure
type Project struct {
	ID    string `bson:"id"`
	Team  string `bson:"team"`
	Name  string `bson:"name"`
	Alias string `bson:"alias"`
}

func SetProjectAlias(ctx context.Context, c DBClient) error {
	sceneCollection := c.WithCollection("scene").Client()
	projectCollection := c.WithCollection("project").Client()

	cursor, err := sceneCollection.Find(ctx, bson.M{})
	if err != nil {
		return fmt.Errorf("failed to find documents in scene: %w", err)
	}
	defer func() {
		if err := cursor.Close(ctx); err != nil {
			log.Printf("failed to close cursor for scene: %v", err)
		}
	}()

	updatedProjectCount := 0
	updatedSceneCount := 0

	for cursor.Next(ctx) {
		var scene Scene
		if err := cursor.Decode(&scene); err != nil {
			log.Printf("failed to decode scene document: %v", err)
			continue
		}

		// Generate alias based on scene ID
		alias := fmt.Sprintf("c-%s", scene.ID)

		// Update project if alias is not set
		projectFilter := bson.M{
			"id": scene.Project,
			"$or": []bson.M{
				{"alias": bson.M{"$exists": false}},
				{"alias": nil},
				{"alias": ""},
			},
		}

		projectUpdate := bson.M{
			"$set": bson.M{
				"alias": alias,
			},
		}

		projectResult, err := projectCollection.UpdateOne(ctx, projectFilter, projectUpdate)
		if err != nil {
			log.Printf("failed to update project %s: %v", scene.Project, err)
			continue
		}

		if projectResult.ModifiedCount > 0 {
			updatedProjectCount++
			log.Printf("Updated project %s with alias: %s", scene.Project, alias)
		}

		// Get the actual alias from the project (either newly set or existing)
		var project Project
		projectFindFilter := bson.M{"id": scene.Project}
		err = projectCollection.FindOne(ctx, projectFindFilter).Decode(&project)
		if err != nil {
			log.Printf("failed to find project %s: %v", scene.Project, err)
			continue
		}

		// Update scene with the same alias as the project
		sceneFilter := bson.M{"id": scene.ID}
		sceneUpdate := bson.M{
			"$set": bson.M{
				"alias": project.Alias,
			},
		}

		sceneResult, err := sceneCollection.UpdateOne(ctx, sceneFilter, sceneUpdate)
		if err != nil {
			log.Printf("failed to update scene %s: %v", scene.ID, err)
			continue
		}

		if sceneResult.ModifiedCount > 0 {
			updatedSceneCount++
			log.Printf("Updated scene %s with alias: %s", scene.ID, project.Alias)
		}
	}

	if err := cursor.Err(); err != nil {
		return fmt.Errorf("cursor error while iterating scenes: %w", err)
	}

	log.Printf("Migration completed. Updated %d projects and %d scenes", updatedProjectCount, updatedSceneCount)
	return nil
}
