package idx

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSet_NewSet(t *testing.T) {
	a := New[T]()
	assert.Equal(t, &Set[T]{
		l: nil,
		m: nil,
	}, NewSet[T]())
	assert.Equal(t, &Set[T]{
		l: List[T]{a},
		m: map[ID[T]]struct{}{
			a: {},
		},
	}, NewSet(a))
}

func TestSet_Has(t *testing.T) {
	a := New[T]()
	b := New[T]()
	assert.False(t, (*Set[T])(nil).Has(a, b))
	assert.True(t, NewSet(a).Has(a, b))
	assert.False(t, NewSet(a).Has(b))
}

func TestSet_List(t *testing.T) {
	a := New[T]()
	b := New[T]()
	assert.Nil(t, (*Set[T])(nil).List())
	assert.Nil(t, NewSet[T]().List())
	assert.Equal(t, List[T]{a, b}, NewSet(a, b).List())
}

func TestSet_Clone(t *testing.T) {
	a := New[T]()
	b := New[T]()
	s := NewSet(a, b)
	assert.Nil(t, (*Set[T])(nil).Clone())
	assert.Equal(t, &Set[T]{}, NewSet[T]().Clone())
	assert.Equal(t, s, s.Clone())
	assert.NotSame(t, s, s.Clone())
}

func TestSet_Add(t *testing.T) {
	a := New[T]()
	b := New[T]()
	s := NewSet(a)
	(*Set[T])(nil).Add(a, b)
	s.Add(a, b)
	assert.Equal(t, NewSet(a, b), s)
}

func TestSet_Merge(t *testing.T) {
	a := New[T]()
	b := New[T]()
	s := NewSet(a)
	u := NewSet(a, b)
	(*Set[T])(nil).Merge(u)
	s.Merge(u)
	assert.Equal(t, NewSet(a, b), s)
}

func TestSet_Concat(t *testing.T) {
	a := New[T]()
	b := New[T]()
	s := NewSet(a)
	u := NewSet(a, b)
	assert.Nil(t, (*Set[T])(nil).Concat(u))
	assert.Equal(t, NewSet(a, b), s.Concat(u))
	assert.Equal(t, NewSet(a), s)
}

func TestSet_Delete(t *testing.T) {
	a := New[T]()
	b := New[T]()
	c := New[T]()
	s := NewSet(a, b, c)
	(*Set[T])(nil).Delete(a, b)
	s.Delete(a, b)
	assert.Equal(t, NewSet(c), s)
}
