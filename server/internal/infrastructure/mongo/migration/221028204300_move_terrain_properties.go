package migration

import (
	"context"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

func MoveTerrainProperties(ctx context.Context, c DBClient) error {
	col := c.WithCollection("property")
	fields := []property.FieldID{
		"terrain",
		"terrainType",
		"terrainExaggeration",
		"terrainExaggerationRelativeHeight",
		"depthTestAgainstTerrain",
	}

	diff := property.SchemaDiff{
		Moved: lo.Map(fields, func(f property.FieldID, _ int) property.SchemaDiffMoved {
			return property.SchemaDiffMoved{
				From: property.SchemaFieldPointer{
					SchemaGroup: "default",
					Field:       f,
				},
				To: property.SchemaFieldPointer{
					SchemaGroup: "terrain",
					Field:       f,
				},
			}
		}),
	}

	return col.Find(ctx, bson.M{
		"$or": []bson.M{
			{
				"schema": "reearth/cesium",
			},
			{
				"schemaplugin": "reearth",
				"schemaname":   "cesium",
			},
		},
	}, &mongox.BatchConsumer{
		Size: 1000,
		Callback: func(rows []bson.Raw) error {
			ids := make([]string, 0, len(rows))
			newRows := make([]interface{}, 0, len(rows))

			log.Infofc(ctx, "migration: MoveTerrainProperties: hit properties: %d\n", len(rows))

			for _, row := range rows {
				var doc mongodoc.PropertyDocument
				if err := bson.Unmarshal(row, &doc); err != nil {
					return err
				}

				p, err := doc.Model()
				if err != nil {
					return err
				}

				if diff.Migrate(p) {
					ids = append(ids, doc.ID)
					doc2, _ := mongodoc.NewProperty(p)
					newRows = append(newRows, doc2)
				}
			}

			return col.SaveAll(ctx, ids, newRows)
		},
	})
}
