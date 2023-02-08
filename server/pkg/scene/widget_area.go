package scene

import (
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

// WidgetArea has the widgets and alignment information found in each part area of a section.
type WidgetArea struct {
	widgetIds  WidgetIDList
	align      WidgetAlignType
	padding    *WidgetAreaPadding
	gap        *int
	centered   bool
	background *string
}

type WidgetAlignType string

const (
	WidgetAlignStart    WidgetAlignType = "start"
	WidgetAlignCentered WidgetAlignType = "centered"
	WidgetAlignEnd      WidgetAlignType = "end"
)

func NewWidgetArea(widgetIds []WidgetID, align WidgetAlignType, padding *WidgetAreaPadding, gap *int, centered bool, background *string) *WidgetArea {
	wa := &WidgetArea{}
	wa.AddAll(widgetIds)
	wa.SetAlignment(align)
	wa.SetPadding(padding)
	wa.SetGap(gap)
	wa.SetCentered(centered)
	wa.SetBackground(background)

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

func (a *WidgetArea) Padding() *WidgetAreaPadding {
	if a == nil {
		return nil
	}

	return util.CloneRef(a.padding)
}

func (a *WidgetArea) Gap() *int {
	if a == nil {
		return nil
	}

	return util.CloneRef(a.gap)
}

func (a *WidgetArea) Centered() bool {
	if a == nil {
		return false
	}

	return a.centered
}

func (a *WidgetArea) Background() *string {
	if a == nil {
		return nil
	}

	return util.CloneRef(a.background)
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

func (a *WidgetArea) SetPadding(ap *WidgetAreaPadding) {
	if a == nil || ap == nil {
		return
	}

	a.padding = util.CloneRef(ap)
}

func (a *WidgetArea) SetGap(g *int) {
	a.gap = util.CloneRef(g)
}

func (a *WidgetArea) SetCentered(c bool) {
	a.centered = c
}

func (a *WidgetArea) SetBackground(bg *string) {
	a.background = util.CloneRef(bg)
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

type WidgetAreaPadding struct {
	top, bottom, left, right int
}

func NewWidgetAreaPadding(l, r, t, b int) *WidgetAreaPadding {
	return &WidgetAreaPadding{
		top:    t,
		bottom: b,
		left:   l,
		right:  r,
	}
}

func (p WidgetAreaPadding) Top() int {
	return p.top
}

func (p WidgetAreaPadding) Bottom() int {
	return p.bottom
}

func (p WidgetAreaPadding) Left() int {
	return p.left
}

func (p WidgetAreaPadding) Right() int {
	return p.right
}
