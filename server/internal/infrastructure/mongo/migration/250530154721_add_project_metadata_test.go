package migration

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestAddProjectMetadata ./internal/infrastructure/mongo/migration/...

func TestAddProjectMetadata(t *testing.T) {
	db := mongotest.Connect(t)(t)
	client := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	_ = client.WithCollection(projectCollection).Client().Drop(ctx)
	_ = client.WithCollection(projectMetadataCollection).Client().Drop(ctx)

	projects := []interface{}{
		bson.M{
			"id":        "proj1",
			"team":      "team1",
			"updatedat": primitive.NewDateTimeFromTime(time.Now()),
		},
		bson.M{
			"id":        "proj2",
			"team":      "team2",
			"updatedat": primitive.NewDateTimeFromTime(time.Now()),
		},
	}
	_, err := client.WithCollection(projectCollection).Client().InsertMany(ctx, projects)
	if err != nil {
		t.Fatalf("failed to insert test projects: %v", err)
	}

	err = AddProjectMetadata(ctx, client)
	if err != nil {
		t.Fatalf("AddProjectMetadata failed: %v", err)
	}

	// check -----
	cur, err := client.WithCollection(projectMetadataCollection).Client().Find(ctx, bson.M{})
	if err != nil {
		t.Fatalf("failed to find projectmetadata documents: %v", err)
	}
	defer cur.Close(ctx)

	count := 0
	for cur.Next(ctx) {
		count++
		var meta bson.M
		if err := cur.Decode(&meta); err != nil {
			t.Fatalf("failed to decode metadata document: %v", err)
		}

		if meta["project"] != "proj1" && meta["project"] != "proj2" {
			t.Errorf("unexpected project ID in metadata: %v", meta["project"])
		}
		if meta["importstatus"] != defaultImportStatus {
			t.Errorf("unexpected importstatus, got: %v", meta["importstatus"])
		}
		if meta["readme"] != nil {
			t.Errorf("readme should be nil initially, got: %v", meta["readme"])
		}
		if meta["license"] != nil {
			t.Errorf("license should be nil initially, got: %v", meta["license"])
		}
	}
	if count != 2 {
		t.Errorf("expected 2 metadata documents, got %d", count)
	}
}
