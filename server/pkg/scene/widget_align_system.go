package scene

type WidgetLocation struct {
	Zone    WidgetZoneType
	Section WidgetSectionType
	Area    WidgetAreaType
}

func (l WidgetLocation) Horizontal() bool {
	return l.Section == WidgetSectionCenter
}

func (l WidgetLocation) Vertical() bool {
	return l.Area == WidgetAreaMiddle
}

// WidgetAlignSystem is the layout structure of any enabled widgets that will be displayed over the scene.
type WidgetAlignSystem struct {
	inner *WidgetZone
	outer *WidgetZone
}

type WidgetZoneType string

const (
	WidgetZoneInner WidgetZoneType = "inner"
	WidgetZoneOuter WidgetZoneType = "outer"
)

// NewWidgetAlignSystem returns a new widget align system.
func NewWidgetAlignSystem() *WidgetAlignSystem {
	return &WidgetAlignSystem{}
}

// Zone will return a specific zone in the align system.
func (was *WidgetAlignSystem) Zone(zone WidgetZoneType) *WidgetZone {
	if was == nil {
		return nil
	}
	switch zone {
	case WidgetZoneInner:
		if was.inner == nil {
			was.inner = NewWidgetZone()
		}
		return was.inner
	case WidgetZoneOuter:
		if was.outer == nil {
			was.outer = NewWidgetZone()
		}
		return was.outer
	}
	return nil
}

// Remove a widget from the align system.
func (was *WidgetAlignSystem) Remove(wid WidgetID) {
	if was == nil {
		return
	}

	was.inner.Remove(wid)
	was.outer.Remove(wid)
}

func (was *WidgetAlignSystem) Area(loc WidgetLocation) *WidgetArea {
	return was.Zone(loc.Zone).Section(loc.Section).Area(loc.Area)
}

func (was *WidgetAlignSystem) Find(wid WidgetID) (int, WidgetLocation) {
	if was == nil {
		return -1, WidgetLocation{}
	}

	if i, section, area := was.inner.Find(wid); i >= 0 {
		return i, WidgetLocation{
			Zone:    WidgetZoneInner,
			Section: section,
			Area:    area,
		}
	}
	if i, section, area := was.outer.Find(wid); i >= 0 {
		return i, WidgetLocation{
			Zone:    WidgetZoneOuter,
			Section: section,
			Area:    area,
		}
	}

	return -1, WidgetLocation{}
}

func (was *WidgetAlignSystem) Move(wid WidgetID, location WidgetLocation, index int) {
	if was == nil {
		return
	}

	if i, loc := was.Find(wid); i < 0 {
		return
	} else if loc != location {
		was.Area(loc).Remove(wid)
		was.Area(location).Add(wid, index)
	} else {
		was.Area(location).Move(i, index)
	}
}

func (w *WidgetAlignSystem) SetZone(t WidgetZoneType, z *WidgetZone) {
	if w == nil {
		return
	}

	switch t {
	case WidgetZoneInner:
		w.inner = z
	case WidgetZoneOuter:
		w.outer = z
	}
}
