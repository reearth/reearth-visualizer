package migration

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"

	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/reearth/reearth/server/internal/infrastructure/fs"
	"github.com/reearth/reearth/server/internal/infrastructure/gcs"
	"github.com/reearth/reearth/server/internal/infrastructure/s3"
	"github.com/reearth/reearth/server/internal/usecase/gateway"
	"github.com/reearth/reearthx/log"
	"github.com/spf13/afero"
	"go.mongodb.org/mongo-driver/bson"
)

func GcschangeEsriToDefault(ctx context.Context, c DBClient) error {

	conf, cerr := config.ReadConfig(false)
	if cerr != nil {
		log.Fatalf("failed to load config: %v", cerr)
	}
	gateway := initFile(ctx, conf)

	if err := scenesModify(ctx, c, gateway); err != nil {
		fmt.Println("failed to scenesModify:", err)
	}

	if err := storiesModify(ctx, c, gateway); err != nil {
		fmt.Println("failed to storiesModify:", err)
	}

	return nil
}

func scenesModify(ctx context.Context, c DBClient, gateway gateway.File) error {

	collection := c.WithCollection("project").Client()
	cur, err := collection.Find(ctx, bson.M{
		"publishmentstatus": bson.M{"$in": bson.A{"public", "limited"}},
	})
	if err != nil {
		return err
	}
	defer cur.Close(ctx)

	for cur.Next(ctx) {
		var doc bson.M
		if err := cur.Decode(&doc); err != nil {
			continue
		}

		alias, ok := doc["alias"].(string)
		if !ok {
			continue
		}

		rc, err := gateway.ReadBuiltSceneFile(ctx, alias)
		if err != nil {
			fmt.Println("!!!!!!! failed to ReadBuiltSceneFile:", err)
			continue
		}
		b, err := io.ReadAll(rc)
		if err != nil {
			fmt.Println("!!!!!!! read error")
			continue
		}
		if !json.Valid(b) {
			fmt.Println("!!!!!!! invalid JSON")
			continue
		}

		var sceneData map[string]interface{}
		if err := json.Unmarshal(b, &sceneData); err != nil {
			fmt.Println("!!!!!!! failed to unmarshal JSON:", err)
			continue
		}

		if changed := change(sceneData); changed {
			updatedJSON, err := json.MarshalIndent(sceneData, "", "  ")
			if err != nil {
				fmt.Println("!!!!!!! failed to marshal updated JSON:", err)
				continue
			}

			fmt.Printf("Updated scene for alias %s:\n%s\n", alias, string(updatedJSON))

			updatedReader := bytes.NewReader(updatedJSON)
			if err = gateway.UploadBuiltScene(ctx, updatedReader, alias); err != nil {
				fmt.Println(fmt.Errorf("!!!!!!! failed to upload updated scene for alias %s: %v", alias, err))
				continue
			}

			log.Printf("Successfully updated tile_type from esri_world_topo to default for alias: %s", alias)

		}
	}

	return nil
}

func storiesModify(ctx context.Context, c DBClient, gateway gateway.File) error {

	collection := c.WithCollection("storytelling").Client()
	cur, err := collection.Find(ctx, bson.M{
		"status": bson.M{"$in": bson.A{"public", "limited"}},
	})
	if err != nil {
		return err
	}
	defer cur.Close(ctx)

	for cur.Next(ctx) {
		var doc bson.M
		if err := cur.Decode(&doc); err != nil {
			continue
		}

		alias, ok := doc["alias"].(string)
		if !ok {
			continue
		}

		rc, err := gateway.ReadStoryFile(ctx, alias)
		if err != nil {
			fmt.Println("!!!!!!! failed to ReadBuiltSceneFile:", err)
			continue
		}
		b, err := io.ReadAll(rc)
		if err != nil {
			fmt.Println("!!!!!!! read error")
			continue
		}
		if !json.Valid(b) {
			fmt.Println("!!!!!!! invalid JSON")
			continue
		}

		var storyData map[string]interface{}
		if err := json.Unmarshal(b, &storyData); err != nil {
			fmt.Println("!!!!!!! failed to unmarshal JSON:", err)
			continue
		}

		if changed := change(storyData); changed {
			updatedJSON, err := json.MarshalIndent(storyData, "", "  ")
			if err != nil {
				fmt.Println("!!!!!!! failed to marshal updated JSON:", err)
				continue
			}

			fmt.Printf("Updated story for alias %s:\n%s\n", alias, string(updatedJSON))

			updatedReader := bytes.NewReader(updatedJSON)
			if err = gateway.UploadStory(ctx, updatedReader, alias); err != nil {
				fmt.Println(fmt.Errorf("!!!!!!! failed to upload updated story for alias %s: %v", alias, err))
				continue
			}

			log.Printf("Successfully updated tile_type from esri_world_topo to default for alias: %s", alias)

		}
	}

	return nil
}

func change(data map[string]interface{}) bool {
	modified := false
	if property, ok := data["property"].(map[string]interface{}); ok {
		if tiles, ok := property["tiles"].([]interface{}); ok {
			for _, tile := range tiles {
				if tileMap, ok := tile.(map[string]interface{}); ok {
					if tileType, ok := tileMap["tile_type"].(string); ok && tileType == "esri_world_topo" {
						tileMap["tile_type"] = "default"
						modified = true
					}
				}
			}
		}
	}
	return modified
}

func initFile(ctx context.Context, conf *config.Config) (fileRepo gateway.File) {
	var err error
	if conf.GCS.IsConfigured() {
		log.Infofc(ctx, "file: GCS storage is used: %s\n", conf.GCS.BucketName)
		fileRepo, err = gcs.NewFile(false, conf.GCS.BucketName, conf.AssetBaseURL, conf.GCS.PublicationCacheControl)
		if err != nil {
			log.Warnf("file: failed to init GCS storage: %s\n", err.Error())
		}
		return

	}

	if conf.S3.IsConfigured() {
		log.Infofc(ctx, "file: S3 storage is used: %s\n", conf.S3.BucketName)
		fileRepo, err = s3.NewS3(ctx, conf.S3.BucketName, conf.AssetBaseURL, conf.S3.PublicationCacheControl)
		if err != nil {
			log.Warnf("file: failed to init S3 storage: %s\n", err.Error())
		}
		return
	}

	log.Infof("file: local storage is used")
	afs := afero.NewBasePathFs(afero.NewOsFs(), "data")
	fileRepo, err = fs.NewFile(afs, conf.AssetBaseURL)
	if err != nil {
		log.Fatalf("file: init error: %+v", err)
	}
	return fileRepo
}
