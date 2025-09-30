package migration

import (
	"context"
	"log"
	"time"

	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AddProjectMetadataFields(ctx context.Context, c DBClient) error {
	projectCol := c.WithCollection("project")

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

				// Check if the new fields already exist
				if _, exists := project["created_at"]; exists {
					log.Printf("Project %s already has metadata fields, skipping\n", id)
					continue
				}

				// Use existing updatedat as created_at if available, otherwise use current time
				now := time.Now()
				createdAt := now
				if updatedat, exists := project["updatedat"]; exists {
					// Handle both time.Time and primitive.DateTime types
					switch v := updatedat.(type) {
					case time.Time:
						createdAt = v
					case primitive.DateTime:
						createdAt = v.Time()
					default:
						log.Printf("Warning: updatedat field has unexpected type %T for project %s, using current time\n", v, id)
					}
				}

				// Add the new fields
				project["created_at"] = createdAt
				project["topics"] = []string{}
				project["star_count"] = 0
				project["starred_by"] = []string{}

				ids = append(ids, id)
				newRows = append(newRows, project)
				log.Printf("Updated project %s with new metadata fields\n", id)
			}

			if len(newRows) > 0 {
				return projectCol.SaveAll(ctx, ids, newRows)
			}
			return nil
		},
	})
}
