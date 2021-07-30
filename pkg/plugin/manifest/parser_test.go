package manifest

import (
	_ "embed"
	"strings"
	"testing"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/reearth/reearth-backend/pkg/plugin"
	"github.com/reearth/reearth-backend/pkg/property"
	"github.com/reearth/reearth-backend/pkg/visualizer"
	"github.com/stretchr/testify/assert"
)

//go:embed testdata/minimum.yml
var minimum string
var minimumExpected = &Manifest{
	Plugin:          plugin.New().ID(id.MustPluginID("aaa#1.1.1")).MustBuild(),
	ExtensionSchema: []*property.Schema{},
	Schema:          nil,
}

//go:embed testdata/test.yml
var normal string
var normalExpected = &Manifest{
	Plugin: plugin.New().ID(id.MustPluginID("aaa#1.1.1")).Name(i18n.StringFrom("bbb")).Extensions([]*plugin.Extension{
		plugin.NewExtension().ID(id.PluginExtensionID("hoge")).
			Visualizer(visualizer.VisualizerCesium).
			Type(plugin.ExtensionTypePrimitive).
			Schema(id.MustPropertySchemaID("aaa#1.1.1/hoge")).
			MustBuild(),
	}).MustBuild(),
	ExtensionSchema: []*property.Schema{
		property.NewSchema().ID(id.MustPropertySchemaID("aaa#1.1.1/hoge")).Groups([]*property.SchemaGroup{
			property.NewSchemaGroup().ID(id.PropertySchemaFieldID("default")).
				Schema(id.MustPropertySchemaID("aaa#1.1.1/hoge")).
				RepresentativeField(id.PropertySchemaFieldID("a").Ref()).
				Fields([]*property.SchemaField{
					property.NewSchemaField().ID(id.PropertySchemaFieldID("a")).
						Type(property.ValueTypeBool).
						DefaultValue(property.ValueTypeBool.MustBeValue(true)).
						IsAvailableIf(&property.Condition{
							Field: id.PropertySchemaFieldID("b"),
							Value: property.ValueTypeNumber.MustBeValue(1),
						}).
						MustBuild(),
					property.NewSchemaField().ID(id.PropertySchemaFieldID("b")).
						Type(property.ValueTypeNumber).
						MustBuild(),
				}).MustBuild(),
		}).MustBuild(),
	},
	Schema: nil,
}

func TestParse(t *testing.T) {
	testCases := []struct {
		name     string
		input    string
		expected *Manifest
		err      error
	}{
		{
			name:     "success create simple manifest",
			input:    minimum,
			expected: minimumExpected,
			err:      nil,
		},
		{
			name:     "success create manifest",
			input:    normal,
			expected: normalExpected,
			err:      nil,
		},
		{
			name:     "fail not valid JSON",
			input:    "",
			expected: nil,
			err:      ErrFailedToParseManifest,
		},
		{
			name: "fail system manifest",
			input: `{
				"system": true,
				"id": "reearth",
				"title": "bbb",
				"version": "1.1.1"
			}`,
			expected: nil,
			err:      ErrSystemManifest,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			m, err := Parse(strings.NewReader(tc.input))
			if tc.err == nil {
				if !assert.NoError(tt, err) {
					return
				}
				assert.Equal(tt, tc.expected, m)
				return
			}
			assert.ErrorIs(tt, tc.err, err)
		})
	}

}

func TestParseSystemFromBytes(t *testing.T) {
	testCases := []struct {
		name, input string
		expected    *Manifest
		err         error
	}{
		{
			name:     "success create simple manifest",
			input:    minimum,
			expected: minimumExpected,
			err:      nil,
		},
		{
			name:     "success create manifest",
			input:    normal,
			expected: normalExpected,
			err:      nil,
		},
		{
			name:     "fail not valid YAML",
			input:    "--",
			expected: nil,
			err:      ErrFailedToParseManifest,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			m, err := ParseSystemFromBytes([]byte(tc.input))
			if tc.err == nil {
				if !assert.NoError(tt, err) {
					return
				}
				assert.Equal(tt, tc.expected, m)
				return
			}
			assert.ErrorIs(tt, tc.err, err)
		})
	}
}

func TestMustParseSystemFromBytes(t *testing.T) {
	testCases := []struct {
		name, input string
		expected    *Manifest
		err         error
	}{
		{
			name:     "success create simple manifest",
			input:    minimum,
			expected: minimumExpected,
			err:      nil,
		},
		{
			name:     "success create manifest",
			input:    normal,
			expected: normalExpected,
			err:      nil,
		},
		{
			name:     "fail not valid JSON",
			input:    "--",
			expected: nil,
			err:      ErrFailedToParseManifest,
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()

			if tc.err != nil {
				assert.PanicsWithError(tt, tc.err.Error(), func() {
					_ = MustParseSystemFromBytes([]byte(tc.input))
				})
				return
			}

			m := MustParseSystemFromBytes([]byte(tc.input))
			assert.Equal(tt, m, tc.expected)
		})
	}
}
