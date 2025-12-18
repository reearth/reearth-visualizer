package e2e

import (
	"testing"

	"github.com/gavv/httpexpect/v2"
	"golang.org/x/text/language"

	accountsID "github.com/reearth/reearth-accounts/server/pkg/id"
)

// export REEARTH_DB=mongodb://localhost
// go test -v -run TestWidgetAlignSystemDesktop ./e2e/...

func getString(obj *httpexpect.Value, key string) string {
	return obj.Object().Value(key).Raw().(string)
}

func TestWidgetAlignSystemDesktop(t *testing.T) {
	e, result := Server(t, baseSeeder)
	_, sceneId, _ := createProjectSet(e, result)

	_, sceneWidget := addWidgetMutation(e, result.UID, map[string]any{
		"type":        "DESKTOP",
		"sceneId":     sceneId,
		"pluginId":    "reearth",
		"extensionId": "button",
	})

	widgetId := getString(sceneWidget, "id")

	updateWidgetMutation(e, result.UID, map[string]any{
		"type":     "DESKTOP",
		"sceneId":  sceneId,
		"widgetId": widgetId,
		"enabled":  true,
		"location": map[string]any{
			"zone":    "INNER",
			"section": "LEFT",
			"area":    "MIDDLE",
		},
		"index": 0,
	})

	updateWidgetAlignSystemMutation(e, result.UID, map[string]any{
		"type":    "DESKTOP",
		"sceneId": sceneId,
		"location": map[string]any{
			"zone":    "OUTER",
			"section": "LEFT",
			"area":    "MIDDLE",
		},
		"align": "END",
	})

	res := getScene(e, result.UID, sceneId, language.Und.String())

	desktop := res.Path("$.widgetAlignSystem.desktop")
	desktop.Path("$.outer.left.middle.align").IsEqual("END")
	desktop.Path("$.inner.left.middle.widgetIds[0]").IsEqual(widgetId)

	removeWidgetMutation(e, result.UID, map[string]any{
		"type":     "DESKTOP",
		"sceneId":  sceneId,
		"widgetId": widgetId,
	})

	res = getScene(e, result.UID, sceneId, language.Und.String())

	desktop = res.Path("$.widgetAlignSystem.desktop")
	desktop.Path("$.inner.left.middle.widgetIds").Array().Length().IsEqual(0)
}

// go test -v -run TestWidgetAlignSystemMobile ./e2e/...
func TestWidgetAlignSystemMobile(t *testing.T) {
	e, result := Server(t, baseSeeder)
	_, sceneId, _ := createProjectSet(e, result)

	_, sceneWidget := addWidgetMutation(e, result.UID, map[string]any{
		"type":        "MOBILE",
		"sceneId":     sceneId,
		"pluginId":    "reearth",
		"extensionId": "button",
	})

	widgetId := getString(sceneWidget, "id")

	updateWidgetMutation(e, result.UID, map[string]any{
		"type":     "MOBILE",
		"sceneId":  sceneId,
		"widgetId": widgetId,
		"enabled":  true,
		"location": map[string]any{
			"zone":    "INNER",
			"section": "LEFT",
			"area":    "MIDDLE",
		},
		"index": 0,
	})

	updateWidgetAlignSystemMutation(e, result.UID, map[string]any{
		"type":    "MOBILE",
		"sceneId": sceneId,
		"location": map[string]any{
			"zone":    "OUTER",
			"section": "LEFT",
			"area":    "MIDDLE",
		},
		"align": "END",
	})

	res := getScene(e, result.UID, sceneId, language.Und.String())

	mobile := res.Path("$.widgetAlignSystem.mobile")
	mobile.Path("$.outer.left.middle.align").IsEqual("END")
	mobile.Path("$.inner.left.middle.widgetIds[0]").IsEqual(widgetId)

	removeWidgetMutation(e, result.UID, map[string]any{
		"type":     "MOBILE",
		"sceneId":  sceneId,
		"widgetId": widgetId,
	})

	res = getScene(e, result.UID, sceneId, language.Und.String())

	mobile = res.Path("$.widgetAlignSystem.mobile")
	mobile.Path("$.inner.left.middle.widgetIds").Array().Length().IsEqual(0)
}

const AddWidgetMutation = `mutation AddWidget($type: WidgetAlignSystemType!, $sceneId: ID!, $pluginId: ID!, $extensionId: ID!, $lang: Lang) {
  addWidget(
    input: {type: $type, sceneId: $sceneId, pluginId: $pluginId, extensionId: $extensionId}
  ) {
    scene {
      id
      widgets {
        id
        enabled
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
    sceneWidget {
      id
      enabled
      pluginId
      extensionId
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
}`

func addWidgetMutation(e *httpexpect.Expect, u accountsID.UserID, variables map[string]any) ([]httpexpect.Value, *httpexpect.Value) {
	requestBody := GraphQLRequest{
		OperationName: "AddWidget",
		Query:         AddWidgetMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)

	return res.Path("$.data.addWidget.scene.widgets").Array().Iter(), res.Path("$.data.addWidget.sceneWidget")
}

const UpdateWidgetMutation = `mutation UpdateWidget($type: WidgetAlignSystemType!, $sceneId: ID!, $widgetId: ID!, $enabled: Boolean, $location: WidgetLocationInput, $extended: Boolean, $index: Int) {
  updateWidget(
    input: {type: $type, sceneId: $sceneId, widgetId: $widgetId, enabled: $enabled, location: $location, extended: $extended, index: $index}
  ) {
    scene {
      id
      widgets {
        id
        enabled
        extended
        pluginId
        extensionId
        propertyId
        __typename
      }
      __typename
    }
    __typename
  }
}`

func updateWidgetMutation(e *httpexpect.Expect, u accountsID.UserID, variables map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "UpdateWidget",
		Query:         UpdateWidgetMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.updateWidget.scene.widgets")
}

const UpdateWidgetAlignSystemMutation = `mutation UpdateWidgetAlignSystem($type: WidgetAlignSystemType!, $sceneId: ID!, $location: WidgetLocationInput!, $align: WidgetAreaAlign, $padding: WidgetAreaPaddingInput, $gap: Int, $centered: Boolean, $background: String) {
  updateWidgetAlignSystem(
    input: {type: $type, sceneId: $sceneId, location: $location, align: $align, padding: $padding, gap: $gap, centered: $centered, background: $background}
  ) {
    scene {
      id
      widgets {
        id
        enabled
        pluginId
        extensionId
        propertyId
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
      __typename
    }
    __typename
  }
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
}`

func updateWidgetAlignSystemMutation(e *httpexpect.Expect, u accountsID.UserID, variables map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "UpdateWidgetAlignSystem",
		Query:         UpdateWidgetAlignSystemMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.updateWidgetAlignSystem.scene.widgetAlignSystem")
}

const RemoveWidgetMutation = `mutation RemoveWidget($type: WidgetAlignSystemType!, $sceneId: ID!, $widgetId: ID!) {
  removeWidget(input: {type: $type, sceneId: $sceneId, widgetId: $widgetId}) {
    scene {
      id
      widgets {
        id
        enabled
        pluginId
        extensionId
        propertyId
        __typename
      }
      __typename
    }
    __typename
  }
}`

func removeWidgetMutation(e *httpexpect.Expect, u accountsID.UserID, variables map[string]any) *httpexpect.Value {
	requestBody := GraphQLRequest{
		OperationName: "RemoveWidget",
		Query:         RemoveWidgetMutation,
		Variables:     variables,
	}
	res := Request(e, u.String(), requestBody)
	return res.Path("$.data.removeWidget.scene.widgets[0]")
}
