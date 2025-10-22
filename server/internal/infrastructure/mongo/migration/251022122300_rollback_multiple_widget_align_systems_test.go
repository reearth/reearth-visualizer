package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestRollbackMultipleWidgetAlignSystems(t *testing.T) {
	t.Parallel()

	db := mongotest.Connect(t)(t)
	c := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	cl := c.WithCollection("scene").Client()

	// Clean slate
	if err := cl.Drop(ctx); err != nil {
		t.Fatalf("drop collection: %v", err)
	}

	// Seed: one doc WITH alignsystems (migrated state), one WITHOUT (should be untouched).
	desktopAlignSystem := bson.M{
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
		"_id": id1,
		"id":  "scn-test-1",
		"alignsystems": bson.M{
			"desktop": desktopAlignSystem,
			"mobile":  nil,
		},
	})
	if err != nil {
		t.Fatalf("insert doc1: %v", err)
	}

	id2 := primitive.NewObjectID()
	_, err = cl.InsertOne(ctx, bson.M{
		"_id": id2,
		"id":  "scn-test-2",
		// no alignsystems - already in old format or never had align system
	})
	if err != nil {
		t.Fatalf("insert doc2: %v", err)
	}

	// Run rollback migration
	if err := RollbackMultipleWidgetAlignSystems(ctx, c); err != nil {
		t.Fatalf("migration error: %v", err)
	}

	// Verify doc1
	var got1 bson.M
	if err := cl.FindOne(ctx, bson.M{"_id": id1}).Decode(&got1); err != nil {
		t.Fatalf("find doc1: %v", err)
	}

	// alignsystems should STILL be present (not removed)
	alignsystems, ok := got1["alignsystems"].(bson.M)
	if !ok {
		t.Fatalf("alignsystems should still be present: %#v", got1["alignsystems"])
	}

	// desktop and mobile should still be in alignsystems
	desktop, ok := alignsystems["desktop"].(bson.M)
	if !ok {
		t.Fatalf("alignsystems.desktop should still be present: %#v", alignsystems["desktop"])
	}
	if got, want := desktop["inner"], desktopAlignSystem["inner"]; !bsonEqual(got, want) {
		t.Fatalf("desktop.inner mismatch\n got: %#v\nwant: %#v", got, want)
	}
	if got, want := desktop["outer"], desktopAlignSystem["outer"]; !bsonEqual(got, want) {
		t.Fatalf("desktop.outer mismatch\n got: %#v\nwant: %#v", got, want)
	}

	// mobile should still exist
	if _, mobilePresent := alignsystems["mobile"]; !mobilePresent {
		t.Fatalf("alignsystems.mobile should still exist")
	}

	// alignsystem should NOW exist with desktop, mobile, inner, and outer fields
	as, ok := got1["alignsystem"].(bson.M)
	if !ok {
		t.Fatalf("alignsystem missing or wrong type: %#v", got1["alignsystem"])
	}

	// alignsystem.desktop should match desktopAlignSystem
	asDesktop, ok := as["desktop"].(bson.M)
	if !ok {
		t.Fatalf("alignsystem.desktop missing or wrong type: %#v", as["desktop"])
	}
	if got, want := asDesktop["inner"], desktopAlignSystem["inner"]; !bsonEqual(got, want) {
		t.Fatalf("alignsystem.desktop.inner mismatch\n got: %#v\nwant: %#v", got, want)
	}
	if got, want := asDesktop["outer"], desktopAlignSystem["outer"]; !bsonEqual(got, want) {
		t.Fatalf("alignsystem.desktop.outer mismatch\n got: %#v\nwant: %#v", got, want)
	}

	// alignsystem.mobile should exist and be nil
	if _, mobilePresent := as["mobile"]; !mobilePresent {
		t.Fatalf("alignsystem.mobile should exist")
	}
	if as["mobile"] != nil {
		t.Fatalf("alignsystem.mobile should be nil, got: %#v", as["mobile"])
	}

	// alignsystem.inner should match desktopAlignSystem.inner (copied from desktop)
	if got, want := as["inner"], desktopAlignSystem["inner"]; !bsonEqual(got, want) {
		t.Fatalf("alignsystem.inner mismatch\n got: %#v\nwant: %#v", got, want)
	}

	// alignsystem.outer should match desktopAlignSystem.outer (copied from desktop)
	if got, want := as["outer"], desktopAlignSystem["outer"]; !bsonEqual(got, want) {
		t.Fatalf("alignsystem.outer mismatch\n got: %#v\nwant: %#v", got, want)
	}

	// Verify doc2: untouched
	var got2 bson.M
	if err := cl.FindOne(ctx, bson.M{"_id": id2}).Decode(&got2); err != nil {
		t.Fatalf("find doc2: %v", err)
	}
	if _, ok := got2["alignsystem"]; ok {
		t.Fatalf("doc2 should not have alignsystem: %#v", got2["alignsystem"])
	}
	if _, ok := got2["alignsystems"]; ok {
		t.Fatalf("doc2 should not have alignsystems: %#v", got2["alignsystems"])
	}
}
