package manifest

import (
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
)

type Manifest struct {
	Plugin          *plugin.Plugin
	ExtensionSchema property.SchemaList
	Schema          *property.Schema
}

func (m Manifest) PropertySchemas() property.SchemaList {
	sl := append(property.SchemaList{}, m.ExtensionSchema...)
	if m.Schema != nil {
		sl = append(sl, m.Schema)
	}
	return sl
}

func (m Manifest) PropertySchema(psid property.SchemaID) *property.Schema {
	if psid.IsNil() {
		return nil
	}
	if m.Schema != nil && psid.Equal(m.Schema.ID()) {
		return m.Schema
	}
	return m.ExtensionSchema.Find(psid)
}
