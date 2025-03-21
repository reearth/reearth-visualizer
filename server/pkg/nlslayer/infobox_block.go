package nlslayer

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/property"
)

type InfoboxBlock struct {
	id        id.InfoboxBlockID
	plugin    id.PluginID
	extension id.PluginExtensionID
	property  id.PropertyID
}

func (i *InfoboxBlock) ID() id.InfoboxBlockID {
	return i.id
}

func (i *InfoboxBlock) Property() id.PropertyID {
	return i.property
}

func (i *InfoboxBlock) PropertyRef() *id.PropertyID {
	if i == nil {
		return nil
	}
	return i.property.Ref()
}

func (i *InfoboxBlock) ValidateProperty(pm property.Map) error {
	if i == nil || pm == nil {
		return nil
	}

	lp := pm[i.property]
	if lp == nil {
		return errors.New("property does not exist")
	}

	return nil
}

func (i *InfoboxBlock) Clone() *InfoboxBlock {
	if i == nil {
		return nil
	}

	return &InfoboxBlock{
		id:       i.id,
		property: i.property,
	}
}

func (i *InfoboxBlock) Plugin() id.PluginID {
	return i.plugin
}

func (i *InfoboxBlock) Extension() id.PluginExtensionID {
	return i.extension
}
