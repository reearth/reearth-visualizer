package property

type LinkableFieldsBuilder struct {
	p *LinkableFields
}

func NewLinkableFields() *LinkableFieldsBuilder {
	return &LinkableFieldsBuilder{p: &LinkableFields{}}
}

func (b *LinkableFieldsBuilder) Build() (*LinkableFields, error) {
	return b.p, nil
}

func (b *LinkableFieldsBuilder) MustBuild() *LinkableFields {
	p, err := b.Build()
	if err != nil {
		panic(err)
	}
	return p
}

func (b *LinkableFieldsBuilder) LatLng(LatLng *SchemaFieldPointer) *LinkableFieldsBuilder {
	b.p.LatLng = LatLng
	return b
}
func (b *LinkableFieldsBuilder) URL(URL *SchemaFieldPointer) *LinkableFieldsBuilder {
	b.p.URL = URL
	return b
}
