package util

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

type T struct{}

func TestList_Has(t *testing.T) {
	l := List[int]{1, 2}

	assert.True(t, l.Has(1))
	assert.True(t, l.Has(1, 3))
	assert.False(t, l.Has(3))
	assert.False(t, List[int](nil).Has(1))
}

func TestList_At(t *testing.T) {
	a := T{}
	b := T{}
	l := List[T]{a, b}

	assert.Nil(t, List[T](nil).At(0))
	assert.Nil(t, l.At(-1))
	assert.Equal(t, &a, l.At(0))
	assert.Equal(t, &b, l.At(1))
	assert.Nil(t, l.At(2))
}

func TestList_Index(t *testing.T) {
	l := List[string]{"a", "b"}

	assert.Equal(t, -1, List[string](nil).Index("a"))
	assert.Equal(t, 0, l.Index("a"))
	assert.Equal(t, 1, l.Index("b"))
	assert.Equal(t, -1, l.Index("c"))
}

func TestList_Len(t *testing.T) {
	a := T{}
	b := T{}
	l := List[T]{a, b}

	assert.Equal(t, 0, List[T](nil).Len())
	assert.Equal(t, 2, l.Len())
}

func TestList_Copy(t *testing.T) {
	a := &T{}
	b := &T{}
	l := List[*T]{a, b}

	assert.Nil(t, List[*T](nil).Copy())
	assert.Equal(t, List[*T]{a, b}, l.Copy())
	assert.NotSame(t, l, l.Copy())
	assert.Same(t, a, l.Copy()[0])
	assert.Same(t, b, l.Copy()[1])
}

func TestList_Ref(t *testing.T) {
	a := T{}
	b := T{}
	l := List[T]{a, b}

	assert.Nil(t, List[T](nil).Ref())
	assert.Equal(t, &List[T]{a, b}, l.Ref())
}

func TestList_Refs(t *testing.T) {
	a := T{}
	b := T{}
	l := List[T]{a, b}

	assert.Nil(t, List[T](nil).Refs())
	assert.Equal(t, []*T{&a, &b}, l.Refs())
}

func TestList_Delete(t *testing.T) {
	l := List[string]{"a", "b", "c"}

	assert.Nil(t, (List[string])(nil).Delete("a"))
	assert.Equal(t, List[string]{"a", "c"}, l.Delete("b"))
	assert.Equal(t, List[string]{"a", "b", "c"}, l)
}

func TestList_DeleteAt(t *testing.T) {
	l := List[string]{"a", "b", "c"}

	assert.Nil(t, (List[string])(nil).DeleteAt(1))
	assert.Equal(t, List[string]{"a", "c"}, l.DeleteAt(1))
	assert.Equal(t, List[string]{"a", "b", "c"}, l)
}

func TestList_Add(t *testing.T) {
	l := List[string]{"a", "b"}

	assert.Equal(t, List[string]{"a"}, (List[string])(nil).Add("a"))
	assert.Equal(t, List[string]{"a", "b", "c", "d"}, l.Add("c", "d"))
	assert.Equal(t, List[string]{"a", "b"}, l)
}

func TestList_AddUniq(t *testing.T) {
	l := List[string]{"a", "b"}

	assert.Equal(t, List[string]{"a"}, (List[string])(nil).AddUniq("a"))
	assert.Equal(t, List[string]{"a", "b", "c"}, l.AddUniq("a", "c"))
	assert.Equal(t, List[string]{"a", "b"}, l)
}

func TestList_Insert(t *testing.T) {
	a := T{}
	b := T{}
	c := T{}
	l := List[T]{a, b}

	assert.Equal(t, List[T]{a, b, c}, l.Insert(-1, c))
	assert.Equal(t, List[T]{c, a, b}, l.Insert(0, c))
	assert.Equal(t, List[T]{a, c, b}, l.Insert(1, c))
	assert.Equal(t, List[T]{a, b, c}, l.Insert(2, c))
	assert.Equal(t, List[T]{a, b, c}, l.Insert(3, c))
	assert.Equal(t, List[T]{a, b}, l)
}

func TestList_Move(t *testing.T) {
	l := List[string]{"a", "b", "c"}

	assert.Nil(t, (List[string])(nil).Move("a", -1))
	assert.Equal(t, List[string]{"b", "c"}, l.Move("a", -1))
	assert.Equal(t, List[string]{"a", "b", "c"}, l)
	assert.Equal(t, List[string]{"c", "a", "b"}, l.Move("c", 0))
	assert.Equal(t, List[string]{"a", "c", "b"}, l.Move("b", 10))
}

func TestList_MoveAt(t *testing.T) {
	l := List[string]{"a", "b", "c"}

	assert.Nil(t, (List[string])(nil).MoveAt(0, -1))
	assert.Equal(t, List[string]{"b", "c"}, l.MoveAt(0, -1))
	assert.Equal(t, List[string]{"a", "b", "c"}, l)
	assert.Equal(t, List[string]{"c", "a", "b"}, l.MoveAt(2, 0))
	assert.Equal(t, List[string]{"a", "c", "b"}, l.MoveAt(1, 10))
}

func TestList_Reverse(t *testing.T) {
	l := List[string]{"a", "b", "c"}

	assert.Nil(t, (List[string])(nil).Reverse())
	assert.Equal(t, List[string]{"c", "b", "a"}, l.Reverse())
	assert.Equal(t, List[string]{"a", "b", "c"}, l)
}

func TestList_Concat(t *testing.T) {
	l := List[string]{"a", "b", "c"}

	assert.Equal(t, List[string]{"a"}, (List[string])(nil).Concat(List[string]{"a"}))
	assert.Equal(t, List[string]{"a", "b", "c", "d", "e"}, l.Concat(List[string]{"d", "e"}))
	assert.Equal(t, List[string]{"a", "b", "c"}, l)
}

func TestList_Intersect(t *testing.T) {
	l := List[string]{"a", "b", "c"}

	assert.Nil(t, (List[string])(nil).Intersect(List[string]{"a"}))
	assert.Equal(t, List[string]{"a", "b"}, l.Intersect(List[string]{"b", "e", "a"}))
	assert.Equal(t, List[string]{"a", "b", "c"}, l)
}
