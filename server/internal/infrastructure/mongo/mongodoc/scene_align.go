package mongodoc

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/scene"
)

type WidgetAlignSystemDocument struct {
	Inner *WidgetZoneDocument
	Outer *WidgetZoneDocument
}
type WidgetZoneDocument struct {
	Left   *WidgetSectionDocument
	Center *WidgetSectionDocument
	Right  *WidgetSectionDocument
}

type WidgetSectionDocument struct {
	Top    *WidgetAreaDocument
	Middle *WidgetAreaDocument
	Bottom *WidgetAreaDocument
}

type WidgetAreaDocument struct {
	WidgetIDs  []string
	Align      string
	Padding    *WidgetAreaPaddingDocument
	Gap        *int
	Centered   bool
	Background *string
}

type WidgetAreaPaddingDocument struct {
	Top, Bottom, Left, Right int
}

func NewWidgetAlignSystem(was *scene.WidgetAlignSystem) *WidgetAlignSystemDocument {
	if was == nil {
		return nil
	}

	d := &WidgetAlignSystemDocument{
		Inner: NewWidgetZone(was.Zone(scene.WidgetZoneInner)),
		Outer: NewWidgetZone(was.Zone(scene.WidgetZoneOuter)),
	}

	if d.Inner == nil && d.Outer == nil {
		return nil
	}
	return d
}

func NewWidgetZone(z *scene.WidgetZone) *WidgetZoneDocument {
	if z == nil {
		return nil
	}

	d := &WidgetZoneDocument{
		Left:   NewWidgetSection(z.Section(scene.WidgetSectionLeft)),
		Center: NewWidgetSection(z.Section(scene.WidgetSectionCenter)),
		Right:  NewWidgetSection(z.Section(scene.WidgetSectionRight)),
	}

	if d.Left == nil && d.Center == nil && d.Right == nil {
		return nil
	}
	return d
}

func NewWidgetSection(s *scene.WidgetSection) *WidgetSectionDocument {
	if s == nil {
		return nil
	}

	d := &WidgetSectionDocument{
		Top:    NewWidgetArea(s.Area(scene.WidgetAreaTop)),
		Middle: NewWidgetArea(s.Area(scene.WidgetAreaMiddle)),
		Bottom: NewWidgetArea(s.Area(scene.WidgetAreaBottom)),
	}

	if d.Top == nil && d.Middle == nil && d.Bottom == nil {
		return nil
	}
	return d
}

func NewWidgetArea(a *scene.WidgetArea) *WidgetAreaDocument {
	if a == nil {
		return nil
	}

	return &WidgetAreaDocument{
		WidgetIDs:  a.WidgetIDs().Strings(),
		Align:      string(a.Alignment()),
		Padding:    NewWidgetAreaPadding(a.Padding()),
		Gap:        a.Gap(),
		Centered:   a.Centered(),
		Background: a.Background(),
	}
}

func NewWidgetAreaPadding(p *scene.WidgetAreaPadding) *WidgetAreaPaddingDocument {
	if p == nil {
		return nil
	}

	return &WidgetAreaPaddingDocument{
		Top:    p.Top(),
		Bottom: p.Bottom(),
		Left:   p.Left(),
		Right:  p.Right(),
	}
}

func (d *WidgetAlignSystemDocument) Model() *scene.WidgetAlignSystem {
	if d == nil {
		return nil
	}

	was := scene.NewWidgetAlignSystem()
	was.SetZone(scene.WidgetZoneInner, d.Inner.Model())
	was.SetZone(scene.WidgetZoneOuter, d.Outer.Model())
	return was
}

func (d *WidgetZoneDocument) Model() *scene.WidgetZone {
	if d == nil {
		return nil
	}

	wz := scene.NewWidgetZone()
	wz.SetSection(scene.WidgetSectionLeft, d.Left.Model())
	wz.SetSection(scene.WidgetSectionCenter, d.Center.Model())
	wz.SetSection(scene.WidgetSectionRight, d.Right.Model())
	return wz
}

func (d *WidgetSectionDocument) Model() *scene.WidgetSection {
	if d == nil {
		return nil
	}

	ws := scene.NewWidgetSection()
	ws.SetArea(scene.WidgetAreaTop, d.Top.Model())
	ws.SetArea(scene.WidgetAreaMiddle, d.Middle.Model())
	ws.SetArea(scene.WidgetAreaBottom, d.Bottom.Model())
	return ws
}

func (a *WidgetAreaDocument) Model() *scene.WidgetArea {
	if a == nil {
		return nil
	}

	return scene.NewWidgetArea(
		stringsToWidgetIDs(a.WidgetIDs),
		scene.WidgetAlignType(a.Align),
		a.Padding.Model(),
		a.Gap,
		a.Centered,
		a.Background,
	)
}

func (a *WidgetAreaPaddingDocument) Model() *scene.WidgetAreaPadding {
	if a == nil {
		return nil
	}

	return scene.NewWidgetAreaPadding(a.Left, a.Right, a.Top, a.Bottom)
}

func stringsToWidgetIDs(wids []string) []id.WidgetID {
	if wids == nil {
		return nil
	}
	var docids []id.WidgetID
	for _, wid := range wids {
		nid, err := id.WidgetIDFrom(wid)
		if err != nil {
			continue
		}
		docids = append(docids, nid)
	}
	return docids
}
