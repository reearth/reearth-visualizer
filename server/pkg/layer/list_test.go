package layer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNLSLayerList_Last(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()

	tests := []struct {
		name   string
		target List
		want   *Layer
	}{
		{
			name:   "last element",
			target: List{l1.LayerRef(), l2.LayerRef()},
			want:   l2.LayerRef(),
		},
		{
			name:   "empty list",
			target: List{},
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.Last())
		})
	}
}

func TestItemList_Last(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()

	tests := []struct {
		name   string
		target ItemList
		want   *Item
	}{
		{
			name:   "last element",
			target: ItemList{l1, l2},
			want:   l2,
		},
		{
			name:   "empty list",
			target: ItemList{},
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.Last())
		})
	}
}

func TestList_IDs(t *testing.T) {
	sid := NewSceneID()
	l1 := NewID()
	l2 := NewID()

	tests := []struct {
		name   string
		target List
		want   *IDList
	}{
		{
			name: "ok",
			target: List{
				New().ID(l1).Scene(sid).Item().MustBuild().LayerRef(),
				New().ID(l2).Scene(sid).Group().MustBuild().LayerRef(),
			},
			want: NewIDList([]ID{l1, l2}),
		},
		{
			name:   "nil",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.IDs())
		})
	}
}

func TestList_Properties(t *testing.T) {
	sid := NewSceneID()
	p1 := NewPropertyID()
	p2 := NewPropertyID()
	p3 := NewPropertyID()

	tests := []struct {
		name   string
		target List
		want   []PropertyID
	}{
		{
			name: "ok",
			target: List{
				New().NewID().Scene(sid).Property(&p1).Item().MustBuild().LayerRef(),
				New().NewID().Scene(sid).Infobox(NewInfobox([]*InfoboxField{
					{property: p3},
				}, p2)).Group().MustBuild().LayerRef(),
			},
			want: []PropertyID{p1, p2, p3},
		},
		{
			name:   "nil",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.Properties())
		})
	}
}

func TestList_Pick(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()
	l3 := NewItem().NewID().Scene(sid).MustBuild()

	allLayers := List{l1.LayerRef(), l2.LayerRef()}
	idList := NewIDList([]ID{l1.ID(), l3.ID()})

	tests := []struct {
		name string
		ll   List
		il   *IDList
		want List
	}{
		{
			name: "select existing layers",
			ll:   allLayers,
			il:   idList,
			want: List{l1.LayerRef()},
		},
		{
			name: "nil IDList",
			ll:   allLayers,
			il:   nil,
			want: nil,
		},
		{
			name: "empty list",
			ll:   List{},
			il:   idList,
			want: List{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.ll.Pick(tt.il))
		})
	}
}

func TestList_Find(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()
	nonExistentID := NewID()

	tests := []struct {
		name   string
		target List
		lid    ID
		want   *Layer
	}{
		{
			name:   "find existing element",
			target: List{l1.LayerRef(), l2.LayerRef()},
			lid:    l1.ID(),
			want:   l1.LayerRef(),
		},
		{
			name:   "find non-existing element",
			target: List{l1.LayerRef(), l2.LayerRef()},
			lid:    nonExistentID,
			want:   nil,
		},
		{
			name:   "empty list",
			target: List{},
			lid:    l1.ID(),
			want:   nil,
		},
		{
			name:   "list with nil element",
			target: List{nil, l2.LayerRef()},
			lid:    l2.ID(),
			want:   l2.LayerRef(),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.Find(tt.lid))
		})
	}
}

func TestList_Map(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()

	tests := []struct {
		name   string
		target List
		want   Map
	}{
		{
			name:   "normal case",
			target: List{l1.LayerRef(), l2.LayerRef()},
			want:   Map{l1.ID(): l1.LayerRef(), l2.ID(): l2.LayerRef()},
		},
		{
			name:   "contains nil",
			target: List{l1.LayerRef(), nil},
			want:   Map{l1.ID(): l1.LayerRef()},
		},
		{
			name:   "empty slice",
			target: List{},
			want:   Map{},
		},
		{
			name:   "nil slice",
			target: nil,
			want:   Map{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.Map())
		})
	}
}

