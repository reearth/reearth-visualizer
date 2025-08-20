package builder

import (
	"context"
	"encoding/json"
	"errors"
	"net/url"
	"strings"

	"github.com/reearth/reearth/server/internal/adapter"
	"github.com/reearth/reearth/server/internal/usecase/repo"
	"github.com/reearth/reearth/server/pkg/builtin"
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearth/server/pkg/value"
)

func ParseSceneJSON(sceneJSONData map[string]any) (*sceneJSON, error) {
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

func ParseSceneJSONByByte(data *[]byte) (*sceneJSON, error) {
	var d map[string]any
	if err := json.Unmarshal(*data, &d); err != nil {
		return nil, err
	}
	sceneData, ok := d["scene"].(map[string]any)
	if !ok {
		return nil, errors.New("scene parse error")
	}
	return ParseSceneJSON(sceneData)
}

func ParserWidgetAlignSystem(data *[]byte) (*scene.WidgetAlignSystems, error) {
	sceneJSON, err := ParseSceneJSONByByte(data)
	if err != nil {
		return nil, err
	}
	widgetAlignSystemsJSON := sceneJSON.WidgetAlignSystem
	if widgetAlignSystemsJSON == nil {
		return nil, nil
	}
	wass := scene.NewWidgetAlignSystems()
	wass.SetSystem(scene.WidgetAlignSystemTypeDesktop, parserWidgetAlignSystem(widgetAlignSystemsJSON.Desktop))
	wass.SetSystem(scene.WidgetAlignSystemTypeMobile, parserWidgetAlignSystem(widgetAlignSystemsJSON.Mobile))
	return wass, nil
}

func parserWidgetAlignSystem(widgetAlignSystemJSON *widgetAlignSystemJSON) *scene.WidgetAlignSystem {
	if widgetAlignSystemJSON == nil {
		return nil
	}
	was := scene.NewWidgetAlignSystem()
	was.SetZone(scene.WidgetZoneInner, parseWidgetZone(widgetAlignSystemJSON.Inner))
	was.SetZone(scene.WidgetZoneOuter, parseWidgetZone(widgetAlignSystemJSON.Outer))
	return was
}

func parseWidgetZone(widgetZoneJSON *widgetZoneJSON) *scene.WidgetZone {
	if widgetZoneJSON == nil {
		return nil
	}
	zone := scene.NewWidgetZone()
	zone.SetSection(scene.WidgetSectionLeft, parseWidgetSection(widgetZoneJSON.Left))
	zone.SetSection(scene.WidgetSectionCenter, parseWidgetSection(widgetZoneJSON.Center))
	zone.SetSection(scene.WidgetSectionRight, parseWidgetSection(widgetZoneJSON.Right))
	return zone
}

func parseWidgetSection(widgetSectionJSON *widgetSectionJSON) *scene.WidgetSection {
	if widgetSectionJSON == nil {
		return nil
	}
	section := scene.NewWidgetSection()
	section.SetArea(scene.WidgetAreaTop, parseWidgetArea(widgetSectionJSON.Top))
	section.SetArea(scene.WidgetAreaMiddle, parseWidgetArea(widgetSectionJSON.Middle))
	section.SetArea(scene.WidgetAreaBottom, parseWidgetArea(widgetSectionJSON.Bottom))
	return section
}

func parseWidgetArea(widgetAreaJSON *widgetAreaJSON) *scene.WidgetArea {
	if widgetAreaJSON == nil {
		return nil
	}
	var widgetIDs id.WidgetIDList
	for _, widgetID := range widgetAreaJSON.WidgetIDs {
		if wid, err := id.WidgetIDFrom(widgetID); err == nil {
			widgetIDs = append(widgetIDs, wid)
		}
	}
	area := scene.NewWidgetArea(
		widgetIDs,
		parseWidgetAlign(widgetAreaJSON.Align),
		parseWidgetAreaPadding(widgetAreaJSON.Padding),
		widgetAreaJSON.Gap,
		widgetAreaJSON.Centered,
		widgetAreaJSON.Background,
	)
	return area
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
	padding := scene.NewWidgetAreaPadding(
		paddingJSON.Left,
		paddingJSON.Right,
		paddingJSON.Top,
		paddingJSON.Bottom,
	)
	return padding
}

func Filter(s id.SceneID) repo.SceneFilter {
	return repo.SceneFilter{Readable: id.SceneIDList{s}, Writable: id.SceneIDList{s}}
}

func PropertyUpdate(
	ctx context.Context,
	p *property.Property,
	propertyRepo repo.Property,
	propertySchemaRepo repo.PropertySchema,
	data propertyJSON) {

	ps, err := propertySchemaRepo.Filtered(Filter(p.Scene())).FindByID(ctx, p.Schema())
	if ps == nil || err != nil {
		return
	}

	for schemaGroupId, v1 := range data {

		if v1Map, ok := v1.(map[string]interface{}); ok {
			for fieldId, v2 := range v1Map {
				pv := ToPropertyValue(v2)
				sg := id.PropertySchemaGroupIDFromRef(&schemaGroupId)
				pt := property.NewPointer(sg, nil, id.PropertyFieldIDFromRef(&fieldId))
				if _, _, _, err := p.UpdateValue(ps, pt, pv); err != nil {
					return
				}

				if err := propertyRepo.Filtered(Filter(p.Scene())).Save(ctx, p); err != nil {
					return
				}
			}
		} else if v1List, ok := v1.([]interface{}); ok {

			sg := id.PropertySchemaGroupID(schemaGroupId)
			gl := p.GetOrCreateGroupList(ps, property.PointItemBySchema(sg))

			for i, v2 := range v1List {
				var g *property.Group

				if i == 0 && len(p.GroupListBySchema(sg).Groups()) > 0 && //
					(builtin.PropertySchemaIDVisualizerCesium == ps.ID() ||
						builtin.PropertySchemaIDVisualizerBetaCesium == ps.ID()) {

					// The initial properties of tiles have already been created by CreateScene.
					g = p.GroupListBySchema(sg).Groups()[0]

				} else {

					g = property.NewGroup().NewID().SchemaGroup(sg).MustBuild()

				}

				gl.Add(g, -1)

				if v2Map, ok := v2.(map[string]interface{}); ok {
					for fieldId, v3 := range v2Map {
						if fieldId == "id" {
							continue
						}
						pv := ToPropertyValue(v3)
						ov := property.NewOptionalValue(pv.Type(), pv)
						field := id.PropertyFieldIDFromRef(&fieldId)
						g.AddFields(
							property.NewField(*field).
								Value(ov).
								Build(),
						)
						if err := propertyRepo.Filtered(Filter(p.Scene())).Save(ctx, p); err != nil {
							return
						}
					}
				}
			}
		}
	}
}

func ToPropertyValue(data interface{}) *property.Value {
	if dataMap, ok := data.(map[string]interface{}); ok {
		if t, ok := dataMap["type"].(string); ok {
			return property.ValueType(value.Type(t)).ValueFrom(dataMap["value"])
		}
	}
	return nil
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
