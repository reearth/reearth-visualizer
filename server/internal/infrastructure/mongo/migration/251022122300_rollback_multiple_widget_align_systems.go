package migration

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
)

func RollbackMultipleWidgetAlignSystems(ctx context.Context, c DBClient) error {

	filter := bson.M{
		"alignsystems": bson.M{"$exists": true},
	}
	collection := c.WithCollection("scene").Client()

	cur, err := collection.Find(ctx, filter)
	if err != nil {
		return err
	}
	defer cur.Close(ctx)

	for cur.Next(ctx) {
		var doc bson.M
		if err := cur.Decode(&doc); err != nil {
			continue
		}

		alignsystems, ok := doc["alignsystems"].(bson.M)
		if !ok {
			continue
		}

		// Extract desktop and mobile from alignsystems
		desktop, hasDesktop := alignsystems["desktop"]
		if !hasDesktop {
			continue
		}

		mobile := alignsystems["mobile"]

		// Create alignsystem field with inner/outer from desktop, plus desktop and mobile fields
		alignsystem := bson.M{
			"desktop": desktop,
			"mobile":  mobile,
		}

		// If desktop has inner/outer, copy them to the same level
		if desktopMap, ok := desktop.(bson.M); ok {
			if inner, hasInner := desktopMap["inner"]; hasInner {
				alignsystem["inner"] = inner
			}
			if outer, hasOuter := desktopMap["outer"]; hasOuter {
				alignsystem["outer"] = outer
			}
		}

		// Set alignsystem field but keep alignsystems with both desktop and mobile
		update := bson.M{
			"$set": bson.M{
				"alignsystem": alignsystem,
			},
		}

		_, err := collection.UpdateOne(
			ctx,
			bson.M{"_id": doc["_id"]},
			update,
		)
		if err != nil {
			continue
		}
	}

	return cur.Err()
}
