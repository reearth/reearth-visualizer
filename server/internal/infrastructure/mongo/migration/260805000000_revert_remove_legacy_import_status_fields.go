package migration

import (
	"context"
	"fmt"
	"time"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// phase1RolloutDate is when MoveImportStatusToOwnCollection (Phase 1) first
// started writing to projectimport. Only projectimport documents updated on
// or after this date can have values worth restoring - anything older
// predates projectimport entirely.
var phase1RolloutDate = time.Date(2026, 7, 1, 0, 0, 0, 0, time.UTC)

// RevertRemoveLegacyImportStatusFields reverts RemoveLegacyImportStatusFields.
// For every projectimport document updated on or after Phase 1's rollout, it
// writes the status/result log back onto the corresponding projectmetadata
// document's legacy importstatus/importresultlog fields.
//
// NOTE: This is a revert/rollback migration and should NOT be added to
// migrations.go unless you need to actually revert RemoveLegacyImportStatusFields
// in production.
func RevertRemoveLegacyImportStatusFields(ctx context.Context, c DBClient) error {
	importCol := c.WithCollection("projectimport")
	metadataCol := c.Database().Collection("projectmetadata")

	filter := bson.M{
		"updatedat": bson.M{"$gte": phase1RolloutDate},
	}

	var totalRestored int

	err := importCol.Find(ctx, filter, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			var writes []mongo.WriteModel

			for _, row := range rows {
				var doc mongodoc.ProjectImportDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					fmt.Printf("[revert migration] RevertRemoveLegacyImportStatusFields: failed to unmarshal projectimport row: %v\n", err)
					continue
				}
				if doc.Project == "" {
					continue
				}

				set := bson.M{}
				if doc.Status != nil {
					set["importstatus"] = *doc.Status
				}
				if doc.ResultLog != nil {
					set["importresultlog"] = *doc.ResultLog
				}
				if len(set) == 0 {
					continue
				}

				writes = append(writes, mongo.NewUpdateOneModel().
					SetFilter(bson.M{"project": doc.Project}).
					SetUpdate(bson.M{"$set": set}))
				totalRestored++
			}

			if len(writes) > 0 {
				fmt.Printf("[revert migration] RevertRemoveLegacyImportStatusFields: restoring legacy fields for %d projects\n", len(writes))
				if _, err := metadataCol.BulkWrite(ctx, writes); err != nil {
					return fmt.Errorf("failed to restore legacy import fields: %w", err)
				}
			}

			return nil
		},
	})

	fmt.Printf("[revert migration] RevertRemoveLegacyImportStatusFields: total restored=%d\n", totalRestored)
	return err
}
