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
	p3 := New().ID(pid3).Scene(scene).Schema(ps).MustBuild()
	pl := LoaderFromMap(map[ID]*Property{
		pid1: p1,
		pid2: p2,
		pid3: p3,
	})
	res, err := pl(context.Background(), pid1, pid2)
	assert.Equal(t, List{p1, p2}, res)
	assert.NoError(t, err)
}
