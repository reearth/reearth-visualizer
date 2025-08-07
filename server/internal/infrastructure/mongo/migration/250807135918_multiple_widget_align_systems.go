package migration

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
)

func MultipleWidgetAlignSystems(ctx context.Context, c DBClient) error {
	// alignsystemフィールドが存在するドキュメントのみを対象とする
	filter := bson.M{
		"alignsystem": bson.M{"$exists": true},
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

		alignsystem, ok := doc["alignsystem"]
		if !ok {
			continue
		}

		alignsystems := bson.M{
			"desktop": alignsystem,
			"mobile":  bson.M{},
		}

		update := bson.M{
			"$set": bson.M{
				"alignsystems": alignsystems,
			},
			"$unset": bson.M{
				"alignsystem": "",
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
