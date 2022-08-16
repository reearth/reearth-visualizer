package dataset

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDatasetListDiff(t *testing.T) {
	sid := NewSceneID()
	source1 := "hogehoge/1"
	source2 := "hogehoge/2"
	source3 := "hogehoge/3"
	d1, _ := New().NewID().Scene(sid).Source(source1).Build()
	d2, _ := New().NewID().Scene(sid).Source(source2).Build()
	d3, _ := New().NewID().Scene(sid).Source(source2).Build()
	d4, _ := New().NewID().Scene(sid).Source(source3).Build()
	d5, _ := New().NewID().Scene(sid).Source(source2).Build() // duplicated source

	l1 := List{d1, d2}
	l2 := List{d3, d4}
	diff := l1.DiffBySource(l2)
	expected := Diff{
		Added:   []*Dataset{d4},
		Removed: []*Dataset{d1},
		Others: map[ID]*Dataset{
			d2.ID(): d3,
		},
	}
	assert.Equal(t, expected, diff)

	l1 = List{d1, d2, d5}
	l2 = List{d3, d4}
	diff = l1.DiffBySource(l2)
	expected = Diff{
		Added:   []*Dataset{d4},
		Removed: []*Dataset{d1, d2},
		Others: map[ID]*Dataset{
			d5.ID(): d3,
		},
	}
	assert.Equal(t, expected, diff)
}

func TestDatasetMapGraphSearchByFields(t *testing.T) {
	did1 := NewID()
	did2 := NewID()
	did3 := NewID()
	fid1 := NewFieldID()
	fid2 := NewFieldID()
	fid3 := NewFieldID()
	sid := NewSceneID()
	v1 := ValueTypeRef.ValueFrom(did2)
	v2 := ValueTypeRef.ValueFrom(did3)
	v3 := ValueTypeString.ValueFrom("value")
	f3 := NewField(fid3, v3, "")
	d1, _ := New().ID(did1).Scene(sid).Fields([]*Field{
		NewField(fid1, v1, ""),
	}).Build()
	d2, _ := New().ID(did2).Scene(sid).Fields([]*Field{
		NewField(fid2, v2, ""),
	}).Build()
	d3, _ := New().ID(did3).Scene(sid).Fields([]*Field{
		f3,
	}).Build()

	m := List{d1, d2, d3}.Map()

	res, resf := m.GraphSearchByFields(did1, fid1, fid2, fid3)
	assert.Equal(t, List{d1, d2, d3}, res)
	assert.Equal(t, f3, resf)

	res2, resf2 := m.GraphSearchByFields(did1, fid1, fid3, fid2)
	assert.Equal(t, List{d1, d2}, res2)
	assert.Nil(t, resf2)
}
