package migration

import (
	"context"
	"encoding/json"
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
		return err
	}
	defer func() {
		if err := cursor.Close(ctx); err != nil {
			log.Printf("Error closing cursor for %s: %v\n", collectionName, err)
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
				return err
			}
			batch = batch[:0]
		}
	}

	if len(batch) > 0 {
		if err := processBatch(ctx, c, collectionName, batch, assetURLPrefix); err != nil {
			return err
		}
	}

	if err := cursor.Err(); err != nil {
		return err
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
	if conf.Host == "" {
		return "", errors.New("Failed to load env 'host'")
	}
	return fmt.Sprintf("%s/assets/", conf.Host), nil
}

func normalize(data any) map[string]any {
	if b, err := json.Marshal(data); err == nil {
		var result map[string]any
		if err := json.Unmarshal(b, &result); err == nil {
			return result
		}
	}
	return nil
}

func processBatch(ctx context.Context, c DBClient, collectionName string, batch []map[string]any, assetURLPrefix string) error {
	for _, rawData := range batch {
		project := findProjectID(ctx, c, collectionName, rawData)
		if project == "" {
			continue
		}
		if err := searchAssetURL(ctx, c, project, normalize(rawData), assetURLPrefix); err != nil {
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
			log.Println("Scene ID not found in rawData")
			return ""
		}
		var sceneData map[string]any
		if err := c.WithCollection("scene").Client().FindOne(ctx, bson.M{"id": sceneID}).Decode(&sceneData); err != nil {
			if err == mongo.ErrNoDocuments {
				log.Printf("Scene with ID %s not found\n", sceneID)
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

func searchAssetURL(ctx context.Context, c DBClient, project string, data any, assetURLPrefix string) error {
	switch v := data.(type) {
	case map[string]any:
		for _, value := range v {
			if err := searchAssetURL(ctx, c, project, value, assetURLPrefix); err != nil {
				return err
			}
		}
	case []any:
		for _, item := range v {
			if err := searchAssetURL(ctx, c, project, item, assetURLPrefix); err != nil {
				return err
			}
		}
	case primitive.A:
		if vArr, ok := any(v).(primitive.A); ok {
			for _, item := range vArr {
				if err := searchAssetURL(ctx, c, project, item, assetURLPrefix); err != nil {
					return err
				}
			}
		}
	case string:
		if strings.HasPrefix(v, assetURLPrefix) {
			if _, err := updateAssetProject(ctx, c, project, v); err != nil {
				return err
			}
		} else {
			// fmt.Println("------ skip value: ", v)
		}
	default:
		// fmt.Printf("------ skip type: %T\n", data)
	}
	return nil
}

func updateAssetProject(ctx context.Context, c DBClient, project string, assetURL string) (*mongo.UpdateResult, error) {
	result, err := c.WithCollection("asset").Client().UpdateMany(
		ctx,
		bson.M{"url": assetURL},
		bson.M{"$set": bson.M{"project": project}},
	)
	fmt.Printf("MatchedCount: %d, ModifiedCount: %d  %s \n", result.MatchedCount, result.ModifiedCount, fmt.Sprintf("%s -> %s", assetURL, project))
	return result, err
}

// The code below uses transactions. You must specify a replica.
//--------------------------------------------------------------

// func AssetProjectAssociation(ctx context.Context, c DBClient) error {
// 	collections := []string{"project", "scene", "nlsLayer", "storytelling", "style", "property", "propertySchema", "plugin"}
// 	session, err := c.WithCollection("asset").Client().Database().Client().StartSession()
// 	if err != nil {
// 		return err
// 	}
// 	defer session.EndSession(ctx)
// 	err = session.StartTransaction()
// 	if err != nil {
// 		return err
// 	}
// 	err = mongo.WithSession(ctx, session, func(sessionCtx mongo.SessionContext) error {
// 		var wg sync.WaitGroup
// 		errCh := make(chan error, len(collections))

// 		for _, collectionName := range collections {
// 			wg.Add(1)
// 			go func(name string) {
// 				defer wg.Done()
// 				if err := processCollection(sessionCtx, c, name); err != nil {
// 					errCh <- err
// 				}
// 			}(collectionName)
// 		}

// 		wg.Wait()
// 		close(errCh)

// 		for err := range errCh {
// 			if err != nil {
// 				return err
// 			}
// 		}
// 		return session.CommitTransaction(sessionCtx)
// 	})

// 	if err != nil {
// 		_ = session.AbortTransaction(ctx)
// 		return err
// 	}

// 	return nil
// }
