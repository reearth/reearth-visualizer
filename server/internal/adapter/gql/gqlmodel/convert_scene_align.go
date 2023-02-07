package gqlmodel

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
	"github.com/reearth/reearthx/util"
)

func ToWidgetAlignSystem(sas *scene.WidgetAlignSystem) *WidgetAlignSystem {
	widgetAlignDoc := WidgetAlignSystem{
		Inner: ToWidgetZone(sas.Zone(scene.WidgetZoneInner)),
		Outer: ToWidgetZone(sas.Zone(scene.WidgetZoneOuter)),
	}
	return &widgetAlignDoc
}

func ToWidgetZone(z *scene.WidgetZone) *WidgetZone {
	if z == nil {
		return nil
	}

	return &WidgetZone{
		Left:   ToWidgetSection(z.Section(scene.WidgetSectionLeft)),
		Center: ToWidgetSection(z.Section(scene.WidgetSectionCenter)),
		Right:  ToWidgetSection(z.Section(scene.WidgetSectionRight)),
	}
}

func ToWidgetSection(s *scene.WidgetSection) *WidgetSection {
	if s == nil {
		return nil
	}

	return &WidgetSection{
		Top:    ToWidgetArea(s.Area(scene.WidgetAreaTop)),
		Middle: ToWidgetArea(s.Area(scene.WidgetAreaMiddle)),
		Bottom: ToWidgetArea(s.Area(scene.WidgetAreaBottom)),
	}
}
func ToWidgetAreaPadding(p *scene.WidgetAreaPadding) *WidgetAreaPadding {
	if p == nil {
		return nil
	}

	return &WidgetAreaPadding{
		Top:    p.Top(),
		Bottom: p.Bottom(),
		Left:   p.Left(),
		Right:  p.Right(),
	}
}

func ToWidgetArea(a *scene.WidgetArea) *WidgetArea {
	if a == nil {
		return nil
	}

	return &WidgetArea{
		WidgetIds:  util.Map(a.WidgetIDs(), IDFrom[id.Widget]),
		Align:      ToWidgetAlignType(a.Alignment()),
		Padding:    ToWidgetAreaPadding(a.Padding()),
		Gap:        a.Gap(),
		Centered:   a.Centered(),
		Background: a.Background(),
	}
}

func ToWidgetAlignType(s scene.WidgetAlignType) WidgetAreaAlign {
	switch s {
	case scene.WidgetAlignStart:
		return WidgetAreaAlignStart
	case scene.WidgetAlignCentered:
		return WidgetAreaAlignCentered
	case scene.WidgetAlignEnd:
		return WidgetAreaAlignEnd
	}
	return ""
}

func FromSceneWidgetLocation(l *WidgetLocationInput) *scene.WidgetLocation {
	if l == nil {
		return nil
	}

	return &scene.WidgetLocation{
		Zone:    FromSceneWidgetZoneType(l.Zone),
		Section: FromSceneWidgetSectionType(l.Section),
		Area:    FromSceneWidgetAreaType(l.Area),
	}
}

func FromSceneWidgetAreaPadding(p *WidgetAreaPaddingInput) *scene.WidgetAreaPadding {
	if p == nil {
		return nil
	}
	pp := scene.NewWidgetAreaPadding(
		p.Left,
		p.Right,
		p.Top,
		p.Bottom,
	)
	return pp
}

func FromSceneWidgetZoneType(t WidgetZoneType) scene.WidgetZoneType {
	switch t {
	case WidgetZoneTypeInner:
		return scene.WidgetZoneInner
	case WidgetZoneTypeOuter:
		return scene.WidgetZoneOuter
	}
	return ""
}

func FromSceneWidgetSectionType(t WidgetSectionType) scene.WidgetSectionType {
	switch t {
	case WidgetSectionTypeLeft:
		return scene.WidgetSectionLeft
	case WidgetSectionTypeCenter:
		return scene.WidgetSectionCenter
	case WidgetSectionTypeRight:
		return scene.WidgetSectionRight
	}
	return ""
}

func FromSceneWidgetAreaType(t WidgetAreaType) scene.WidgetAreaType {
	switch t {
	case WidgetAreaTypeTop:
		return scene.WidgetAreaTop
	case WidgetAreaTypeMiddle:
		return scene.WidgetAreaMiddle
	case WidgetAreaTypeBottom:
		return scene.WidgetAreaBottom
	}
	return ""
}

func FromWidgetAlignType(a *WidgetAreaAlign) *scene.WidgetAlignType {
	if a == nil {
		return nil
	}
	var r scene.WidgetAlignType
	switch *a {
	case WidgetAreaAlignStart:
		r = scene.WidgetAlignStart
	case WidgetAreaAlignCentered:
		r = scene.WidgetAlignCentered
	case WidgetAreaAlignEnd:
		r = scene.WidgetAlignEnd
	}
	return &r
}
