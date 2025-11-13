package workspace

import (
	"github.com/samber/lo"
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

func (b *MetadataBuilder) Website(website string) *MetadataBuilder {
	b.a.website = website
	return b
}

func (b *MetadataBuilder) Location(location string) *MetadataBuilder {
	b.a.location = location
	return b
}

func (b *MetadataBuilder) BillingEmail(billingEmail string) *MetadataBuilder {
	b.a.billingEmail = billingEmail
	return b
}

func (b *MetadataBuilder) PhotoURL(photoURL string) *MetadataBuilder {
	b.a.photoURL = photoURL
	return b
}
