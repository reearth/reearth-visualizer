package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSchemaList_Find(t *testing.T) {
	p1 := &Schema{id: MustSchemaID("foo~1.0.0/a")}
	p2 := &Schema{id: MustSchemaID("bar~1.0.0/a")}
	assert.Equal(t, p1, SchemaList{p1, p2}.Find(p1.ID()))
	assert.Nil(t, SchemaList{p1, p2}.Find(MustSchemaID("hoge~1.0.0/a")))
	assert.Nil(t, SchemaList(nil).Find(p1.ID()))
}

func TestSchemaList_Concat(t *testing.T) {
	p1 := &Schema{id: MustSchemaID("foo~1.0.0/a")}
	p2 := &Schema{id: MustSchemaID("bar~1.0.0/a")}
	assert.Equal(t, SchemaList{p1, p2, p2}, SchemaList{p1, p2}.Concat(SchemaList{p2}))
	assert.Equal(t, SchemaList{p1}, SchemaList(nil).Concat(SchemaList{p1}))
	assert.Equal(t, SchemaList{p1}, SchemaList{p1}.Concat(nil))
}

func TestSchemaList_Map(t *testing.T) {
	p1 := &Schema{id: MustSchemaID("foo~1.0.0/a")}
	p2 := &Schema{id: MustSchemaID("bar~1.0.0/a")}
	assert.Equal(t, SchemaMap{p1.ID(): p1, p2.ID(): p2}, SchemaList{p1, p2}.Map())
	assert.Equal(t, SchemaMap{}, SchemaList(nil).Map())
}

func TestSchemaList_MapToIDs(t *testing.T) {
	p1 := &Schema{id: MustSchemaID("foo~1.0.0/a")}
	p2 := &Schema{id: MustSchemaID("bar~1.0.0/a")}
	assert.Equal(t, SchemaList{nil, p2}, SchemaList{p1, p2}.MapToIDs([]SchemaID{MustSchemaID("hoge~1.0.0/a"), p2.ID()}))
	assert.Equal(t, SchemaList{}, SchemaList{p1, p2}.MapToIDs(nil))
	assert.Equal(t, SchemaList{nil}, SchemaList(nil).MapToIDs([]SchemaID{p1.ID()}))
}

func TestSchemaMap_List(t *testing.T) {
	p1 := &Schema{id: MustSchemaID("foo~1.0.0/a")}
	p2 := &Schema{id: MustSchemaID("bar~1.0.0/a")}
	list := SchemaMap{p1.ID(): p1, p2.ID(): p2}.List()
	assert.Len(t, list, 2)
	assert.Contains(t, list, p1)
	assert.Contains(t, list, p2)
	assert.Nil(t, SchemaMap(nil).List())
}

func TestSchemaMap_Clone(t *testing.T) {
	p1 := &Schema{id: MustSchemaID("foo~1.0.0/a")}
	p2 := &Schema{id: MustSchemaID("bar~1.0.0/a")}

	tests := []struct {
		name   string
		target SchemaMap
		want   SchemaMap
	}{
		{
			name: "normal case",
			target: SchemaMap{
				p1.ID(): p1,
				p2.ID(): p2,
			},
			want: SchemaMap{
				p1.ID(): p1,
				p2.ID(): p2,
			},
		},
		{
			name:   "nil case",
			target: nil,
			want:   SchemaMap{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.Clone())
		})
	}
}
