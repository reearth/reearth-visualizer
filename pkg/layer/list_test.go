package layer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

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
