package id

import (
	"encoding"
	"strings"
	"testing"

	"github.com/blang/semver"
	"github.com/stretchr/testify/assert"
)

var _ encoding.TextMarshaler = (*PluginID)(nil)
var _ encoding.TextUnmarshaler = (*PluginID)(nil)

func TestPluginIDValidator(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected bool
	}{
		{
			name:     "accepted name",
			input:    "1cc1_c-d",
			expected: true,
		},
		{
			name:     "les then 100",
			input:    strings.Repeat("a", 100),
			expected: true,
		},
		{
			name:     "empty",
			input:    "",
			expected: false,
		},
		{
			name:     "spaces",
			input:    "    ",
			expected: false,
		},
		{
			name:     "contains not accepted characters",
			input:    "@bbb/aa-a_a",
			expected: false,
		},
		{
			name:     "contain space",
			input:    "bbb a",
			expected: false,
		},
		{
			name:     "contain =",
			input:    "cccd=",
			expected: false,
		},
		{
			name:     "contains reearth reserved key word",
			input:    "reearth",
			expected: false,
		},
		{
			name:     "more than 100 char",
			input:    strings.Repeat("a", 101),
			expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.expected, validatePluginName(tc.input))
		})
	}
}

func TestNewPluginID(t *testing.T) {
	tests := []struct {
		name          string
		pluginName    string
		version       string
		scene         *SceneID
		expected      PluginID
		expectedError bool
	}{
		{
			name:       "success:accepted name",
			pluginName: "1ccc1_c-d",
			version:    "1.0.0",
			scene:      nil,
			expected: PluginID{
				name:    "1ccc1_c-d",
				version: "1.0.0",
				sys:     false,
				scene:   nil,
			},
		},
		{
			name:       "success:with scene id",
			pluginName: "aaaaa",
			version:    "0.1.0",
			scene:      MustSceneID("01fbpdqax0ttrftj3gb5gm4rw7").Ref(),
			expected: PluginID{
				name:    "aaaaa",
				version: "0.1.0",
				sys:     false,
				scene:   MustSceneID("01fbpdqax0ttrftj3gb5gm4rw7").Ref(),
			},
		},
		{
			name:       "success:official plugin id",
			pluginName: officialPluginIDStr,
			expected: PluginID{
				name:    officialPluginIDStr,
				version: "",
				sys:     true,
				scene:   nil,
			},
		},
		{
			name:          "fail:invalid name1",
			pluginName:    "1cc1_c-d",
			version:       "",
			scene:         nil,
			expectedError: true,
		},
		{
			name:          "fail:invalid name2",
			pluginName:    "1cc1_c-d/?s",
			version:       "1.0.0",
			scene:         nil,
			expectedError: true,
		},
		{
			name:          "fail:invalid name3",
			pluginName:    "1cc1_c-d/?s",
			version:       "_1",
			scene:         nil,
			expectedError: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			result, err := NewPluginID(tc.pluginName, tc.version, tc.scene)
			if tc.expectedError {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tc.expected, result)
			}
		})
	}
}

func TestPluginIDFrom(t *testing.T) {
	tests := []struct {
		name          string
		input         string
		expected      PluginID
		expectedError bool
	}{
		{
			name:  "success:accepted name",
			input: "1cc1_c-d~1.0.0",
			expected: PluginID{
				name:    "1cc1_c-d",
				version: "1.0.0",
				sys:     false,
				scene:   nil,
			},
		},
		{
			name:  "success:with scene id",
			input: "01fbpdqax0ttrftj3gb5gm4rw7~aaaaa~0.1.0",
			expected: PluginID{
				name:    "aaaaa",
				version: "0.1.0",
				sys:     false,
				scene:   MustSceneID("01fbpdqax0ttrftj3gb5gm4rw7").Ref(),
			},
		},
		{
			name:  "success:official plugin id",
			input: officialPluginIDStr,
			expected: PluginID{
				name:    officialPluginIDStr,
				version: "",
				sys:     true,
				scene:   nil,
			},
		},
		{
			name:          "fail:invalid name1",
			input:         "1cc1_c-d",
			expectedError: true,
		},
		{
			name:          "fail:invalid name2",
			input:         "1cc1_c-d/?s~1.0.0",
			expectedError: true,
		},
		{
			name:          "fail:invalid name3",
			input:         "1cc1_c-d/?s~1",
			expectedError: true,
		},
		{
			name:          "fail:invalid scene id",
			input:         "xxxx~ssss~1.0.0",
			expectedError: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			result, err := PluginIDFrom(tc.input)
			if tc.expectedError {
				assert.Error(t, err)
			} else {
				assert.Equal(t, tc.expected, result)
			}
		})
	}
}

