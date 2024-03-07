package dataset

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSchemaList_Map(t *testing.T) {
	did1 := NewSchemaID()
	did2 := NewSchemaID()
	sid := NewSceneID()
	d1, _ := NewSchema().ID(did1).Scene(sid).Build()
	d2, _ := NewSchema().ID(did2).Scene(sid).Build()

	tests := []struct {
		name   string
		target SchemaList
		want   SchemaMap
	}{
		{
			name:   "normal case",
			target: SchemaList{d1, d2},
			want:   SchemaMap{did1: d1, did2: d2},
		},
		{
			name:   "contains nil",
			target: SchemaList{d1, nil},
			want:   SchemaMap{did1: d1},
		},
		{
			name:   "empty slice",
			target: SchemaList{},
			want:   SchemaMap{},
		},
		{
			name:   "nil slice",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.Map())
		})
	}
}

func TestSchemaMap_Slice(t *testing.T) {
	did1 := NewSchemaID()
	did2 := NewSchemaID()
	sid := NewSceneID()
	d1, _ := NewSchema().ID(did1).Scene(sid).Build()

	tests := []struct {
		name   string
		target SchemaMap
		want   SchemaList
	}{
		{
			name:   "normal case",
			target: SchemaMap{did1: d1},
			want:   SchemaList{d1},
		},
		{
			name:   "contains nil",
			target: SchemaMap{did1: d1, did2: nil},
			want:   SchemaList{d1},
		},
		{
			name:   "empty slice",
			target: SchemaMap{},
			want:   SchemaList{},
		},
		{
			name:   "nil slice",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.Slice())
		})
	}
}

func TestDatasetSchemaMapGraphSearchByFields(t *testing.T) {
	did1 := NewSchemaID()
	did2 := NewSchemaID()
	did3 := NewSchemaID()
	fid1 := NewFieldID()
	fid2 := NewFieldID()
	fid3 := NewFieldID()
	sid := NewSceneID()
	f1, _ := NewSchemaField().ID(fid1).Type(ValueTypeString).Ref(&did2).Build()
	f2, _ := NewSchemaField().ID(fid2).Type(ValueTypeString).Ref(&did3).Build()
	f3, _ := NewSchemaField().ID(fid3).Type(ValueTypeString).Build()
	d1, _ := NewSchema().ID(did1).Scene(sid).Fields([]*SchemaField{
		f1,
	}).Build()
	d2, _ := NewSchema().ID(did2).Scene(sid).Fields([]*SchemaField{
		f2,
	}).Build()
	d3, _ := NewSchema().ID(did3).Scene(sid).Fields([]*SchemaField{
		f3,
	}).Build()

	m := SchemaList{d1, d2, d3}.Map()

	res, resf := m.GraphSearchByFields(did1, fid1, fid2, fid3)
	assert.Equal(t, SchemaList{d1, d2, d3}, res)
	assert.Equal(t, f3, resf)

	res2, resf2 := m.GraphSearchByFields(did1, fid1, fid3, fid2)
	assert.Equal(t, SchemaList{d1, d2}, res2)
	assert.Nil(t, resf2)
}
