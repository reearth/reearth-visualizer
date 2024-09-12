package builder

import (
	"context"
	"encoding/json"

	"github.com/reearth/reearth/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/idx"
)

func ParseSceneJSON(ctx context.Context, sceneJSONData map[string]interface{}) (*sceneJSON, error) {
	sceneBytes, err := json.MarshalIndent(sceneJSONData, "", "  ")
	if err != nil {
		return nil, err
	}
	var result sceneJSON
	if err := json.Unmarshal(sceneBytes, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func ParserWidgetAlignSystem(widgetAlignSystemJSON *widgetAlignSystemJSON) *scene.WidgetAlignSystem {
	if widgetAlignSystemJSON == nil {
		return nil
	}
	was := scene.NewWidgetAlignSystem()
	if widgetAlignSystemJSON.Inner != nil {
		parseWidgetZone(was.Zone(scene.WidgetZoneInner), widgetAlignSystemJSON.Inner)
	}
	if widgetAlignSystemJSON.Outer != nil {
		parseWidgetZone(was.Zone(scene.WidgetZoneOuter), widgetAlignSystemJSON.Outer)
	}
	return was
}

func parseWidgetZone(zone *scene.WidgetZone, widgetZoneJSON *widgetZoneJSON) {
	if zone == nil || widgetZoneJSON == nil {
		return
	}
	if widgetZoneJSON.Left != nil {
		setWidgetSection(zone.Section(scene.WidgetSectionLeft), widgetZoneJSON.Left)
	}
	if widgetZoneJSON.Center != nil {
		setWidgetSection(zone.Section(scene.WidgetSectionCenter), widgetZoneJSON.Center)
	}
	if widgetZoneJSON.Right != nil {
		setWidgetSection(zone.Section(scene.WidgetSectionRight), widgetZoneJSON.Right)
	}
}

func setWidgetSection(section *scene.WidgetSection, widgetSectionJSON *widgetSectionJSON) {
	if section == nil || widgetSectionJSON == nil {
		return
	}
	section.SetArea(scene.WidgetAreaTop, parseWidgetArea(widgetSectionJSON.Top))
	section.SetArea(scene.WidgetAreaMiddle, parseWidgetArea(widgetSectionJSON.Middle))
	section.SetArea(scene.WidgetAreaBottom, parseWidgetArea(widgetSectionJSON.Bottom))
}

func parseWidgetArea(widgetAreaJSON *widgetAreaJSON) *scene.WidgetArea {
	if widgetAreaJSON == nil {
		return nil
	}
	var widgetIDs []idx.ID[id.Widget]
	for _, widgetID := range widgetAreaJSON.WidgetIDs {
		id, _ := gqlmodel.ToID[id.Widget](gqlmodel.ID(widgetID))
		widgetIDs = append(widgetIDs, id)
	}
	return scene.NewWidgetArea(
		widgetIDs,
		parseWidgetAlign(widgetAreaJSON.Align),
		parseWidgetAreaPadding(widgetAreaJSON.Padding),
		widgetAreaJSON.Gap,
		widgetAreaJSON.Centered,
		widgetAreaJSON.Background,
	)
}

func parseWidgetAlign(align string) scene.WidgetAlignType {
	switch align {
	case "start":
		return scene.WidgetAlignStart
	case "centered":
		return scene.WidgetAlignCentered
	case "end":
		return scene.WidgetAlignEnd
	default:
		return scene.WidgetAlignStart
	}
}

func parseWidgetAreaPadding(paddingJSON *widgetAreaPaddingJSON) *scene.WidgetAreaPadding {
	if paddingJSON == nil {
		return nil
	}
	return scene.NewWidgetAreaPadding(
		paddingJSON.Left,
		paddingJSON.Right,
		paddingJSON.Top,
		paddingJSON.Bottom,
	)
}

func AddItemFromPropertyJSON(prop *property.Property, ps *property.Schema, pj propertyJSON) (*property.Property, error) {
	for sgKey, value1 := range pj {
		schemaGroupID := id.PropertySchemaGroupIDFromRef(&sgKey)
		if iVal, ok := value1.(map[string]interface{}); ok {
			for fKey, value2 := range iVal {
				fieldID := id.PropertyFieldIDFromRef(&fKey)
				ptr := property.NewPointer(schemaGroupID, nil, fieldID)
				v, ok := parsePropertyValue(value2)
				if ok {
					_, _, _, err := prop.UpdateValue(ps, ptr, v)
					if err != nil {
						return nil, err
					}
				}
			}
		}
	}
	return prop, nil
}

func parsePropertyValue(value interface{}) (*property.Value, bool) {
	if fieldObj, ok := value.(map[string]interface{}); ok {
		fieldType, ok1 := fieldObj["type"].(string)
		fieldVal, ok2 := fieldObj["value"]
		if ok1 && ok2 {
			return property.ValueType(fieldType).ValueFrom(fieldVal), ok
		}
	}
	return nil, false
}
