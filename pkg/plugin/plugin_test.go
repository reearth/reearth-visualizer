package plugin

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/stretchr/testify/assert"
)

func TestPlugin_Extension(t *testing.T) {
	tests := []struct {
		name     string
		plugin   *Plugin
		key      ExtensionID
		expected *Extension
	}{
		{
			name:     "exiting extension",
			key:      "yyy",
			plugin:   New().ID(MustID("aaa~1.1.1")).Extensions([]*Extension{NewExtension().ID("xxx").MustBuild(), NewExtension().ID("yyy").MustBuild()}).MustBuild(),
			expected: NewExtension().ID("yyy").MustBuild(),
		},
		{
			name:     "not exiting extension",
			key:      "zzz",
			plugin:   New().ID(MustID("aaa~1.1.1")).Extensions([]*Extension{NewExtension().ID("xxx").MustBuild(), NewExtension().ID("yyy").MustBuild()}).MustBuild(),
			expected: nil,
		},
		{
			name:     "nil",
			key:      "zzz",
			plugin:   nil,
			expected: nil,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.expected, tc.plugin.Extension(tc.key))
		})
	}
}

func TestPlugin_PropertySchemas(t *testing.T) {
	ps1 := MustPropertySchemaID("hoge~0.1.0/a")
	ps2 := MustPropertySchemaID("hoge~0.1.0/b")
	ps3 := MustPropertySchemaID("hoge~0.1.0/c")

	tests := []struct {
		name     string
		plugin   *Plugin
		expected []PropertySchemaID
	}{
		{
			name:     "normal",
			plugin:   New().ID(MustID("aaa~1.1.1")).Schema(&ps1).Extensions([]*Extension{NewExtension().ID("xxx").Schema(ps2).MustBuild(), NewExtension().ID("yyy").Schema(ps3).MustBuild()}).MustBuild(),
			expected: []PropertySchemaID{ps1, ps2, ps3},
		},
		{
			name:     "no plugin property schema",
			plugin:   New().ID(MustID("aaa~1.1.1")).Extensions([]*Extension{NewExtension().ID("xxx").Schema(ps2).MustBuild(), NewExtension().ID("yyy").Schema(ps3).MustBuild()}).MustBuild(),
			expected: []PropertySchemaID{ps2, ps3},
		},
		{
			name:     "nil",
			plugin:   nil,
			expected: []PropertySchemaID(nil),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.expected, tc.plugin.PropertySchemas())
		})
	}
}

func TestPlugin_Author(t *testing.T) {
	p := New().ID(MustID("aaa~1.1.1")).Author("xx").MustBuild()
	assert.Equal(t, "xx", p.Author())
}

func TestPlugin_ID(t *testing.T) {
	assert.Equal(t, New().ID(MustID("xxx~1.1.1")).MustBuild().ID(), MustID("xxx~1.1.1"))
}

func TestPlugin_Clone(t *testing.T) {
	tests := []struct {
		name   string
		target *Plugin
	}{
		{
			name: "ok",
			target: &Plugin{
				id:   MustID("hoge~0.1.0"),
				name: i18n.StringFrom("hoge"),
				extensions: map[ExtensionID]*Extension{
					ExtensionID("foo"): {
						id:            ExtensionID("foo"),
						extensionType: ExtensionTypeBlock,
						schema:        MustPropertySchemaID("hoge~0.1.0/foo"),
					},
					ExtensionID("bar"): {
						id:            ExtensionID("bar"),
						extensionType: ExtensionTypePrimitive,
						schema:        MustPropertySchemaID("hoge~0.1.0/bar"),
					},
				},
				extensionOrder: []ExtensionID{"foo", "bar"},
				schema:         MustPropertySchemaID("hoge~0.1.0/fff").Ref(),
			},
		},
		{
			name:   "empty",
			target: &Plugin{},
		},
		{
			name: "nil",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.target.Clone()
			assert.Equal(t, tt.target, got)
			if tt.target != nil {
				assert.NotSame(t, tt.target, got)
			}
		})
	}
}
