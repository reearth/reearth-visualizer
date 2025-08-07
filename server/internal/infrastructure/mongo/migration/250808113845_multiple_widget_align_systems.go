package migration

import (
	"context"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo"
	"github.com/reearth/reearth/server/pkg/id"
	"go.mongodb.org/mongo-driver/bson"
)

func MultipleWidgetAlignSystems(ctx context.Context, c DBClient) error {

	filter := bson.M{
		"alignsystem": bson.M{"$exists": true},
	}
	collection := c.WithCollection("scene").Client()

	cur, err := collection.Find(ctx, filter)
	if err != nil {
		return err
	}
	defer cur.Close(ctx)

	sceneRepo := mongo.NewScene(c)

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
			"mobile":  nil, // Set to nil temporarily
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

		// --------------------------------------------------------
		// Once retrieved and saved, the mobile data will be stored
		idStr, ok := doc["id"].(string)
		if !ok {
			continue
		}
		sid, err := id.SceneIDFrom(idStr)
		if err != nil {
			continue
		}
		sce, err := sceneRepo.FindByID(ctx, sid)
		if err != nil {
			continue
		}
		err = sceneRepo.Save(ctx, sce)
		if err != nil {
			continue
		}

	}

	return cur.Err()
}
