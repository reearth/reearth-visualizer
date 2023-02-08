package scene

// WidgetSection is the structure of each section of the align system.
type WidgetSection struct {
	top    *WidgetArea
	middle *WidgetArea
	bottom *WidgetArea
}

type WidgetAreaType string

var (
	WidgetAreaTop    WidgetAreaType = "top"
	WidgetAreaMiddle WidgetAreaType = "middle"
	WidgetAreaBottom WidgetAreaType = "bottom"
)

func NewWidgetSection() *WidgetSection {
	return &WidgetSection{}
}

func (s *WidgetSection) Area(t WidgetAreaType) *WidgetArea {
	if s == nil {
		return nil
	}

	switch t {
	case WidgetAreaTop:
		if s.top == nil {
			s.top = NewWidgetArea(nil, WidgetAlignStart, nil, nil, false, nil)
		}
		return s.top
	case WidgetAreaMiddle:
		if s.middle == nil {
			s.middle = NewWidgetArea(nil, WidgetAlignStart, nil, nil, false, nil)
		}
		return s.middle
	case WidgetAreaBottom:
		if s.bottom == nil {
			s.bottom = NewWidgetArea(nil, WidgetAlignStart, nil, nil, false, nil)
		}
		return s.bottom
	}
	return nil
}

func (s *WidgetSection) Find(wid WidgetID) (int, WidgetAreaType) {
	if s == nil {
		return -1, ""
	}

	if i := s.top.Find(wid); i >= 0 {
		return i, WidgetAreaTop
	}
	if i := s.middle.Find(wid); i >= 0 {
		return i, WidgetAreaMiddle
	}
	if i := s.bottom.Find(wid); i >= 0 {
		return i, WidgetAreaBottom
	}
	return -1, ""
}

func (s *WidgetSection) Remove(wid WidgetID) {
	if s == nil {
		return
	}

	s.top.Remove(wid)
	s.middle.Remove(wid)
	s.bottom.Remove(wid)
}

func (s *WidgetSection) SetArea(t WidgetAreaType, a *WidgetArea) {
	if s == nil {
		return
	}

	switch t {
	case WidgetAreaTop:
		s.top = a
	case WidgetAreaMiddle:
		s.middle = a
	case WidgetAreaBottom:
		s.bottom = a
	}
}
