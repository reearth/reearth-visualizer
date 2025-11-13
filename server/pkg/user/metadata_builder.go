package user

import (
	"github.com/samber/lo"
	"golang.org/x/text/language"
)

type MetadataBuilder struct {
	a Metadata
}

func NewMetadata() *MetadataBuilder {
	return &MetadataBuilder{a: Metadata{}}
}

func (b *MetadataBuilder) Build() (Metadata, error) {
	return b.a, nil
}

func (b *MetadataBuilder) MustBuild() Metadata {
	return lo.Must(b.Build())
}

func (b *MetadataBuilder) Description(description string) *MetadataBuilder {
	b.a.description = description
	return b
}

func (b *MetadataBuilder) Lang(lang language.Tag) *MetadataBuilder {
	b.a.lang = lang
	return b
}

func (b *MetadataBuilder) PhotoURL(photoURL string) *MetadataBuilder {
	b.a.photoURL = photoURL
	return b
}

func (b *MetadataBuilder) Theme(theme string) *MetadataBuilder {
	b.a.theme = theme
	return b
}

func (b *MetadataBuilder) Website(website string) *MetadataBuilder {
	b.a.website = website
	return b
}
