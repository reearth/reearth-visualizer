package scene

type Style struct {
	id    StyleID
	name  string
	value *StyleValue
	scene ID
}

func (s *Style) ID() StyleID {
	if s == nil {
		return StyleID{}
	}
	return s.id
}

func (s *Style) Name() string {
	if s == nil {
		return ""
	}
	return s.name
}

func (s *Style) Value() *StyleValue {
	if s == nil {
		return nil
	}
	return s.value
}

func (s *Style) Rename(name string) {
	if s == nil {
		return
	}
	s.name = name
}

func (s *Style) UpdateValue(sv *StyleValue) {
	if s == nil {
		return
	}
	s.value = sv
}

func (l *Style) Scene() ID {
	return l.scene
}

func (s *Style) Duplicate() *Style {
	if s == nil {
		return nil
	}

	return NewStyle().NewID().Name(s.name).Value(s.value).Scene(s.scene).MustBuild()
}
