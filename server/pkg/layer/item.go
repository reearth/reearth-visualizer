package layer

import (
	"github.com/reearth/reearth/server/pkg/property"
)

type Item struct {
	layerBase
	linkedDataset *DatasetID
}

func (l *Item) ID() ID {
	return l.layerBase.ID()
}

func (l *Item) IDRef() *ID {
	if l == nil {
		return nil
	}
	return l.layerBase.IDRef()
}

func (l *Item) Name() string {
	if l == nil {
		return ""
	}
	return l.layerBase.Name()
}

func (l *Item) IsVisible() bool {
	if l == nil {
		return false
	}
	return l.layerBase.IsVisible()
}

func (l *Item) Plugin() *PluginID {
	if l == nil {
		return nil
	}
	return l.layerBase.Plugin()
}

func (l *Item) Extension() *PluginExtensionID {
	if l == nil {
		return nil
	}
	return l.layerBase.Extension()
}

func (l *Item) UsesPlugin() bool {
	if l == nil {
		return false
	}
	return l.layerBase.UsesPlugin()
}

func (l *Item) Property() *PropertyID {
	if l == nil {
		return nil
	}
	return l.layerBase.Property()
}

func (l *Item) Infobox() *Infobox {
	if l == nil {
		return nil
	}
	return l.layerBase.Infobox()
}

func (l *Item) Rename(name string) {
	if l == nil {
		return
	}
	l.layerBase.Rename(name)
}

func (l *Item) SetVisible(visible bool) {
	if l == nil {
		return
	}
	l.layerBase.SetVisible(visible)
}

func (l *Item) SetInfobox(infobox *Infobox) {
	if l == nil {
		return
	}
	l.layerBase.SetInfobox(infobox)
}

func (l *Item) SetPlugin(plugin *PluginID) {
	if l == nil {
		return
	}
	l.layerBase.SetPlugin(plugin)
}

func (l *Item) IsLinked() bool {
	if l == nil {
		return false
	}
	return l.linkedDataset != nil
}

func (l *Item) LinkedDataset() *DatasetID {
	if l == nil {
		return nil
	}
	return l.linkedDataset.CloneRef()
}

func (l *Item) Link(ds DatasetID) {
	if l == nil {
		return
	}
	ds2 := ds
	l.linkedDataset = &ds2
}

func (l *Item) Unlink() {
	if l == nil {
		return
	}
	l.linkedDataset = nil
}

func (l *Item) LayerRef() *Layer {
	if l == nil {
		return nil
	}
	var layer Layer = l
	return &layer
}

func (l *Item) Properties() []PropertyID {
	if l == nil {
		return nil
	}
	return l.layerBase.Properties()
}

func (l *Item) ValidateProperties(pm property.Map) error {
	if l == nil {
		return nil
	}
	return l.layerBase.ValidateProperties(pm)
}

func (l *Item) Tags() *TagList {
	if l.layerBase.tags == nil {
		l.layerBase.tags = NewTagList(nil)
	}
	return l.layerBase.tags
}
