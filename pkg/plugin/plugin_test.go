package plugin

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestPlugin_Extension(t *testing.T) {
	testCases := []struct {
		name     string
		plugin   *Plugin
		key      id.PluginExtensionID
		expected *Extension
	}{
		{
			name:     "exiting extension",
			key:      "yyy",
			plugin:   New().Extensions([]*Extension{NewExtension().ID("xxx").MustBuild(), NewExtension().ID("yyy").MustBuild()}).MustBuild(),
			expected: NewExtension().ID("yyy").MustBuild(),
		},
		{
			name:     "not exiting extension",
			key:      "zzz",
			plugin:   New().Extensions([]*Extension{NewExtension().ID("xxx").MustBuild(), NewExtension().ID("yyy").MustBuild()}).MustBuild(),
			expected: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.expected, tc.plugin.Extension(tc.key))
		})
	}
}

func TestPlugin_Rename(t *testing.T) {
	p := New().Name(i18n.StringFrom("x")).MustBuild()
	p.Rename(i18n.StringFrom("z"))
	assert.Equal(t, i18n.StringFrom("z"), p.Name())
}

func TestPlugin_SetDescription(t *testing.T) {
	p := New().MustBuild()
	p.SetDescription(i18n.StringFrom("xxx"))
	assert.Equal(t, i18n.StringFrom("xxx"), p.Description())
}

func TestPlugin_Author(t *testing.T) {
	p := New().Author("xx").MustBuild()
	assert.Equal(t, "xx", p.Author())
}

func TestPlugin_ID(t *testing.T) {
	assert.Equal(t, New().ID(id.MustPluginID("xxx#1.1.1")).MustBuild().ID(), id.MustPluginID("xxx#1.1.1"))
}
