package migration

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/mongox/mongotest"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
)

func init() {
	mongotest.Env = "REEARTH_DB"
}

func TestMoveTerrainProperties(t *testing.T) {
	db := mongotest.Connect(t)(t)
	cl := mongox.NewClientWithDatabase(db)
	ctx := context.Background()

	sid := id.NewSceneID()
	iid := id.NewPropertyItemID()
	pid1, pid2, pid3 := id.NewPropertyID(), id.NewPropertyID(), id.NewPropertyID()

	// insert seeds
	_, _ = db.Collection("property").InsertMany(ctx, []any{
		mongodoc.PropertyDocument{
			ID:           pid1.String(),
			Scene:        sid.String(),
			SchemaPlugin: "reearth",
			SchemaName:   "cesium",
			Items: []*mongodoc.PropertyItemDocument{
				{
					ID:          iid.String(),
					Type:        "group",
					SchemaGroup: "default",
					Fields: []*mongodoc.PropertyFieldDocument{
						{Field: "terrain", Type: "bool", Value: true},
						{Field: "terrainType", Type: "string", Value: "cesium"},
						{Field: "terrainExaggeration", Type: "number", Value: 2.0},
						{Field: "terrainExaggerationRelativeHeight", Type: "number", Value: 1.0},
						{Field: "depthTestAgainstTerrain", Type: "bool", Value: true},
					},
				},
			},
		},
		mongodoc.PropertyDocument{
			ID:           pid2.String(),
			Scene:        sid.String(),
			Schema:       "reearth/cesium",
			SchemaPlugin: "reearth",
			SchemaName:   "cesium",
			Items: []*mongodoc.PropertyItemDocument{
				{
					ID:          iid.String(),
					Type:        "group",
					SchemaGroup: "default",
					Fields: []*mongodoc.PropertyFieldDocument{
						{Field: "aaa", Type: "bool", Value: true},
					},
				},
			},
		},
		mongodoc.PropertyDocument{
			ID:           pid3.String(),
			Scene:        sid.String(),
			SchemaPlugin: "reearth",
			SchemaName:   "cesium",
			Items: []*mongodoc.PropertyItemDocument{
				{
					ID:          iid.String(),
					Type:        "group",
					SchemaGroup: "default",
					Fields: []*mongodoc.PropertyFieldDocument{
						{Field: "aaa", Type: "bool", Value: true},
						{Field: "terrain", Type: "bool", Value: true},
					},
				},
			},
		},
	})

	// migrate
	assert.NoError(t, MoveTerrainProperties(ctx, cl))

	// assert migrated docs
	cur, err := db.Collection("property").Find(ctx, bson.M{})
	assert.NoError(t, err)
	var res []mongodoc.PropertyDocument
	assert.NoError(t, cur.All(ctx, &res))

	assert.Equal(t, []mongodoc.PropertyDocument{
		{
			ID:           pid1.String(),
			Scene:        sid.String(),
			SchemaPlugin: "reearth",
			SchemaName:   "cesium",
			Items: []*mongodoc.PropertyItemDocument{
				{
					ID:          iid.String(),
					Type:        "group",
					SchemaGroup: "default",
					Fields:      []*mongodoc.PropertyFieldDocument{},
				},
				{
					ID:          res[0].Items[1].ID,
					Type:        "group",
					SchemaGroup: "terrain",
					Fields: []*mongodoc.PropertyFieldDocument{
						{Field: "terrain", Type: "bool", Value: true},
						{Field: "terrainType", Type: "string", Value: "cesium"},
						{Field: "terrainExaggeration", Type: "number", Value: 2.0},
						{Field: "terrainExaggerationRelativeHeight", Type: "number", Value: 1.0},
						{Field: "depthTestAgainstTerrain", Type: "bool", Value: true},
					},
				},
			},
		},
		{
			ID:           pid2.String(),
			Scene:        sid.String(),
			Schema:       "reearth/cesium",
			SchemaPlugin: "reearth",
			SchemaName:   "cesium",
			Items: []*mongodoc.PropertyItemDocument{
				{
					ID:          iid.String(),
					Type:        "group",
					SchemaGroup: "default",
					Fields: []*mongodoc.PropertyFieldDocument{
						{Field: "aaa", Type: "bool", Value: true},
					},
				},
			},
		},
		{
			ID:           pid3.String(),
			Scene:        sid.String(),
			SchemaPlugin: "reearth",
			SchemaName:   "cesium",
			Items: []*mongodoc.PropertyItemDocument{
				{
					ID:          iid.String(),
					Type:        "group",
					SchemaGroup: "default",
					Fields: []*mongodoc.PropertyFieldDocument{
						{Field: "aaa", Type: "bool", Value: true},
					},
				},
				{
					ID:          res[2].Items[1].ID,
					Type:        "group",
					SchemaGroup: "terrain",
					Fields: []*mongodoc.PropertyFieldDocument{
						{Field: "terrain", Type: "bool", Value: true},
					},
				},
			},
		},
	}, res)
}
