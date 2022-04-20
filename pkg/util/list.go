package util

import (
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type List[T comparable] []T

func (l List[T]) Has(elements ...T) bool {
	return Any(elements, func(e T) bool {
		return slices.Contains(l, e)
	})
}

func (l List[T]) At(i int) *T {
	if len(l) == 0 || i < 0 || len(l) <= i {
		return nil
	}
	e := l[i]
	return &e
}

func (l List[T]) Index(e T) int {
	return slices.Index(l, e)
}

func (l List[T]) Len() int {
	return len(l)
}

func (l List[T]) Copy() List[T] {
	if l == nil {
		return nil
	}
	return slices.Clone(l)
}

func (l List[T]) Ref() *List[T] {
	if l == nil {
		return nil
	}
	return &l
}

func (l List[T]) Refs() []*T {
	return Map(l, func(e T) *T {
		return &e
	})
}

func (l List[T]) Delete(elements ...T) List[T] {
	if l == nil {
		return nil
	}
	m := l.Copy()
	for _, e := range elements {
		if j := l.Index(e); j >= 0 {
			m = slices.Delete[[]T](m, j, j+1)
		}
	}
	return m
}

func (l List[T]) DeleteAt(i int) List[T] {
	if l == nil {
		return nil
	}
	m := l.Copy()
	return slices.Delete(m, i, i+1)
}

func (l List[T]) Add(elements ...T) List[T] {
	res := l.Copy()
	for _, e := range elements {
		res = append(res, e)
	}
	return res
}

func (l List[T]) AddUniq(elements ...T) List[T] {
	res := append(List[T]{}, l...)
	for _, id := range elements {
		if !res.Has(id) {
			res = append(res, id)
		}
	}
	return res
}

func (l List[T]) Insert(i int, elements ...T) List[T] {
	if i < 0 || len(l) < i {
		return l.Add(elements...)
	}
	return slices.Insert(l, i, elements...)
}

func (l List[T]) Move(e T, to int) List[T] {
	return l.MoveAt(l.Index(e), to)
}

func (l List[T]) MoveAt(from, to int) List[T] {
	if from < 0 || from == to || len(l) <= from {
		return l.Copy()
	}
	e := l[from]
	if from < to {
		to--
	}
	m := l.DeleteAt(from)
	if to < 0 {
		return m
	}
	return m.Insert(to, e)
}

func (l List[T]) Reverse() List[T] {
	return lo.Reverse(l.Copy())
}

func (l List[T]) Concat(m []T) List[T] {
	return append(l, m...)
}

func (l List[T]) Intersect(m []T) List[T] {
	if l == nil {
		return nil
	}
	return lo.Intersect(m, l)
}
