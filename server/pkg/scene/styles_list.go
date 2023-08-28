package scene

type StyleList struct {
	styles []*Style
}

func NewStyleList() *StyleList {
	return &StyleList{}
}

func NewStyleListFrom(Styles []*Style) *StyleList {
	return &StyleList{styles: append([]*Style{}, Styles...)}
}

func (tl *StyleList) Styles() []*Style {
	if tl == nil {
		return nil
	}
	return append([]*Style{}, tl.styles...)
}

func (tl *StyleList) Has(tid StyleID) bool {
	if tl == nil {
		return false
	}
	for _, Style := range tl.styles {
		if Style.ID() == tid {
			return true
		}
	}
	return false
}

func (tl *StyleList) Add(Styles ...*Style) {
	if tl == nil {
		return
	}
	tl.styles = append(tl.styles, Styles...)
}

func (tl *StyleList) Get(cid StyleID) *Style {
	if tl == nil {
		return nil
	}
	for _, c := range tl.styles {
		if c.ID() == cid {
			return c
		}
	}
	return nil
}

func (tl *StyleList) Remove(Styles ...StyleID) {
	if tl == nil {
		return
	}
	for i := 0; i < len(tl.styles); i++ {
		for _, tid := range Styles {
			if tl.styles[i].id == tid {
				tl.styles = append(tl.styles[:i], tl.styles[i+1:]...)
				i--
			}
		}
	}
}

func (tl *StyleList) Values() []*StyleValue {
	if tl == nil {
		return nil
	}
	res := make([]*StyleValue, 0, len(tl.styles))
	for _, c := range tl.styles {
		res = append(res, c.value)
	}
	return res
}
