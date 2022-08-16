package idx

import (
	"github.com/reearth/reearth/server/pkg/util"
	"golang.org/x/exp/slices"
)

type List[T Type] []ID[T]

type RefList[T Type] []*ID[T]

func ListFrom[T Type](ids []string) (List[T], error) {
	return util.TryMap(ids, From[T])
}

func MustList[T Type](ids []string) List[T] {
	return util.Must(ListFrom[T](ids))
}

func (l List[T]) list() util.List[ID[T]] {
	return util.List[ID[T]](l)
}

func (l List[T]) Has(ids ...ID[T]) bool {
	return l.list().Has(ids...)
}

func (l List[T]) At(i int) *ID[T] {
	return l.list().At(i)
}

func (l List[T]) Index(id ID[T]) int {
	return l.list().Index(id)
}

func (l List[T]) Len() int {
	return l.list().Len()
}

func (l List[T]) Ref() *List[T] {
	return (*List[T])(l.list().Ref())
}

func (l List[T]) Refs() RefList[T] {
	return l.list().Refs()
}

func (l List[T]) Delete(ids ...ID[T]) List[T] {
	return List[T](l.list().Delete(ids...))
}

func (l List[T]) DeleteAt(i int) List[T] {
	return List[T](l.list().DeleteAt(i))
}

func (l List[T]) Add(ids ...ID[T]) List[T] {
	return List[T](l.list().Add(ids...))
}

func (l List[T]) AddUniq(ids ...ID[T]) List[T] {
	return List[T](l.list().AddUniq(ids...))
}

func (l List[T]) Insert(i int, ids ...ID[T]) List[T] {
	return List[T](l.list().Insert(i, ids...))
}

func (l List[T]) Move(e ID[T], to int) List[T] {
	return List[T](l.list().Move(e, to))
}

func (l List[T]) MoveAt(from, to int) List[T] {
	return List[T](l.list().MoveAt(from, to))
}

func (l List[T]) Reverse() List[T] {
	return List[T](l.list().Reverse())
}

func (l List[T]) Concat(m List[T]) List[T] {
	return List[T](l.list().Concat(m))
}

func (l List[T]) Intersect(m List[T]) List[T] {
	return List[T](l.list().Intersect(m))
}

func (l List[T]) Strings() []string {
	return util.Map(l, func(id ID[T]) string {
		return id.String()
	})
}

func (l List[T]) Clone() List[T] {
	return util.Map(l, func(id ID[T]) ID[T] {
		return id.Clone()
	})
}

func (l List[T]) Sort() List[T] {
	m := l.list().Copy()
	slices.SortStableFunc(m, func(a, b ID[T]) bool {
		return a.Compare(b) <= 0
	})
	return List[T](m)
}

func (l RefList[T]) Deref() List[T] {
	return util.FilterMap(l, func(id *ID[T]) *ID[T] {
		if id != nil && !(*id).IsNil() {
			return id
		}
		return nil
	})
}
