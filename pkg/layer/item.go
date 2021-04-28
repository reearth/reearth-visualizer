package layer

import (
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/property"
)

type Item struct {
	layerBase
	linkedDataset *id.DatasetID
}

func (l *Item) ID() id.LayerID {
	return l.layerBase.ID()
}

func (l *Item) IDRef() *id.LayerID {
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

func (l *Item) Plugin() *id.PluginID {
	if l == nil {
		return nil
	}
	return l.layerBase.Plugin()
}

func (l *Item) Extension() *id.PluginExtensionID {
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

func (l *Item) Property() *id.PropertyID {
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

func (l *Item) SetPlugin(plugin *id.PluginID) {
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

func (l *Item) LinkedDataset() *id.DatasetID {
	if l == nil || l.linkedDataset == nil {
		return nil
	}
	id := *l.linkedDataset
	return &id
}

func (l *Item) Link(ds id.DatasetID) {
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

func (l *Item) Properties() []id.PropertyID {
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
