package scene

import (
	"errors"

	"github.com/reearth/reearth-backend/pkg/id"
)

var (
	ErrDuplicatedWidgetInstance = errors.New("duplicated widget instance")
)

type WidgetSystem struct {
	widgets []*Widget
}

func NewWidgetSystem(w []*Widget) *WidgetSystem {
	if w == nil {
		return &WidgetSystem{widgets: []*Widget{}}
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
			w3 := *w1
			w2 = append(w2, &w3)
		}
	}
	return &WidgetSystem{widgets: w2}
}

func (w *WidgetSystem) Widgets() []*Widget {
	if w == nil {
		return nil
	}
	return append([]*Widget{}, w.widgets...)
}

func (w *WidgetSystem) Widget(p id.PluginID, e id.PluginExtensionID) *Widget {
	if w == nil {
		return nil
	}
	for _, ww := range w.widgets {
		if ww.plugin.Equal(p) && ww.extension == e {
			return ww
		}
	}
	return nil
}

func (w *WidgetSystem) Has(p id.PluginID, e id.PluginExtensionID) bool {
	if w == nil {
		return false
	}
	for _, w2 := range w.widgets {
		if w2.plugin.Equal(p) && w2.extension == e {
			return true
		}
	}
	return false
}

func (w *WidgetSystem) Add(sw *Widget) {
	if w == nil || sw == nil || w.Has(sw.plugin, sw.extension) {
		return
	}
	sw2 := *sw
	w.widgets = append(w.widgets, &sw2)
}

func (w *WidgetSystem) Remove(p id.PluginID, e id.PluginExtensionID) {
	if w == nil {
		return
	}
	for i := 0; i < len(w.widgets); i++ {
		if w.widgets[i].plugin.Equal(p) && w.widgets[i].extension == e {
			w.widgets = append(w.widgets[:i], w.widgets[i+1:]...)
			i--
		}
	}
}

func (w *WidgetSystem) RemoveAllByPlugin(p id.PluginID) (res []id.PropertyID) {
	if w == nil {
		return nil
	}
	for i := 0; i < len(w.widgets); i++ {
		if w.widgets[i].plugin.Equal(p) {
			res = append(res, w.widgets[i].Property())
			w.widgets = append(w.widgets[:i], w.widgets[i+1:]...)
			i--
		}
	}
	return res
}

func (w *WidgetSystem) Replace(oldp, newp id.PluginID) {
	if w == nil || w.widgets == nil {
		return
	}
	for _, ww := range w.widgets {
		if ww.plugin.Equal(oldp) {
			ww.plugin = newp
		}
	}
}

func (w *WidgetSystem) Properties() []id.PropertyID {
	if w == nil {
		return nil
	}
	res := make([]id.PropertyID, 0, len(w.widgets))
	for _, ww := range w.widgets {
		res = append(res, ww.property)
	}
	return res
}
