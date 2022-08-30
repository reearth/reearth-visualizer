package layer

import (
	"github.com/reearth/reearth/server/pkg/property"
)

type Group struct {
	layerBase
	layers              *IDList
	linkedDatasetSchema *DatasetSchemaID
	root                bool
}

func (l *Group) ID() ID {
	return l.layerBase.ID()
}

func (l *Group) IDRef() *ID {
	if l == nil {
		return nil
	}
	return l.layerBase.IDRef()
}

func (l *Group) Name() string {
	return l.layerBase.Name()
}

func (l *Group) Plugin() *PluginID {
	if l == nil {
		return nil
	}
	return l.layerBase.Plugin()
}

func (l *Group) Extension() *PluginExtensionID {
	if l == nil {
		return nil
	}
	return l.layerBase.Extension()
}

func (l *Group) UsesPlugin() bool {
	return l.layerBase.UsesPlugin()
}

func (l *Group) Property() *PropertyID {
	if l == nil {
		return nil
	}
	return l.layerBase.Property()
}

func (l *Group) Infobox() *Infobox {
	if l == nil {
		return nil
	}
	return l.layerBase.Infobox()
}

func (l *Group) IsVisible() bool {
	if l == nil {
		return false
	}
	return l.layerBase.IsVisible()
}

func (l *Group) Rename(name string) {
	if l == nil {
		return
	}
	l.layerBase.Rename(name)
}

func (l *Group) SetInfobox(infobox *Infobox) {
	if l == nil {
		return
	}
	l.layerBase.SetInfobox(infobox)
}

func (l *Group) SetVisible(visible bool) {
	if l == nil {
		return
	}
	l.layerBase.SetVisible(visible)
}

func (l *Group) SetPlugin(plugin *PluginID) {
	if l == nil {
		return
	}
	l.layerBase.SetPlugin(plugin)
}

func (l *Group) IsLinked() bool {
	if l == nil {
		return false
	}
	return l.linkedDatasetSchema != nil
}

func (l *Group) LinkedDatasetSchema() *DatasetSchemaID {
	if l == nil {
		return nil
	}
	return l.linkedDatasetSchema.CloneRef()
}

func (l *Group) Link(ds DatasetSchemaID) {
	if l == nil {
		return
	}
	ds2 := ds
	l.linkedDatasetSchema = &ds2
}

func (l *Group) Unlink() {
	if l == nil {
		return
	}
	l.linkedDatasetSchema = nil
}

func (l *Group) Layers() *IDList {
	if l == nil {
		return nil
	}
	if l.layers == nil {
		l.layers = NewIDList(nil)
	}
	return l.layers
}

func (l *Group) MoveLayerFrom(id ID, index int, fromLayerGroup *Group) {
	if l == nil {
		return
	}

	if fromLayerGroup == nil || fromLayerGroup.id == l.id {
		l.layers.MoveLayer(id, index)
		return
	}

	fromLayerGroup.layers.RemoveLayer(id)

	if l.layers == nil {
		l.layers = NewIDList(nil)
	}
	l.layers.AddLayer(id, index)
}

func (l *Group) LayerRef() *Layer {
	if l == nil {
		return nil
	}
	var layer Layer = l
	return &layer
}

func (l *Group) IsRoot() bool {
	if l == nil {
		return false
	}
	return l.root
}

func (l *Group) Properties() []PropertyID {
	if l == nil {
		return nil
	}
	return l.layerBase.Properties()
}

func (l *Group) ValidateProperties(pm property.Map) error {
	if l == nil {
		return nil
	}
	return l.layerBase.ValidateProperties(pm)
}

func (l *Group) Tags() *TagList {
	if l == nil {
		return nil
	}
	if l.layerBase.tags == nil {
		l.layerBase.tags = NewTagList(nil)
	}
	return l.layerBase.tags
}
