package migration

import (
	"context"
	"fmt"
	"log"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AddProjectMetadataJob struct {
	ctx    context.Context
	client DBClient
}

const (
	projectCollection         = "project"
	projectMetadataCollection = "projectmetadata"
	defaultImportStatus       = "NONE"
)

func AddProjectMetadata(ctx context.Context, c DBClient) error {
	job := &AddProjectMetadataJob{
		ctx:    ctx,
		client: c,
	}
	return job.Process()
}

func (j *AddProjectMetadataJob) Process() error {
	opts := options.Find().SetBatchSize(batchSize)
	cursor, err := j.client.WithCollection(projectCollection).Client().Find(j.ctx, bson.M{}, opts)
	if err != nil {
		return fmt.Errorf("failed to find documents in %s: %w", projectCollection, err)
	}
	defer func() {
		if closeErr := cursor.Close(j.ctx); closeErr != nil {
			log.Printf("Error closing cursor: %v\n", closeErr)
		}
	}()

	var batch []map[string]any
	for cursor.Next(j.ctx) {
		var rawData map[string]any
		if err := cursor.Decode(&rawData); err != nil {
			log.Printf("Error decoding document: %v\n", err)
			continue
		}
		batch = append(batch, rawData)
		if len(batch) >= batchSize {
			if err := j.processBatch(batch); err != nil {
				log.Printf("Error processing batch: %v\n", err)
			}
			batch = nil
		}
	}
	if len(batch) > 0 {
		if err := j.processBatch(batch); err != nil {
			log.Printf("Error processing final batch: %v\n", err)
		}
	}
	if err := cursor.Err(); err != nil {
		return fmt.Errorf("cursor error: %w", err)
	}
	return nil
}

func (j *AddProjectMetadataJob) processBatch(batch []map[string]any) error {
	coll := j.client.WithCollection(projectMetadataCollection).Client()
	var writes []interface{}
	for _, doc := range batch {
		id, _ := doc["id"].(string)
		team, _ := doc["team"].(string)
		timeRaw, _ := doc["updatedat"].(primitive.DateTime)
		timeVal := timeRaw.Time()

		metaDoc := bson.M{
			"id":           uuid.New().String(),
			"workspace":    team,
			"project":      id,
			"importstatus": defaultImportStatus,
			"readme":       nil,
			"license":      nil,
			"createdat":    timeVal,
			"updatedat":    timeVal,
		}
		writes = append(writes, metaDoc)
	}
	if len(writes) > 0 {
		_, err := coll.InsertMany(j.ctx, writes)
		if err != nil {
			return fmt.Errorf("failed to insert metadata batch: %w", err)
		}
	}
	return nil
}
