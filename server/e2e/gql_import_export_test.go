package e2e

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/internal/app/config"
	"github.com/stretchr/testify/assert"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestCallExportProject ./e2e/...

func TestCallExportProject(t *testing.T) {

	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	pID := createProjectWithExternalImage(e, "test")

	_, _, sID := createScene(e, pID)

	_, _, storyID := createStory(e, sID, "test", 0)

	_, _, pageID := createPage(e, sID, storyID, "test", true)

	_, _, _ = createBlock(e, sID, storyID, pageID, "reearth", "imageStoryBlock", nil)
	_, _, _ = createBlock(e, sID, storyID, pageID, "reearth", "imageStoryBlock", nil)
	_, _, _ = createBlock(e, sID, storyID, pageID, "reearth", "imageStoryBlock", nil)

	_, res := fetchSceneForStories(e, sID)

	blocks := res.Object().Value("data").Object().
		Value("node").Object().
		Value("stories").Array().First().Object().
		Value("pages").Array().First().Object().
		Value("blocks").Array().Iter()

	propID1 := blocks[0].Object().Value("propertyId").Raw().(string)
	propID2 := blocks[1].Object().Value("propertyId").Raw().(string)
	propID3 := blocks[2].Object().Value("propertyId").Raw().(string)

	_, res = updatePropertyValue(e, propID1, "default", "", "src", "http://localhost:8080/assets/01jbbhhtq2jq7mx39dhyq1cfr2.png", "URL")
	res.Path("$.data.updatePropertyValue.propertyField.value").Equal("http://localhost:8080/assets/01jbbhhtq2jq7mx39dhyq1cfr2.png")

	_, res = updatePropertyValue(e, propID2, "default", wID.String(), "src", "https://test.com/project.jpg", "URL")
	res.Path("$.data.updatePropertyValue.propertyField.value").Equal("https://test.com/project.jpg")

	_, res = updatePropertyValue(e, propID3, "default", wID.String(), "src", "https://api.visualizer.test.reearth.dev/assets/01jbbhhtq2jq7mx39dhyq1cfr2.png", "URL")
	res.Path("$.data.updatePropertyValue.propertyField.value").Equal("https://api.visualizer.test.reearth.dev/assets/01jbbhhtq2jq7mx39dhyq1cfr2.png")

	fileName := exporProject(t, e, pID)

	defer func() {
		err := os.Remove(fileName)
		assert.Nil(t, err)
	}()

}

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestCallImportProject ./e2e/...

func TestCallImportProject(t *testing.T) {

	e := StartServer(t, &config.Config{
		Origins: []string{"https://example.com"},
		AuthSrv: config.AuthSrvConfig{
			Disabled: true,
		},
	}, true, baseSeeder)

	filePath := "test.zip"

	r := importProject(t, e, filePath)

	r.Value("project").NotNull()
	r.Value("plugins").Array()
	r.Value("schema").Array()
	r.Value("scene").NotNull()
	r.Value("nlsLayer").Array()
	r.Value("style").Array()
	r.Value("story").NotNull()

	sid := r.Value("scene").Object().Value("id").Raw().(string)

	r = getScene(e, sid)
	// fmt.Println(toJSONString(r.Raw()))

	r.Value("id").Equal(sid)
}

func createProjectWithExternalImage(e *httpexpect.Expect, name string) string {
	requestBody := GraphQLRequest{
		OperationName: "CreateProject",
		Query: `mutation CreateProject($teamId: ID!, $visualizer: Visualizer!, $name: String!, $description: String!, $imageUrl: URL, $coreSupport: Boolean) {
			createProject( input: {teamId: $teamId, visualizer: $visualizer, name: $name, description: $description, imageUrl: $imageUrl, coreSupport: $coreSupport} ) { 
				project { 
					id
					__typename 
				} 
				__typename 
			}
		}`,
		Variables: map[string]any{
			"name":        name,
			"description": "abc",
			"imageUrl":    "https://test.com/project.jpg",
			"teamId":      wID.String(),
			"visualizer":  "CESIUM",
			"coreSupport": true,
		},
	}
	res := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON()
	return res.Path("$.data.createProject.project.id").Raw().(string)
}

