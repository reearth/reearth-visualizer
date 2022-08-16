package plugin

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/visualizer"
)

type ExtensionBuilder struct {
	p *Extension
	s bool
}

func NewExtension() *ExtensionBuilder {
	return &ExtensionBuilder{p: &Extension{}}
}

func (b *ExtensionBuilder) Build() (*Extension, error) {
	if string(b.p.id) == "" {
		return nil, ErrInvalidID
	}
	if !b.s {
		if b.p.extensionType == ExtensionTypeVisualizer || b.p.extensionType == ExtensionTypeInfobox {
			return nil, errors.New("cannot build system extension")
		}
	}
	return b.p, nil
}

func (b *ExtensionBuilder) MustBuild() *Extension {
	p, err := b.Build()
	if err != nil {
		panic(err)
	}
	return p
}

func (b *ExtensionBuilder) ID(id ExtensionID) *ExtensionBuilder {
	b.p.id = id
	return b
}

func (b *ExtensionBuilder) Name(name i18n.String) *ExtensionBuilder {
	b.p.name = name.Clone()
	return b
}

func (b *ExtensionBuilder) Type(extensionType ExtensionType) *ExtensionBuilder {
	b.p.extensionType = extensionType
	return b
}

func (b *ExtensionBuilder) Description(description i18n.String) *ExtensionBuilder {
	b.p.description = description.Clone()
	return b
}

func (b *ExtensionBuilder) Icon(icon string) *ExtensionBuilder {
	b.p.icon = icon
	return b
}

func (b *ExtensionBuilder) Schema(schema PropertySchemaID) *ExtensionBuilder {
	b.p.schema = schema
	return b
}

func (b *ExtensionBuilder) Visualizer(visualizer visualizer.Visualizer) *ExtensionBuilder {
	b.p.visualizer = visualizer
	return b
}

func (b *ExtensionBuilder) SingleOnly(singleOnly bool) *ExtensionBuilder {
	b.p.singleOnly = singleOnly
	return b
}

func (b *ExtensionBuilder) WidgetLayout(widgetLayout *WidgetLayout) *ExtensionBuilder {
	b.p.widgetLayout = widgetLayout
	return b
}

func (b *ExtensionBuilder) System(s bool) *ExtensionBuilder {
	b.s = s
	return b
}
