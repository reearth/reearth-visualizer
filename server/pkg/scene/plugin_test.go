package scene

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestPlugin(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()

	res := NewPlugin(pid, pr)
	assert.Equal(t, &Plugin{
		plugin:   pid,
		property: pr,
	}, res)
	assert.Equal(t, pid, res.Plugin())
	assert.Equal(t, &pid, res.PluginRef())
	assert.Equal(t, pr, res.Property())

	cl := res.Clone()
	assert.Equal(t, res, cl)
	assert.NotSame(t, res, cl)

	assert.Nil(t, (*Plugin)(nil).PluginRef())
}
