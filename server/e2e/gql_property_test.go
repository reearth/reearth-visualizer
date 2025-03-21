package e2e

import (
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func updatePropertyValue(e *httpexpect.Expect, propertyID, schemaGroupID, itemID, fieldID string, value any, valueType any) (GraphQLRequest, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "UpdatePropertyValue",
		Query: `mutation UpdatePropertyValue(
  $propertyId: ID!
  $schemaGroupId: ID
  $itemId: ID
  $fieldId: ID!
  $value: Any
  $type: ValueType!
) {
  updatePropertyValue(
    input: {
      propertyId: $propertyId
      schemaGroupId: $schemaGroupId
      itemId: $itemId
      fieldId: $fieldId
      value: $value
      type: $type
    }
  ) {
    property {
      id
      schema {
        id
        groups {
          schemaGroupId
          title
          collection
          isList
          representativeFieldId
          isAvailableIf {
            fieldId
            type
            value
          }
          fields {
            fieldId
            title
            description
            placeholder
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
            }
            isAvailableIf {
              fieldId
              type
              value
            }
          }
        }
      }
      items {
        ...PropertyItemFragment
      }
    }
    propertyField {
      id
      type
      value
    }
  }
}

fragment PropertyItemFragment on PropertyItem {
  ... on PropertyGroupList {
    id
    schemaGroupId
    groups {
      ...PropertyGroupFragment
    }
  }
  ... on PropertyGroup {
    ...PropertyGroupFragment
  }
}

fragment PropertyGroupFragment on PropertyGroup {
  id
  schemaGroupId
  fields {
    id
    fieldId
    type
    value
  }
}`,
		Variables: map[string]any{
			"propertyId":    propertyID,
			"schemaGroupId": schemaGroupID,
			"itemId":        itemID,
			"fieldId":       fieldID,
			"value":         value,
			"type":          valueType,
		},
	}
	res := Request(e, uID.String(), requestBody)
	return requestBody, res
}

func addPropertyItem(e *httpexpect.Expect, propertyID, schemaGroupID string) (GraphQLRequest, *httpexpect.Value, string, string) {
	requestBody := GraphQLRequest{
		OperationName: "AddPropertyItem",
		Query: `mutation AddPropertyItem($propertyId: ID!, $schemaGroupId: ID!) {
  addPropertyItem(input: { propertyId: $propertyId, schemaGroupId: $schemaGroupId }) {
    property {
      id
      items {
        ... on PropertyGroupList {
          id
          schemaGroupId
          groups {
            id
            schemaGroupId
          }
        }
        ... on PropertyGroup {
          id
          schemaGroupId
        }
      }
    }
  }
}
`,
		Variables: map[string]any{
			"propertyId":    propertyID,
			"schemaGroupId": schemaGroupID,
		},
	}
	res := Request(e, uID.String(), requestBody)
	itemId := res.Path("$.data.addPropertyItem.property.items[0].id").Raw().(string)
	groupId := res.Path("$.data.addPropertyItem.property.items[0].groups[0].id").Raw().(string)

	return requestBody, res, itemId, groupId
}

func TestUpdateScenePropertyValue(t *testing.T) {
	e := Server(t, fullSeeder)
	sceneID := sID.String()
	res := getScene(e, sceneID, language.Und.String())

	// TODO: Write detailed tests

	// Scene Property test ---------------------------------------
	scenePropertySchemaGroups := res.Path("$.property.schema.groups")
	assert.NotNil(t, scenePropertySchemaGroups)

	// Widgets Property test ---------------------------------------
	widgetPropertySchemaGroups := res.Path("$.widgets[0].property.schema.groups")
	assert.NotNil(t, widgetPropertySchemaGroups)

}

