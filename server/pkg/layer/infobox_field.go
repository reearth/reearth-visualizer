package layer

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
)

type InfoboxField struct {
	id        InfoboxFieldID
	plugin    PluginID
	extension PluginExtensionID
	property  PropertyID
}

func (i *InfoboxField) ID() InfoboxFieldID {
	return i.id
}

func (i *InfoboxField) Plugin() PluginID {
	return i.plugin
}

func (i *InfoboxField) Extension() PluginExtensionID {
	return i.extension
}

func (i *InfoboxField) Property() PropertyID {
	return i.property
}

func (i *InfoboxField) PropertyRef() *PropertyID {
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
	if !lp.Schema().Equal(NewPropertySchemaID(i.plugin, i.extension.String())) {
		return errors.New("property has a invalid schema")
	}

	return nil
}

func (i *InfoboxField) UpgradePlugin(id plugin.ID) {
	if i == nil || !i.plugin.NameEqual(id) {
		return
	}
	i.plugin = id
}

func (i *InfoboxField) Clone() *InfoboxField {
	if i == nil {
		return nil
	}

	return &InfoboxField{
		id:        i.id,
		plugin:    i.plugin,
		extension: i.extension,
		property:  i.property,
	}
}
