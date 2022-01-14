package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPointer(t *testing.T) {
	iid := NewItemID()
	sgid := SchemaGroupID("foo")
	fid := FieldID("hoge")

	var p *Pointer
	var ok bool

	p = PointItem(iid)
	i, ok := p.Item()
	assert.True(t, ok)
	assert.Equal(t, iid, i)
	_, ok = p.ItemBySchemaGroup()
	assert.False(t, ok)
	_, _, ok = p.FieldByItem()
	assert.False(t, ok)
	_, _, ok = p.FieldBySchemaGroup()
	assert.False(t, ok)

	p = PointItemBySchema(sgid)
	_, ok = p.Item()
	assert.False(t, ok)
	sg, ok := p.ItemBySchemaGroup()
	assert.True(t, ok)
	assert.Equal(t, sgid, sg)
	_, _, ok = p.FieldByItem()
	assert.False(t, ok)
	_, _, ok = p.FieldBySchemaGroup()
	assert.False(t, ok)

	p = PointFieldByItem(iid, fid)
	i, ok = p.Item()
	assert.True(t, ok)
	assert.Equal(t, iid, i)
	_, ok = p.ItemBySchemaGroup()
	assert.False(t, ok)
	i, f, ok := p.FieldByItem()
	assert.True(t, ok)
	assert.Equal(t, iid, i)
	assert.Equal(t, fid, f)
	_, _, ok = p.FieldBySchemaGroup()
	assert.False(t, ok)

	p = PointFieldBySchemaGroup(sgid, fid)
	_, ok = p.Item()
	assert.False(t, ok)
	sg, ok = p.ItemBySchemaGroup()
	assert.True(t, ok)
	assert.Equal(t, sgid, sg)
	_, _, ok = p.FieldByItem()
	assert.False(t, ok)
	sg, f, ok = p.FieldBySchemaGroup()
	assert.True(t, ok)
	assert.Equal(t, sgid, sg)
	assert.Equal(t, fid, f)

	p = PointField(&sgid, &iid, fid)
	i, ok = p.Item()
	assert.True(t, ok)
	assert.Equal(t, iid, i)
	sg, ok = p.ItemBySchemaGroup()
	assert.True(t, ok)
	assert.Equal(t, sgid, sg)
	_, _, ok = p.FieldByItem()
	assert.False(t, ok)
	_, _, ok = p.FieldBySchemaGroup()
	assert.False(t, ok)
}
