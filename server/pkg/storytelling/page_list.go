package storytelling

import (
	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearthx/util"
)

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
	return util.Get[PageID, Page](l.pages, (*Page).Id, id)
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
	l.pages = util.RemoveById[PageID, Page](l.pages, (*Page).Id, id)
}

func (l *PageList) IndexOf(id PageID) int {
	if l == nil || l.pages == nil {
		return -1
	}
	return util.IndexOf[PageID, Page](l.pages, (*Page).Id, id)
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
