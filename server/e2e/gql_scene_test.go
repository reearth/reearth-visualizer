//go:build e2e

package e2e

import (
	"testing"

	"github.com/gavv/httpexpect/v2"
	"golang.org/x/text/language"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

func TestGetScenePlaceholderEnglish(t *testing.T) {
	e, result := ServerLanguage(t, language.English)
	_, sceneId, _ := createProjectSet(e, result)
	r := getScene(e, result.UID, sceneId, language.English.String())

	for _, group := range r.Object().Value("property").Object().Value("schema").Object().Value("groups").Array().Iter() {
		for _, field := range group.Object().Value("fields").Array().Iter() {
			fieldId := field.Object().Value("fieldId").Raw().(string)

			if fieldId == "tile_type" {
				field.Object().Value("translatedPlaceholder").IsEqual("please enter tile type")
			}
			if fieldId == "tile_url" {
				field.Object().Value("translatedPlaceholder").IsEqual("please enter tile url")
			}
			if fieldId == "tile_zoomLevel" {
				field.Object().Value("translatedPlaceholder").IsEqual("please enter tile zoom level")
			}
			if fieldId == "tile_opacity" {
				field.Object().Value("translatedPlaceholder").IsEqual("please enter tile opacity")
			}
		}
	}
}

func TestGetScenePlaceholderJapanese(t *testing.T) {
	e, result := ServerLanguage(t, language.Japanese)
	pID := createProjectWithExternalImage(e, result, "test")
	sID := createScene(e, result.UID, pID)
	r := getScene(e, result.UID, sID, language.Japanese.String())

	for _, group := range r.Object().Value("property").Object().Value("schema").Object().Value("groups").Array().Iter() {
		for _, field := range group.Object().Value("fields").Array().Iter() {
			fieldId := field.Object().Value("fieldId").Raw().(string)

			if fieldId == "tile_type" {
				field.Object().Value("translatedPlaceholder").IsEqual("タイルのタイプを選択")
			}
			if fieldId == "tile_url" {
				field.Object().Value("translatedPlaceholder").IsEqual("タイルのURLを入力")
			}
			if fieldId == "tile_zoomLevel" {
				field.Object().Value("translatedPlaceholder").IsEqual("ズームレベルを入力")
			}
			if fieldId == "tile_opacity" {
				field.Object().Value("translatedPlaceholder").IsEqual("不透明度を入力")
			}
		}
	}
}

// make e2e-test TEST_NAME=TestGetScene
func TestGetSceneNLSLayer(t *testing.T) {
	e, result := Server(t, baseSeeder)
	pId := createProject(e, result.UID, map[string]any{
		"name":        "test",
		"description": "abc",
		"workspaceId": result.WID.String(),
		"visualizer":  "CESIUM",
		"coreSupport": true,
	})
	sId := createScene(e, result.UID, pId)
	_, _, lId := addNLSLayerSimple(e, sId, "someTitle99", 99, result.UID.String())

	r := getScene(e, result.UID, sId, language.Und.String())
	r.Object().Value("newLayers").Array().Value(0).Object().HasValue("id", lId)
	r.Object().Value("newLayers").Array().Value(0).Object().HasValue("title", "someTitle99")
	r.Object().Value("newLayers").Array().Value(0).Object().HasValue("index", 99)

}

func createProjectWithExternalImage(e *httpexpect.Expect, result *SeederResult, name string) string {
	requestBody := GraphQLRequest{
		OperationName: "CreateProject",
		Query:         CreateProjectMutation,
		Variables: map[string]any{
			"name":        name,
			"description": "abc",
			"workspaceId": result.WID.String(),
			"visualizer":  "CESIUM",
			"coreSupport": true,
		},
	}
	res := Request(e, result.UID.String(), requestBody)
	return res.Path("$.data.createProject.project.id").Raw().(string)
}

func createScene(e *httpexpect.Expect, u accountsID.UserID, pID string) string {
	requestBody := GraphQLRequest{
		OperationName: "CreateScene",
		Query: `mutation CreateScene($projectId: ID!) {
			createScene( input: {projectId: $projectId} ) {
				scene {
					id
				}
			}
		}`,
		Variables: map[string]any{
			"projectId": pID,
		},
	}

	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.createScene.scene.id").Raw().(string)
}

func getScene(e *httpexpect.Expect, u accountsID.UserID, s string, l string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "GetScene",
		Query:         GetSceneQuery,
		Variables: map[string]any{
			"sceneId": s,
			"lang":    l,
		},
	}

	r := Request(e, u.String(), requestBody)
	// ValueDump(r)
	v := r.Object().Value("data").Object().Value("node")
	v.NotNull()
	return v
}

const GetSceneQuery = `
query GetScene($sceneId: ID!, $lang: Lang) {
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
        desktop {
          ...WidgetAlignSystemFragment
        }
        mobile {
          ...WidgetAlignSystemFragment
        }
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
      alias
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
  translatedTitle(lang: $lang)
  translatedDescription(lang: $lang)
  prefix
  suffix
  type
  defaultValue
  ui
  min
  max
  placeholder
  translatedPlaceholder(lang: $lang)
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
  projectId
  sceneId
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
}
`
