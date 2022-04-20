package idx

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestListFrom(t *testing.T) {
	id := Must[T]("01g0nzan4qnb2f2s9ehrgv62a3")

	ids, err := ListFrom[T]([]string{"01g0nzan4qnb2f2s9ehrgv62a3"})
	assert.NoError(t, err)
	assert.Equal(t, List[T]{id}, ids)

	ids, err = ListFrom[T]([]string{"01g0nzan4qnb2f2s9ehrgv62a3", "a"})
	assert.Equal(t, ErrInvalidID, err)
	assert.Nil(t, ids)
}

func TestMustList(t *testing.T) {
	id := Must[T]("01g0nzan4qnb2f2s9ehrgv62a3")

	ids := MustList[T]([]string{"01g0nzan4qnb2f2s9ehrgv62a3"})
	assert.Equal(t, List[T]{id}, ids)

	assert.PanicsWithValue(t, ErrInvalidID, func() {
		_ = MustList[T]([]string{"01g0nzan4qnb2f2s9ehrgv62a3", "a"})
	})
}

func TestList_Has(t *testing.T) {
	a := New[T]()
	b := New[T]()
	c := New[T]()
	l := List[T]{a, b}

	assert.True(t, l.Has(a))
	assert.True(t, l.Has(a, c))
	assert.False(t, l.Has(c))
	assert.False(t, List[T](nil).Has(a))
}

func TestList_At(t *testing.T) {
	a := New[T]()
	b := New[T]()
	l := List[T]{a, b}

	assert.Nil(t, List[T](nil).At(0))
	assert.Nil(t, l.At(-1))
	assert.Equal(t, &a, l.At(0))
	assert.Equal(t, &b, l.At(1))
	assert.Nil(t, l.At(2))
}

func TestList_Index(t *testing.T) {
	a := New[T]()
	b := New[T]()
	c := New[T]()
	l := List[T]{a, b}

	assert.Equal(t, -1, List[T](nil).Index(a))
	assert.Equal(t, 0, l.Index(a))
	assert.Equal(t, 1, l.Index(b))
	assert.Equal(t, -1, l.Index(c))
}

func TestList_Len(t *testing.T) {
	a := New[T]()
	b := New[T]()
	l := List[T]{a, b}

	assert.Equal(t, 0, List[T](nil).Len())
	assert.Equal(t, 2, l.Len())
}

func TestList_Ref(t *testing.T) {
	a := New[T]()
	b := New[T]()
	l := List[T]{a, b}

	assert.Nil(t, List[T](nil).Ref())
	assert.Equal(t, &List[T]{a, b}, l.Ref())
}

func TestList_Refs(t *testing.T) {
	a := New[T]()
	b := New[T]()
	l := List[T]{a, b}

	assert.Nil(t, List[T](nil).Refs())
	assert.Equal(t, RefList[T]{&a, &b}, l.Refs())
}

func TestList_Delete(t *testing.T) {
	a := New[T]()
	b := New[T]()
	c := New[T]()
	l := List[T]{a, b, c}

	assert.Nil(t, (List[T])(nil).Delete(b))
	assert.Equal(t, List[T]{a, c}, l.Delete(b))
	assert.Equal(t, List[T]{a, b, c}, l)
}

func TestList_DeleteAt(t *testing.T) {
	a := New[T]()
	b := New[T]()
	c := New[T]()
	l := List[T]{a, b, c}

	assert.Nil(t, (List[T])(nil).DeleteAt(1))
	assert.Equal(t, List[T]{a, c}, l.DeleteAt(1))
	assert.Equal(t, List[T]{a, b, c}, l)
}

func TestList_Add(t *testing.T) {
	a := New[T]()
	b := New[T]()
	c := New[T]()
	l := List[T]{a, b}

	assert.Equal(t, List[T]{a, b}, List[T](nil).Add(a, b))
	assert.Equal(t, List[T]{a, b, c, a}, l.Add(c, a))
	assert.Equal(t, List[T]{a, b}, l)
}

func TestList_AddUniq(t *testing.T) {
	a := New[T]()
	b := New[T]()
	c := New[T]()
	l := List[T]{a, b}

	assert.Equal(t, List[T]{a, b}, List[T](nil).AddUniq(a, b))
	assert.Equal(t, List[T]{a, b, c}, l.AddUniq(c, a))
	assert.Equal(t, List[T]{a, b}, l)
}

