package tag

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIDtList_Add(t *testing.T) {
	tid := NewID()
	var tl *IDList
	tl.Add(tid)
	assert.Nil(t, tl.Tags())
	tl = NewIDList()
	tl.Add(tid)
	expected := []ID{tid}
	assert.Equal(t, expected, tl.Tags())
}

func TestIDList_Remove(t *testing.T) {
	tid := NewID()
	tid2 := NewID()
	tags := []ID{
		tid,
		tid2,
	}
	var tl *IDList
	tl.Remove(tid2)
	assert.Nil(t, tl.Tags())
	tl = IDListFrom(tags)
	tl.Remove(tid2)
	expected := []ID{tid}
	assert.Equal(t, expected, tl.Tags())
}

func TestIDList_Has(t *testing.T) {
	tid1 := NewID()
	tid2 := NewID()
	tags := []ID{
		tid1,
	}

	tests := []struct {
		Name     string
		Tags     []ID
		TID      ID
		Expected bool
	}{
		{
			Name:     "false: nil tag list",
			Expected: false,
		},
		{
			Name:     "false: tag not found",
			Tags:     tags,
			TID:      tid2,
			Expected: false,
		},
		{
			Name:     "true: tag found",
			Tags:     tags,
			TID:      tid1,
			Expected: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := IDListFrom(tc.Tags).Has(tc.TID)
			assert.Equal(t, tc.Expected, res)
		})
	}
}

func TestList_Items(t *testing.T) {
	sceneID := NewSceneID()
	sceneID2 := NewSceneID()
	tag1 := NewItem().NewID().Label("hoge").Scene(sceneID).MustBuild()
	tag2 := NewItem().NewID().Label("foo").Scene(sceneID).MustBuild()
	tag3 := NewItem().NewID().Label("foo").Scene(sceneID2).MustBuild()
	tag4 := NewGroup().NewID().Label("bar").Scene(sceneID).Tags(IDListFrom(([]ID{
		tag1.ID(), tag2.ID(),
	}))).MustBuild()
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
	tag4 := NewGroup().NewID().Label("bar").Scene(sceneID).Tags(IDListFrom(([]ID{
		tag1.ID(), tag2.ID(),
	}))).MustBuild()
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
	tag4 := NewGroup().NewID().Label("bar").Scene(sceneID).Tags(IDListFrom(([]ID{
		tag1.ID(), tag2.ID(),
	}))).MustBuild()
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
	tag4 := NewGroup().NewID().Label("bar").Scene(sceneID).Tags(IDListFrom(([]ID{
		tag1.ID(), tag2.ID(),
	}))).MustBuild()
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
	var tag4 Tag = NewGroup().NewID().Label("bar").Scene(sceneID).Tags(IDListFrom(([]ID{
		tag1.ID(), tag2.ID(),
	}))).MustBuild()
	tags := List{tag1, tag2, tag3, tag4}

	assert.Equal(t, []*Tag{&tag1, &tag2, &tag3, &tag4}, tags.Refs())
	assert.Nil(t, List(nil).Refs())
}
