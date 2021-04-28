package layer

import (
	"github.com/reearth/reearth-backend/pkg/id"
)

// InfoboxFieldBuilder _
type InfoboxFieldBuilder struct {
	i *InfoboxField
}

func NewInfoboxField() *InfoboxFieldBuilder {
	return &InfoboxFieldBuilder{i: &InfoboxField{}}
}

func (b *InfoboxFieldBuilder) Build() (*InfoboxField, error) {
	if id.ID(b.i.id).IsNil() ||
		string(b.i.extension) == "" ||
		id.ID(b.i.property).IsNil() {
		return nil, id.ErrInvalidID
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

func (b *InfoboxFieldBuilder) ID(id id.InfoboxFieldID) *InfoboxFieldBuilder {
	b.i.id = id
	return b
}

func (b *InfoboxFieldBuilder) NewID() *InfoboxFieldBuilder {
	b.i.id = id.InfoboxFieldID(id.New())
	return b
}

func (b *InfoboxFieldBuilder) Plugin(plugin id.PluginID) *InfoboxFieldBuilder {
	b.i.plugin = plugin
	return b
}

func (b *InfoboxFieldBuilder) Extension(extension id.PluginExtensionID) *InfoboxFieldBuilder {
	b.i.extension = extension
	return b
}

func (b *InfoboxFieldBuilder) Property(p id.PropertyID) *InfoboxFieldBuilder {
	b.i.property = p
	return b
}
