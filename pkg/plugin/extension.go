package plugin

import (
	"errors"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/visualizer"
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
	return w.name.Copy()
}

func (w *Extension) Description() i18n.String {
	return w.description.Copy()
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
	w.name = name.Copy()

}

func (w *Extension) SetDescription(des i18n.String) {
	w.description = des.Copy()
}

type WidgetLayout struct {
	horizontallyExtendable bool
	verticallyExtendable   bool
	extended               bool
	floating               bool
	defaultLocation        *WidgetLocation
}

func (l WidgetLayout) Extendable(loc WidgetLocation) bool {
	return l.HorizontallyExtendable() && loc.Horizontal() || l.VerticallyExtendable() && loc.Vertical()
}

func NewWidgetLayout(horizontallyExtendable, verticallyExtendable, extended, floating bool, defaultLocation *WidgetLocation) WidgetLayout {
	return WidgetLayout{
		horizontallyExtendable: horizontallyExtendable,
		verticallyExtendable:   verticallyExtendable,
		extended:               extended,
		floating:               floating,
		defaultLocation:        defaultLocation.CopyRef(),
	}
}

func (l WidgetLayout) Ref() *WidgetLayout {
	return &l
}

func (l WidgetLayout) HorizontallyExtendable() bool {
	return l.horizontallyExtendable
}

func (l WidgetLayout) VerticallyExtendable() bool {
	return l.verticallyExtendable
}

func (l WidgetLayout) Extended() bool {
	return l.extended
}

func (l WidgetLayout) Floating() bool {
	return l.floating
}

func (l WidgetLayout) DefaultLocation() *WidgetLocation {
	if l.defaultLocation == nil {
		return nil
	}
	return l.defaultLocation.CopyRef()
}

type WidgetLocation struct {
	Zone    WidgetZoneType
	Section WidgetSectionType
	Area    WidgetAreaType
}

func (l WidgetLocation) Horizontal() bool {
	return l.Section == WidgetSectionCenter
}

func (l WidgetLocation) Vertical() bool {
	return l.Area == WidgetAreaMiddle
}

func (l *WidgetLocation) CopyRef() *WidgetLocation {
	if l == nil {
		return nil
	}
	return &WidgetLocation{
		Zone:    l.Zone,
		Section: l.Section,
		Area:    l.Area,
	}
}

type WidgetZoneType string
type WidgetSectionType string
type WidgetAreaType string

const (
	WidgetZoneInner     WidgetZoneType    = "inner"
	WidgetZoneOuter     WidgetZoneType    = "outer"
	WidgetSectionLeft   WidgetSectionType = "left"
	WidgetSectionCenter WidgetSectionType = "center"
	WidgetSectionRight  WidgetSectionType = "right"
	WidgetAreaTop       WidgetAreaType    = "top"
	WidgetAreaMiddle    WidgetAreaType    = "middle"
	WidgetAreaBottom    WidgetAreaType    = "bottom"
)
