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

	expectedMap := Map{
		l1.ID(): l1.LayerRef(),
		l2.ID(): l2.LayerRef(),
	}
	actualMap := List{l1.LayerRef(), l2.LayerRef()}.Map()

	assert.Equal(t, expectedMap, actualMap)
	assert.Equal(t, Map{}, List{}.Map())
	assert.Equal(t, Map{}, List{nil}.Map())
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
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()

	m1 := Map{}
	m1 = m1.Add(l1.LayerRef(), l2.LayerRef())

	m2 := Map{
		l1.ID(): l1.LayerRef(),
	}
	m2 = m2.Add(nil)

	expectedMap1 := Map{
		l1.ID(): l1.LayerRef(),
		l2.ID(): l2.LayerRef(),
	}
	expectedMap2 := Map{
		l1.ID(): l1.LayerRef(),
	}

	assert.Equal(t, expectedMap1, m1)
	assert.Equal(t, expectedMap2, m2)
}

func TestMap_Merge(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()
	l3 := NewItem().NewID().Scene(sid).MustBuild()

	m1 := Map{
		l1.ID(): l1.LayerRef(),
		l2.ID(): l2.LayerRef(),
	}
	m2 := Map{
		l3.ID(): l3.LayerRef(),
	}

	mergedMap := m1.Merge(m2)
	expectedMap := Map{
		l1.ID(): l1.LayerRef(),
		l2.ID(): l2.LayerRef(),
		l3.ID(): l3.LayerRef(),
	}

	assert.Equal(t, expectedMap, mergedMap)
}

func TestMap_List(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()

	m := Map{
		l1.ID(): l1.LayerRef(),
		l2.ID(): l2.LayerRef(),
	}
	list := m.List()
	expectedList := List{l1.LayerRef(), l2.LayerRef()}

	assert.Equal(t, expectedList, list)
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

	m := Map{
		l1.ID(): l1.LayerRef(),
		l2.ID(): l2.LayerRef(),
	}

	clonedMap := m.Clone()

	assert.Equal(t, m, clonedMap)
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
