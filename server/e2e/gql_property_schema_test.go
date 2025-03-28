package e2e

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/builtin"
	"golang.org/x/text/language"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestPropertySchemaOrder ./e2e/...

func TestPropertySchemaOrder(t *testing.T) {
	e := Server(t, baseSeeder)
	pId := createProject(e, "test")
	_, _, sId := createScene(e, pId)
	res := getScene(e, sId, language.Und.String())

	propID := res.Path("$.property.id").Raw().(string)
	groupID := res.Path("$.property.items[0].groups[0].id").Raw().(string)

	_, r := updatePropertyValue(e, propID, "tiles", groupID, "tile_type", "open_street_map", "STRING")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual("open_street_map") // OK

	_, r = updatePropertyValue(e, propID, "tiles", groupID, "tile_zoomLevel", []int{10, 20}, "ARRAY")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual([]*int{nil, nil}) // bug?

	_, r = updatePropertyValue(e, propID, "tiles", groupID, "tile_opacity", 0.5, "NUMBER")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual(0.5) // OK

	// 1. tile_type
	// 2. tile_zoomLevel
	// 3. tile_opacity

	res = getScene(e, sId, language.Und.String())
	fields := res.Path("$.property.items[0].groups[0].fields").Array()
	fields.Value(0).Object().Value("fieldId").IsEqual("tile_type")
	fields.Value(1).Object().Value("fieldId").IsEqual("tile_zoomLevel")
	fields.Value(2).Object().Value("fieldId").IsEqual("tile_opacity")

	data := `
id: reearth
system: true
name: Re:Earth Official Plugin
description: Official Plugin
author: Re:Earth
extensions:
  - id: cesium-beta
    name: Cesium Beta
    description: Description
    visualizer: cesium
    type: visualizer
    schema:
      groups:
        - id: default
          collection: main
          title: Main
          fields:
            - id: ion
              type: string
              title: Cesium Ion API access token
              description: Cesium Ion account users may use their personal API keys to be able to use their Cesium Ion assets(tile data, 3D data, etc) with their project.
            - id: vr
              type: bool
              title: VR
              description: Enable VR mode to split the screen into left and right.
        - id: tiles
          collection: tiles
          title: Tiles
          description: You may change the look of the Earth by obtaining map tile data and setting it here.
          list: true
          representativeField: tile_type
          fields:
            - id: tile_type
              type: string
              title: Tile type
              defaultValue: default
              placeholder: please enter tile type
              choices:
                - key: default
                  label: Default
                - key: default_label
                  label: Labelled
                - key: default_road
                  label: Road Map
                - key: open_street_map
                  label: OpenStreetMap
                - key: esri_world_topo
                  label: ESRI Topography
                - key: black_marble
                  label: Earth at night
                - key: japan_gsi_standard
                  label: Japan GSI Standard Map
                - key: url
                  label: URL
            - id: tile_url
              type: string
              title: Tile map URL
              availableIf:
                field: tile_type
                type: string
                value: url
              placeholder: please enter tile url

            - id: tile_opacity
              type: number
              title: Opacity
              description: "Change the opacity of the selected tile map. Min: 0 Max: 1"
              defaultValue: 1
              ui: slider
              min: 0
              max: 1
              placeholder: please enter tile opacity
            - id: tile_zoomLevel
              type: array
              title: Zoom level
              description: "Change the zoom level of the selected tile map. Min:0, Max:25"
              defaultValue: [0,25]
              ui: zoomLevel
              min: 0
              max: 25
              placeholder: please enter tile zoom level
`
	// tile_opacity <=> tile_zoomLevel

	// 1. tile_type
	// 2. tile_opacity
	// 3. tile_zoomLevel

	builtin.E2ETestChange([]byte(data))

	res = getScene(e, sId, language.Und.String())
	fields = res.Path("$.property.items[0].groups[0].fields").Array()
	fields.Value(0).Object().Value("fieldId").IsEqual("tile_type")
	fields.Value(1).Object().Value("fieldId").IsEqual("tile_opacity")
	fields.Value(2).Object().Value("fieldId").IsEqual("tile_zoomLevel")
}