func TestList_Remove(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()
	l3 := NewItem().NewID().Scene(sid).MustBuild()
	assert.Equal(t, List{l2.LayerRef()}, List{l1.LayerRef(), l2.LayerRef()}.Remove(l1.ID(), l3.ID()))
	assert.Equal(t, List{l1.LayerRef(), l2.LayerRef()}, List{l1.LayerRef(), l2.LayerRef()}.Remove())
	assert.Equal(t, List(nil), List(nil).Remove(l1.ID()))
	assert.Equal(t, List{}, List{}.Remove(l1.ID()))
}

func TestList_AddUnique(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()
	assert.Equal(t, List{l2.LayerRef(), l1.LayerRef()}, List{l2.LayerRef()}.AddUnique(l1.LayerRef()))
	assert.Equal(t, List{l2.LayerRef()}, List{l2.LayerRef()}.AddUnique(l2.LayerRef()))
	assert.Equal(t, List{l1.LayerRef()}, List{}.AddUnique(l1.LayerRef(), l1.LayerRef()))
}

func TestMap_Add(t *testing.T) {
	sid1 := NewSceneID()
	sid2 := NewSceneID()
	l1 := NewItem().NewID().Scene(sid1).MustBuild()
	l2 := NewItem().NewID().Scene(sid1).MustBuild()
	l3 := NewItem().NewID().Scene(sid2).MustBuild()

	tests := []struct {
		name   string
		target Map
		args   []*Layer
		want   Map
	}{
		{
			name:   "normal case",
			target: Map{},
			args: []*Layer{
				l1.LayerRef(),
				l2.LayerRef(),
			},
			want: Map{
				l1.ID(): l1.LayerRef(),
				l2.ID(): l2.LayerRef(),
			},
		},
		{
			name: "add to existing map",
			target: Map{
				l1.ID(): l1.LayerRef(),
			},
			args: []*Layer{
				l2.LayerRef(),
			},
			want: Map{
				l1.ID(): l1.LayerRef(),
				l2.ID(): l2.LayerRef(),
			},
		},
		{
			name:   "empty Map",
			target: Map{},
			args:   nil,
			want:   Map{},
		},
		{
			name:   "nil Map",
			target: nil,
			args:   nil,
			want:   Map{},
		},
		{
			name: "add nil layer",
			target: Map{
				l1.ID(): l1.LayerRef(),
			},
			args: []*Layer{
				nil,
			},
			want: Map{
				l1.ID(): l1.LayerRef(),
			},
		},
		{
			name: "add duplicate layer",
			target: Map{
				l1.ID(): l1.LayerRef(),
			},
			args: []*Layer{
				l1.LayerRef(),
			},
			want: Map{
				l1.ID(): l1.LayerRef(),
			},
		},
		{
			name:   "add layer with different scene ID",
			target: Map{},
			args: []*Layer{
				l3.LayerRef(),
			},
			want: Map{
				l3.ID(): l3.LayerRef(),
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.Add(tt.args...))
		})
	}
}

func TestMap_Merge(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()
	l3 := NewItem().NewID().Scene(sid).MustBuild()

	tests := []struct {
		name        string
		m1          Map
		m2          Map
		expectedMap Map
	}{
		{
			name: "Both maps are non-empty",
			m1: Map{
				l1.ID(): l1.LayerRef(),
				l2.ID(): l2.LayerRef(),
			},
			m2: Map{
				l3.ID(): l3.LayerRef(),
			},
			expectedMap: Map{
				l1.ID(): l1.LayerRef(),
				l2.ID(): l2.LayerRef(),
				l3.ID(): l3.LayerRef(),
			},
		},
		{
			name: "First map is empty",
			m1:   Map{},
			m2: Map{
				l1.ID(): l1.LayerRef(),
			},
			expectedMap: Map{
				l1.ID(): l1.LayerRef(),
			},
		},
		{
			name: "Second map is empty",
			m1: Map{
				l1.ID(): l1.LayerRef(),
			},
			m2: Map{},
			expectedMap: Map{
				l1.ID(): l1.LayerRef(),
			},
		},
		{
			name:        "Both maps are empty",
			m1:          Map{},
			m2:          Map{},
			expectedMap: Map{},
		},
		{
			name: "First map is nil",
			m1:   nil,
			m2: Map{
				l1.ID(): l1.LayerRef(),
			},
			expectedMap: Map{
				l1.ID(): l1.LayerRef(),
			},
		},
		{
			name: "Second map is nil",
			m1: Map{
				l1.ID(): l1.LayerRef(),
			},
			m2: nil,
			expectedMap: Map{
				l1.ID(): l1.LayerRef(),
			},
		},
		{
			name:        "Both maps are nil",
			m1:          nil,
			m2:          nil,
			expectedMap: Map{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mergedMap := tt.m1.Merge(tt.m2)
			assert.Equal(t, tt.expectedMap, mergedMap)
		})
	}
}

