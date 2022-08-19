package mongo

import (
	"context"
	"encoding/hex"
	"os"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/x/mongo/driver/uuid"
)

func connect(t *testing.T) func(*testing.T) *mongo.Database {
	t.Helper()

	// Skip unit testing if "REEARTH_DB" is not configured
	// See details: https://github.com/reearth/reearth/issues/273
	db := os.Getenv("REEARTH_DB")
	if db == "" {
		t.SkipNow()
		return nil
	}

	c, _ := mongo.Connect(
		context.Background(),
		options.Client().
			ApplyURI(db).
			SetConnectTimeout(time.Second*10),
	)

	return func(t *testing.T) *mongo.Database {
		t.Helper()

		database, _ := uuid.New()
		databaseName := "reearth-test-" + hex.EncodeToString(database[:])
		d := c.Database(databaseName)

		t.Cleanup(func() {
			_ = d.Drop(context.Background())
		})

		return d
	}
}
