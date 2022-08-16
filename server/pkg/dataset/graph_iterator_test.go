package dataset

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDatasetGraphIterator(t *testing.T) {
	sid := NewSceneID()
	dsid := NewSchemaID()

	d0id := NewID()
	d11id := NewID()
	d12id := NewID()
	d21id := NewID()
	d31id := NewID()
	d32id := NewID()

	d0, _ := New().ID(d0id).Schema(dsid).Scene(sid).Fields([]*Field{
		NewField(NewFieldID(), ValueTypeRef.ValueFrom(d11id), ""),
		NewField(NewFieldID(), ValueTypeRef.ValueFrom(d12id), ""),
	}).Build()
	d11, _ := New().ID(d11id).Schema(dsid).Scene(sid).Fields([]*Field{
		NewField(NewFieldID(), ValueTypeRef.ValueFrom(d21id), ""),
	}).Build()
	d12, _ := New().ID(d12id).Schema(dsid).Scene(sid).Fields([]*Field{
		NewField(NewFieldID(), ValueTypeString.ValueFrom("hoge"), ""),
	}).Build()
	d21, _ := New().ID(d21id).Schema(dsid).Scene(sid).Fields([]*Field{
		NewField(NewFieldID(), ValueTypeRef.ValueFrom(d31id), ""),
		NewField(NewFieldID(), ValueTypeRef.ValueFrom(d32id), ""),
	}).Build()
	d31, _ := New().ID(d31id).Schema(dsid).Scene(sid).Fields([]*Field{
		NewField(NewFieldID(), ValueTypeString.ValueFrom("foo"), ""),
	}).Build()
	d32, _ := New().ID(d32id).Schema(dsid).Scene(sid).Fields([]*Field{
		NewField(NewFieldID(), ValueTypeString.ValueFrom("bar"), ""),
	}).Build()

	it := GraphIteratorFrom(d0id, 3)
	testTestDatasetGraphIteratorNext(
		t, it, []*Dataset{d0, d11, d12, d21, d31, d32},
	)
	it = GraphIteratorFrom(d0id, 2)
	testTestDatasetGraphIteratorNext(
		t, it, []*Dataset{d0, d11, d12, d21},
	)
}

func testTestDatasetGraphIteratorNext(t *testing.T, it *GraphIterator, ds List) {
	t.Helper()
	for i, d := range ds {
		next, done := it.Next(d)
		if i == len(ds)-1 {
			assert.Equal(t, true, done)
		} else {
			assert.False(t, done, "next done %d", i)
			assert.Equal(t, ds[i+1].ID(), next, "next %d", i)
		}
	}
	assert.Equal(t, ds.Map(), it.Result())
}
