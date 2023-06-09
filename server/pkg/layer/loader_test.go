package layer

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoader_Walk(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()
	l3 := NewItem().NewID().Scene(sid).MustBuild()
	l4 := NewGroup().NewID().Scene(sid).Layers(NewIDList([]ID{l1.ID(), l2.ID()})).MustBuild()
	l5 := NewGroup().NewID().Scene(sid).Layers(NewIDList([]ID{l3.ID(), l4.ID()})).MustBuild()
	w := LoaderFrom([]Layer{l1, l2, l3, l4, l5})

	layers := []Layer{}
	parents := []GroupList{}
	err := w.Walk(context.TODO(), func(l Layer, p GroupList) error {
		layers = append(layers, l)
		parents = append(parents, p)
		return nil
	}, []ID{l5.ID()})

	assert.NoError(t, err)
	assert.Equal(t, []Layer{l5, l3, l4, l1, l2}, layers)
	assert.Equal(t, []GroupList{nil, {l5}, {l5}, {l5, l4}, {l5, l4}}, parents)
}

func TestLoader_Walk2(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()
	l3 := NewItem().NewID().Scene(sid).MustBuild()
	l4 := NewGroup().NewID().Scene(sid).Layers(NewIDList([]ID{l1.ID(), l2.ID()})).MustBuild()
	l5 := NewGroup().NewID().Scene(sid).Layers(NewIDList([]ID{l3.ID(), l4.ID()})).MustBuild()
	w := LoaderFrom([]Layer{l1, l2, l3, l4, l5})

	layers := []Layer{}
	parents := []GroupList{}
	err := w.Walk(context.TODO(), func(l Layer, p GroupList) error {
		layers = append(layers, l)
		parents = append(parents, p)
		return WalkerSkipChildren
	}, []ID{l5.ID()})

	assert.NoError(t, err)
	assert.Equal(t, []Layer{l5}, layers)
	assert.Equal(t, []GroupList{nil}, parents)
}

func TestLoader_Walk3(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()
	l3 := NewItem().NewID().Scene(sid).MustBuild()
	l4 := NewGroup().NewID().Scene(sid).Layers(NewIDList([]ID{l1.ID(), l2.ID()})).MustBuild()
	l5 := NewGroup().NewID().Scene(sid).Layers(NewIDList([]ID{l3.ID(), l4.ID()})).MustBuild()
	w := LoaderFrom([]Layer{l1, l2, l3, l4, l5})

	err := errors.New("Error")
	layers := []Layer{}
	parents := []GroupList{}
	err2 := w.Walk(context.TODO(), func(l Layer, p GroupList) error {
		layers = append(layers, l)
		parents = append(parents, p)
		if l == l4 {
			return err
		}
		return nil
	}, []ID{l5.ID()})

	assert.Same(t, err, err2)
	assert.Equal(t, []Layer{l5, l3, l4}, layers)
	assert.Equal(t, []GroupList{nil, {l5}, {l5}}, parents)
}

func TestLoaderBySceneFrom(t *testing.T) {
	sid := NewSceneID()
	l1 := NewItem().NewID().Scene(sid).MustBuild()
	l2 := NewItem().NewID().Scene(sid).MustBuild()
	l3 := NewItem().NewID().Scene(sid).MustBuild()
	l4 := NewGroup().NewID().Scene(sid).Layers(NewIDList([]ID{l1.ID(), l2.ID()})).MustBuild()
	l5 := NewGroup().NewID().Scene(sid).Layers(NewIDList([]ID{l3.ID(), l4.ID()})).MustBuild()
	res, err := LoaderFrom([]Layer{l1, l2, l3, l4, l5})(context.Background(), l1.ID(), l5.ID())

	assert.NoError(t, err)
	assert.Equal(t, List{l1.LayerRef(), l5.LayerRef()}, res)
}
