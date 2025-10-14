package migration

import (
	"context"
	"log"

	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

func UpdateProjectMetadataFields(ctx context.Context, c DBClient) error {
	projectCol := c.WithCollection("project")
	metadataCol := c.WithCollection("projectmetadata")

	return projectCol.Find(ctx, bson.M{}, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			log.Printf("Processing batch of %d projects\n", len(rows))

			ids := make([]string, 0, len(rows))
			newRows := make([]interface{}, 0, len(rows))

			for _, row := range rows {
				var project map[string]interface{}
				if err := bson.Unmarshal(row, &project); err != nil {
					log.Printf("Error unmarshaling project: %v\n", err)
					continue
				}

				id, ok := project["id"].(string)
				if !ok {
					log.Printf("Skipping project with missing or invalid id\n")
					continue
				}

				// Remove unwanted fields if they exist in the project collection
				for _, field := range []string{"topics", "star_count", "starred_by", "created_at"} {
					if _, exists := project[field]; exists {
						delete(project, field)
						log.Printf("Removed field '%s' from project %s\n", field, id)
					}
				}

				// Check if projectmetadata exists for this project and update if found
				var existingMetadata bson.Raw
				err := metadataCol.Client().FindOne(ctx, bson.M{"project": id}).Decode(&existingMetadata)
				
				if err == nil {
					// Existing metadata found, update the fields
					updateFields := bson.M{
						"$set": bson.M{
							"topics":     []string{},
							"star_count": 0,
							"starred_by": []string{},
						},
					}

					if _, updateErr := metadataCol.Client().UpdateOne(ctx, bson.M{"project": id}, updateFields); updateErr != nil {
						log.Printf("Failed to update metadata for project %s: %v\n", id, updateErr)
						continue
					}
					log.Printf("Updated existing metadata for project %s in projectmetadata collection\n", id)
				} else {
					log.Printf("No existing metadata found for project %s, skipping metadata update\n", id)
				}

				ids = append(ids, id)
				newRows = append(newRows, project)
				log.Printf("Processed project %s\n", id)
			}

			if len(newRows) > 0 {
				return projectCol.SaveAll(ctx, ids, newRows)
			}
			return nil
		},
	})
}
