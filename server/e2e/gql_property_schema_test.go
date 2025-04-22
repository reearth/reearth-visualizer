package e2e

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/builtin"
	"golang.org/x/text/language"
)

func TestPropertySchemaOrder(t *testing.T) {
	e := Server(t, baseSeeder)
	pId := createProject(e, uID, map[string]any{
		"name":        "test",
		"description": "abc",
		"teamId":      wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	_, _, sId := createScene(e, pId)
	res := getScene(e, sId, language.Und.String())

	propID := res.Path("$.property.id").Raw().(string)
	groupID := res.Path("$.property.items[0].groups[0].id").Raw().(string)

	_, r := updatePropertyValue(e, propID, "tiles", groupID, "tile_type", "open_street_map", "STRING")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual("open_street_map")

	_, r = updatePropertyValue(e, propID, "tiles", groupID, "tile_zoomLevel", []int{10, 20}, "ARRAY")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual([]*int{nil, nil})

	_, r = updatePropertyValue(e, propID, "tiles", groupID, "tile_opacity", 0.5, "NUMBER")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual(0.5)

	// 1. tile_type
	// 2. tile_zoomLevel
	// 3. tile_opacity

	res = getScene(e, sId, language.Und.String())
	fields := res.Path("$.property.items[0].groups[0].fields").Array()
	fields.Value(0).Object().Value("fieldId").IsEqual("tile_type")
	fields.Value(1).Object().Value("fieldId").IsEqual("tile_zoomLevel")
	fields.Value(2).Object().Value("fieldId").IsEqual("tile_opacity")

	// tile_opacity <=> tile_zoomLevel
	builtin.E2ETestChange()

	// 1. tile_type
	// 2. tile_opacity
	// 3. tile_zoomLevel

	res = getScene(e, sId, language.Und.String())
	fields = res.Path("$.property.items[0].groups[0].fields").Array()
	fields.Value(0).Object().Value("fieldId").IsEqual("tile_type")
	fields.Value(1).Object().Value("fieldId").IsEqual("tile_opacity")
	fields.Value(2).Object().Value("fieldId").IsEqual("tile_zoomLevel")
}
