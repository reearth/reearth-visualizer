package builtin

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/reearth/reearth/server/pkg/visualizer"
	"github.com/stretchr/testify/assert"
)

func TestGetPropertySchemaByVisualizer(t *testing.T) {
	tests := []struct {
		name        string
		visualizer  visualizer.Visualizer
		expectedNil bool
	}{
		{
			name:        "cesium",
			visualizer:  visualizer.VisualizerCesium,
			expectedNil: false,
		},
		{
			name:        "unsupported visualizer",
			visualizer:  "foo",
			expectedNil: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			res := GetPropertySchemaByVisualizer(tc.visualizer)
			if tc.expectedNil {
				assert.Nil(t, res)
			} else {
				assert.NotNil(t, res)
			}
		})
	}
}

func TestPlugin(t *testing.T) {
	assert.NotNil(t, Plugin())
}

func TestGetPlugin(t *testing.T) {
	tests := []struct {
		name        string
		pluginID    id.PluginID
		expectedNil bool
	}{
		{
			name:        "Official Plugin",
			pluginID:    id.OfficialPluginID,
			expectedNil: false,
		},
		{
			name:        "foo plugin",
			pluginID:    id.MustPluginID("foo~1.1.1"),
			expectedNil: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			res := GetPlugin(tc.pluginID)
			if tc.expectedNil {
				assert.Nil(t, res)
			} else {
				assert.NotNil(t, res)
			}
		})
	}
}

func TestGetPropertySchema(t *testing.T) {
	tests := []struct {
		name        string
		psId        id.PropertySchemaID
		expectedNil bool
	}{
		{
			name:        "Infobox",
			psId:        PropertySchemaIDInfobox,
			expectedNil: false,
		},
		{
			name:        "unknown propertySchemaId",
			psId:        id.MustPropertySchemaID("xxx~1.1.1/aa"),
			expectedNil: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			res := GetPropertySchema(tc.psId)
			if tc.expectedNil {
				assert.Nil(t, res)
			} else {
				assert.NotNil(t, res)
			}
		})
	}
}
