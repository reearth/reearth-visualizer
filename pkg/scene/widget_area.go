package scene

import "github.com/reearth/reearth-backend/pkg/id"

// WidgetArea has the widgets and alignment information found in each part area of a section.
type WidgetArea struct {
	widgetIds []id.WidgetID
	align     WidgetAlignType
}

type WidgetAlignType string

const (
	WidgetAlignStart    WidgetAlignType = "start"
	WidgetAlignCentered WidgetAlignType = "centered"
	WidgetAlignEnd      WidgetAlignType = "end"
)

func NewWidgetArea(widgetIds []id.WidgetID, align WidgetAlignType) *WidgetArea {
	wa := &WidgetArea{}
	wa.AddAll(widgetIds)
	wa.SetAlignment(align)
	return wa
}

// WidgetIds will return a slice of widget ids from a specific area.
func (a *WidgetArea) WidgetIDs() []id.WidgetID {
	if a == nil {
		return nil
	}

	return append([]id.WidgetID{}, a.widgetIds...)
}

// Alignment will return the alignment of a specific area.
func (a *WidgetArea) Alignment() WidgetAlignType {
	if a == nil {
		return ""
	}

	return a.align
}

func (a *WidgetArea) Find(wid id.WidgetID) int {
	if a == nil {
		return -1
	}

	for i, w := range a.widgetIds {
		if w == wid {
			return i
		}
	}
	return -1
}

func (a *WidgetArea) Add(wid id.WidgetID, index int) {
	if a == nil || wid.Contains(a.widgetIds) {
		return
	}

	a.widgetIds = insertWidgetID(a.widgetIds, wid, index)
}

func (a *WidgetArea) AddAll(wids []id.WidgetID) {
	if a == nil {
		return
	}

	widgetIds := make([]id.WidgetID, 0, len(wids))
	for _, w := range wids {
		if w.Contains(a.widgetIds) || w.Contains(widgetIds) {
			continue
		}
		widgetIds = append(widgetIds, w)
	}

	a.widgetIds = widgetIds
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

func (a *WidgetArea) Remove(wid id.WidgetID) {
	if a == nil {
		return
	}

	for i, w := range a.widgetIds {
		if w == wid {
			a.widgetIds = removeWidgetID(a.widgetIds, i)
			return
		}
	}
}

func (a *WidgetArea) Move(from, to int) {
	if a == nil {
		return
	}

	wid := a.widgetIds[from]
	a.widgetIds = insertWidgetID(removeWidgetID(a.widgetIds, from), wid, to)
}

// insertWidgetID is used in moveInt to add the widgetID to a new position(index).
func insertWidgetID(array []id.WidgetID, value id.WidgetID, index int) []id.WidgetID {
	if index < 0 {
		return append(array, value)
	}
	return append(array[:index], append([]id.WidgetID{value}, array[index:]...)...)
}

// removeWidgetID is used in moveInt to remove the widgetID from original position(index).
func removeWidgetID(array []id.WidgetID, index int) []id.WidgetID {
	return append(array[:index], array[index+1:]...)
}
