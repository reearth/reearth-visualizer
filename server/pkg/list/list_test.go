package list_test

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/list"
	"github.com/stretchr/testify/assert"
)

type MockIdentifiable struct {
	id string
}

func (m MockIdentifiable) ID() string {
	return m.id
}

type MockIDLister struct {
	ids []string
}

func (m MockIDLister) LayerCount() int {
	return len(m.ids)
}

func (m MockIDLister) Layers() []string {
	return m.ids
}

func TestLast(t *testing.T) {
	int1 := 1
	int2 := 2

	tests := []struct {
		name   string
		target []*int
		want   *int
	}{
		{
			name:   "last element",
			target: []*int{&int1, &int2},
			want:   &int2,
		},
		{
			name:   "empty slice",
			target: []*int{},
			want:   nil,
		},
		{
			name:   "nil slice",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, list.Last(tt.target))
		})
	}
}

func TestExtractIDs(t *testing.T) {
	tests := []struct {
		name   string
		target []*MockIdentifiable
		want   []string
	}{
		{
			name:   "normal case",
			target: []*MockIdentifiable{{id: "id1"}, {id: "id2"}, {id: "id3"}},
			want:   []string{"id1", "id2", "id3"},
		},
		{
			name:   "empty slice",
			target: []*MockIdentifiable{},
			want:   nil,
		},
		{
			name:   "nil contained",
			target: []*MockIdentifiable{{id: "id1"}, nil, {id: "id3"}},
			want:   []string{"id1", "", "id3"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.ExtractIDs[string, MockIdentifiable](tt.target)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestPick(t *testing.T) {
	tests := []struct {
		name   string
		slice  []*MockIdentifiable
		idList MockIDLister
		want   []*MockIdentifiable
	}{
		{
			name:   "pick existing items",
			slice:  []*MockIdentifiable{{id: "id1"}, {id: "id2"}, {id: "id3"}},
			idList: MockIDLister{ids: []string{"id1", "id3"}},
			want:   []*MockIdentifiable{{id: "id1"}, {id: "id3"}},
		},
		{
			name:   "pick non-existing item",
			slice:  []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
			idList: MockIDLister{ids: []string{"id3"}},
			want:   []*MockIdentifiable{},
		},
		{
			name:   "nil id list",
			slice:  []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
			idList: MockIDLister{ids: nil},
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.Pick[string, MockIdentifiable](tt.slice, tt.idList)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestFind(t *testing.T) {
	tests := []struct {
		name  string
		slice []*MockIdentifiable
		lid   string
		want  *MockIdentifiable
	}{
		{
			name:  "find existing item",
			slice: []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
			lid:   "id2",
			want:  &MockIdentifiable{id: "id2"},
		},
		{
			name:  "find non-existing item",
			slice: []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
			lid:   "id3",
			want:  nil,
		},
		{
			name:  "nil item in slice",
			slice: []*MockIdentifiable{{id: "id1"}, nil, {id: "id3"}},
			lid:   "id3",
			want:  &MockIdentifiable{id: "id3"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.Find[string, MockIdentifiable](tt.slice, tt.lid)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestDeref(t *testing.T) {
	tests := []struct {
		name    string
		slice   []*MockIdentifiable
		skipNil bool
		want    []MockIdentifiable
	}{
		{
			name:    "non-empty slice",
			slice:   []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
			skipNil: false,
			want:    []MockIdentifiable{{id: "id1"}, {id: "id2"}},
		},
		{
			name:    "empty slice",
			slice:   []*MockIdentifiable{},
			skipNil: false,
			want:    []MockIdentifiable{},
		},
		{
			name:    "nil slice",
			slice:   nil,
			skipNil: false,
			want:    nil,
		},
		{
			name:    "slice with nil element",
			slice:   []*MockIdentifiable{{id: "id1"}, nil, {id: "id3"}},
			skipNil: false,
			want:    []MockIdentifiable{{id: "id1"}, {id: ""}, {id: "id3"}},
		},
		{
			name:    "nil slice with skipNil true",
			slice:   nil,
			skipNil: true,
			want:    []MockIdentifiable{},
		},
		{
			name:    "slice with nil element with skipNil true",
			slice:   []*MockIdentifiable{{id: "id1"}, nil, {id: "id3"}},
			skipNil: true,
			want:    []MockIdentifiable{{id: "id1"}, {id: "id3"}},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.Deref[MockIdentifiable](tt.slice, tt.skipNil)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestAdd(t *testing.T) {
	tests := []struct {
		name  string
		m     map[string]*MockIdentifiable
		items []*MockIdentifiable
		want  map[string]*MockIdentifiable
	}{
		{
			name:  "add to empty map",
			m:     make(map[string]*MockIdentifiable),
			items: []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
			want:  map[string]*MockIdentifiable{"id1": {id: "id1"}, "id2": {id: "id2"}},
		},
		{
			name:  "add to non-empty map",
			m:     map[string]*MockIdentifiable{"id1": {id: "id1"}},
			items: []*MockIdentifiable{{id: "id2"}},
			want:  map[string]*MockIdentifiable{"id1": {id: "id1"}, "id2": {id: "id2"}},
		},
		{
			name:  "nil item",
			m:     make(map[string]*MockIdentifiable),
			items: []*MockIdentifiable{nil},
			want:  map[string]*MockIdentifiable{},
		},
		{
			name:  "nil map",
			m:     nil,
			items: []*MockIdentifiable{{id: "id1"}},
			want:  map[string]*MockIdentifiable{"id1": {id: "id1"}},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.Add[string, MockIdentifiable](tt.m, tt.items...)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestMap(t *testing.T) {
	tests := []struct {
		name  string
		slice []*MockIdentifiable
		want  map[string]*MockIdentifiable
	}{
		{
			name:  "non-empty slice",
			slice: []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
			want:  map[string]*MockIdentifiable{"id1": {id: "id1"}, "id2": {id: "id2"}},
		},
		{
			name:  "empty slice",
			slice: []*MockIdentifiable{},
			want:  map[string]*MockIdentifiable{},
		},
		{
			name:  "nil slice",
			slice: nil,
			want:  map[string]*MockIdentifiable{},
		},
		{
			name:  "slice with nil element",
			slice: []*MockIdentifiable{{id: "id1"}, nil, {id: "id3"}},
			want:  map[string]*MockIdentifiable{"id1": {id: "id1"}, "id3": {id: "id3"}},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.Map[string, MockIdentifiable](tt.slice)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestMapWithIDFunc(t *testing.T) {
	idFunc := func(item *MockIdentifiable) string {
		if item != nil {
			return item.ID()
		}
		return ""
	}

	tests := []struct {
		name     string
		slice    []*MockIdentifiable
		checkNil bool
		want     map[string]*MockIdentifiable
	}{
		{
			name:     "non-empty slice",
			slice:    []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
			checkNil: false,
			want:     map[string]*MockIdentifiable{"id1": {id: "id1"}, "id2": {id: "id2"}},
		},
		{
			name:     "nil slice with checkNil true",
			slice:    nil,
			checkNil: true,
			want:     nil,
		},
		{
			name:     "nil slice with checkNil false",
			slice:    nil,
			checkNil: false,
			want:     map[string]*MockIdentifiable{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.MapWithIDFunc[string, MockIdentifiable](tt.slice, idFunc, tt.checkNil)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestMerge(t *testing.T) {
	tests := []struct {
		name string
		m    map[string]*MockIdentifiable
		m2   map[string]*MockIdentifiable
		want map[string]*MockIdentifiable
	}{
		{
			name: "merge two non-empty maps",
			m:    map[string]*MockIdentifiable{"id1": {id: "id1"}},
			m2:   map[string]*MockIdentifiable{"id2": {id: "id2"}},
			want: map[string]*MockIdentifiable{"id1": {id: "id1"}, "id2": {id: "id2"}},
		},
		{
			name: "merge with nil map",
			m:    nil,
			m2:   map[string]*MockIdentifiable{"id1": {id: "id1"}},
			want: map[string]*MockIdentifiable{"id1": {id: "id1"}},
		},
		{
			name: "merge with nil map 2",
			m:    map[string]*MockIdentifiable{"id1": {id: "id1"}},
			m2:   nil,
			want: map[string]*MockIdentifiable{"id1": {id: "id1"}},
		},
		{
			name: "merge with nil maps",
			m:    nil,
			m2:   nil,
			want: map[string]*MockIdentifiable{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.Merge[string, MockIdentifiable](tt.m, tt.m2)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestListMerge(t *testing.T) {
	type T struct {
		ID   string
		Name string
	}
	cloneFunc := func(item T) T {
		return T{ID: item.ID, Name: item.Name}
	}

	tests := []struct {
		name          string
		list1         []T
		list2         []T
		getClone      func(T) T
		duplicateSkip bool
		want          []T
	}{
		{
			name:          "merge two non-empty lists",
			list1:         []T{{ID: "id1", Name: "Item 1"}, {ID: "id3", Name: "Item 3"}},
			list2:         []T{{ID: "id2", Name: "Item 2"}, {ID: "id4", Name: "Item 4"}},
			getClone:      cloneFunc,
			duplicateSkip: false,
			want:          []T{{ID: "id1", Name: "Item 1"}, {ID: "id3", Name: "Item 3"}, {ID: "id2", Name: "Item 2"}, {ID: "id4", Name: "Item 4"}},
		},
		{
			name:          "merge two non-empty lists with duplicate items",
			list1:         []T{{ID: "id1", Name: "Item 1"}, {ID: "id2", Name: "Item 2"}, {ID: "id3", Name: "Item 3"}},
			list2:         []T{{ID: "id2", Name: "Item 2"}, {ID: "id4", Name: "Item 4"}},
			getClone:      cloneFunc,
			duplicateSkip: false,
			want:          []T{{ID: "id1", Name: "Item 1"}, {ID: "id2", Name: "Item 2"}, {ID: "id3", Name: "Item 3"}, {ID: "id2", Name: "Item 2"}, {ID: "id4", Name: "Item 4"}},
		},
		{
			name:          "merge two non-empty lists with duplicate items and skip",
			list1:         []T{{ID: "id1", Name: "Item 1"}, {ID: "id2", Name: "Item 2"}, {ID: "id3", Name: "Item 3"}},
			list2:         []T{{ID: "id2", Name: "Item 2"}, {ID: "id4", Name: "Item 4"}},
			getClone:      cloneFunc,
			duplicateSkip: true,
			want:          []T{{ID: "id1", Name: "Item 1"}, {ID: "id2", Name: "Item 2"}, {ID: "id3", Name: "Item 3"}, {ID: "id4", Name: "Item 4"}},
		},
		{
			name:          "merge non-empty list with empty list",
			list1:         []T{{ID: "id1", Name: "Item 1"}, {ID: "id2", Name: "Item 2"}},
			list2:         []T{},
			getClone:      cloneFunc,
			duplicateSkip: true,
			want:          []T{{ID: "id1", Name: "Item 1"}, {ID: "id2", Name: "Item 2"}},
		},
		{
			name:          "merge empty list with non-empty list",
			list1:         []T{},
			list2:         []T{{ID: "id3", Name: "Item 3"}, {ID: "id4", Name: "Item 4"}},
			getClone:      cloneFunc,
			duplicateSkip: false,
			want:          []T{{ID: "id3", Name: "Item 3"}, {ID: "id4", Name: "Item 4"}},
		},
		{
			name:          "merge two nil lists",
			list1:         nil,
			list2:         nil,
			duplicateSkip: true,
			getClone:      cloneFunc,
			want:          []T{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.ListMerge(tt.list1, tt.list2, tt.getClone, tt.duplicateSkip)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestList(t *testing.T) {
	tests := []struct {
		name    string
		m       map[string]*MockIdentifiable
		skipNil bool
		want    []*MockIdentifiable
	}{
		{
			name:    "non-empty map",
			m:       map[string]*MockIdentifiable{"id1": {id: "id1"}},
			skipNil: false,
			want:    []*MockIdentifiable{{id: "id1"}},
		},
		{
			name:    "map with nil values",
			m:       map[string]*MockIdentifiable{"id1": nil, "id2": {id: "id2"}},
			skipNil: true,
			want:    []*MockIdentifiable{{id: "id2"}},
		},
		{
			name:    "empty map",
			m:       map[string]*MockIdentifiable{},
			skipNil: false,
			want:    []*MockIdentifiable{},
		},
		{
			name:    "nil map",
			m:       nil,
			skipNil: false,
			want:    nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.List[string, MockIdentifiable](tt.m, tt.skipNil)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestClone(t *testing.T) {
	tests := []struct {
		name string
		m    map[string]*MockIdentifiable
		want map[string]*MockIdentifiable
	}{
		{
			name: "clone non-empty map",
			m: map[string]*MockIdentifiable{
				"id1": {id: "id1"},
				"id2": {id: "id2"},
			},
			want: map[string]*MockIdentifiable{
				"id1": {id: "id1"},
				"id2": {id: "id2"},
			},
		},
		{
			name: "clone empty map",
			m:    map[string]*MockIdentifiable{},
			want: map[string]*MockIdentifiable{},
		},
		{
			name: "clone nil map",
			m:    nil,
			want: map[string]*MockIdentifiable{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.Clone[string, MockIdentifiable](tt.m)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestListClone(t *testing.T) {
	type T struct {
		ID   string
		Name string
	}
	cloneFunc := func(item T) T {
		return T{ID: item.ID, Name: item.Name}
	}

	tests := []struct {
		name     string
		list     []T
		getClone func(T) T
		want     []T
	}{
		{
			name:     "clone non-empty list",
			list:     []T{{ID: "id1", Name: "Item 1"}, {ID: "id2", Name: "Item 2"}},
			getClone: cloneFunc,
			want:     []T{{ID: "id1", Name: "Item 1"}, {ID: "id2", Name: "Item 2"}},
		},
		{
			name:     "clone empty list",
			list:     []T{},
			getClone: cloneFunc,
			want:     []T{},
		},
		{
			name:     "clone nil list",
			list:     nil,
			getClone: cloneFunc,
			want:     nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.ListClone(tt.list, tt.getClone)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestRemove(t *testing.T) {
	tests := []struct {
		name        string
		slice       []*MockIdentifiable
		idsToRemove []string
		want        []*MockIdentifiable
	}{
		{
			name:        "remove existing items",
			slice:       []*MockIdentifiable{{id: "id1"}, {id: "id2"}, {id: "id3"}},
			idsToRemove: []string{"id1", "id3"},
			want:        []*MockIdentifiable{{id: "id2"}},
		},
		{
			name:        "remove non-existing items",
			slice:       []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
			idsToRemove: []string{"id3"},
			want:        []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
		},
		{
			name:        "remove all items",
			slice:       []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
			idsToRemove: []string{"id1", "id2"},
			want:        []*MockIdentifiable{},
		},
		{
			name:        "remove from empty slice",
			slice:       []*MockIdentifiable{},
			idsToRemove: []string{"id1", "id2"},
			want:        []*MockIdentifiable{},
		},
		{
			name:        "remove from nil slice",
			slice:       nil,
			idsToRemove: []string{"id1", "id2"},
			want:        nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.Remove[string, MockIdentifiable](tt.slice, tt.idsToRemove...)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestAddUnique(t *testing.T) {
	tests := []struct {
		name    string
		slice   []*MockIdentifiable
		newList []*MockIdentifiable
		want    []*MockIdentifiable
	}{
		{
			name:    "add unique items",
			slice:   []*MockIdentifiable{{id: "id1"}},
			newList: []*MockIdentifiable{{id: "id2"}, {id: "id3"}},
			want:    []*MockIdentifiable{{id: "id1"}, {id: "id2"}, {id: "id3"}},
		},
		{
			name:    "skip existing items",
			slice:   []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
			newList: []*MockIdentifiable{{id: "id2"}, {id: "id3"}},
			want:    []*MockIdentifiable{{id: "id1"}, {id: "id2"}, {id: "id3"}},
		},
		{
			name:    "add to empty slice",
			slice:   []*MockIdentifiable{},
			newList: []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
			want:    []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
		},
		{
			name:    "add to nil slice",
			slice:   nil,
			newList: []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
			want:    []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
		},
		{
			name:    "add nil item",
			slice:   []*MockIdentifiable{{id: "id1"}},
			newList: []*MockIdentifiable{nil},
			want:    []*MockIdentifiable{{id: "id1"}},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.AddUnique[string, MockIdentifiable](tt.slice, tt.newList)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestMapPick(t *testing.T) {
	tests := []struct {
		name   string
		m      map[string]*MockIdentifiable
		idList MockIDLister
		want   []*MockIdentifiable
	}{
		{
			name:   "pick existing items from map",
			m:      map[string]*MockIdentifiable{"id1": {id: "id1"}, "id2": {id: "id2"}},
			idList: MockIDLister{ids: []string{"id1"}},
			want:   []*MockIdentifiable{{id: "id1"}},
		},
		{
			name:   "pick non-existing items from map",
			m:      map[string]*MockIdentifiable{"id1": {id: "id1"}, "id2": {id: "id2"}},
			idList: MockIDLister{ids: []string{"id3"}},
			want:   []*MockIdentifiable{},
		},
		{
			name:   "nil id list",
			m:      map[string]*MockIdentifiable{"id1": {id: "id1"}, "id2": {id: "id2"}},
			idList: MockIDLister{ids: nil},
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.MapPick[string, MockIdentifiable](tt.m, tt.idList)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestExtractKeys(t *testing.T) {
	tests := []struct {
		name string
		m    map[string]*MockIdentifiable
		want []string
	}{
		{
			name: "non-empty map",
			m:    map[string]*MockIdentifiable{"id1": {id: "id1"}},
			want: []string{"id1"},
		},
		{
			name: "empty map",
			m:    map[string]*MockIdentifiable{},
			want: []string{},
		},
		{
			name: "nil map",
			m:    nil,
			want: []string{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.ExtractKeys[string, MockIdentifiable](tt.m)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestToGenericList(t *testing.T) {
	converter := func(s *MockIdentifiable) *MockIdentifiable {
		return s
	}

	tests := []struct {
		name      string
		list      []*MockIdentifiable
		converter func(*MockIdentifiable) *MockIdentifiable
		want      []*MockIdentifiable
	}{
		{
			name:      "non-empty list",
			list:      []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
			converter: converter,
			want:      []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
		},
		{
			name:      "empty list",
			list:      []*MockIdentifiable{},
			converter: converter,
			want:      []*MockIdentifiable{},
		},
		{
			name:      "nil list",
			list:      nil,
			converter: converter,
			want:      []*MockIdentifiable{},
		},
		{
			name:      "list with nil element",
			list:      []*MockIdentifiable{{id: "id1"}, nil, {id: "id3"}},
			converter: converter,
			want:      []*MockIdentifiable{{id: "id1"}, {id: "id3"}},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.ToGenericList[MockIdentifiable, MockIdentifiable](tt.list, tt.converter)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestToGenericListValue(t *testing.T) {
	converter := func(s MockIdentifiable) *MockIdentifiable {
		return &s
	}

	tests := []struct {
		name      string
		list      []MockIdentifiable
		converter func(MockIdentifiable) *MockIdentifiable
		want      []*MockIdentifiable
	}{
		{
			name:      "non-empty list",
			list:      []MockIdentifiable{{id: "id1"}, {id: "id2"}},
			converter: converter,
			want:      []*MockIdentifiable{{id: "id1"}, {id: "id2"}},
		},
		{
			name:      "empty list",
			list:      []MockIdentifiable{},
			converter: converter,
			want:      nil,
		},
		{
			name:      "nil list",
			list:      nil,
			converter: converter,
			want:      nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.ToGenericListValue[MockIdentifiable, MockIdentifiable](tt.list, tt.converter)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestHas(t *testing.T) {
	type ID string
	type T struct {
		ID ID
	}
	getID := func(t *T) ID {
		return t.ID
	}

	tests := []struct {
		name string
		list []*T
		id   ID
		want bool
	}{
		{
			name: "existing item",
			list: []*T{{ID: "id1"}, {ID: "id2"}, {ID: "id3"}},
			id:   "id2",
			want: true,
		},
		{
			name: "non-existing item",
			list: []*T{{ID: "id1"}, {ID: "id2"}},
			id:   "id3",
			want: false,
		},
		{
			name: "empty list",
			list: []*T{},
			id:   "id1",
			want: false,
		},
		{
			name: "nil list",
			list: nil,
			id:   "id1",
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.Has[ID, T](tt.list, getID, tt.id)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestGet(t *testing.T) {
	type ID string
	type T struct {
		ID ID
	}
	getID := func(t *T) ID {
		return t.ID
	}

	tests := []struct {
		name string
		list []*T
		id   ID
		want *T
	}{
		{
			name: "existing item",
			list: []*T{{ID: "id1"}, {ID: "id2"}, {ID: "id3"}},
			id:   "id2",
			want: &T{ID: "id2"},
		},
		{
			name: "non-existing item",
			list: []*T{{ID: "id1"}, {ID: "id2"}},
			id:   "id3",
			want: nil,
		},
		{
			name: "empty list",
			list: []*T{},
			id:   "id1",
			want: nil,
		},
		{
			name: "nil list",
			list: nil,
			id:   "id1",
			want: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.Get[ID, T](tt.list, getID, tt.id)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestRemoveById(t *testing.T) {
	type ID string
	type T struct {
		ID ID
	}
	getID := func(t *T) ID {
		return t.ID
	}

	tests := []struct {
		name string
		list []*T
		id   ID
		want []*T
	}{
		{
			name: "remove existing items",
			list: []*T{{ID: "id1"}, {ID: "id2"}, {ID: "id3"}},
			id:   ID("id1"),
			want: []*T{{ID: "id2"}, {ID: "id3"}},
		},
		{
			name: "remove non-existing items",
			list: []*T{{ID: "id1"}, {ID: "id2"}},
			id:   ID("id3"),
			want: []*T{{ID: "id1"}, {ID: "id2"}},
		},
		{
			name: "remove duplicate items",
			list: []*T{{ID: "id1"}, {ID: "id1"}, {ID: "id2"}},
			id:   ID("id1"),
			want: []*T{{ID: "id1"}, {ID: "id2"}},
		},
		{
			name: "remove from empty slice",
			list: []*T{},
			id:   ID("id1"),
			want: []*T{},
		},
		{
			name: "remove from nil slice",
			list: nil,
			id:   ID("id1"),
			want: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.RemoveById[ID, T](tt.list, getID, tt.id)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestRemoveByIds(t *testing.T) {
	type ID string
	type T struct {
		ID ID
	}
	getID := func(t *T) ID {
		return t.ID
	}

	tests := []struct {
		name string
		list []*T
		ids  []ID
		want []*T
	}{
		{
			name: "remove existing items",
			list: []*T{{ID: "id1"}, {ID: "id2"}, {ID: "id3"}},
			ids:  []ID{"id1", "id3"},
			want: []*T{{ID: "id2"}},
		},
		{
			name: "remove non-existing items",
			list: []*T{{ID: "id1"}, {ID: "id2"}},
			ids:  []ID{"id3"},
			want: []*T{{ID: "id1"}, {ID: "id2"}},
		},
		{
			name: "remove all items",
			list: []*T{{ID: "id1"}, {ID: "id2"}},
			ids:  []ID{"id1", "id2"},
			want: []*T{},
		},
		{
			name: "remove from empty slice",
			list: []*T{},
			ids:  []ID{"id1", "id2"},
			want: []*T{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.RemoveByIds[ID, T](tt.list, getID, tt.ids...)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestContains(t *testing.T) {
	type ID string

	tests := []struct {
		name string
		ids  []ID
		id   ID
		want bool
	}{
		{
			name: "string slice contains id",
			ids:  []ID{"id1", "id2", "id3"},
			id:   "id2",
			want: true,
		},
		{
			name: "string slice does not contain id",
			ids:  []ID{"id1", "id2", "id3"},
			id:   "id4",
			want: false,
		},
		{
			name: "nil slice",
			ids:  nil,
			id:   "id1",
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.Contains[ID](tt.ids, tt.id)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestProperties(t *testing.T) {
	type PropertyID string
	type T struct {
		PropertyID PropertyID
	}
	getProperty := func(t *T) PropertyID {
		return t.PropertyID
	}

	tests := []struct {
		name string
		list []*T
		want []PropertyID
	}{
		{
			name: "non-empty list",
			list: []*T{{PropertyID: "PropertyID1"}, {PropertyID: "PropertyID2"}},
			want: []PropertyID{"PropertyID1", "PropertyID2"},
		},
		{
			name: "empty list",
			list: []*T{},
			want: []PropertyID{},
		},
		{
			name: "nil list",
			list: nil,
			want: nil,
		},
		{
			name: "list with nil element",
			list: []*T{{PropertyID: "PropertyID1"}, nil, {PropertyID: "PropertyID3"}},
			want: []PropertyID{"PropertyID1", "PropertyID3"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.Properties[PropertyID, T](tt.list, getProperty)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestFilter(t *testing.T) {
	type ID string
	type T struct {
		ID   ID
		Name string
	}
	getID := func(t T) ID {
		return t.ID
	}

	tests := []struct {
		name  string
		list  []T
		id    ID
		getId func(T) ID
		want  []T
	}{
		{
			name:  "filter existing items by ID",
			list:  []T{{ID: "id1", Name: "Item 1"}, {ID: "id2", Name: "Item 2"}, {ID: "id1", Name: "Item 3"}},
			id:    "id1",
			getId: getID,
			want:  []T{{ID: "id1", Name: "Item 1"}, {ID: "id1", Name: "Item 3"}},
		},
		{
			name:  "filter non-existing item by ID",
			list:  []T{{ID: "id1", Name: "Item 1"}, {ID: "id2", Name: "Item 2"}},
			id:    "id3",
			getId: getID,
			want:  []T{},
		},
		{
			name:  "empty list",
			list:  []T{},
			id:    "id1",
			getId: getID,
			want:  nil,
		},
		{
			name:  "nil list",
			list:  nil,
			id:    "id1",
			getId: getID,
			want:  nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.Filter(tt.list, tt.id, tt.getId)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestIndexOf(t *testing.T) {
	type ID string
	type T struct {
		ID ID
	}
	getID := func(t *T) ID {
		return t.ID
	}

	tests := []struct {
		name string
		list []*T
		id   ID
		want int
	}{
		{
			name: "existing item",
			list: []*T{{ID: "id1"}, {ID: "id2"}, {ID: "id3"}},
			id:   ID("id1"),
			want: 0,
		},
		{
			name: "existing item 2",
			list: []*T{{ID: "id1"}, {ID: "id2"}, {ID: "id3"}},
			id:   ID("id3"),
			want: 2,
		},
		{
			name: "non-existing item",
			list: []*T{{ID: "id1"}, {ID: "id2"}},
			id:   ID("id3"),
			want: -1,
		},
		{
			name: "empty slice",
			list: []*T{},
			id:   ID("id1"),
			want: -1,
		},
		{
			name: "nil slice",
			list: nil,
			id:   ID("id1"),
			want: -1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := list.IndexOf[ID, T](tt.list, getID, tt.id)
			assert.Equal(t, tt.want, got)
		})
	}
}