func TestMustPluginID(t *testing.T) {
	tests := []struct {
		name          string
		input         string
		expected      PluginID
		expectedError bool
	}{
		{
			name:  "success:accepted name",
			input: "1cc1_c-d~1.0.0",
			expected: PluginID{
				name:    "1cc1_c-d",
				version: "1.0.0",
				sys:     false,
			},
		},
		{
			name:          "fail:invalid name",
			input:         "1cc.1_c-d",
			expectedError: true,
		},
		{
			name:          "fail:invalid name2",
			input:         "1cc.1_c-d/?s~1.0.0",
			expectedError: true,
		},
		{
			name:          "fail:invalid name3",
			input:         "1cc.1_c-d/?s~1",
			expectedError: true,
		},
		{
			name:          "fail:invalid scene id",
			input:         "xxxx~ssss~1.0.0",
			expectedError: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			if tc.expectedError {
				assert.Panics(t, func() {
					_ = MustPluginID(tc.input)
				})
			} else {
				result := MustPluginID(tc.input)
				assert.Equal(t, tc.expected, result)
			}
		})
	}
}

func TestPluginIDFromRef(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected *PluginID
	}{
		{
			name:  "success:accepted name",
			input: "1cc1_c-d~1.0.0",
			expected: &PluginID{
				name:    "1cc1_c-d",
				version: "1.0.0",
				sys:     false,
			},
		},
		{
			name:  "fail:invalid name1",
			input: "1cc1_c-d",
		},
		{
			name:  "fail:invalid name2",
			input: "1cc1_c-d/?s~1.0.0",
		},
		{
			name:  "fail:invalid name3",
			input: "1cc1_c-d/?s~1",
		},
		{
			name:  "fail:invalid scene id",
			input: "xxxx~ssss~1.0.0",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			if tc.expected == nil {
				result := PluginIDFromRef(&tc.input)
				assert.Nil(t, result)
			} else {
				result := PluginIDFromRef(&tc.input)
				assert.Equal(t, *tc.expected, *result)
			}
		})
	}
}

func TestPluginID_WithScene(t *testing.T) {
	sid := NewSceneID().Ref()

	assert.Equal(t, PluginID{
		name:    "aaa",
		version: "1.0.0",
		sys:     false,
		scene:   sid,
	}, PluginID{
		name:    "aaa",
		version: "1.0.0",
		sys:     false,
		scene:   nil,
	}.WithScene(sid))
}

func TestPluginID_Clone(t *testing.T) {
	p := PluginID{
		name:    "aaa",
		version: "1.0.0",
		sys:     false,
		scene:   NewSceneID().Ref(),
	}
	c := p.Clone()

	assert.Equal(t, p, c)
	assert.NotSame(t, p, c)
}

func TestPluginID_Name(t *testing.T) {
	plugin := MustPluginID("MyPlugin~1.0.0")

	assert.Equal(t, "MyPlugin", plugin.Name())
}

func TestPluginID_Version(t *testing.T) {
	plugin := MustPluginID("MyPlugin~1.0.0")

	assert.Equal(t, semver.MustParse("1.0.0"), plugin.Version())
}

func TestPluginID_Scene(t *testing.T) {
	scene := MustSceneID("01fbpdqax0ttrftj3gb5gm4rw7")
	sid := PluginID{
		scene: &scene,
	}.Scene()
	assert.Equal(t, scene, *sid)
	assert.NotSame(t, scene, *sid)
}

func TestPluginID_System(t *testing.T) {
	plugin := MustPluginID("MyPlugin~1.0.0")

	assert.False(t, plugin.System())

	plugin = MustPluginID(officialPluginIDStr)

	assert.True(t, plugin.System())
}