func TestMap_List(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()

	tests := []struct {
		name   string
		target Map
		want   List
	}{
		{
			name:   "normal case",
			target: Map{l1.ID(): l1.LayerRef()},
			want:   List{l1.LayerRef()},
		},
		{
			name:   "contains nil",
			target: Map{l2.ID(): nil},
			want:   List{nil},
		},
		{
			name:   "empty slice",
			target: Map{},
			want:   List{},
		},
		{
			name:   "nil slice",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.List())
		})
	}
}

func TestList_Deref(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()

	tests := []struct {
		name   string
		target List
		want   []Layer
	}{
		{
			name: "non-nil elements",
			target: List{
				l1.LayerRef(),
				l2.LayerRef(),
			},
			want: []Layer{*l1.LayerRef(), *l2.LayerRef()},
		},
		{
			name: "including nil element",
			target: List{
				l1.LayerRef(),
				nil,
				l2.LayerRef(),
			},
			want: []Layer{*l1.LayerRef(), nil, *l2.LayerRef()},
		},
		{
			name:   "nil list",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.Deref())
		})
	}
}

func TestMap_Clone(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()

	tests := []struct {
		name   string
		target Map
		want   Map
	}{
		{
			name: "normal case",
			target: Map{
				l1.ID(): l1.LayerRef(),
				l2.ID(): l2.LayerRef(),
			},
			want: Map{
				l1.ID(): l1.LayerRef(),
				l2.ID(): l2.LayerRef(),
			},
		},
		{
			name:   "nil case",
			target: nil,
			want:   Map{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.Clone())
		})
	}
}

func TestMap_Pick(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()
	l3 := NewItem().NewID().Scene(sid).MustBuild()

	allLayers := Map{
		l1.ID(): l1.LayerRef(),
		l2.ID(): l2.LayerRef(),
	}

	idList := NewIDList([]ID{l1.ID(), l3.ID()})

	tests := []struct {
		name string
		m    Map
		il   *IDList
		want List
	}{
		{
			name: "select existing layers",
			m:    allLayers,
			il:   idList,
			want: List{l1.LayerRef()},
		},
		{
			name: "nil IDList",
			m:    allLayers,
			il:   nil,
			want: nil,
		},
		{
			name: "empty map",
			m:    Map{},
			il:   idList,
			want: List{},
		},
		{
			name: "non-existing ID",
			m:    allLayers,
			il:   NewIDList([]ID{NewID()}),
			want: List{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.m.Pick(tt.il))
		})
	}
}

func TestMap_Keys(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()

	m := Map{
		l1.ID(): l1.LayerRef(),
		l2.ID(): l2.LayerRef(),
	}

	expectedKeys := []ID{l1.ID(), l2.ID()}
	sortIDs(expectedKeys)

	tests := []struct {
		name    string
		mapData Map
		want    []ID
	}{
		{
			name:    "valid keys",
			mapData: m,
			want:    expectedKeys,
		},
		{
			name:    "empty map",
			mapData: Map{},
			want:    []ID{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.mapData.Keys())
		})
	}
}

func TestList_ToLayerItemList(t *testing.T) {
	sid := NewSceneID()
	item1 := NewItem().NewID().Scene(sid).MustBuild()
	item2 := NewItem().NewID().Scene(sid).MustBuild()
	layer1 := item1.LayerRef()
	layer2 := item2.LayerRef()

	tests := []struct {
		name   string
		target List
		want   ItemList
	}{
		{
			name:   "convert list to item list",
			target: List{layer1, layer2},
			want:   ItemList{item1, item2},
		},
		{
			name:   "handle empty list",
			target: List{},
			want:   ItemList{},
		},
		{
			name:   "handle nil elements in list",
			target: List{nil, layer1},
			want:   ItemList{item1},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.ToLayerItemList())
		})
	}
}
