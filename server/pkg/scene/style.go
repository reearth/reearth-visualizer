package scene

type Style struct {
	id    StyleID
	name  string
	value *StyleValue
}

func NewStyle(sid StyleID, name string, sv *StyleValue) (*Style, error) {
	if sid.IsNil() {
		return nil, ErrInvalidID
	}
	return &Style{
		id:    sid,
		name:  name,
		value: sv,
	}, nil
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
