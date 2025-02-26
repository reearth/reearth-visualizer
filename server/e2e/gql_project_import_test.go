package e2e

import (
	"os"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestCallImportProject ./e2e/...

func TestCallImportProject(t *testing.T) {

	e := Server(t, baseSeeder)

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

	r = getScene(e, sid, language.English.String())
	// fmt.Println(toJSONString(r.Raw()))

	r.Value("id").IsEqual(sid)

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

	assert.Nil(t, err)
	r := RequestWithMultipart(e, uID.String(), requestBody, filePath).Object()
	projectData := r.Value("data").Object().Value("importProject").Object().Value("projectData")
	projectData.NotNull()
	return projectData.Object()
}

func getScene(e *httpexpect.Expect, s string, l string) *httpexpect.Object {
	requestBody := GraphQLRequest{
		OperationName: "GetScene",
		Query:         GetSceneGuery,
		Variables: map[string]any{
			"sceneId": s,
			"lang":    l,
		},
	}

	r := Request(e, uID.String(), requestBody).Object()
	v := r.Value("data").Object().Value("node")
	v.NotNull()
	return v.Object()
}

const GetSceneGuery = `
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
