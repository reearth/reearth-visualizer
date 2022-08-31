package layer

import (
	"errors"
	"fmt"

	"github.com/reearth/reearth/server/pkg/property"
)

var (
	ErrDuplicatedTag = errors.New("duplicated tag")
	ErrTagNotFound   = errors.New("tag not found")
)

type Layer interface {
	ID() ID
	Name() string
	IsVisible() bool
	Plugin() *PluginID
	Extension() *PluginExtensionID
	UsesPlugin() bool
	Property() *PropertyID
	HasInfobox() bool
	Infobox() *Infobox
	Scene() SceneID
	Tags() *TagList
	Rename(string)
	SetVisible(bool)
	SetInfobox(*Infobox)
	SetPlugin(*PluginID)
	Properties() []PropertyID
	ValidateProperties(property.Map) error
}

func ToLayerGroup(l Layer) *Group {
	if lg, ok := l.(*Group); ok {
		return lg
	}
	return nil
}

func ToLayerGroupRef(l *Layer) *Group {
	if l == nil {
		return nil
	}
	l2 := *l
	if lg, ok := l2.(*Group); ok {
		return lg
	}
	return nil
}

func ToLayerItem(l Layer) *Item {
	if li, ok := l.(*Item); ok {
		return li
	}
	return nil
}

func ToLayerItemRef(l *Layer) *Item {
	if l == nil {
		return nil
	}
	l2 := *l
	if li, ok := l2.(*Item); ok {
		return li
	}
	return nil
}

type layerBase struct {
	id        ID
	name      string
	visible   bool
	plugin    *PluginID
	extension *PluginExtensionID
	property  *PropertyID
	infobox   *Infobox
	scene     SceneID
	tags      *TagList
}

func (l *layerBase) ID() ID {
	return l.id
}

func (l *layerBase) IDRef() *ID {
	if l == nil {
		return nil
	}
	return l.id.Ref()
}

func (l *layerBase) Name() string {
	if l == nil {
		return ""
	}
	return l.name
}

func (l *layerBase) IsVisible() bool {
	if l == nil {
		return false
	}
	return l.visible
}

func (l *layerBase) UsesPlugin() bool {
	if l == nil {
		return false
	}
	return l.plugin != nil && l.extension != nil
}

func (l *layerBase) Plugin() *PluginID {
	if l == nil {
		return nil
	}
	return l.plugin.CloneRef()
}

func (l *layerBase) Extension() *PluginExtensionID {
	if l == nil {
		return nil
	}
	return l.extension.CloneRef()
}

func (l *layerBase) Property() *PropertyID {
	if l == nil {
		return nil
	}
	return l.property.CloneRef()
}

func (l *layerBase) HasInfobox() bool {
	if l == nil {
		return false
	}
	return l.infobox != nil
}

func (l *layerBase) Infobox() *Infobox {
	if l == nil {
		return nil
	}
	return l.infobox
}

func (l *layerBase) Scene() SceneID {
	return l.scene
}

func (l *layerBase) Rename(name string) {
	if l == nil {
		return
	}
	l.name = name
}

func (l *layerBase) SetVisible(visible bool) {
	if l == nil {
		return
	}
	l.visible = visible
}

func (l *layerBase) SetInfobox(infobox *Infobox) {
	if l == nil {
		return
	}
	l.infobox = infobox
}

func (l *layerBase) SetPlugin(plugin *PluginID) {
	if l == nil {
		return
	}
	l.plugin = plugin.CloneRef()
}

func (l *layerBase) Properties() []PropertyID {
	if l == nil {
		return nil
	}
	res := []PropertyID{}
	if l.property != nil {
		res = append(res, *l.property)
	}
	if l.infobox != nil {
		res = append(res, l.infobox.property)
		for _, f := range l.infobox.fields {
			res = append(res, f.property)
		}
	}
	return res
}

func (l *layerBase) ValidateProperties(pm property.Map) error {
	if l == nil || pm == nil {
		return nil
	}

	// property
	if l.property != nil {
		if l.plugin == nil || l.extension == nil {
			return errors.New("layer should have plugin id and extension id")
		}

		psid := NewPropertySchemaID(*l.plugin, l.extension.String())

		lp := pm[*l.property]
		if lp == nil {
			return errors.New("layer property does not exist")
		}

		if !lp.Schema().Equal(psid) {
			return errors.New("layer property has a invalid schema")
		}
	} else if l.plugin != nil || l.extension != nil {
		return errors.New("layer should have property id")
	}

	// infobox
	if err := l.infobox.ValidateProperties(pm); err != nil {
		return fmt.Errorf("infobox: %w", err)
	}

	return nil
}
