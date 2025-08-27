package migration

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ChangeEsriToDefault(ctx context.Context, c DBClient) error {
	col := c.WithCollection("property").Client()

	filter := bson.M{
		"items.groups.fields.field": "tile_type",
		"items.groups.fields.value": "esri_world_topo",
	}

	countCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	n, err := col.CountDocuments(countCtx, filter)
	if err != nil {
		return fmt.Errorf("count failed: %w", err)
	}
	fmt.Printf("[migration] target documents: %d\n", n)
	if n == 0 {
		fmt.Println("[migration] nothing to do")
		return nil
	}

	update := bson.M{
		"$set": bson.M{
			"items.$[].groups.$[].fields.$[f].value": "default",
		},
	}
	arrayFilters := options.ArrayFilters{
		Filters: []interface{}{
			bson.M{"f.field": "tile_type", "f.value": "esri_world_topo"},
		},
	}
	opts := options.Update().SetArrayFilters(arrayFilters)

	updateCtx, cancel2 := context.WithTimeout(ctx, 30*time.Minute)
	defer cancel2()

	res, err := col.UpdateMany(updateCtx, filter, update, opts)
	if err != nil {
		var ce mongo.CommandError
		if ok := errors.As(err, &ce); ok {
			fmt.Printf("[migration] command error: %v (code=%d)\n", ce.Message, ce.Code)
		}
		return fmt.Errorf("update failed: %w", err)
	}

	fmt.Printf("[migration] Migration completed. Updated %d documents.\n", res.ModifiedCount)
	return nil
}
