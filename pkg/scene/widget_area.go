package scene

// WidgetArea has the widgets and alignment information found in each part area of a section.
type WidgetArea struct {
	widgetIds []WidgetID
	align     WidgetAlignType
}

type WidgetAlignType string

const (
	WidgetAlignStart    WidgetAlignType = "start"
	WidgetAlignCentered WidgetAlignType = "centered"
	WidgetAlignEnd      WidgetAlignType = "end"
)

func NewWidgetArea(widgetIds []WidgetID, align WidgetAlignType) *WidgetArea {
	wa := &WidgetArea{}
	wa.AddAll(widgetIds)
	wa.SetAlignment(align)
	return wa
}

// WidgetIds will return a slice of widget ids from a specific area.
func (a *WidgetArea) WidgetIDs() []WidgetID {
	if a == nil {
		return nil
	}

	return append([]WidgetID{}, a.widgetIds...)
}

// Alignment will return the alignment of a specific area.
func (a *WidgetArea) Alignment() WidgetAlignType {
	if a == nil {
		return ""
	}

	return a.align
}

func (a *WidgetArea) Find(wid WidgetID) int {
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

func (a *WidgetArea) Add(wid WidgetID, index int) {
	if a == nil || wid.Contains(a.widgetIds) {
		return
	}

	a.widgetIds = insertWidgetID(a.widgetIds, wid, index)
}

func (a *WidgetArea) AddAll(wids []WidgetID) {
	if a == nil {
		return
	}

	widgetIds := make([]WidgetID, 0, len(wids))
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

func (a *WidgetArea) Remove(wid WidgetID) {
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
func insertWidgetID(array []WidgetID, value WidgetID, index int) []WidgetID {
	if index < 0 {
		return append(array, value)
	}
	return append(array[:index], append([]WidgetID{value}, array[index:]...)...)
}

// removeWidgetID is used in moveInt to remove the widgetID from original position(index).
func removeWidgetID(array []WidgetID, index int) []WidgetID {
	return append(array[:index], array[index+1:]...)
}
