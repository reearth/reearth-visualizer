package util

import (
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
	"golang.org/x/exp/slices"
)

func TestSyncMap_Load_Store(t *testing.T) {
	s := &SyncMap[string, int]{}
	s.Store("a", 1)

	res, ok := s.Load("a")
	assert.Equal(t, 1, res)
	assert.True(t, ok)

	res, ok = s.Load("b")
	assert.Equal(t, 0, res)
	assert.False(t, ok)
}

func TestSyncMap_LoadAll(t *testing.T) {
	s := &SyncMap[string, int]{}
	s.Store("a", 1)
	s.Store("b", 2)

	assert.Equal(t, []int{1, 2}, s.LoadAll("a", "b", "c"))
	assert.Equal(t, []int(nil), s.LoadAll("d"))
}

func TestSyncMap_LoadOrStore(t *testing.T) {
	s := &SyncMap[string, string]{}
	res, ok := s.LoadOrStore("a", "A")
	assert.Equal(t, "", res)
	assert.False(t, ok)
	res, ok = s.LoadOrStore("a", "AA")
	assert.Equal(t, "A", res)
	assert.True(t, ok)
	res, ok = s.Load("a")
	assert.Equal(t, "A", res)
	assert.True(t, ok)
}

func TestSyncMap_Delete(t *testing.T) {
	s := &SyncMap[string, int]{}
	s.Store("a", 1)

	s.Delete("a")
	res, ok := s.Load("a")
	assert.Equal(t, 0, res)
	assert.False(t, ok)

	s.Delete("b") // no panic
}

func TestSyncMap_DeleteAll(t *testing.T) {
	s := &SyncMap[string, int]{}
	s.Store("a", 1)
	s.Store("b", 2)

	s.DeleteAll("a", "b")
	res, ok := s.Load("a")
	assert.Equal(t, 0, res)
	assert.False(t, ok)
	res, ok = s.Load("b")
	assert.Equal(t, 0, res)
	assert.False(t, ok)

	s.DeleteAll("c") // no panic
}

func TestSyncMap_Range(t *testing.T) {
	s := &SyncMap[string, int]{}
	s.Store("a", 1)
	s.Store("b", 2)

	var vv int
	s.Range(func(k string, v int) bool {
		if k == "a" {
			vv = v
			return false
		}
		return true
	})
	assert.Equal(t, 1, vv)
}

func TestSyncMap_Find(t *testing.T) {
	s := &SyncMap[string, int]{}
	s.Store("a", 1)
	s.Store("b", 2)

	res := s.Find(func(k string, v int) bool {
		return k == "a"
	})
	assert.Equal(t, 1, res)

	res = s.Find(func(k string, v int) bool {
		return k == "c"
	})
	assert.Equal(t, 0, res)
}

func TestSyncMap_FindAll(t *testing.T) {
	s := &SyncMap[string, int]{}
	s.Store("a", 1)
	s.Store("b", 2)

	res := s.FindAll(func(k string, v int) bool {
		return k == "a" || k == "b"
	})
	slices.Sort(res)
	assert.Equal(t, []int{1, 2}, res)

	res = s.FindAll(func(k string, v int) bool {
		return k == "c"
	})
	assert.Equal(t, []int(nil), res)
}

func TestSyncMap_Map(t *testing.T) {
	s := &SyncMap[string, int]{}
	s.Store("a", 1)
	s.Store("b", 2)
	u := s.Map(func(k string, v int) int {
		if k == "a" {
			return 3
		}
		return v
	})

	keys := u.Keys()
	slices.Sort(keys)
	values := u.Values()
	slices.Sort(values)
	assert.Equal(t, []string{"a", "b"}, keys)
	assert.Equal(t, []int{2, 3}, values)
}

func TestSyncMap_Merge(t *testing.T) {
	s := &SyncMap[string, int]{}
	s.Store("a", 1)
	s.Store("b", 2)
	u := &SyncMap[string, int]{}
	u.Store("c", 3)
	s.Merge(u)

	keys := s.Keys()
	slices.Sort(keys)
	values := s.Values()
	slices.Sort(values)
	assert.Equal(t, []string{"a", "b", "c"}, keys)
	assert.Equal(t, []int{1, 2, 3}, values)
}

func TestSyncMap_Keys(t *testing.T) {
	s := &SyncMap[string, int]{}
	s.Store("a", 1)
	s.Store("b", 2)
	keys := s.Keys()
	slices.Sort(keys)
	assert.Equal(t, []string{"a", "b"}, keys)
}

func TestSyncMap_Values(t *testing.T) {
	s := &SyncMap[string, int]{}
	s.Store("a", 1)
	s.Store("b", 2)
	values := s.Values()
	slices.Sort(values)
	assert.Equal(t, []int{1, 2}, values)
}

func TestSyncMap_Len(t *testing.T) {
	s := SyncMap[string, int]{}
	s.Store("a", 1)
	s.Store("b", 2)
	assert.Equal(t, 2, s.Len())
}

func TestLockMap(t *testing.T) {
	m := LockMap[string]{}
	res := []string{}
	wg := sync.WaitGroup{}

	wg.Add(3)
	go func() {
		u := m.Lock("a")
		res = append(res, "a")
		u()
		wg.Done()
	}()
	go func() {
		u := m.Lock("b")
		res = append(res, "b")
		u()
		wg.Done()
	}()
	go func() {
		u := m.Lock("a")
		res = append(res, "c")
		u()
		wg.Done()
	}()

	wg.Wait()
	slices.Sort(res)
	assert.Equal(t, []string{"a", "b", "c"}, res)
}
