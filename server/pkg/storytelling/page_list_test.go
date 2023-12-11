package storytelling

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestPageList(t *testing.T) {

	var pl *PageList = nil
	assert.Equal(t, 0, len(pl.Pages()))
	assert.Nil(t, pl.Pages())
	assert.Nil(t, pl.Page(NewPageID()))
	assert.Equal(t, -1, pl.IndexOf(NewPageID()))
	assert.NotPanics(t, func() {
		pl.AddAt(nil, nil)
		pl.Remove(NewPageID())
		pl.Move(NewPageID(), 0)
	})

	pl = NewPageList(nil)

	assert.Equal(t, 0, len(pl.Pages()))
	assert.Equal(t, -1, pl.IndexOf(NewPageID()))
	assert.Nil(t, pl.Pages())
	assert.Nil(t, pl.Page(NewPageID()))

	pageId1 := NewPageID()
	p1 := &Page{
		id: pageId1,
	}
	pl.AddAt(p1, nil)
	assert.Equal(t, 1, len(pl.Pages()))
	assert.Equal(t, []*Page{p1}, pl.Pages())
	assert.Equal(t, 0, pl.IndexOf(pageId1))
	assert.Equal(t, -1, pl.IndexOf(NewPageID()))
	assert.Equal(t, p1, pl.Page(pageId1))
	assert.Nil(t, pl.Page(NewPageID()))

	pageId2 := NewPageID()
	p2 := &Page{
		id: pageId2,
	}
	pl.AddAt(p2, lo.ToPtr(5))
	assert.Equal(t, 2, len(pl.Pages()))
	assert.Equal(t, []*Page{p1, p2}, pl.Pages())

	pl.Move(pageId1, 0)
	assert.Equal(t, []*Page{p1, p2}, pl.Pages())
	pl.Move(pageId1, 1)
	assert.Equal(t, []*Page{p2, p1}, pl.Pages())
	pl.Move(pageId1, 0)
	assert.Equal(t, []*Page{p1, p2}, pl.Pages())
	pl.Move(pageId1, 5)
	assert.Equal(t, []*Page{p2, p1}, pl.Pages())

	pl.Remove(pageId1)
	assert.Equal(t, []*Page{p2}, pl.Pages())
	pl.Remove(pageId2)
	assert.Equal(t, 0, len(pl.Pages()))
	pl.Remove(NewPageID())
	assert.Equal(t, 0, len(pl.Pages()))
}
