package scene

import "fmt"

type Style struct {
	IDField    StyleID     `msgpack:"IDField"`
	NameField  string      `msgpack:"NameField"`
	ValueField *StyleValue `msgpack:"ValueField"`
	SceneField ID          `msgpack:"SceneField"`
}

func (s *Style) ID() StyleID {
	if s == nil {
		return StyleID{}
	}
	return s.IDField
}

func (s *Style) Name() string {
	if s == nil {
		return ""
	}
	return s.NameField
}

func (s *Style) Value() *StyleValue {
	if s == nil {
		return nil
	}
	return s.ValueField
}

func (s *Style) Rename(name string) {
	if s == nil {
		return
	}
	s.NameField = name
}

func (s *Style) UpdateValue(sv *StyleValue) {
	if s == nil {
		return
	}
	s.ValueField = sv
}

func (l *Style) Scene() ID {
	return l.SceneField
}

func (s *Style) Duplicate() *Style {
	if s == nil {
		return nil
	}

	return NewStyle().NewID().Name(s.NameField).Value(s.ValueField).Scene(s.SceneField).MustBuild()
}

func StyleCacheKey(id StyleID) string {
	return fmt.Sprintf("style:%s", id)
}
