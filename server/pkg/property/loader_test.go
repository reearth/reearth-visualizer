package property

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoaderFrom(t *testing.T) {
	scene := NewSceneID()
	ps := MustSchemaID("xxx~1.1.1/aa")
	pid1 := NewID()
	pid2 := NewID()
	p1 := New().ID(pid1).Scene(scene).Schema(ps).MustBuild()
	p2 := New().ID(pid2).Scene(scene).Schema(ps).MustBuild()
	pl := LoaderFrom([]*Property{
		p1,
		p2,
		New().NewID().Scene(scene).Schema(ps).MustBuild(),
	})
	res, err := pl(context.Background(), pid1, pid2)

	assert.Equal(t, List{p1, p2}, res)
	assert.NoError(t, err)
}

func TestLoaderFromMap(t *testing.T) {
	scene := NewSceneID()
	ps := MustSchemaID("xxx~1.1.1/aa")
	pid1 := NewID()
	pid2 := NewID()
	pid3 := NewID()
	p1 := New().ID(pid1).Scene(scene).Schema(ps).MustBuild()
	p2 := New().ID(pid2).Scene(scene).Schema(ps).MustBuild()

	pl := LoaderFromMap(map[ID]*Property{
		pid1: p1,
		pid2: p2,
	})
	res, err := pl(context.Background(), pid1, pid3, pid2)
	assert.Equal(t, List{p1, nil, p2}, res)
	assert.NoError(t, err)
}

func TestSchemaLoaderFrom(t *testing.T) {
	pid1 := MustSchemaID("xxx~1.1.1/aa")
	pid2 := MustSchemaID("xxx~1.1.1/bb")
	p1 := NewSchema().ID(pid1).MustBuild()
	p2 := NewSchema().ID(pid2).MustBuild()
	pl := SchemaLoaderFrom(p1, p2)
	res, err := pl(context.Background(), pid1, pid2)

	assert.Equal(t, SchemaList{p1, p2}, res)
	assert.NoError(t, err)
}

func TestSchemaLoaderFromMap(t *testing.T) {
	psid1 := MustSchemaID("xxx~1.1.1/aa")
	psid2 := MustSchemaID("xxx~1.1.1/bb")
	psid3 := MustSchemaID("xxx~1.1.1/cc")
	ps1 := NewSchema().ID(psid1).MustBuild()
	ps2 := NewSchema().ID(psid2).MustBuild()

	pl := SchemaLoaderFromMap(map[SchemaID]*Schema{
		psid1: ps1,
		psid2: ps2,
	})
	res, err := pl(context.Background(), psid1, psid3, psid2)
	assert.Equal(t, SchemaList{ps1, nil, ps2}, res)
	assert.NoError(t, err)
}
