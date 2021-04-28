package property

import (
	"context"
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestLoaderFrom(t *testing.T) {
	scene := id.NewSceneID()
	ps := id.MustPropertySchemaID("xxx#1.1.1/aa")
	pid1 := id.NewPropertyID()
	pid2 := id.NewPropertyID()
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
	scene := id.NewSceneID()
	ps := id.MustPropertySchemaID("xxx#1.1.1/aa")
	pid1 := id.NewPropertyID()
	pid2 := id.NewPropertyID()
	pid3 := id.NewPropertyID()
	p1 := New().ID(pid1).Scene(scene).Schema(ps).MustBuild()
	p2 := New().ID(pid2).Scene(scene).Schema(ps).MustBuild()
	p3 := New().ID(pid3).Scene(scene).Schema(ps).MustBuild()
	pl := LoaderFromMap(map[id.PropertyID]*Property{
		pid1: p1,
		pid2: p2,
		pid3: p3,
	})
	res, err := pl(context.Background(), pid1, pid2)
	assert.Equal(t, List{p1, p2}, res)
	assert.NoError(t, err)
}
