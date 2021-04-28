package plugin

import (
	"errors"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/visualizer"
)

// ExtensionBuilder _
type ExtensionBuilder struct {
	p *Extension
	s bool
}

// NewExtension _
func NewExtension() *ExtensionBuilder {
	return &ExtensionBuilder{p: &Extension{}}
}

// Build _
func (b *ExtensionBuilder) Build() (*Extension, error) {
	if string(b.p.id) == "" {
		return nil, id.ErrInvalidID
	}
	if !b.s {
		if b.p.extensionType == ExtensionTypeVisualizer || b.p.extensionType == ExtensionTypeInfobox {
			return nil, errors.New("cannot build system extension")
		}
	}
	return b.p, nil
}

// MustBuild _
func (b *ExtensionBuilder) MustBuild() *Extension {
	p, err := b.Build()
	if err != nil {
		panic(err)
	}
	return p
}

// ID _
func (b *ExtensionBuilder) ID(id id.PluginExtensionID) *ExtensionBuilder {
	b.p.id = id
	return b
}

// Name _
func (b *ExtensionBuilder) Name(name i18n.String) *ExtensionBuilder {
	b.p.name = name.Copy()
	return b
}

// Type _
func (b *ExtensionBuilder) Type(extensionType ExtensionType) *ExtensionBuilder {
	b.p.extensionType = extensionType
	return b
}

// Description _
func (b *ExtensionBuilder) Description(description i18n.String) *ExtensionBuilder {
	b.p.description = description.Copy()
	return b
}

// Icon _
func (b *ExtensionBuilder) Icon(icon string) *ExtensionBuilder {
	b.p.icon = icon
	return b
}

// Schema _
func (b *ExtensionBuilder) Schema(schema id.PropertySchemaID) *ExtensionBuilder {
	b.p.schema = schema
	return b
}

// Visualizer _
func (b *ExtensionBuilder) Visualizer(visualizer visualizer.Visualizer) *ExtensionBuilder {
	b.p.visualizer = visualizer
	return b
}

// System _
func (b *ExtensionBuilder) System(s bool) *ExtensionBuilder {
	b.s = s
	return b
}
