package builder

import (
	"context"
	"encoding/json"
	"net/url"
	"strings"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/log"
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

func ParserWidgetAlignSystem(widgetAlignSystemJSON *widgetAlignSystemJSON, replaceWidgetIDs map[string]idx.ID[id.Widget]) *scene.WidgetAlignSystem {
	if widgetAlignSystemJSON == nil {
		return nil
	}
	was := scene.NewWidgetAlignSystem()
	if widgetAlignSystemJSON.Inner != nil {
		parseWidgetZone(was.Zone(scene.WidgetZoneInner), widgetAlignSystemJSON.Inner, replaceWidgetIDs)
	}
	if widgetAlignSystemJSON.Outer != nil {
		parseWidgetZone(was.Zone(scene.WidgetZoneOuter), widgetAlignSystemJSON.Outer, replaceWidgetIDs)
	}
	return was
}

func parseWidgetZone(zone *scene.WidgetZone, widgetZoneJSON *widgetZoneJSON, replaceWidgetIDs map[string]idx.ID[id.Widget]) {
	if zone == nil || widgetZoneJSON == nil {
		return
	}
	if widgetZoneJSON.Left != nil {
		setWidgetSection(zone.Section(scene.WidgetSectionLeft), widgetZoneJSON.Left, replaceWidgetIDs)
	}
	if widgetZoneJSON.Center != nil {
		setWidgetSection(zone.Section(scene.WidgetSectionCenter), widgetZoneJSON.Center, replaceWidgetIDs)
	}
	if widgetZoneJSON.Right != nil {
		setWidgetSection(zone.Section(scene.WidgetSectionRight), widgetZoneJSON.Right, replaceWidgetIDs)
	}
}

func setWidgetSection(section *scene.WidgetSection, widgetSectionJSON *widgetSectionJSON, replaceWidgetIDs map[string]idx.ID[id.Widget]) {
	if section == nil || widgetSectionJSON == nil {
		return
	}
	section.SetArea(scene.WidgetAreaTop, parseWidgetArea(widgetSectionJSON.Top, replaceWidgetIDs))
	section.SetArea(scene.WidgetAreaMiddle, parseWidgetArea(widgetSectionJSON.Middle, replaceWidgetIDs))
	section.SetArea(scene.WidgetAreaBottom, parseWidgetArea(widgetSectionJSON.Bottom, replaceWidgetIDs))
}

func parseWidgetArea(widgetAreaJSON *widgetAreaJSON, replaceWidgetIDs map[string]idx.ID[id.Widget]) *scene.WidgetArea {
	if widgetAreaJSON == nil {
		return nil
	}

	var widgetIDs []idx.ID[id.Widget]
	for _, oldId := range widgetAreaJSON.WidgetIDs {
		widgetIDs = append(widgetIDs, replaceWidgetIDs[oldId])
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

func AddItemFromPropertyJSON(ctx context.Context, prop *property.Property, ps *property.Schema, pj propertyJSON) (*property.Property, error) {
	for sgKey, value := range pj {

		if items, ok := value.(map[string]interface{}); ok {
			// simple property

			sgID := id.PropertySchemaGroupIDFromRef(&sgKey)

			for fieldKey, value := range items {

				fieldID := id.PropertyFieldIDFromRef(&fieldKey)
				ptr := property.NewPointer(sgID, nil, fieldID)
				pv, ok := parsePropertyValue(ctx, value)

				if ok && ps != nil {
					_, _, _, err := prop.UpdateValue(ps, ptr, pv)
					if err != nil {
						return nil, err
					}
				}
			}

		} else if arrayProperty, ok := value.([]interface{}); ok {
			// group property

			for _, groupProperty := range arrayProperty {

				sg := id.PropertySchemaGroupID(sgKey)
				gl := prop.GetOrCreateGroupList(ps, property.PointItemBySchema(sg))
				g := property.NewGroup().NewID().SchemaGroup(sg).MustBuild()
				gl.Add(g, -1)

				if items, ok := groupProperty.(map[string]interface{}); ok {

					for fieldKey, value := range items {
						if fieldKey == "id" {
							continue
						}
						ov, ok := parsePropertyOptionalValue(ctx, value)
						if ok {
							fieldID := id.PropertyFieldIDFromRef(&fieldKey)
							field := property.NewField(*fieldID).
								Value(ov).
								// Links(flinks).
								Build()
							g.AddFields(field)
						}
					}
				}
			}
		}
	}
	return prop, nil
}

func parsePropertyValue(ctx context.Context, value interface{}) (*property.Value, bool) {
	if fieldObj, ok := value.(map[string]interface{}); ok {
		if fieldType, ok := fieldObj["type"].(string); ok {
			if fieldVal, ok := fieldObj["value"]; ok {
				if fieldType == "url" {
					if !IsCurrentHostAssets(ctx, fieldVal.(string)) {
						fieldVal = ReplaceToCurrentHost(ctx, fieldVal.(string))
					}
				}
				return property.ValueType(fieldType).ValueFrom(fieldVal), ok
			}
		}
	}
	log.Infofc(ctx, "property is unreadable %v\n", value)
	return nil, false
}

func parsePropertyOptionalValue(ctx context.Context, value interface{}) (*property.OptionalValue, bool) {
	pv, ok := parsePropertyValue(ctx, value)
	if ok {
		ov := property.NewOptionalValue(pv.Type(), pv)
		return ov, true
	}
	return nil, false
}

func IsCurrentHostAssets(ctx context.Context, u string) bool {
	if strings.HasPrefix(u, "assets/") || strings.HasPrefix(u, "/assets") {
		return true
	}
	return strings.HasPrefix(u, adapter.CurrentHost(ctx))
}

func ReplaceToCurrentHost(ctx context.Context, urlString string) string {
	u, err := url.Parse(urlString)
	if err != nil {
		return urlString
	}
	u2, err := url.Parse(adapter.CurrentHost(ctx))
	if err != nil {
		return urlString
	}
	u.Scheme = u2.Scheme
	u.Host = u2.Host
	return u.String()
}
