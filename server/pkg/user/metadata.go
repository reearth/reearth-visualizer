package user

import "golang.org/x/text/language"

type Metadata struct {
	description string
	lang        language.Tag
	photoURL    string
	theme       string
	website     string
}

func (m Metadata) Description() string {
	return m.description
}

func (m Metadata) Lang() language.Tag {
	return m.lang
}

func (m Metadata) PhotoURL() string {
	return m.photoURL
}

func (m Metadata) Theme() string {
	return m.theme
}

func (m Metadata) Website() string {
	return m.website
}