func TestUpdateStoryPropertyValue(t *testing.T) {
	e := Server(t, fullSeeder)
	sceneID := sID.String()
	res := getScene(e, sceneID, language.Und.String())
	storyID := res.Object().Path("$.stories[0].id").Raw().(string)

	// Page Property test ---------------------------------------
	pagePropertyId := res.Object().Path("$.stories[0].pages[0].property.id").Raw().(string)
	pageId := res.Object().Path("$.stories[0].pages[0].id").Raw().(string)

	// title
	_, r := updatePropertyValue(e, pagePropertyId, "title", "", "title", "test", "STRING")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual("test")

	// title color
	_, r = updatePropertyValue(e, pagePropertyId, "title", "", "color", "#2914acff", "STRING")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual("#2914acff")

	camera := map[string]any{
		// "height":      313.66307524391044,
		// "aspectRatio": 0.42407108239095315,
		"altitude": 313.66307524391044,
		"fov":      1.0471975511965976,
		"heading":  6.283185307179581,
		"lat":      35.682290440916404,
		"lng":      139.7529563415448,
		"pitch":    -1.569091180503932,
		"roll":     0,
	}
	_, r = updatePropertyValue(e, pagePropertyId, "cameraAnimation", "", "cameraPosition", camera, "CAMERA")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual(camera)

	// cameraDuration
	_, r = updatePropertyValue(e, pagePropertyId, "cameraAnimation", "", "cameraDuration", 3, "NUMBER")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual(3)

	// timePoint
	_, r = updatePropertyValue(e, pagePropertyId, "timePoint", "", "timePoint", "2025-03-06T11:05:44+09:00", "STRING")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual("2025-03-06T11:05:44+09:00")

	// Block Property test ---------------------------------------
	blockPropertyId := res.Object().Path("$.stories[0].pages[0].blocks[0].property.id").Raw().(string)

	_, r = updatePropertyValue(e, blockPropertyId, "default", "", "text", "test", "STRING")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual("test")

	// mdTextStoryBlock
	_, _, _, blockPropertyId1 := createBlock(e, sceneID, storyID, pageId, "reearth", "mdTextStoryBlock", lo.ToPtr(1))
	_, r = updatePropertyValue(e, blockPropertyId1, "default", "", "text", "test", "STRING")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual("test")

	// imageStoryBlock
	_, _, _, blockPropertyId2 := createBlock(e, sceneID, storyID, pageId, "reearth", "imageStoryBlock", lo.ToPtr(2))
	_, r = updatePropertyValue(e, blockPropertyId2, "default", "", "src", "http://localhost:8080/assets/01jn54nwbw1cwwma2z4e221zxf.png", "URL")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual("http://localhost:8080/assets/01jn54nwbw1cwwma2z4e221zxf.png")

	// videoStoryBlock
	_, _, _, blockPropertyId3 := createBlock(e, sceneID, storyID, pageId, "reearth", "videoStoryBlock", lo.ToPtr(3))
	_, r = updatePropertyValue(e, blockPropertyId3, "default", "", "src", "http://samplelib.com/lib/preview/mp4/sample-5s.mp4", "URL")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual("http://samplelib.com/lib/preview/mp4/sample-5s.mp4")

	// cameraButtonStoryBlock
	_, _, _, blockPropertyId4 := createBlock(e, sceneID, storyID, pageId, "reearth", "cameraButtonStoryBlock", lo.ToPtr(4))
	_, _, _, groupId4 := addPropertyItem(e, blockPropertyId4, "default")
	_, r = updatePropertyValue(e, blockPropertyId4, "default", groupId4, "cameraPosition", camera, "CAMERA")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual(camera)

	// linkButtonStoryBlock
	_, _, _, blockPropertyId5 := createBlock(e, sceneID, storyID, pageId, "reearth", "linkButtonStoryBlock", lo.ToPtr(5))
	_, _, _, groupId5 := addPropertyItem(e, blockPropertyId5, "default")
	_, r = updatePropertyValue(e, blockPropertyId5, "default", groupId5, "url", "http://samplelib.com/lib/preview/mp4/sample-5s.mp4", "URL")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual("http://samplelib.com/lib/preview/mp4/sample-5s.mp4")

	// showLayersStoryBlock
	_, _, _, blockPropertyId6 := createBlock(e, sceneID, storyID, pageId, "reearth", "showLayersStoryBlock", lo.ToPtr(6))
	_, _, _, groupId6 := addPropertyItem(e, blockPropertyId6, "default")
	_, r = updatePropertyValue(e, blockPropertyId6, "default", groupId6, "showLayers", []string{nlsLayerId.String()}, "ARRAY")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual([]string{nlsLayerId.String()})

	// timelineStoryBlock
	_, _, _, blockPropertyId7 := createBlock(e, sceneID, storyID, pageId, "reearth", "timelineStoryBlock", lo.ToPtr(7))
	_, r = updatePropertyValue(e, blockPropertyId7, "default", "", "timelineSetting", map[string]any{
		"currentTime": "2025-03-03T10:38:59+09:00",
		"startTime":   "2025-02-23T10:38:43+09:00",
		"endTime":     "2025-03-08T10:39:10+09:00",
	}, "TIMELINE")
	r.Path("$.data.updatePropertyValue.propertyField.value").IsEqual(map[string]any{
		"currentTime": "2025-03-03T10:38:59+09:00",
		"startTime":   "2025-02-23T10:38:43+09:00",
		"endTime":     "2025-03-08T10:39:10+09:00",
	})

}
