package idx

type Set[T Type] struct {
	l List[T]
	m map[ID[T]]struct{}
}

func NewSet[T Type](id ...ID[T]) *Set[T] {
	s := &Set[T]{}
	s.Add(id...)
	return s
}

func (s *Set[T]) Has(id ...ID[T]) bool {
	if s == nil || s.m == nil {
		return false
	}
	for _, i := range id {
		if _, ok := s.m[i]; ok {
			return true
		}
	}
	return false
}

func (s *Set[T]) List() List[T] {
	if s == nil {
		return nil
	}
	return s.l.Clone()
}

func (s *Set[T]) Clone() *Set[T] {
	if s == nil {
		return nil
	}
	return NewSet(s.l...)
}

func (s *Set[T]) Add(id ...ID[T]) {
	if s == nil {
		return
	}
	for _, i := range id {
		if !s.Has(i) {
			if s.m == nil {
				s.m = map[ID[T]]struct{}{}
			}
			s.m[i] = struct{}{}
			s.l = append(s.l, i)
		}
	}
}

func (s *Set[T]) Merge(sets ...*Set[T]) {
	if s == nil {
		return
	}
	for _, t := range sets {
		if t != nil {
			s.Add(t.l...)
		}
	}
}

func (s *Set[T]) Concat(sets ...*Set[T]) *Set[T] {
	if s == nil {
		return nil
	}
	ns := s.Clone()
	ns.Merge(sets...)
	return ns
}

func (s *Set[T]) Delete(id ...ID[T]) {
	if s == nil {
		return
	}
	for _, i := range id {
		s.l = s.l.Delete(i)
		if s.m != nil {
			delete(s.m, i)
		}
	}
}
