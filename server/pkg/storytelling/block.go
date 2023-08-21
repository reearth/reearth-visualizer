package storytelling

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
)

type Block struct {
	id        BlockID
	plugin    PluginID
	extension PluginExtensionID
	property  PropertyID
}

func (i *Block) ID() BlockID {
	if i == nil {
		return BlockID{}
	}
	return i.id
}

func (i *Block) Plugin() PluginID {
	if i == nil {
		return PluginID{}
	}
	return i.plugin
}

func (i *Block) Extension() PluginExtensionID {
	if i == nil {
		return PluginExtensionID("")
	}
	return i.extension
}

func (i *Block) Property() PropertyID {
	if i == nil {
		return PropertyID{}
	}
	return i.property
}

func (i *Block) PropertyRef() *PropertyID {
	if i == nil {
		return nil
	}
	return i.property.Ref()
}

func (i *Block) ValidateProperty(pm property.Map) error {
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

func (i *Block) UpgradePlugin(id plugin.ID) {
	if i == nil || !i.plugin.NameEqual(id) {
		return
	}
	i.plugin = id
}

func (i *Block) Clone() *Block {
	if i == nil {
		return nil
	}
	return &Block{
		id:        i.id.Clone(),
		plugin:    i.plugin.Clone(),
		extension: i.extension,
		property:  i.property.Clone(),
	}
}
