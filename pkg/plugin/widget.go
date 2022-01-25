package plugin

type WidgetZoneType string
type WidgetSectionType string
type WidgetAreaType string

const (
	WidgetZoneInner     WidgetZoneType    = "inner"
	WidgetZoneOuter     WidgetZoneType    = "outer"
	WidgetSectionLeft   WidgetSectionType = "left"
	WidgetSectionCenter WidgetSectionType = "center"
	WidgetSectionRight  WidgetSectionType = "right"
	WidgetAreaTop       WidgetAreaType    = "top"
	WidgetAreaMiddle    WidgetAreaType    = "middle"
	WidgetAreaBottom    WidgetAreaType    = "bottom"
)

type WidgetLayout struct {
	horizontallyExtendable bool
	verticallyExtendable   bool
	extended               bool
	floating               bool
	defaultLocation        *WidgetLocation
}

func (l WidgetLayout) Extendable(loc WidgetLocation) bool {
	return l.HorizontallyExtendable() && loc.Horizontal() || l.VerticallyExtendable() && loc.Vertical()
}

func NewWidgetLayout(horizontallyExtendable, verticallyExtendable, extended, floating bool, defaultLocation *WidgetLocation) WidgetLayout {
	return WidgetLayout{
		horizontallyExtendable: horizontallyExtendable,
		verticallyExtendable:   verticallyExtendable,
		extended:               extended,
		floating:               floating,
		defaultLocation:        defaultLocation.Clone(),
	}
}

func (l WidgetLayout) Ref() *WidgetLayout {
	return &l
}

func (l WidgetLayout) HorizontallyExtendable() bool {
	return l.horizontallyExtendable
}

func (l WidgetLayout) VerticallyExtendable() bool {
	return l.verticallyExtendable
}

func (l WidgetLayout) Extended() bool {
	return l.extended
}

func (l WidgetLayout) Floating() bool {
	return l.floating
}

func (l WidgetLayout) DefaultLocation() *WidgetLocation {
	if l.defaultLocation == nil {
		return nil
	}
	return l.defaultLocation.Clone()
}

func (l *WidgetLayout) Clone() *WidgetLayout {
	if l == nil {
		return nil
	}
	return &WidgetLayout{
		horizontallyExtendable: l.horizontallyExtendable,
		verticallyExtendable:   l.verticallyExtendable,
		extended:               l.extended,
		floating:               l.floating,
		defaultLocation:        l.defaultLocation.Clone(),
	}
}

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

func (l *WidgetLocation) Clone() *WidgetLocation {
	if l == nil {
		return nil
	}
	return &WidgetLocation{
		Zone:    l.Zone,
		Section: l.Section,
		Area:    l.Area,
	}
}
