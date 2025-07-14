package e2e

import (
	"math/rand"
	"testing"
	"time"

	"github.com/gavv/httpexpect/v2"
)

func TestUpdateCustomProperties(t *testing.T) {
	e := Server(t, baseSeeder)
	pId := createProject(e, uID, map[string]any{
		"name":        "test",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	sId := createScene(e, pId)
	lId := addTestNLSLayerSimple(e, sId)

	proId1 := RandomString(10)
	fId1 := addTestGeoJSONFeature(e, lId, proId1)
	updateTestGeoJSONFeature(e, lId, fId1, proId1)

	proId2 := RandomString(10)
	fId2 := addTestGeoJSONFeature(e, lId, proId2)
	updateTestGeoJSONFeature(e, lId, fId2, proId2)

	// check GetScene
	res := getNewLayersOfScene(e, sId)
	JSONEqRegexpInterface(t, res.Path("$.sketch.customPropertySchema").Raw(), `
{
	"AAA": "Text_1",
	"BBB": "Int_2",
	"XXX": "URL_3",
	"YYY": "Boolean_4"
}`)
	JSONEqRegexpInterface(t, res.Path("$.sketch.featureCollection").Raw(), `
{
    "__typename": "FeatureCollection",
    "features": [
        {
            "__typename": "Feature",
            "geometry": {
                "__typename": "Point",
                "pointCoordinates": [
                    139.75315007107542,
                    35.68233694131118
                ],
                "type": "Point"
            },
            "id": ".*",
            "properties": {
                "AAA": "aaa",
                "BBB": 123,
                "XXX": "xxx",
                "YYY": true,
                "extrudedHeight": 0,
                "id": ".*",
                "positions": [
                    [
                        -3958794.0678944187,
                        3350992.944211698,
                        3699619.2576891473
                    ]
                ],
                "type": "marker"
            },
            "type": "Feature"
        },
        {
            "__typename": "Feature",
            "geometry": {
                "__typename": "Point",
                "pointCoordinates": [
                    139.75315007107542,
                    35.68233694131118
                ],
                "type": "Point"
            },
            "id": ".*",
            "properties": {
                "AAA": "aaa",
                "BBB": 123,
                "XXX": "xxx",
                "YYY": true,
                "extrudedHeight": 0,
                "id": ".*",
                "positions": [
                    [
                        -3958794.0678944187,
                        3350992.944211698,
                        3699619.2576891473
                    ]
                ],
                "type": "marker"
            },
            "type": "Feature"
        }
    ],
    "type": "FeatureCollection"
}`)
}

func TestChangeCustomPropertyTitle(t *testing.T) {
	e := Server(t, baseSeeder)

	pId := createProject(e, uID, map[string]any{
		"name":        "test",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	sId := createScene(e, pId)
	lId := addTestNLSLayerSimple(e, sId)

	// change XXX -> ZZZ
	requestBody := GraphQLRequest{
		OperationName: "ChangeCustomPropertyTitle",
		Query: `
			mutation ChangeCustomPropertyTitle($input: ChangeCustomPropertyTitleInput!) {
				changeCustomPropertyTitle(input: $input) {
					layer {
						id
					}
				}
			}
		`,
		Variables: map[string]any{
			"input": map[string]interface{}{
				"layerId": lId,
				"schema": map[string]any{
					"AAA": "Text_1",
					"BBB": "Int_2",
					"CCC": "URL_3", // XXX -> CCC
					"YYY": "Boolean_4",
				},
				"oldTitle": "CCC", // XXX -> CCC
				"newTitle": "ZZZ", // XXX -> ZZZ
			},
		},
	}
	Request(e, uID.String(), requestBody)

	proId1 := RandomString(10)
	fId1 := addTestGeoJSONFeature(e, lId, proId1)
	updateTestGeoJSONFeature(e, lId, fId1, proId1)

	proId2 := RandomString(10)
	fId2 := addTestGeoJSONFeature(e, lId, proId2)
	updateTestGeoJSONFeature(e, lId, fId2, proId2)

	// change XXX -> ZZZ
	requestBody = GraphQLRequest{
		OperationName: "ChangeCustomPropertyTitle",
		Query: `
			mutation ChangeCustomPropertyTitle($input: ChangeCustomPropertyTitleInput!) {
				changeCustomPropertyTitle(input: $input) {
					layer {
						id
					}
				}
			}
		`,
		Variables: map[string]any{
			"input": map[string]interface{}{
				"layerId": lId,
				"schema": map[string]any{
					"AAA": "Text_1",
					"BBB": "Int_2",
					"ZZZ": "URL_3", // XXX -> ZZZ
					"YYY": "Boolean_4",
				},
				"oldTitle": "XXX", // XXX -> ZZZ
				"newTitle": "ZZZ", // XXX -> ZZZ
			},
		},
	}
	Request(e, uID.String(), requestBody)

	// check GetScene
	res := getNewLayersOfScene(e, sId)
	JSONEqRegexpInterface(t, res.Path("$.sketch.customPropertySchema").Raw(), `
{
	"AAA": "Text_1",
	"BBB": "Int_2",
	"ZZZ": "URL_3",
	"YYY": "Boolean_4"
}`)

	features := res.Path("$.sketch.featureCollection.features").Array()
	features.Length().IsEqual(2)
	feature0 := features.Value(0).Object()
	feature1 := features.Value(1).Object()

	JSONEqRegexpInterface(t, feature0.Raw(), `
{
	"AAA": "aaa",
	"BBB": 123,
	"ZZZ": "xxx",
	"YYY": true,
	"extrudedHeight": 0,
	"id": ".*",
	"positions": [
		[
			-3958794.0678944187,
			3350992.944211698,
			3699619.2576891473
		]
	],
	"type": "marker"
}`)
	JSONEqRegexpInterface(t, feature1.Raw(), `
{
	"AAA": "aaa",
	"BBB": 123,
	"ZZZ": "xxx",
	"YYY": true,
	"extrudedHeight": 0,
	"id": ".*",
	"positions": [
		[
			-3958794.0678944187,
			3350992.944211698,
			3699619.2576891473
		]
	],
	"type": "marker"
}`)
}

func TestRemoveCustomProperty(t *testing.T) {
	e := Server(t, baseSeeder)
	pId := createProject(e, uID, map[string]any{
		"name":        "test",
		"description": "abc",
		"workspaceId": wID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	sId := createScene(e, pId)
	lId := addTestNLSLayerSimple(e, sId)

	// remove XXX
	requestBody := GraphQLRequest{
		OperationName: "RemoveCustomProperty",
		Query: `
			mutation RemoveCustomProperty($input: RemoveCustomPropertyInput!) {
				removeCustomProperty(input: $input) {
					layer {
						id
					}
				}
			}
		`,
		Variables: map[string]any{
			"input": map[string]interface{}{
				"layerId": lId,
				"schema": map[string]any{
					"AAA": "Text_1",
					"BBB": "Int_2",
					// "XXX": "URL_3", remove
					"YYY": "Boolean_3",
				},
				"removedTitle": "CCC",
			},
		},
	}
	Request(e, uID.String(), requestBody)

	proId1 := RandomString(10)
	fId1 := addTestGeoJSONFeature(e, lId, proId1)
	updateTestGeoJSONFeature(e, lId, fId1, proId1)

	proId2 := RandomString(10)
	fId2 := addTestGeoJSONFeature(e, lId, proId2)
	updateTestGeoJSONFeature(e, lId, fId2, proId2)

	// remove XXX
	requestBody = GraphQLRequest{
		OperationName: "RemoveCustomProperty",
		Query: `
			mutation RemoveCustomProperty($input: RemoveCustomPropertyInput!) {
				removeCustomProperty(input: $input) {
					layer {
						id
					}
				}
			}
		`,
		Variables: map[string]any{
			"input": map[string]interface{}{
				"layerId": lId,
				"schema": map[string]any{
					"AAA": "Text_1",
					"BBB": "Int_2",
					// "XXX": "URL_3", remove
					"YYY": "Boolean_3",
				},
				"removedTitle": "XXX",
			},
		},
	}
	Request(e, uID.String(), requestBody)

	// check GetScene
	res := getNewLayersOfScene(e, sId)
	JSONEqRegexpInterface(t, res.Path("$.sketch.customPropertySchema").Raw(), `
{
	"AAA": "Text_1",
	"BBB": "Int_2",
	"YYY": "Boolean_3"
}`)

	features := res.Path("$.sketch.featureCollection.features").Array()
	features.Length().IsEqual(2)
	feature0 := features.Value(0).Object()
	feature1 := features.Value(1).Object()

	JSONEqRegexpInterface(t, feature0.Raw(), `
	
		{
			"AAA": "aaa",
			"BBB": 123,
			"YYY": true,
			"extrudedHeight": 0,
			"id": ".*",
			"positions": [
				[
					-3958794.0678944187,
					3350992.944211698,
					3699619.2576891473
				]
			],
			"type": "marker"
		}`)

	JSONEqRegexpInterface(t, feature1.Raw(), `
	
		{
			"AAA": "aaa",
			"BBB": 123,
			"YYY": true,
			"extrudedHeight": 0,
			"id": ".*",
			"positions": [
				[
					-3958794.0678944187,
					3350992.944211698,
					3699619.2576891473
				]
			],
			"type": "marker"
		}`)
}

// below Common functions -----------------------------------------------------

func getNewLayersOfScene(e *httpexpect.Expect, sId string) *httpexpect.Object {
	requestBody := GraphQLRequest{
		OperationName: "GetScene",
		Query: `query GetScene($sceneId: ID!, $lang: Lang) {
  node(id: $sceneId, type: SCENE) {
    id
    ... on Scene {
      workspaceId
      projectId
      property {
        id
        ...PropertyFragment
        __typename
      }
      plugins {
        property {
          id
          ...PropertyFragment
          __typename
        }
        plugin {
          ...PluginFragment
          __typename
        }
        __typename
      }
      widgets {
        id
        enabled
        extended
        pluginId
        extensionId
        property {
          id
          ...PropertyFragment
          __typename
        }
        __typename
      }
      widgetAlignSystem {
        ...WidgetAlignSystemFragment
        __typename
      }
      stories {
        ...StoryFragment
        __typename
      }
      newLayers {
        ...NLSLayerCommon
        __typename
      }
      styles {
        ...NLSLayerStyle
        __typename
      }
      __typename
    }
    __typename
  }
}
fragment PropertyFieldFragment on PropertyField {
  id
  fieldId
  type
  value
  __typename
}
fragment PropertyGroupFragment on PropertyGroup {
  id
  schemaGroupId
  fields {
    ...PropertyFieldFragment
    __typename
  }
  __typename
}
fragment PropertyItemFragment on PropertyItem {
  ... on PropertyGroupList {
    id
    schemaGroupId
    groups {
      ...PropertyGroupFragment
      __typename
    }
    __typename
  }
  ... on PropertyGroup {
    ...PropertyGroupFragment
    __typename
  }
  __typename
}
fragment PropertyFragmentWithoutSchema on Property {
  id
  items {
    ...PropertyItemFragment
    __typename
  }
  __typename
}
fragment PropertySchemaFieldFragment on PropertySchemaField {
  fieldId
  title
  description
  placeholder
  translatedTitle(lang: $lang)
  translatedDescription(lang: $lang)
  translatedPlaceholder(lang: $lang)
  prefix
  suffix
  type
  defaultValue
  ui
  min
  max
  choices {
    key
    icon
    title
    translatedTitle(lang: $lang)
    __typename
  }
  isAvailableIf {
    fieldId
    type
    value
    __typename
  }
  __typename
}
fragment PropertySchemaGroupFragment on PropertySchemaGroup {
  schemaGroupId
  title
  collection
  translatedTitle(lang: $lang)
  isList
  representativeFieldId
  isAvailableIf {
    fieldId
    type
    value
    __typename
  }
  fields {
    ...PropertySchemaFieldFragment
    __typename
  }
  __typename
}
fragment WidgetAreaFragment on WidgetArea {
  widgetIds
  align
  padding {
    top
    bottom
    left
    right
    __typename
  }
  gap
  centered
  background
  __typename
}
fragment WidgetSectionFragment on WidgetSection {
  top {
    ...WidgetAreaFragment
    __typename
  }
  middle {
    ...WidgetAreaFragment
    __typename
  }
  bottom {
    ...WidgetAreaFragment
    __typename
  }
  __typename
}
fragment WidgetZoneFragment on WidgetZone {
  left {
    ...WidgetSectionFragment
    __typename
  }
  center {
    ...WidgetSectionFragment
    __typename
  }
  right {
    ...WidgetSectionFragment
    __typename
  }
  __typename
}
fragment PropertyFragment on Property {
  id
  ...PropertyFragmentWithoutSchema
  schema {
    id
    groups {
      ...PropertySchemaGroupFragment
      __typename
    }
    __typename
  }
  __typename
}
fragment StoryPageFragment on StoryPage {
  id
  title
  swipeable
  propertyId
  property {
    id
    ...PropertyFragment
    __typename
  }
  layersIds
  blocks {
    id
    pluginId
    extensionId
    property {
      id
      ...PropertyFragment
      __typename
    }
    __typename
  }
  __typename
}
fragment FeatureFragment on Feature {
  id
  type
  properties
  geometry {
    ... on Point {
      type
      pointCoordinates
      __typename
    }
    ... on LineString {
      type
      lineStringCoordinates
      __typename
    }
    ... on Polygon {
      type
      polygonCoordinates
      __typename
    }
    ... on MultiPolygon {
      type
      multiPolygonCoordinates
      __typename
    }
    ... on GeometryCollection {
      type
      geometries {
        ... on Point {
          type
          pointCoordinates
          __typename
        }
        ... on LineString {
          type
          lineStringCoordinates
          __typename
        }
        ... on Polygon {
          type
          polygonCoordinates
          __typename
        }
        ... on MultiPolygon {
          type
          multiPolygonCoordinates
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}
fragment PluginFragment on Plugin {
  id
  name
  extensions {
    extensionId
    description
    name
    translatedDescription(lang: $lang)
    translatedName(lang: $lang)
    icon
    singleOnly
    type
    widgetLayout {
      extendable {
        vertically
        horizontally
        __typename
      }
      extended
      floating
      defaultLocation {
        zone
        section
        area
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}
fragment WidgetAlignSystemFragment on WidgetAlignSystem {
  outer {
    ...WidgetZoneFragment
    __typename
  }
  inner {
    ...WidgetZoneFragment
    __typename
  }
  __typename
}
fragment StoryFragment on Story {
  id
  title
  panelPosition
  bgColor
  isBasicAuthActive
  basicAuthUsername
  basicAuthPassword
  alias
  publicTitle
  publicDescription
  publishmentStatus
  publicImage
  publicNoIndex
  pages {
    ...StoryPageFragment
    __typename
  }
  __typename
}
fragment NLSLayerCommon on NLSLayer {
  id
  index
  layerType
  sceneId
  config
  title
  visible
  infobox {
    sceneId
    layerId
    propertyId
    property {
      id
      ...PropertyFragment
      __typename
    }
    blocks {
      id
      pluginId
      extensionId
      propertyId
      property {
        id
        ...PropertyFragment
        __typename
      }
      __typename
    }
    __typename
  }
  isSketch
  sketch {
    customPropertySchema
    featureCollection {
      type
      features {
        ...FeatureFragment
        __typename
      }
      __typename
    }
    __typename
  }
  ... on NLSLayerGroup {
    children {
      id
      __typename
    }
    __typename
  }
  __typename
}
fragment NLSLayerStyle on Style {
  id
  name
  value
  __typename
}`,
		Variables: map[string]any{
			"sceneId": sId,
			"lang":    "en",
		},
	}
	res := Request(e, uID.String(), requestBody)
	newLayers := res.Path("$.data.node.newLayers").Array()
	newLayers.Length().IsEqual(1)
	return newLayers.Value(0).Object()
}

func addTestNLSLayerSimple(e *httpexpect.Expect, sId string) string {
	requestBody := GraphQLRequest{
		OperationName: "AddNLSLayerSimple",
		Query:         "mutation AddNLSLayerSimple($input: AddNLSLayerSimpleInput!) { addNLSLayerSimple(input: $input) { layers { id __typename } __typename }}",
		Variables: map[string]any{
			"input": map[string]any{
				"sceneId": sId,
				"config": map[string]any{
					"properties": map[string]any{
						"name": "TestLayer",
					},
					"layerStyleId": "",
					"data": map[string]any{
						"type": "geojson",
					},
				},
				"visible":   true,
				"layerType": "simple",
				"title":     "TestLayer",
				"index":     0,
				"schema": map[string]any{
					"AAA": "Text_1",
					"BBB": "Int_2",
					"XXX": "URL_3",
					"YYY": "Boolean_4",
				},
			},
		},
	}
	res := Request(e, uID.String(), requestBody)
	return res.Path("$.data.addNLSLayerSimple.layers.id").Raw().(string)
}

func addTestGeoJSONFeature(e *httpexpect.Expect, lId string, proId string) string {
	requestBody := GraphQLRequest{
		OperationName: "AddGeoJSONFeature",
		Query:         "mutation AddGeoJSONFeature($input: AddGeoJSONFeatureInput!) { addGeoJSONFeature(input: $input) { id type properties __typename }}",
		Variables: map[string]any{
			"input": map[string]any{
				"layerId": lId,
				"geometry": map[string]any{
					"type": "Point",
					"coordinates": []float64{
						139.75315007107542,
						35.68233694131118,
					},
				},
				"type": "Feature",
				"properties": map[string]any{
					"id":   proId,
					"type": "marker",
					"positions": [][]float64{
						{
							-3958794.0678944187,
							3350992.944211698,
							3699619.2576891473,
						},
					},
					"extrudedHeight": 0,
				},
			},
		},
	}
	res := Request(e, uID.String(), requestBody)
	featureId := res.Path("$.data.addGeoJSONFeature.id").Raw().(string)
	return featureId
}

func updateTestGeoJSONFeature(e *httpexpect.Expect, lId string, fId string, proId string) {
	requestBody := GraphQLRequest{
		OperationName: "UpdateGeoJSONFeature",
		Query:         "mutation UpdateGeoJSONFeature($input: UpdateGeoJSONFeatureInput!) { updateGeoJSONFeature(input: $input) { id type properties __typename }}",
		Variables: map[string]any{
			"input": map[string]any{
				"layerId":   lId,
				"featureId": fId,
				"geometry": map[string]any{
					"type": "Point",
					"coordinates": []float64{
						139.75315007107542,
						35.68233694131118,
					},
				},
				"properties": map[string]any{
					"extrudedHeight": 0,
					"id":             proId,
					"positions": [][]float64{
						{
							-3958794.0678944187,
							3350992.944211698,
							3699619.2576891473,
						},
					},
					"type": "marker",
					"AAA":  "aaa",
					"BBB":  123,
					"XXX":  "xxx",
					"YYY":  true,
				},
			},
		},
	}
	Request(e, uID.String(), requestBody)
}

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func RandomString(n int) string {
	src := rand.NewSource(time.Now().UnixNano())
	r := rand.New(src)
	result := make([]byte, n)
	for i := range result {
		result[i] = letters[r.Intn(len(letters))]
	}
	return string(result)
}