func TestList_Insert(t *testing.T) {
	a := New[T]()
	b := New[T]()
	c := New[T]()
	l := List[T]{a, b}

	assert.Equal(t, List[T]{a, b, c}, l.Insert(-1, c))
	assert.Equal(t, List[T]{c, a, b}, l.Insert(0, c))
	assert.Equal(t, List[T]{a, c, b}, l.Insert(1, c))
	assert.Equal(t, List[T]{a, b, c}, l.Insert(2, c))
	assert.Equal(t, List[T]{a, b, c}, l.Insert(3, c))
}

func TestList_Move(t *testing.T) {
	a := New[T]()
	b := New[T]()
	c := New[T]()
	l := List[T]{a, b, c}

	assert.Nil(t, List[T](nil).Move(a, -1))
	assert.Equal(t, List[T]{c, a, b}, l.Move(c, 0))
	assert.Equal(t, List[T]{a, b, c}, l)
	assert.Equal(t, List[T]{a, b}, l.Move(c, -1))
	assert.Equal(t, List[T]{c, a, b}, l.Move(c, 0))
	assert.Equal(t, List[T]{a, c, b}, l.Move(b, 10))
}

func TestList_MoveAt(t *testing.T) {
	a := New[T]()
	b := New[T]()
	c := New[T]()
	l := List[T]{a, b, c}

	assert.Nil(t, List[T](nil).MoveAt(0, -1))
	assert.Equal(t, List[T]{c, a, b}, l.MoveAt(2, 0))
	assert.Equal(t, List[T]{a, b, c}, l)
	assert.Equal(t, List[T]{a, b}, l.MoveAt(2, -1))
	assert.Equal(t, List[T]{c, a, b}, l.MoveAt(2, 0))
	assert.Equal(t, List[T]{a, c, b}, l.MoveAt(1, 10))
}

func TestList_Reverse(t *testing.T) {
	a := New[T]()
	b := New[T]()
	c := New[T]()
	l := List[T]{a, b, c}

	assert.Nil(t, List[T](nil).Reverse())
	assert.Equal(t, List[T]{c, b, a}, l.Reverse())
	assert.Equal(t, List[T]{a, b, c}, l)
}

func TestList_Concat(t *testing.T) {
	a := New[T]()
	b := New[T]()
	c := New[T]()
	l := List[T]{a, b}

	assert.Equal(t, List[T]{a, c}, List[T](nil).Concat(List[T]{a, c}))
	assert.Equal(t, List[T]{a, b, a, c}, l.Concat(List[T]{a, c}))
	assert.Equal(t, List[T]{a, b}, l)
}

func TestList_Intersect(t *testing.T) {
	a := New[T]()
	b := New[T]()
	c := New[T]()
	l := List[T]{a, b}

	assert.Nil(t, List[T](nil).Intersect(List[T]{c, a}))
	assert.Equal(t, List[T]{a}, l.Intersect(List[T]{c, a}))
	assert.Equal(t, List[T]{a, b}, l)
}

func TestList_Strings(t *testing.T) {
	a := New[T]()
	b := New[T]()
	l := List[T]{a, b}

	assert.Nil(t, List[T](nil).Strings())
	assert.Equal(t, []string{a.String(), b.String()}, l.Strings())
}

func TestList_Clone(t *testing.T) {
	a := New[T]()
	b := New[T]()
	l := List[T]{a, b}

	assert.Nil(t, List[T](nil).Clone())
	assert.Equal(t, List[T]{a, b}, l.Clone())
	assert.NotSame(t, l, l.Clone())
}

func TestList_Sort(t *testing.T) {
	a := New[T]()
	b := New[T]()
	l := List[T]{b, a, a}

	assert.Nil(t, List[T](nil).Sort())
	assert.Equal(t, List[T]{a, a, b}, l.Sort())
}

func TestList_Deref(t *testing.T) {
	a := New[T]()
	b := New[T]()
	c := New[T]()
	l := RefList[T]{&b, &a, nil, &c}

	assert.Nil(t, RefList[T](nil).Deref())
	assert.Equal(t, List[T]{b, a, c}, l.Deref())
}
