package scene

type WidgetAreaProperties struct {
	padding    WidgetAreaPadding
	gap        int
	centered   bool
	background *string
}

type WidgetAreaPadding struct {
	top, bottom, left, right int
}

func NewWidgetAreaProperties() *WidgetAreaProperties {
	return &WidgetAreaProperties{}
}
func NewWidgetAreaPropertiesWith(padding WidgetAreaPadding, gap int, centered bool, bg *string) *WidgetAreaProperties {
	return &WidgetAreaProperties{
		padding:    padding,
		gap:        gap,
		centered:   centered,
		background: bg,
	}
}

func (ap *WidgetAreaProperties) Padding() WidgetAreaPadding {
	return ap.padding
}

func (ap *WidgetAreaProperties) SetPadding(p WidgetAreaPadding) {
	if ap == nil {
		return
	}
	ap.padding = p
}

func (ap *WidgetAreaProperties) Gap() int {
	return ap.gap
}

func (ap *WidgetAreaProperties) SetGap(g int) {
	if ap == nil {
		return
	}
	ap.gap = g
}

func (ap *WidgetAreaProperties) Centered() bool {
	return ap.centered
}

func (ap *WidgetAreaProperties) SetCentered(c bool) {
	if ap == nil {
		return
	}
	ap.centered = c
}

func (ap *WidgetAreaProperties) Background() *string {
	return ap.background
}

func (ap *WidgetAreaProperties) SetBackground(bg *string) {
	if ap == nil {
		return
	}
	ap.background = bg
}

func (ap *WidgetAreaProperties) Clone() *WidgetAreaProperties {
	if ap == nil {
		return nil
	}
	return &WidgetAreaProperties{
		padding:    ap.padding,
		gap:        ap.gap,
		centered:   ap.centered,
		background: ap.background,
	}
}

func NewWidgetAreaPadding(l, r, t, b int) WidgetAreaPadding {
	return WidgetAreaPadding{
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
