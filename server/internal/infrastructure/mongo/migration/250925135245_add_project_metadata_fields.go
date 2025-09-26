package migration

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AddProjectMetadataFields(ctx context.Context, c DBClient) error {
	projectCol := c.WithCollection("project")

	// Get workspace information for workspace_name lookup
	workspaces, err := getWorkspaces(ctx, c)
	if err != nil {
		log.Printf("Warning: failed to get workspaces for name lookup: %v\n", err)
		workspaces = make(map[string]string)
	}

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
					// Remove the old "updatedat" property
					delete(project, "updatedat")
				}

				workspaceID, _ := project["workspace"].(string)
				workspaceName := workspaces[workspaceID]

				// Add the new fields
				project["created_at"] = createdAt
				project["updated_at"] = now
				project["topics"] = []string{}
				project["workspace_name"] = workspaceName
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

// getWorkspaces retrieves workspace ID to name mapping from reearth-account database
func getWorkspaces(ctx context.Context, c DBClient) (map[string]string, error) {
	mongoClient := c.Database().Client()

	accountClient := mongox.NewClient("reearth-account", mongoClient)
	accountCol := accountClient.WithCollection("workspace")

	workspaces := make(map[string]string)
	err := accountCol.Find(ctx, bson.M{}, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			for _, row := range rows {
				var workspace struct {
					ID   string `bson:"id"`
					Name string `bson:"name"`
				}
				if err := bson.Unmarshal(row, &workspace); err != nil {
					log.Printf("Error decoding workspace document: %v\n", err)
					continue
				}
				workspaces[workspace.ID] = workspace.Name
			}
			return nil
		},
	})

	if err != nil {
		return nil, fmt.Errorf("failed to query workspaces from account database: %w", err)
	}

	log.Printf("Retrieved %d workspaces from account database\n", len(workspaces))
	return workspaces, nil
}
