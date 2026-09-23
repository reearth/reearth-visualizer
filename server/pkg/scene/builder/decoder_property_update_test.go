package builder

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/internal/infrastructure/memory"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// countingPropertyRepo wraps a repo.Property and counts how many times Save was called,
// including through Filtered, which PropertyUpdate always goes through.
type countingPropertyRepo struct {
	repo.Property
	saves *int
}

func (r *countingPropertyRepo) Filtered(f repo.SceneFilter) repo.Property {
	return &countingPropertyRepo{Property: r.Property.Filtered(f), saves: r.saves}
}

func (r *countingPropertyRepo) Save(ctx context.Context, p *property.Property) error {
	*r.saves++
	return r.Property.Save(ctx, p)
}

// TestPropertyUpdate_SavesOnceRegardlessOfFieldCount is a regression test for SCA-06: Save used
// to sit in the innermost field loop, so a property with N fields across schema groups and list
// items issued N full-document upserts to build up one property. This confirms every field still
// lands correctly on the saved property, but in a single Save call no matter how many fields or
// list items were touched.
func TestPropertyUpdate_SavesOnceRegardlessOfFieldCount(t *testing.T) {
	ctx := context.Background()
	sceneID := id.NewSceneID()

	schema := builtin.GetPropertySchema(builtin.PropertySchemaIDVisualizerCesium)
	require.NotNil(t, schema)

	p := property.New().NewID().Scene(sceneID).Schema(schema.ID()).MustBuild()

	saves := 0
	propertyRepo := &countingPropertyRepo{Property: memory.NewPropertyWith(p), saves: &saves}
	propertySchemaRepo := memory.NewPropertySchemaWith(schema)

	// A direct schema-group field (map case) plus a list-item field (list case), so both loop
	// shapes in PropertyUpdate are exercised in one call.
	var listGroupID string
	for _, sg := range schema.Groups().Groups() {
		if sg.IsList() {
			listGroupID = sg.ID().String()
			break
		}
	}
	require.NotEmpty(t, listGroupID, "test schema must have at least one list group")

	stringValue := func(v string) map[string]interface{} {
		return map[string]interface{}{"type": "string", "value": v}
	}
	data := propertyJSON{
		listGroupID: []interface{}{
			map[string]interface{}{
				"id":        "item-0",
				"tile_type": stringValue("default"),
				"tile_url":  stringValue("https://example.com/tiles"),
			},
		},
	}

	PropertyUpdate(ctx, p, propertyRepo, propertySchemaRepo, data)

	assert.LessOrEqual(t, saves, 1, "PropertyUpdate must issue at most one Save regardless of how many fields/list items it touched")

	got, err := propertyRepo.FindByID(ctx, p.ID())
	require.NoError(t, err)
	require.NotNil(t, got.GroupListBySchema(id.PropertySchemaGroupID(listGroupID)))
	assert.Len(t, got.GroupListBySchema(id.PropertySchemaGroupID(listGroupID)).Groups(), 1,
		"the list item added during the update must actually be persisted")
}

// TestPropertyUpdate_NoChangesSkipsSave confirms an empty update does not issue a Save at all,
// matching the pre-batching behavior where the field loop (and its Save call) simply never ran.
func TestPropertyUpdate_NoChangesSkipsSave(t *testing.T) {
	ctx := context.Background()
	sceneID := id.NewSceneID()

	schema := builtin.GetPropertySchema(builtin.PropertySchemaIDVisualizerCesium)
	require.NotNil(t, schema)

	p := property.New().NewID().Scene(sceneID).Schema(schema.ID()).MustBuild()

	saves := 0
	propertyRepo := &countingPropertyRepo{Property: memory.NewPropertyWith(p), saves: &saves}
	propertySchemaRepo := memory.NewPropertySchemaWith(schema)

	PropertyUpdate(ctx, p, propertyRepo, propertySchemaRepo, propertyJSON{})

	assert.Equal(t, 0, saves, "an update with no data should not write anything")
}
