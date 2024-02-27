package tag

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestList_DerefList(t *testing.T) {
	sceneID := NewSceneID()
	var tag1 Tag = NewItem().NewID().Label("hoge").Scene(sceneID).MustBuild()

	tests := []struct {
		name string
		args []*Tag
		want List
	}{
		{
			name: "non-nil elements",
			args: []*Tag{&tag1},
			want: List{tag1},
		},
		{
			name: "including nil element",
			args: []*Tag{&tag1, nil},
			want: List{tag1},
		},
		{
			name: "nil elements",
			args: nil,
			want: List{},
		},
		{
			name: "empty elements",
			args: []*Tag{},
			want: List{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, DerefList(tt.args))
		})
	}
}

func TestList_Items(t *testing.T) {
	sceneID := NewSceneID()
	sceneID2 := NewSceneID()
	tag1 := NewItem().NewID().Label("hoge").Scene(sceneID).MustBuild()
	tag2 := NewItem().NewID().Label("foo").Scene(sceneID).MustBuild()
	tag3 := NewItem().NewID().Label("foo").Scene(sceneID2).MustBuild()
	tag4 := NewGroup().NewID().Label("bar").Scene(sceneID).Tags(IDList{
		tag1.ID(), tag2.ID(),
	}).MustBuild()
	tags := List{tag1, tag2, tag3, tag4}

	assert.Equal(t, []*Item{tag1, tag2, tag3}, tags.Items())
	assert.Nil(t, List(nil).Items())
}

func TestList_Groups(t *testing.T) {
	sceneID := NewSceneID()
	sceneID2 := NewSceneID()
	tag1 := NewItem().NewID().Label("hoge").Scene(sceneID).MustBuild()
	tag2 := NewItem().NewID().Label("foo").Scene(sceneID).MustBuild()
	tag3 := NewItem().NewID().Label("foo").Scene(sceneID2).MustBuild()
	tag4 := NewGroup().NewID().Label("bar").Scene(sceneID).Tags(IDList{
		tag1.ID(), tag2.ID(),
	}).MustBuild()
	tags := List{tag1, tag2, tag3, tag4}

	assert.Equal(t, []*Group{tag4}, tags.Groups())
	assert.Nil(t, List(nil).Groups())
}

func TestList_FilterByScene(t *testing.T) {
	sceneID := NewSceneID()
	sceneID2 := NewSceneID()
	tag1 := NewItem().NewID().Label("hoge").Scene(sceneID).MustBuild()
	tag2 := NewItem().NewID().Label("foo").Scene(sceneID).MustBuild()
	tag3 := NewItem().NewID().Label("foo").Scene(sceneID2).MustBuild()
	tag4 := NewGroup().NewID().Label("bar").Scene(sceneID).Tags(IDList{
		tag1.ID(), tag2.ID(),
	}).MustBuild()
	tags := List{tag1, tag2, tag3, tag4}

	assert.Equal(t, List{tag1, tag2, tag4}, tags.FilterByScene(sceneID))
	assert.Nil(t, List(nil).FilterByScene(sceneID))
}

func TestList_Roots(t *testing.T) {
	sceneID := NewSceneID()
	sceneID2 := NewSceneID()
	tag1 := NewItem().NewID().Label("hoge").Scene(sceneID).MustBuild()
	tag2 := NewItem().NewID().Label("foo").Scene(sceneID).MustBuild()
	tag3 := NewItem().NewID().Label("foo").Scene(sceneID2).MustBuild()
	tag4 := NewGroup().NewID().Label("bar").Scene(sceneID).Tags(IDList{
		tag1.ID(), tag2.ID(),
	}).MustBuild()
	tags := List{tag1, tag2, tag3, tag4}

	assert.Equal(t, List{tag3, tag4}, tags.Roots())
	assert.Nil(t, List(nil).Roots())
}

func TestList_Refs(t *testing.T) {
	sceneID := NewSceneID()
	sceneID2 := NewSceneID()
	var tag1 Tag = NewItem().NewID().Label("hoge").Scene(sceneID).MustBuild()
	var tag2 Tag = NewItem().NewID().Label("foo").Scene(sceneID).MustBuild()
	var tag3 Tag = NewItem().NewID().Label("foo").Scene(sceneID2).MustBuild()
	var tag4 Tag = NewGroup().NewID().Label("bar").Scene(sceneID).Tags(IDList{
		tag1.ID(), tag2.ID(),
	}).MustBuild()
	tags := List{tag1, tag2, tag3, tag4}

	assert.Equal(t, []*Tag{&tag1, &tag2, &tag3, &tag4}, tags.Refs())
	assert.Nil(t, List(nil).Refs())
}
