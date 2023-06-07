package plugin

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoaderFrom(t *testing.T) {
	pid1 := MustID("plugin~1.1.1")
	pid2 := MustID("plugin~1.1.2")
	p1 := New().ID(pid1).MustBuild()
	p2 := New().ID(pid2).MustBuild()

	pl := LoaderFrom(p1, p2)
	res, err := pl(context.Background(), []ID{pid1})

	assert.Equal(t, List{p1}, res)
	assert.NoError(t, err)

	pml := LoaderFromMap(List{p1, p2}.Map())
	res2, err2 := pml(context.Background(), []ID{pid1})

	assert.Equal(t, List{p1}, res2)
	assert.NoError(t, err2)
}
