package plugin

import (
	"context"
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestLoaderFrom(t *testing.T) {
	pid1 := id.MustPluginID("plugin~1.1.1")
	pid2 := id.MustPluginID("plugin~1.1.2")
	p1 := New().ID(pid1).MustBuild()
	p2 := New().ID(pid2).MustBuild()

	pl := LoaderFrom(p1, p2)
	res, err := pl(context.Background(), []id.PluginID{pid1})

	assert.Equal(t, List{p1}, res)
	assert.NoError(t, err)

	pml := LoaderFromMap(List{p1, p2}.Map())
	res2, err2 := pml(context.Background(), []id.PluginID{pid1})

	assert.Equal(t, List{p1}, res2)
	assert.NoError(t, err2)
}
