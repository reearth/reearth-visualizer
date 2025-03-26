package migration

import (
	"context"
	"fmt"
	"log"
	"sync"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DeleteJunkDataJob struct {
	collections []string
}

func NewDeleteJunkDataJob() *DeleteJunkDataJob {
	return &DeleteJunkDataJob{
		collections: []string{"nlsLayer", "storytelling", "style", "property", "propertySchema", "plugin"},
	}
}

func DeleteJunkData(ctx context.Context, c DBClient) error {
	job := NewDeleteJunkDataJob()
	return job.Process(ctx, c)
}

func (j *DeleteJunkDataJob) Process(ctx context.Context, c DBClient) error {
	var wg sync.WaitGroup
	errCh := make(chan error, len(j.collections))

	for _, collectionName := range j.collections {
		wg.Add(1)
		go func(name string) {
			defer wg.Done()
			if err := j.processCollection(ctx, c, name); err != nil {
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

func (j *DeleteJunkDataJob) processCollection(ctx context.Context, c DBClient, collectionName string) error {
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
			if err := j.processBatch(ctx, c, collectionName, batch); err != nil {
				log.Printf("Error processing batch in %s: %v\n", collectionName, err)
			}
			batch = nil
		}
	}

	if len(batch) > 0 {
		if err := j.processBatch(ctx, c, collectionName, batch); err != nil {
			log.Printf("Error processing final batch in %s: %v\n", collectionName, err)
		}
	}

	if err := cursor.Err(); err != nil {
		return fmt.Errorf("cursor error in %s: %w", collectionName, err)
	}

	return nil
}

func (j *DeleteJunkDataJob) processBatch(ctx context.Context, c DBClient, collectionName string, batch []map[string]any) error {
	for _, rawData := range batch {
		id, _ := rawData["id"].(string)

		sceneID, ok := rawData["scene"].(string)
		if !ok {
			fmt.Println("[NG] Scene ID not found collectionName:", collectionName, "id", id, "Deleting...")
			_, err := c.WithCollection(collectionName).Client().DeleteOne(ctx, bson.M{"id": id})
			if err != nil {
				log.Printf("Failed to delete junk data (no scene field): %v\n", err)
			}
			continue
		}

		count, err := c.WithCollection("scene").Client().CountDocuments(ctx, bson.M{"id": sceneID})
		if err != nil {
			log.Printf("Error counting scene: %v\n", err)
			continue
		}

		if count == 0 {
			fmt.Println("[NG] Parent Scene ", sceneID, "not found collectionName:", collectionName, "id", id, "Deleting...")
			_, err := c.WithCollection(collectionName).Client().DeleteOne(ctx, bson.M{"id": id})
			if err != nil {
				log.Printf("Failed to delete junk data (missing scene): %v\n", err)
			}
			continue
		}

		fmt.Println("[OK] No problem collectionName:", collectionName, "id", id)
	}
	return nil
}
