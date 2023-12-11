package storytelling

import "github.com/reearth/reearth/server/pkg/id"

type PageList struct {
	pages []*Page
}

func NewPageList(pages []*Page) *PageList {
	return &PageList{pages: pages}
}

func (l *PageList) Pages() []*Page {
	if l == nil || l.pages == nil {
		return nil
	}
	return l.pages
}

func (l *PageList) AddAt(p *Page, index *int) {
	if p == nil || l == nil {
		return
	}
	if index == nil || *index < 0 || len(l.pages) <= *index {
		l.pages = append(l.pages, p)
		return
	}
	l.pages = append(l.pages[:*index], append([]*Page{p}, l.pages[*index:]...)...)
}

func (l *PageList) Page(id PageID) *Page {
	if l == nil || l.pages == nil {
		return nil
	}
	for _, page := range l.pages {
		if page.Id() == id {
			return page
		}
	}
	return nil
}

func (l *PageList) Move(id PageID, i int) {
	if l == nil || l.pages == nil {
		return
	}
	le := len(l.pages)
	if i < 0 || le <= i {
		i = le
	}
	for index, page := range l.pages {
		if page.Id() == id {
			if index == i {
				return
			}
			l.pages = append(l.pages[:index], l.pages[index+1:]...)
			l.AddAt(page, &i)
			return
		}
	}
}

func (l *PageList) Remove(id PageID) {
	if l == nil || l.pages == nil {
		return
	}
	for index, page := range l.pages {
		if page.Id() == id {
			l.pages = append(l.pages[:index], l.pages[index+1:]...)
			return
		}
	}
}

func (l *PageList) IndexOf(id PageID) int {
	if l == nil || l.pages == nil {
		return -1
	}
	for index, page := range l.pages {
		if page.Id() == id {
			return index
		}
	}
	return -1
}

func (l *PageList) Properties() id.PropertyIDList {
	if l == nil || l.pages == nil {
		return nil
	}
	ids := make(id.PropertyIDList, 0, len(l.pages))
	for _, page := range l.pages {
		ids = append(ids, page.Properties()...)
	}
	return ids
}
