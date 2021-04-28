//go:generate go run github.com/reearth/reearth-backend/tools/cmd/idgen --name InfoboxField --output ../id

package layer

import (
	"errors"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
)

type InfoboxField struct {
	id        id.InfoboxFieldID
	plugin    id.PluginID
	extension id.PluginExtensionID
	property  id.PropertyID
}

func (i *InfoboxField) ID() id.InfoboxFieldID {
	return i.id
}

func (i *InfoboxField) Plugin() id.PluginID {
	return i.plugin
}

func (i *InfoboxField) Extension() id.PluginExtensionID {
	return i.extension
}

func (i *InfoboxField) Property() id.PropertyID {
	return i.property
}

func (i *InfoboxField) PropertyRef() *id.PropertyID {
	if i == nil {
		return nil
	}
	return i.property.Ref()
}

func (i *InfoboxField) ValidateProperty(pm property.Map) error {
	if i == nil || pm == nil {
		return nil
	}

	lp := pm[i.property]
	if lp == nil {
		return errors.New("property does not exist")
	}
	if lp.Schema() != id.MustPropertySchemaIDFromExtension(i.plugin, i.extension) {
		return errors.New("property has a invalid schema")
	}

	return nil
}
