package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// go test -v -run TestMultipleWidgetAlignSystems ./internal/infrastructure/mongo/migration/...

func TestMultipleWidgetAlignSystems(t *testing.T) {
	t.Parallel()

	db := mongotest.Connect(t)(t)
	c := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	cl := c.WithCollection("scene").Client()

	// Clean slate
	if err := cl.Drop(ctx); err != nil {
		t.Fatalf("drop collection: %v", err)
	}

	// Seed: one doc WITH alignsystem, one WITHOUT (should be untouched).
	origAlignSystem := bson.M{
		"inner": bson.M{
			"left": bson.M{
				"top": bson.M{
					"widgetIds": primitive.A{"w1", "w2"},
					"align":     "START",
				},
			},
		},
		"outer": bson.M{},
	}

	id1 := primitive.NewObjectID()
	_, err := cl.InsertOne(ctx, bson.M{
		"_id":         id1,
		"id":          "scn-test-1",
		"alignsystem": origAlignSystem,
	})
	if err != nil {
		t.Fatalf("insert doc1: %v", err)
	}

	id2 := primitive.NewObjectID()
	_, err = cl.InsertOne(ctx, bson.M{
		"_id": id2,
		"id":  "scn-test-2",
		// no alignsystem
	})
	if err != nil {
		t.Fatalf("insert doc2: %v", err)
	}

	// Run migration
	if err := MultipleWidgetAlignSystems(ctx, c); err != nil {
		t.Fatalf("migration error: %v", err)
	}

	// Verify doc1
	var got1 bson.M
	if err := cl.FindOne(ctx, bson.M{"_id": id1}).Decode(&got1); err != nil {
		t.Fatalf("find doc1: %v", err)
	}

	// alignsystem should be removed
	if _, ok := got1["alignsystem"]; ok {
		t.Fatalf("alignsystem should be unset, but present: %#v", got1["alignsystem"])
	}

	// alignsystems should exist
	as, ok := got1["alignsystems"].(bson.M)
	if !ok {
		t.Fatalf("alignsystems missing or wrong type: %#v", got1["alignsystems"])
	}

	// desktop should match original
	desktop, ok := as["desktop"].(bson.M)
	if !ok {
		t.Fatalf("alignsystems.desktop missing or wrong type: %#v", as["desktop"])
	}
	if got, want := desktop["inner"], origAlignSystem["inner"]; !bsonEqual(got, want) {
		t.Fatalf("desktop.inner mismatch\n got: %#v\nwant: %#v", got, want)
	}
	if got, want := desktop["outer"], origAlignSystem["outer"]; !bsonEqual(got, want) {
		t.Fatalf("desktop.outer mismatch\n got: %#v\nwant: %#v", got, want)
	}

	// mobile should exist and be nil
	if _, mobilePresent := as["mobile"]; !mobilePresent {
		t.Fatalf("alignsystems.mobile should exist (null), but absent")
	}
	if as["mobile"] != nil {
		t.Fatalf("alignsystems.mobile should be nil (null), got: %#v", as["mobile"])
	}

	// Verify doc2: untouched
	var got2 bson.M
	if err := cl.FindOne(ctx, bson.M{"_id": id2}).Decode(&got2); err != nil {
		t.Fatalf("find doc2: %v", err)
	}
	if _, ok := got2["alignsystems"]; ok {
		t.Fatalf("doc2 should not have been migrated: %#v", got2["alignsystems"])
	}
}

// bsonEqual provides minimal structural equality for values decoded as interface{}.
func bsonEqual(a, b interface{}) bool {
	if a == nil || b == nil {
		return a == b
	}
	switch va := a.(type) {
	case bson.M:
		vb, ok := b.(bson.M)
		if !ok || len(va) != len(vb) {
			return false
		}
		for k, va2 := range va {
			if !bsonEqual(va2, vb[k]) {
				return false
			}
		}
		return true
	case primitive.A:
		vb, ok := b.(primitive.A)
		if !ok || len(va) != len(vb) {
			return false
		}
		for i := range va {
			if !bsonEqual(va[i], vb[i]) {
				return false
			}
		}
		return true
	case []interface{}:
		vb, ok := b.([]interface{})
		if !ok || len(va) != len(vb) {
			return false
		}
		for i := range va {
			if !bsonEqual(va[i], vb[i]) {
				return false
			}
		}
		return true
	default:
		return va == b
	}
}
