package manifest

import (
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/property"
)

type Manifest struct {
	Plugin          *plugin.Plugin
	ExtensionSchema []*property.Schema
	Schema          *property.Schema
}

func (m Manifest) PropertySchemas() []*property.Schema {
	if m.Schema == nil {
		return append([]*property.Schema{}, m.ExtensionSchema...)
	}
	return append(m.ExtensionSchema, m.Schema)
}
