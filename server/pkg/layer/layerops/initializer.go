package layerops

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/layer"
	"github.com/reearth/reearth/server/pkg/plugin"
	"github.com/reearth/reearth/server/pkg/property"
)

type LayerItem struct {
	SceneID                layer.SceneID
	ParentLayerID          layer.ID
	Plugin                 *plugin.Plugin
	ExtensionID            *layer.PluginExtensionID
	Index                  *int
	LinkedDatasetID        *layer.DatasetID
	Name                   string
	LinkablePropertySchema *property.Schema
	LatLng                 *property.LatLng
}

var (
	ErrExtensionTypeMustBePrimitive error = errors.New("extension type must be primitive")
)

func (i LayerItem) Initialize() (*layer.Item, *property.Property, error) {
	builder := layer.NewItem().NewID().Scene(i.SceneID)

	var p *property.Property
	var err error
	if i.Plugin != nil && i.ExtensionID != nil {
		extension := i.Plugin.Extension(*i.ExtensionID)
		if extension == nil || extension.Type() != plugin.ExtensionTypePrimitive {
			return nil, nil, ErrExtensionTypeMustBePrimitive
		}

		p, err = property.New().
			NewID().
			Schema(extension.Schema()).
			Scene(i.SceneID).
			Build()

		if err != nil {
			return nil, nil, err
		}

		p.UpdateLinkableValue(i.LinkablePropertySchema, property.ValueTypeLatLng.ValueFrom(i.LatLng))

		builder.
			Plugin(i.Plugin.ID().Ref()).
			Extension(i.ExtensionID).
			Property(p.ID().Ref()).
			Name(i.Name)
	}

	layerItem, err := builder.LinkedDataset(i.LinkedDatasetID).Build()
	if err != nil {
		return nil, nil, err
	}

	return layerItem, p, nil
}
