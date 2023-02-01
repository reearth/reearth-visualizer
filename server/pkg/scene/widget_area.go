package scene

import "github.com/samber/lo"

// WidgetArea has the widgets and alignment information found in each part area of a section.
type WidgetArea struct {
	widgetIds  WidgetIDList
	align      WidgetAlignType
	properties *WidgetAreaProperties
}

type WidgetAlignType string

const (
	WidgetAlignStart    WidgetAlignType = "start"
	WidgetAlignCentered WidgetAlignType = "centered"
	WidgetAlignEnd      WidgetAlignType = "end"
)

func NewWidgetArea(widgetIds []WidgetID, align WidgetAlignType, properties *WidgetAreaProperties) *WidgetArea {
	wa := &WidgetArea{}
	wa.AddAll(widgetIds)
	wa.SetAlignment(align)
	wa.SetProperties(properties)
	return wa
}

// WidgetIds will return a slice of widget ids from a specific area.
func (a *WidgetArea) WidgetIDs() WidgetIDList {
	if a == nil {
		return nil
	}

	return a.widgetIds.Clone()
}

// Alignment will return the alignment of a specific area.
func (a *WidgetArea) Alignment() WidgetAlignType {
	if a == nil {
		return ""
	}

	return a.align
}

func (a *WidgetArea) Properties() *WidgetAreaProperties {
	if a == nil {
		return nil
	}

	return a.properties
}

func (a *WidgetArea) Find(wid WidgetID) int {
	if a == nil {
		return -1
	}
	return lo.IndexOf(a.widgetIds, wid)
}

func (a *WidgetArea) Add(wid WidgetID, index int) {
	if a == nil || a.widgetIds.Has(wid) {
		return
	}

	if i := a.widgetIds.Index(wid); i >= 0 {
		a.widgetIds = a.widgetIds.DeleteAt(i)
		if i < index {
			index--
		}
	}
	a.widgetIds = a.widgetIds.Insert(index, wid)
}

func (a *WidgetArea) AddAll(wids []WidgetID) {
	if a == nil {
		return
	}

	a.widgetIds = a.widgetIds.AddUniq(wids...)
}

func (a *WidgetArea) SetAlignment(at WidgetAlignType) {
	if a == nil {
		return
	}

	if at == WidgetAlignStart || at == WidgetAlignCentered || at == WidgetAlignEnd {
		a.align = at
	} else {
		a.align = WidgetAlignStart
	}
}

func (a *WidgetArea) SetProperties(ap *WidgetAreaProperties) {
	if a == nil || ap == nil {
		return
	}

	a.properties = ap.Clone()
}

func (a *WidgetArea) Remove(wid WidgetID) {
	if a == nil {
		return
	}

	for i, w := range a.widgetIds {
		if w == wid {
			a.widgetIds = a.widgetIds.DeleteAt(i)
			return
		}
	}
}

func (a *WidgetArea) Move(from, to int) {
	if a == nil {
		return
	}

	wid := a.widgetIds[from]
	a.widgetIds = a.widgetIds.DeleteAt(from).Insert(to, wid)
}
