package i18n

type String map[string]string // key should use BCP 47 representation

func StringFrom(s string) String {
	if s == "" {
		return nil
	}
	return String{"en": s}
}

func (s String) Translated(lang ...string) string {
	if s == nil {
		return ""
	}
	for _, l := range lang {
		if s, ok := s[l]; ok {
			return s
		}
	}
	return s.String()
}

func (s String) Copy() String {
	if s == nil {
		return nil
	}
	s2 := make(String, len(s))
	for k, v := range s {
		s2[k] = v
	}
	return s2
}

func (s String) String() string {
	if s == nil {
		return ""
	}
	return s["en"]
}

func (s String) StringRef() *string {
	if s == nil {
		return nil
	}
	st := s["en"]
	return &st
}
