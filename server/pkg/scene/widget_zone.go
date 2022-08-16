package scene

// WidgetZone is the structure of each layer (inner and outer) of the align system.
type WidgetZone struct {
	left   *WidgetSection
	center *WidgetSection
	right  *WidgetSection
}

type WidgetSectionType string

const (
	WidgetSectionLeft   WidgetSectionType = "left"
	WidgetSectionCenter WidgetSectionType = "center"
	WidgetSectionRight  WidgetSectionType = "right"
)

func NewWidgetZone() *WidgetZone {
	return &WidgetZone{}
}

func (wz *WidgetZone) Section(s WidgetSectionType) *WidgetSection {
	switch s {
	case WidgetSectionLeft:
		if wz.left == nil {
			wz.left = NewWidgetSection()
		}
		return wz.left
	case WidgetSectionCenter:
		if wz.center == nil {
			wz.center = NewWidgetSection()
		}
		return wz.center
	case WidgetSectionRight:
		if wz.right == nil {
			wz.right = NewWidgetSection()
		}
		return wz.right
	}
	return nil
}

func (z *WidgetZone) Remove(wid WidgetID) {
	if z == nil {
		return
	}

	z.left.Remove(wid)
	z.center.Remove(wid)
	z.right.Remove(wid)
}

func (z *WidgetZone) Find(wid WidgetID) (int, WidgetSectionType, WidgetAreaType) {
	if z == nil {
		return -1, "", ""
	}

	if i, wa := z.left.Find(wid); i >= 0 {
		return i, WidgetSectionLeft, wa
	}
	if i, wa := z.center.Find(wid); i >= 0 {
		return i, WidgetSectionCenter, wa
	}
	if i, wa := z.right.Find(wid); i >= 0 {
		return i, WidgetSectionRight, wa
	}

	return -1, "", ""
}

func (z *WidgetZone) SetSection(t WidgetSectionType, s *WidgetSection) {
	if z == nil {
		return
	}

	switch t {
	case WidgetSectionLeft:
		z.left = s
	case WidgetSectionCenter:
		z.center = s
	case WidgetSectionRight:
		z.right = s
	}
}
