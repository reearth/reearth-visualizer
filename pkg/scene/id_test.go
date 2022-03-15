package scene

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIDList_Clone(t *testing.T) {
	t1 := NewID()
	t2 := NewID()
	t3 := NewID()
	ids := IDList{t1, t2, t3}
	assert.Equal(t, ids, ids.Clone())
	assert.NotSame(t, ids, ids.Clone())
	assert.Nil(t, IDList(nil).Clone())
}

func TestIDList_Filter(t *testing.T) {
	t1 := NewID()
	t2 := NewID()
	t3 := NewID()
	t4 := NewID()
	assert.Equal(t, IDList{t1}, IDList{t1, t2, t3}.Filter(t1))
	assert.Equal(t, IDList{t1, t3}, IDList{t1, t2, t3}.Filter(t1, t3))
	assert.Equal(t, IDList{}, IDList{t1, t2, t3}.Filter(t4))
	assert.Equal(t, IDList(nil), IDList(nil).Filter(t4))
}

func TestIDList_Includes(t *testing.T) {
	t1 := NewID()
	t2 := NewID()
	t3 := NewID()
	assert.True(t, IDList{t1, t2, t3}.Includes(t1))
	assert.False(t, IDList{t1, t2}.Includes(t3))
	assert.False(t, IDList(nil).Includes(t1))
}

func TestIDList_Len(t *testing.T) {
	t1 := NewID()
	t2 := NewID()
	t3 := NewID()
	assert.Equal(t, 2, IDList{t1, t2}.Len())
	assert.Equal(t, 3, IDList{t1, t2, t3}.Len())
	assert.Equal(t, 0, IDList{}.Len())
	assert.Equal(t, 0, IDList(nil).Len())
}
