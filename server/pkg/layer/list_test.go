package layer

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

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
