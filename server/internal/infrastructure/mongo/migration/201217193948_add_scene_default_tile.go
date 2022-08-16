package migration

import (
	"context"

	"github.com/reearth/reearth-backend/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-backend/pkg/builtin"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/log"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/visualizer"
	"go.mongodb.org/mongo-driver/bson"
)

var scenePropertySchema = builtin.MustPropertySchemaByVisualizer(visualizer.VisualizerCesium)

func AddSceneDefaultTile(ctx context.Context, c DBClient) error {
	col := c.WithCollection("property")

	psid := scenePropertySchema.ID().String()
	filter := bson.M{
		"$or": bson.A{
			bson.M{"schema": psid, "items": bson.A{}},
			bson.M{"schema": psid, "items": bson.M{"$exists": false}},
			bson.M{
				"schema": psid,
				"items": bson.M{
					"$not": bson.M{
						"$elemMatch": bson.M{
							"schemagroup": "tiles",
						},
					},
				},
			},
			bson.M{
				"schema": psid,
				"items": bson.M{
					"$elemMatch": bson.M{
						"schemagroup": "tiles",
						"groups":      bson.A{},
					},
				},
			},
		},
	}

	log.Infof("migration: AddSceneDefaultTile: filter: %+v\n", filter)

	return col.Find(ctx, filter, &mongodoc.PropertyBatchConsumer{
		Size: 1000,
		Callback: func(properties []*property.Property) error {
			log.Infof("migration: AddSceneDefaultTile: hit properties: %d\n", len(properties))

			for _, p := range properties {
				g := p.GetOrCreateGroupList(scenePropertySchema, property.PointItemBySchema(id.PropertySchemaGroupID("tiles")))
				if g == nil || g.Count() > 0 {
					continue
				}
				f := property.NewGroup().NewID().SchemaGroup(id.PropertySchemaGroupID("tiles")).MustBuild()
				g.Add(f, -1)
			}

			docs, ids := mongodoc.NewProperties(properties, nil)

			return col.SaveAll(ctx, ids, docs)
		},
	})
}
