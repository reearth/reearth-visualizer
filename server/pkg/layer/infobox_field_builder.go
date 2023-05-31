package layer

type InfoboxFieldBuilder struct {
	i *InfoboxField
}

func NewInfoboxField() *InfoboxFieldBuilder {
	return &InfoboxFieldBuilder{i: &InfoboxField{}}
}

func (b *InfoboxFieldBuilder) Build() (*InfoboxField, error) {
	if b.i.id.IsNil() || string(b.i.extension) == "" || b.i.property.IsNil() || b.i.plugin.IsNil() {
		return nil, ErrInvalidID
	}
	return b.i, nil
}

func (b *InfoboxFieldBuilder) MustBuild() *InfoboxField {
	i, err := b.Build()
	if err != nil {
		panic(err)
	}
	return i
}

func (b *InfoboxFieldBuilder) ID(id InfoboxFieldID) *InfoboxFieldBuilder {
	b.i.id = id
	return b
}

func (b *InfoboxFieldBuilder) NewID() *InfoboxFieldBuilder {
	b.i.id = NewInfoboxFieldID()
	return b
}

func (b *InfoboxFieldBuilder) Plugin(plugin PluginID) *InfoboxFieldBuilder {
	b.i.plugin = plugin
	return b
}

func (b *InfoboxFieldBuilder) Extension(extension PluginExtensionID) *InfoboxFieldBuilder {
	b.i.extension = extension
	return b
}

func (b *InfoboxFieldBuilder) Property(p PropertyID) *InfoboxFieldBuilder {
	b.i.property = p
	return b
}
