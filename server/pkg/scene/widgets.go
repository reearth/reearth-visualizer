package scene

import (
	"errors"

	"github.com/reearth/reearth/server/pkg/id"
)

var (
	ErrDuplicatedWidgetInstance = errors.New("duplicated widget instance")
)

type Widgets struct {
	widgets      []*Widget
	alignSystems []*WidgetAlignSystem
}

func NewWidgets(w []*Widget, a []*WidgetAlignSystem) *Widgets {
	if a == nil {
		a = NewWidgetAlignSystems()
	}
	if w == nil {
		return &Widgets{widgets: []*Widget{}, alignSystems: a}
	}
	w2 := make([]*Widget, 0, len(w))
	for _, w1 := range w {
		if w1 == nil {
			continue
		}
		duplicated := false
		for _, w3 := range w2 {
			if w1.ID() == w3.ID() {
				duplicated = true
				break
			}
		}
		if !duplicated {
			w2 = append(w2, w1)
		}
	}
	return &Widgets{widgets: w2, alignSystems: a}
}

func (w *Widgets) Widgets() []*Widget {
	if w == nil {
		return nil
	}
	return append([]*Widget{}, w.widgets...)
}

func (w *Widgets) Alignmens() []*WidgetAlignSystem {
	if w == nil {
		return nil
	}
	return w.alignSystems
}

func (w *Widgets) SetAlignments(alignSystems []*WidgetAlignSystem) {
	if w == nil {
		return
	}
	w.alignSystems = alignSystems
}

func (w *Widgets) Widget(wid id.WidgetID) *Widget {
	if w == nil {
		return nil
	}
	for _, ww := range w.widgets {
		if ww.ID() == wid {
			return ww
		}
	}
	return nil
}

func (w *Widgets) Has(wid id.WidgetID) bool {
	if w == nil {
		return false
	}
	for _, w2 := range w.widgets {
		if w2.ID() == wid {
			return true
		}
	}
	return false
}

func (w *Widgets) Add(sw *Widget) {
	if w == nil || sw == nil || w.Has(sw.ID()) {
		return
	}
	w.widgets = append(w.widgets, sw)
}

func (w *Widgets) Remove(wid id.WidgetID) {
	if w == nil {
		return
	}
	for i := 0; i < len(w.widgets); i++ {
		if w.widgets[i].ID() == wid {
			w.widgets = append(w.widgets[:i], w.widgets[i+1:]...)
			return
		}
	}
}

func (w *Widgets) RemoveAllByPlugin(p id.PluginID, e *id.PluginExtensionID) (res []id.PropertyID) {
	if w == nil {
		return nil
	}
	for i := 0; i < len(w.widgets); i++ {
		ww := w.widgets[i]
		if ww.Plugin().Equal(p) && (e == nil || ww.Extension() == *e) {
			res = append(res, ww.Property())
			for _, wa := range w.alignSystems {
				wa.Remove(ww.ID())
			}
			w.widgets = append(w.widgets[:i], w.widgets[i+1:]...)
			i--
		}
	}
	return res
}

func (w *Widgets) UpgradePlugin(oldp, newp id.PluginID) {
	if w == nil || w.widgets == nil || oldp.Equal(newp) || oldp.IsNil() || newp.IsNil() {
		return
	}
	for _, ww := range w.widgets {
		if ww.plugin.Equal(oldp) {
			ww.SetPlugin(newp)
		}
	}
}

func (w *Widgets) Properties() []id.PropertyID {
	if w == nil {
		return nil
	}
	res := make([]id.PropertyID, 0, len(w.widgets))
	for _, ww := range w.widgets {
		res = append(res, ww.property)
	}
	return res
}
