package migration

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"
	"sync"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/reearth/reearth/server/internal/app/config"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	batchSize    = 100
	configPrefix = "reearth"
)

// If the same asset is used by multiple sources, it will be assigned to the last one.
func AssetProjectAssociation(ctx context.Context, c DBClient) error {
	assetURLPrefix, err := loadAssetURLPrefix()
	if err != nil {
		return err
	}

	fmt.Println("****************************************************************************************")
	fmt.Println("Target asset URL Prefix :", assetURLPrefix)
	fmt.Println("****************************************************************************************")

	collections := []string{"project", "scene", "nlsLayer", "storytelling", "style", "property", "propertySchema", "plugin"}

	var wg sync.WaitGroup
	errCh := make(chan error, len(collections))

	for _, collectionName := range collections {
		wg.Add(1)
		go func(name string) {
			defer wg.Done()
			if err := processCollection(ctx, c, name, assetURLPrefix); err != nil {
				errCh <- err
			}
		}(collectionName)
	}

	wg.Wait()
	close(errCh)

	for err := range errCh {
		if err != nil {
			return err
		}
	}

	return nil
}

func processCollection(ctx context.Context, c DBClient, collectionName string, assetURLPrefix string) error {
	opts := options.Find().SetBatchSize(batchSize)
	cursor, err := c.WithCollection(collectionName).Client().Find(ctx, bson.M{}, opts)
	if err != nil {
		return fmt.Errorf("failed to find documents in %s: %w", collectionName, err)
	}
	defer func() {
		if closeErr := cursor.Close(ctx); closeErr != nil {
			log.Printf("Error closing cursor for %s: %v\n", collectionName, closeErr)
		}
	}()

	var batch []map[string]any
	for cursor.Next(ctx) {
		var rawData map[string]any
		if err := cursor.Decode(&rawData); err != nil {
			log.Printf("Error decoding document in %s: %v\n", collectionName, err)
			continue
		}

		batch = append(batch, rawData)
		if len(batch) >= batchSize {
			if err := processBatch(ctx, c, collectionName, batch, assetURLPrefix); err != nil {
				log.Printf("Error processing batch in %s: %v\n", collectionName, err)
			}
			batch = nil
		}
	}

	if len(batch) > 0 {
		if err := processBatch(ctx, c, collectionName, batch, assetURLPrefix); err != nil {
			log.Printf("Error processing final batch in %s: %v\n", collectionName, err)
		}
	}

	if err := cursor.Err(); err != nil {
		return fmt.Errorf("cursor error in %s: %w", collectionName, err)
	}

	return nil
}

func loadAssetURLPrefix() (string, error) {
	if err := godotenv.Load(".env"); err != nil && !os.IsNotExist(err) {
		return "", err
	}
	var conf config.Config
	if err := envconfig.Process(configPrefix, &conf); err != nil {
		return "", err
	}
	if conf.AssetBaseURL == "" {
		return "", errors.New("Failed to load env 'host'")
	}
	return conf.AssetBaseURL, nil
}

func processBatch(ctx context.Context, c DBClient, collectionName string, batch []map[string]any, assetURLPrefix string) error {
	for _, rawData := range batch {
		project := findProjectID(ctx, c, collectionName, rawData)
		if project == "" {
			continue
		}
		if err := searchAssetURL(ctx, c, project, rawData, assetURLPrefix, collectionName); err != nil {
			return err
		}
	}
	return nil
}

func findProjectID(ctx context.Context, c DBClient, collectionName string, rawData map[string]any) string {
	switch collectionName {
	case "project":
		if id, ok := rawData["id"].(string); ok {
			return id
		}
	case "scene":
		if proj, ok := rawData["project"].(string); ok {
			return proj
		}
	default:
		sceneID, ok := rawData["scene"].(string)
		if !ok {
			log.Printf("Scene ID not found collection %s id %s \n", collectionName, rawData["id"])
			return ""
		}
		var sceneData map[string]any
		if err := c.WithCollection("scene").Client().FindOne(ctx, bson.M{"id": sceneID}).Decode(&sceneData); err != nil {
			if err == mongo.ErrNoDocuments {
				log.Printf("Parent Scene %s not found for %s id %s \n", sceneID, collectionName, rawData["id"])
			} else {
				log.Printf("Error fetching scene: %v\n", err)
			}
			return ""
		}
		if proj, ok := sceneData["project"].(string); ok {
			return proj
		}
		log.Printf("Project ID not found in scene: %v\n", sceneData)
	}
	return ""
}

func searchAssetURL(ctx context.Context, c DBClient, project string, data any, assetURLPrefix string, collectionName string) error {

	if pa, ok := data.(primitive.A); ok {
		data = []any(pa)
	}

	switch v := data.(type) {
	case map[string]any:
		for key, value := range v {
			if str, ok := value.(string); ok {
				cleanedStr := strings.Trim(str, "'")
				if strings.HasPrefix(cleanedStr, assetURLPrefix) {
					if _, err := updateAssetProject(ctx, c, project, cleanedStr, collectionName, key); err != nil {
						return err
					}
				}
			} else {
				if err := searchAssetURL(ctx, c, project, value, assetURLPrefix, collectionName); err != nil {
					return err
				}
			}
		}
	case []any:
		for _, item := range v {
			if str, ok := item.(string); ok {
				cleanedStr := strings.Trim(str, "'")
				if strings.HasPrefix(cleanedStr, assetURLPrefix) {
					if _, err := updateAssetProject(ctx, c, project, cleanedStr, collectionName, ""); err != nil {
						return err
					}
				}
			} else {
				if err := searchAssetURL(ctx, c, project, item, assetURLPrefix, collectionName); err != nil {
					return err
				}
			}
		}
	}
	return nil
}

func updateAssetProject(ctx context.Context, c DBClient, project string, assetURL string, collectionName string, key string) (*mongo.UpdateResult, error) {
	result, err := c.WithCollection("asset").Client().UpdateMany(
		ctx,
		bson.M{"url": assetURL},
		bson.M{"$set": bson.M{"project": project}},
	)
	fmt.Printf("Matched: %d, Modified: %d  %s \n", result.MatchedCount, result.ModifiedCount, fmt.Sprintf("%s -> set project %s  collection:%s key:%s", assetURL, project, collectionName, key))
	return result, err
}
