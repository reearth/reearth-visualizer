package scene

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestPlugin(t *testing.T) {
	pid := id.MustPluginID("xxx~1.1.1")
	pr := id.NewPropertyID().Ref()
	res := NewPlugin(pid, pr)
	p := Plugin{
		plugin:   pid,
		property: pr,
	}
	assert.Equal(t, &p, res)
	assert.Equal(t, pid, p.Plugin())
	assert.Equal(t, pr, p.Property())
}