func TestPluginID_Validate(t *testing.T) {
	tests := []struct {
		name     string
		input    PluginID
		expected bool
	}{
		{
			name: "success:accepted name",
			input: PluginID{
				name:    "1cc1_c-d",
				version: "1.0.0",
				sys:     false,
			},
			expected: true,
		},
		{
			name: "success:accepted name",
			input: PluginID{
				name:    "1cc1/?_c-d",
				version: "1.0.0",
				sys:     false,
			},
			expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			assert.Equal(t, tc.expected, tc.input.Validate())
		})
	}
}

func TestPluginID_String(t *testing.T) {
	tests := []struct {
		name     string
		input    PluginID
		expected string
	}{
		{
			name: "accepted name1",
			input: PluginID{
				name:    "ppl",
				version: "1.0.0",
				scene:   nil,
				sys:     false,
			},
			expected: "ppl~1.0.0",
		},
		{
			name: "accepted name2",
			input: PluginID{
				name:    "plg",
				version: "2.1.0-beta",
				scene:   nil,
				sys:     false,
			},
			expected: "plg~2.1.0-beta",
		},
		{
			name: "with scene id",
			input: PluginID{
				name:    "plg",
				version: "2.1.0-beta",
				scene:   MustSceneID("01fbpdqax0ttrftj3gb5gm4rw7").Ref(),
				sys:     false,
			},
			expected: "01fbpdqax0ttrftj3gb5gm4rw7~plg~2.1.0-beta",
		},
		{
			name: "system",
			input: PluginID{
				name:    "reearth",
				version: "",
				scene:   nil,
				sys:     true,
			},
			expected: "reearth",
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			assert.Equal(t, tc.expected, tc.input.String())
		})
	}
}

func TestPluginID_Ref(t *testing.T) {
	pluginID := MustPluginID("Test~1.0.0")

	ref := pluginID.Ref()

	assert.Equal(t, *ref, pluginID)
}

func TestPluginID_CopyRef(t *testing.T) {
	pluginID := MustPluginID("Test~1.0.0")

	ref := pluginID.Ref()

	ref2 := ref.CopyRef()

	assert.Equal(t, *ref, pluginID)
	assert.Equal(t, *ref2, pluginID)
	assert.Equal(t, *ref, *ref2)
}

func TestPluginID_StringRef(t *testing.T) {
	pluginID := MustPluginID("Test~1.0.0")

	ref := pluginID.Ref()

	strRef := ref.StringRef()

	assert.Equal(t, pluginID.String(), *strRef)
}

func TestPluginID_Equal(t *testing.T) {
	tests := []struct {
		name     string
		input1   PluginID
		input2   PluginID
		expected bool
	}{
		{
			name:     "system",
			input1:   MustPluginID("reearth"),
			input2:   MustPluginID("reearth"),
			expected: true,
		},
		{
			name:     "system and normal",
			input1:   MustPluginID("reearth"),
			input2:   MustPluginID("Test~1.0.0"),
			expected: false,
		},
		{
			name:     "same",
			input1:   MustPluginID("Test~1.0.0"),
			input2:   MustPluginID("Test~1.0.0"),
			expected: true,
		},
		{
			name:     "diff version",
			input1:   MustPluginID("Test~1.0.0"),
			input2:   MustPluginID("Test~1.0.1"),
			expected: false,
		},
		{
			name:     "diff name",
			input1:   MustPluginID("Test0~1.0.0"),
			input2:   MustPluginID("Test1~1.0.0"),
			expected: false,
		},
		{
			name:     "same scene",
			input1:   MustPluginID("01fbprc3j929w0a3h16nh8rqy6~Test~1.0.0"),
			input2:   MustPluginID("01fbprc3j929w0a3h16nh8rqy6~Test~1.0.0"),
			expected: true,
		},
		{
			name:     "diff scene",
			input1:   MustPluginID("01fbprc3j929w0a3h16nh8rqy6~Test~1.0.0"),
			input2:   MustPluginID("01fbprc3j929w0a3h16nh8rqy7~Test~1.0.0"),
			expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.expected, tc.input1.Equal(tc.input2))
			assert.Equal(t, tc.expected, tc.input2.Equal(tc.input1))
		})
	}
}

