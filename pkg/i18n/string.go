package i18n

const DefaultLang = "en"

type String map[string]string // key should use BCP 47 representation

func StringFrom(s string) String {
	if s == "" {
		return String{}
	}
	return String{DefaultLang: s}
}

func (s String) WithDefault(d string) String {
	if s == nil && d == "" {
		return nil
	}

	res := s.Clone()
	if res == nil {
		res = String{}
	}
	if d != "" {
		res[DefaultLang] = d
	}
	return res
}

func (s String) WithDefaultRef(d *string) String {
	if d == nil {
		return s.Clone()
	}
	return s.WithDefault(*d)
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

func (s String) Clone() String {
	if len(s) == 0 {
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
	return s[DefaultLang]
}

func (s String) StringRef() *string {
	if s == nil {
		return nil
	}
	st := s[DefaultLang]
	return &st
}
