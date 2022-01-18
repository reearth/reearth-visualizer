package scene

import (
	"errors"
)

var (
	ErrDuplicatedWidgetInstance = errors.New("duplicated widget instance")
)

type Widgets struct {
	widgets []*Widget
}

func NewWidgets(w []*Widget) *Widgets {
	if w == nil {
		return &Widgets{widgets: []*Widget{}}
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
	return &Widgets{widgets: w2}
}

func (w *Widgets) Widgets() []*Widget {
	if w == nil {
		return nil
	}
	return append([]*Widget{}, w.widgets...)
}

func (w *Widgets) Widget(wid WidgetID) *Widget {
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

func (w *Widgets) Has(wid WidgetID) bool {
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
	sw2 := *sw
	w.widgets = append(w.widgets, &sw2)
}

func (w *Widgets) Remove(wid WidgetID) {
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

func (w *Widgets) RemoveAllByPlugin(p PluginID) (res []PropertyID) {
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

func (w *Widgets) RemoveAllByExtension(p PluginID, e PluginExtensionID) (res []PropertyID) {
	if w == nil {
		return nil
	}
	for i := 0; i < len(w.widgets); i++ {
		if w.widgets[i].Plugin().Equal(p) && w.widgets[i].Extension() == e {
			res = append(res, w.widgets[i].Property())
			w.widgets = append(w.widgets[:i], w.widgets[i+1:]...)
			i--
		}
	}
	return res
}

func (w *Widgets) ReplacePlugin(oldp, newp PluginID) {
	if w == nil || w.widgets == nil {
		return
	}
	for _, ww := range w.widgets {
		if ww.plugin.Equal(oldp) {
			ww.plugin = newp
		}
	}
}

func (w *Widgets) Properties() []PropertyID {
	if w == nil {
		return nil
	}
	res := make([]PropertyID, 0, len(w.widgets))
	for _, ww := range w.widgets {
		res = append(res, ww.property)
	}
	return res
}
