package dataset

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDatasetSchemaGraphIterator(t *testing.T) {
	sid := NewSceneID()
	d0id := NewSchemaID()
	d11id := NewSchemaID()
	d12id := NewSchemaID()
	d21id := NewSchemaID()
	d31id := NewSchemaID()
	d32id := NewSchemaID()

	d0f0, _ := NewSchemaField().ID(NewFieldID()).Type(ValueTypeRef).Ref(&d11id).Build()
	d0f1, _ := NewSchemaField().ID(NewFieldID()).Type(ValueTypeRef).Ref(&d12id).Build()
	d11f0, _ := NewSchemaField().ID(NewFieldID()).Type(ValueTypeString).Build()
	d12f0, _ := NewSchemaField().ID(NewFieldID()).Type(ValueTypeRef).Ref(&d21id).Build()
	d21f0, _ := NewSchemaField().ID(NewFieldID()).Type(ValueTypeRef).Ref(&d31id).Build()
	d21f1, _ := NewSchemaField().ID(NewFieldID()).Type(ValueTypeRef).Ref(&d32id).Build()
	d31f0, _ := NewSchemaField().ID(NewFieldID()).Type(ValueTypeString).Build()
	d32f0, _ := NewSchemaField().ID(NewFieldID()).Type(ValueTypeString).Build()

	d0, _ := NewSchema().ID(d0id).Scene(sid).Fields([]*SchemaField{
		d0f0, d0f1,
	}).Build()
	d11, _ := NewSchema().ID(d11id).Scene(sid).Fields([]*SchemaField{
		d11f0,
	}).Build()
	d12, _ := NewSchema().ID(d12id).Scene(sid).Fields([]*SchemaField{
		d12f0,
	}).Build()
	d21, _ := NewSchema().ID(d21id).Scene(sid).Fields([]*SchemaField{
		d21f0,
		d21f1,
	}).Build()
	d31, _ := NewSchema().ID(d31id).Scene(sid).Fields([]*SchemaField{
		d31f0,
	}).Build()
	d32, _ := NewSchema().ID(d32id).Scene(sid).Fields([]*SchemaField{
		d32f0,
	}).Build()

	it := SchemaGraphIteratorFrom(d0id, 3)
	testTestDatasetSchemaGraphIteratorNext(
		t, it, []*Schema{d0, d11, d12, d21, d31, d32},
	)
	it = SchemaGraphIteratorFrom(d0id, 2)
	testTestDatasetSchemaGraphIteratorNext(
		t, it, []*Schema{d0, d11, d12, d21},
	)
}

func testTestDatasetSchemaGraphIteratorNext(t *testing.T, it *SchemaGraphIterator, ds SchemaList) {
	for i, d := range ds {
		next, done := it.Next(d)
		if i == len(ds)-1 {
			assert.Equal(t, true, done)
		} else {
			assert.Equal(t, ds[i+1].ID(), next, "next %d", i)
			assert.Equal(t, false, done, "next done %d", i)
		}
	}
	assert.Equal(t, ds.Map(), it.Result())
}