func TestPluginID_NameEqual(t *testing.T) {
	tests := []struct {
		name     string
		input1   PluginID
		input2   PluginID
		expected bool
	}{
		{
			name:     "system",
			input1:   MustPluginID("reearth"),
			input2:   MustPluginID("reearth"),
			expected: true,
		},
		{
			name:     "system and normal",
			input1:   MustPluginID("reearth"),
			input2:   MustPluginID("Test~1.0.0"),
			expected: false,
		},
		{
			name:     "same",
			input1:   MustPluginID("Test~1.0.0"),
			input2:   MustPluginID("Test~1.0.0"),
			expected: true,
		},
		{
			name:     "diff version",
			input1:   MustPluginID("Test~1.0.0"),
			input2:   MustPluginID("Test~1.0.1"),
			expected: true,
		},
		{
			name:     "diff name",
			input1:   MustPluginID("Test0~1.0.0"),
			input2:   MustPluginID("Test1~1.0.0"),
			expected: false,
		},
		{
			name:     "same scene",
			input1:   MustPluginID("01fbprc3j929w0a3h16nh8rqy6~Test~1.0.0"),
			input2:   MustPluginID("01fbprc3j929w0a3h16nh8rqy6~Test~1.0.0"),
			expected: true,
		},
		{
			name:     "diff scene",
			input1:   MustPluginID("01fbprc3j929w0a3h16nh8rqy6~Test~1.0.0"),
			input2:   MustPluginID("01fbprc3j929w0a3h16nh8rqy7~Test~1.0.0"),
			expected: false,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.expected, tc.input1.NameEqual(tc.input2))
			assert.Equal(t, tc.expected, tc.input2.NameEqual(tc.input1))
		})
	}
}

func TestPluginID_MarshalText(t *testing.T) {
	pluginIdRef := MustPluginID("Test~1.0.0").Ref()

	res, err := pluginIdRef.MarshalText()

	assert.Nil(t, err)
	assert.Equal(t, []byte("Test~1.0.0"), res)
}

func TestPluginID_UnmarshalText(t *testing.T) {
	text := []byte("Test~1.0.0")

	pluginId := &PluginID{}

	err := pluginId.UnmarshalText(text)

	assert.Nil(t, err)
	assert.Equal(t, "Test~1.0.0", pluginId.String())

}

func TestPluginIDsToStrings(t *testing.T) {
	tests := []struct {
		name     string
		input    []PluginID
		expected []string
	}{
		{
			name:     "Empty slice",
			input:    make([]PluginID, 0),
			expected: make([]string, 0),
		},
		{
			name:     "1 element",
			input:    []PluginID{MustPluginID("Test~1.0.0")},
			expected: []string{"Test~1.0.0"},
		},
		{
			name: "multiple elements",
			input: []PluginID{
				MustPluginID("Test~1.0.0"),
				MustPluginID("Test~1.0.1"),
				MustPluginID("Test~1.0.2"),
			},
			expected: []string{
				"Test~1.0.0",
				"Test~1.0.1",
				"Test~1.0.2",
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.expected, PluginIDsToStrings(tc.input))
		})
	}
}

func TestPluginIDsFrom(t *testing.T) {
	tests := []struct {
		name     string
		input    []string
		expected []PluginID
		err      error
	}{
		{
			name:     "Empty slice",
			input:    make([]string, 0),
			expected: []PluginID{},
		},
		{
			name:     "1 element",
			input:    []string{"Test~1.0.0"},
			expected: []PluginID{MustPluginID("Test~1.0.0")},
		},
		{
			name: "multiple elements",
			input: []string{
				"Test~1.0.0",
				"Test~1.0.1",
				"Test~1.0.2",
			},
			expected: []PluginID{
				MustPluginID("Test~1.0.0"),
				MustPluginID("Test~1.0.1"),
				MustPluginID("Test~1.0.2"),
			},
		},
		{
			name: "invalid element",
			input: []string{
				"Test~1.0.0",
				"Test~1.0.1",
				"Test",
			},
			expected: nil,
			err:      ErrInvalidID,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			res, err := PluginIDsFrom(tt.input)
			if tt.err != nil {
				assert.Nil(t, res)
				assert.Equal(t, tt.err, err)
			} else {
				assert.Equal(t, tt.expected, res)
				assert.Nil(t, err)
			}
		})
	}
}

func TestPluginID_IsNil(t *testing.T) {
	tests := []struct {
		name   string
		target PluginID
		want   bool
	}{
		{
			name:   "present",
			target: PluginID{name: "a"},
			want:   false,
		},
		{
			name:   "empty",
			target: PluginID{},
			want:   true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.IsNil())
		})
	}
}
