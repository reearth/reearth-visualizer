package plugin

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/i18n"
	"github.com/reearth/reearth/server/pkg/visualizer"
)

type ExtensionType string

var (
	ErrPluginExtensionDuplicated error         = errors.New("plugin extension duplicated")
	ExtensionTypePrimitive       ExtensionType = "primitive"
	ExtensionTypeWidget          ExtensionType = "widget"
	ExtensionTypeBlock           ExtensionType = "block"
	ExtensionTypeVisualizer      ExtensionType = "visualizer"
	ExtensionTypeInfobox         ExtensionType = "infobox"
	ExtensionTypeCluster         ExtensionType = "cluster"

	ExtensionTypeStory      ExtensionType = "story"
	ExtensionTypeStoryPage  ExtensionType = "storyPage"
	ExtensionTypeStoryBlock ExtensionType = "storyBlock"
)

type Extension struct {
	id            ExtensionID
	extensionType ExtensionType
	name          i18n.String
	description   i18n.String
	icon          string
	schema        PropertySchemaID
	visualizer    visualizer.Visualizer
	singleOnly    bool
	widgetLayout  *WidgetLayout
}

func (w *Extension) ID() ExtensionID {
	return w.id
}

func (w *Extension) Type() ExtensionType {
	return w.extensionType
}

func (w *Extension) Name() i18n.String {
	return w.name.Clone()
}

func (w *Extension) Description() i18n.String {
	return w.description.Clone()
}

func (w *Extension) Icon() string {
	return w.icon
}

func (w *Extension) Schema() PropertySchemaID {
	return w.schema
}

func (w *Extension) Visualizer() visualizer.Visualizer {
	return w.visualizer
}

func (w *Extension) SingleOnly() bool {
	return w.singleOnly
}

func (w *Extension) WidgetLayout() *WidgetLayout {
	if w == nil {
		return nil
	}
	return w.widgetLayout
}

func (w *Extension) Rename(name i18n.String) {
	w.name = name.Clone()

}

func (w *Extension) SetDescription(des i18n.String) {
	w.description = des.Clone()
}

func (w *Extension) Clone() *Extension {
	if w == nil {
		return nil
	}
	return &Extension{
		id:            w.id,
		extensionType: w.extensionType,
		name:          w.name.Clone(),
		description:   w.description.Clone(),
		icon:          w.icon,
		schema:        w.schema.Clone(),
		visualizer:    w.visualizer,
		singleOnly:    w.singleOnly,
		widgetLayout:  w.widgetLayout.Clone(),
	}
}