func exporProject(t *testing.T, e *httpexpect.Expect, p string) string {
	requestBody := GraphQLRequest{
		OperationName: "ExportProject",
		Query:         "mutation ExportProject($projectId: ID!) { exportProject(input: {projectId: $projectId}) { projectDataPath __typename } }",
		Variables: map[string]any{
			"projectId": p,
		},
	}
	r := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	downloadPath := r.
		Value("data").Object().
		Value("exportProject").Object().
		Value("projectDataPath").String().Raw()
	downloadResponse := e.GET(fmt.Sprintf("http://localhost:8080%s", downloadPath)).
		Expect().
		Status(http.StatusOK).
		Body().Raw()
	fileName := "project_data.zip"
	err := os.WriteFile(fileName, []byte(downloadResponse), os.ModePerm)
	assert.Nil(t, err)
	return fileName
}

func importProject(t *testing.T, e *httpexpect.Expect, filePath string) *httpexpect.Object {
	file, err := os.Open(filePath)
	if err != nil {
		t.Fatalf("failed to open file: %v", err)
	}
	defer func() {
		if cerr := file.Close(); cerr != nil && err == nil {
			err = cerr
		}
	}()
	requestBody := map[string]interface{}{
		"operationName": "ImportProject",
		"variables": map[string]interface{}{
			"teamId": wID.String(),
			"file":   nil,
		},
		"query": `mutation ImportProject($teamId: ID!, $file: Upload!) {  
            importProject(input: {teamId: $teamId, file: $file}) {    
                projectData    
                __typename  
            } 
        }`,
	}
	r := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithMultipart().
		WithFormField("operations", toJSONString(requestBody)).
		WithFormField("map", `{"0": ["variables.file"]}`).
		WithFile("0", filePath).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	projectData := r.Value("data").Object().Value("importProject").Object().Value("projectData")
	projectData.NotNull()
	return projectData.Object()
}

func getScene(e *httpexpect.Expect, s string) *httpexpect.Object {
	requestBody := GraphQLRequest{
		OperationName: "GetScene",
		Query:         GetSceneGuery,
		Variables: map[string]any{
			"sceneId": s,
		},
	}
	r := e.POST("/api/graphql").
		WithHeader("Origin", "https://example.com").
		WithHeader("authorization", "Bearer test").
		WithHeader("X-Reearth-Debug-User", uID.String()).
		WithHeader("Content-Type", "application/json").
		WithJSON(requestBody).
		Expect().
		Status(http.StatusOK).
		JSON().
		Object()
	v := r.Value("data").Object().Value("node")
	v.NotNull()
	return v.Object()
}

func toJSONString(v interface{}) string {
	jsonData, _ := json.Marshal(v)
	return string(jsonData)
}

const GetSceneGuery = `
query GetScene($sceneId: ID!, $lang: Lang) {
  node(id: $sceneId, type: SCENE) {
    id
    ... on Scene {
      rootLayerId
      teamId
      projectId
      property {
        id
        ...PropertyFragment
        __typename
      }
      clusters {
        id
        name
        propertyId
        property {
          id
          ...PropertyFragment
          __typename
        }
        __typename
      }
      tags {
        id
        label
        ... on TagGroup {
          tags {
            id
            label
            __typename
          }
          __typename
        }
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
fragment PropertyFieldLink on PropertyFieldLink {
  datasetId
  datasetSchemaId
  datasetSchemaFieldId
  __typename
}
fragment PropertyFieldFragment on PropertyField {
  id
  fieldId
  type
  value
  links {
    ...PropertyFieldLink
    __typename
  }
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
