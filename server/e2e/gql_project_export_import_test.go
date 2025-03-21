package e2e

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/idx"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestProjectExportImport ./e2e/...

func TestProjectExportImport(t *testing.T) {

	e := Server(t, fullSeeder)

	// 1.Retrieve the data created by fullSeeder.
	expected := getScene(e, sID.String(), language.English.String())

	// 2.Export the data.
	fileName := exporProject(t, e, pID.String())

	// 3.Import the exported data.
	r := importProject(t, e, fileName)

	r.Object().Value("project").NotNull()
	r.Object().Value("plugins").Array()
	r.Object().Value("schemas").Array()
	r.Object().Value("scene").NotNull()
	r.Object().Value("nlsLayer").Array()
	r.Object().Value("style").Array()
	r.Object().Value("story").NotNull()

	r.Object().Value("project").Object().HasValue("name", pName)
	r.Object().Value("project").Object().HasValue("description", pDesc)

	newId := r.Object().Value("scene").Object().Value("id").Raw().(string)

	// 4.Retrieve the imported data.
	actual := getScene(e, newId, language.English.String())

	// 5. Compare and check each value individually.
	compareValue(t, "styles", expected, actual)
	compareValue(t, "widgets", expected, actual)
	compareValue(t, "widgetAlignSystem", expected, actual)
	compareValue(t, "stories", expected, actual)
	compareValue(t, "newLayers", expected, actual)
	compareValue(t, "plugins", expected, actual)

	defer func() {
		err := os.Remove(fileName)
		assert.Nil(t, err)
	}()

}

func convertLine(t *testing.T, key string, v *httpexpect.Value) []string {
	v2, err := json.MarshalIndent(v.Object().Value(key).Raw(), "", "  ")
	assert.Nil(t, err)
	return strings.Split(strings.ReplaceAll(string(v2), "\r\n", "\n"), "\n")
}

func compareValue(t *testing.T, key string, e, a *httpexpect.Value) {
	expected := convertLine(t, key, e)
	actual := convertLine(t, key, a)

	maxLines := len(expected)
	if len(actual) > maxLines {
		maxLines = len(actual)
	}

	for i := 0; i < maxLines; i++ {
		var expectedLine, actualLine string

		if i < len(expected) {
			expectedLine = expected[i]
		}
		if i < len(actual) {
			actualLine = actual[i]
		}

		if expectedLine != actualLine {
			if isIgnore(`"id":`, expectedLine, actualLine) ||
				isIgnore(`"propertyId":`, expectedLine, actualLine) ||
				isIgnore(`"sceneId":`, expectedLine, actualLine) ||
				(isID(expectedLine) && isID(actualLine)) {
				continue
			}
			assert.Failf(t, "Mismatch in %s at line %d", key, i+1,
				"Expected: %s\nActual: %s", expectedLine, actualLine)
		}
	}
}

func isIgnore(propertyName, expectedLine, actualLine string) bool {
	expected := strings.TrimSpace(expectedLine)
	actual := strings.TrimSpace(actualLine)
	if strings.HasPrefix(expected, propertyName) && strings.HasPrefix(actual, propertyName) {
		return true
	}
	return false
}

func isID(text string) bool {
	v := strings.TrimSpace(text)
	v = strings.Trim(v, `"`)
	if _, err := idx.From[id.Widget](v); err != nil {
		return false
	}
	return true
}

func exporProject(t *testing.T, e *httpexpect.Expect, p string) string {
	requestBody := GraphQLRequest{
		OperationName: "ExportProject",
		Query:         "mutation ExportProject($projectId: ID!) { exportProject(input: {projectId: $projectId}) { projectDataPath __typename } }",
		Variables: map[string]any{
			"projectId": p,
		},
	}
	r := Request(e, uID.String(), requestBody)
	// ValueDump(r)
	downloadPath := r.Path("$.data.exportProject.projectDataPath").Raw().(string)
	downloadResponse := e.GET(fmt.Sprintf("http://localhost:8080%s", downloadPath)).
		Expect().
		Status(http.StatusOK).
		Body().Raw()
	fileName := "project_data.zip"
	err := os.WriteFile(fileName, []byte(downloadResponse), os.ModePerm)
	assert.Nil(t, err)
	return fileName
}

func importProject(t *testing.T, e *httpexpect.Expect, filePath string) *httpexpect.Value {
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

	assert.Nil(t, err)
	r := RequestWithMultipart(e, uID.String(), requestBody, filePath)
	// ValueDump(r)
	projectData := r.Object().Value("data").Object().Value("importProject").Object().Value("projectData")
	projectData.NotNull()
	return projectData
}

func getScene(e *httpexpect.Expect, s string, l string) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "GetScene",
		Query:         GetSceneQuery,
		Variables: map[string]any{
			"sceneId": s,
			"lang":    l,
		},
	}

	r := Request(e, uID.String(), requestBody)
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
      teamId
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
