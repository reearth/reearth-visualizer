package migration

import (
	"context"
	"log"
	"strings"

	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func ConvertTopicsToString(ctx context.Context, c DBClient) error {
	projectCol := c.WithCollection("project")
	metadataCol := c.WithCollection("projectmetadata")

	// First, add empty topics field to all projects
	log.Printf("Adding empty topics field to project collection\n")
	if _, err := projectCol.Client().UpdateMany(ctx, bson.M{}, bson.M{
		"$set": bson.M{
			"topics": "",
		},
	}); err != nil {
		log.Printf("Failed to add topics field to projects: %v\n", err)
		return err
	}
	log.Printf("Successfully added empty topics field to all projects\n")

	// Then convert topics from array to string in projectmetadata
	return metadataCol.Find(ctx, bson.M{}, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			log.Printf("Processing batch of %d project metadata records\n", len(rows))

			for _, row := range rows {
				var metadata map[string]interface{}
				if err := bson.Unmarshal(row, &metadata); err != nil {
					log.Printf("Error unmarshaling project metadata: %v\n", err)
					continue
				}

				id, ok := metadata["project"].(string)
				if !ok {
					log.Printf("Skipping metadata with missing or invalid project id\n")
					continue
				}

				// Check if topics field exists and is an array
				if topicsField, exists := metadata["topics"]; exists {
					var topicStrings []string
					var shouldUpdate bool

					switch topics := topicsField.(type) {
					case []interface{}:
						// Convert array of interfaces to string array
						for _, topic := range topics {
							if topicStr, ok := topic.(string); ok {
								topicStrings = append(topicStrings, topicStr)
							}
						}
						shouldUpdate = true
						log.Printf("Found []interface{} topics for project %s\n", id)

					case primitive.A:
						// Handle MongoDB primitive array type
						for _, topic := range topics {
							if topicStr, ok := topic.(string); ok {
								topicStrings = append(topicStrings, topicStr)
							}
						}
						shouldUpdate = true
						log.Printf("Found primitive.A topics for project %s\n", id)

					case string:
						// Already a string, skip
						log.Printf("Topics already string format for project %s\n", id)

					default:
						log.Printf("Unexpected topics format for project %s: %T\n", id, topics)
					}

					if shouldUpdate {
						// Join topics with comma and space
						topicsString := strings.Join(topicStrings, ", ")

						// Update the metadata record
						updateFilter := bson.M{"project": id}
						updateFields := bson.M{
							"$set": bson.M{
								"topics": topicsString,
							},
						}

						if _, err := metadataCol.Client().UpdateOne(ctx, updateFilter, updateFields); err != nil {
							log.Printf("Failed to update topics for project metadata %s: %v\n", id, err)
							continue
						}

						log.Printf("Converted topics from array to string for project %s: %s\n", id, topicsString)
					}
				}
			}

			return nil
		},
	})
}
