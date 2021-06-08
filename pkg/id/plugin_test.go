package id

import (
	"encoding"
	"errors"
	"strings"
	"testing"

	"github.com/blang/semver"
	"github.com/stretchr/testify/assert"
)

var _ encoding.TextMarshaler = (*PluginID)(nil)
var _ encoding.TextUnmarshaler = (*PluginID)(nil)

func TestPluginIDValidator(t *testing.T) {
	t.Parallel()
	testCases := []struct {
		name     string
		input    string
		expected bool
	}{
		{
			name:     "accepted name",
			input:    "1cc.1_c-d",
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.expected, validatePluginName(tc.input))
		})
	}
}

func TestPluginIDFrom(t *testing.T) {
	t.Parallel()
	testCases := []struct {
		name     string
		input    string
		expected struct {
			err    error
			result PluginID
		}
	}{
		{
			name:  "success:accepted name",
			input: "1cc.1_c-d#1.0.0",
			expected: struct {
				err    error
				result PluginID
			}{
				err: nil,
				result: PluginID{
					name:    "1cc.1_c-d",
					version: "1.0.0",
					sys:     false,
				},
			},
		},
		{
			name:  "success:official plugin id",
			input: officialPluginIDStr,
			expected: struct {
				err    error
				result PluginID
			}{
				err: nil,
				result: PluginID{
					name:    officialPluginIDStr,
					version: "",
					sys:     true,
				},
			},
		},
		{
			name:  "fail:not valid name",
			input: "1cc.1_c-d",
			expected: struct {
				err    error
				result PluginID
			}{
				err:    ErrInvalidID,
				result: PluginID{},
			},
		},
		{
			name:  "fail:not valid name",
			input: "1cc.1_c-d/?s#1.0.0",
			expected: struct {
				err    error
				result PluginID
			}{
				err:    ErrInvalidID,
				result: PluginID{},
			},
		},
		{
			name:  "fail:not valid name",
			input: "1cc.1_c-d/?s#1",
			expected: struct {
				err    error
				result PluginID
			}{
				err:    ErrInvalidID,
				result: PluginID{},
			},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			result, _ := PluginIDFrom(tc.input)
			assert.Equal(tt, tc.expected.result, result)
		})
	}
}

func TestMustPluginID(t *testing.T) {
	t.Parallel()
	testCases := []struct {
		name     string
		input    string
		expected struct {
			err    error
			result PluginID
		}
	}{
		{
			name:  "success:accepted name",
			input: "1cc.1_c-d#1.0.0",
			expected: struct {
				err    error
				result PluginID
			}{
				err: nil,
				result: PluginID{
					name:    "1cc.1_c-d",
					version: "1.0.0",
					sys:     false,
				},
			},
		},
		{
			name:  "fail:not valid name",
			input: "1cc.1_c-d",
			expected: struct {
				err    error
				result PluginID
			}{
				err:    ErrInvalidID,
				result: PluginID{},
			},
		},
		{
			name:  "fail:not valid name",
			input: "1cc.1_c-d/?s#1.0.0",
			expected: struct {
				err    error
				result PluginID
			}{
				err:    ErrInvalidID,
				result: PluginID{},
			},
		},
		{
			name:  "fail:not valid name",
			input: "1cc.1_c-d/?s#1",
			expected: struct {
				err    error
				result PluginID
			}{
				err:    ErrInvalidID,
				result: PluginID{},
			},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			if tc.expected.err != nil {
				assert.Panics(tt, func() {
					_ = MustPluginID(tc.input)
				})
			} else {
				result := MustPluginID(tc.input)
				assert.Equal(tt, tc.expected.result, result)
			}
		})
	}
}

func TestPluginIDFromRef(t *testing.T) {
	t.Parallel()
	testCases := []struct {
		name     string
		input    string
		expected struct {
			err    error
			result PluginID
		}
	}{
		{
			name:  "success:accepted name",
			input: "1cc.1_c-d#1.0.0",
			expected: struct {
				err    error
				result PluginID
			}{
				err: nil,
				result: PluginID{
					name:    "1cc.1_c-d",
					version: "1.0.0",
					sys:     false,
				},
			},
		},
		{
			name:  "fail:not valid name",
			input: "1cc.1_c-d",
			expected: struct {
				err    error
				result PluginID
			}{
				err:    ErrInvalidID,
				result: PluginID{},
			},
		},
		{
			name:  "fail:not valid name",
			input: "1cc.1_c-d/?s#1.0.0",
			expected: struct {
				err    error
				result PluginID
			}{
				err:    ErrInvalidID,
				result: PluginID{},
			},
		},
		{
			name:  "fail:not valid name",
			input: "1cc.1_c-d/?s#1",
			expected: struct {
				err    error
				result PluginID
			}{
				err:    ErrInvalidID,
				result: PluginID{},
			},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			if tc.expected.err != nil {
				result := PluginIDFromRef(&tc.input)
				assert.Nil(tt, result)
			} else {
				result := PluginIDFromRef(&tc.input)
				assert.Equal(tt, tc.expected.result, *result)
			}
		})
	}
}

func TestPluginID_Name(t *testing.T) {
	plugin := MustPluginID("MyPlugin#1.0.0")

	assert.Equal(t, "MyPlugin", plugin.Name())
}

func TestPluginID_Version(t *testing.T) {
	plugin := MustPluginID("MyPlugin#1.0.0")

	assert.Equal(t, semver.MustParse("1.0.0"), plugin.Version())
}

func TestPluginID_System(t *testing.T) {
	plugin := MustPluginID("MyPlugin#1.0.0")

	assert.False(t, plugin.System())

	plugin = MustPluginID(officialPluginIDStr)

	assert.True(t, plugin.System())
}

func TestPluginID_Validate(t *testing.T) {
	t.Parallel()
	testCases := []struct {
		name     string
		input    PluginID
		expected bool
	}{
		{
			name: "success:accepted name",
			input: PluginID{
				name:    "1cc.1_c-d",
				version: "1.0.0",
				sys:     false,
			},
			expected: true,
		},
		{
			name: "success:accepted name",
			input: PluginID{
				name:    "1cc.1/?_c-d",
				version: "1.0.0",
				sys:     false,
			},
			expected: false,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			assert.Equal(tt, tc.expected, tc.input.Validate())
		})
	}
}

func TestPluginID_String(t *testing.T) {
	t.Parallel()
	testCases := []struct {
		name     string
		input    PluginID
		expected string
	}{
		{
			name: "success:accepted name",
			input: PluginID{
				name:    "ppl",
				version: "1.0.0",
				sys:     false,
			},
			expected: "ppl#1.0.0",
		},
		{
			name: "success:accepted name",
			input: PluginID{
				name:    "plg",
				version: "2.1.0-beta",
				sys:     false,
			},
			expected: "plg#2.1.0-beta",
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			assert.Equal(tt, tc.expected, tc.input.String())
		})
	}
}

func TestPluginID_Ref(t *testing.T) {
	pluginID := MustPluginID("Test#1.0.0")

	ref := pluginID.Ref()

	assert.Equal(t, *ref, pluginID)
}

func TestPluginID_CopyRef(t *testing.T) {
	pluginID := MustPluginID("Test#1.0.0")

	ref := pluginID.Ref()

	ref2 := ref.CopyRef()

	assert.Equal(t, *ref, pluginID)
	assert.Equal(t, *ref2, pluginID)
	assert.Equal(t, *ref, *ref2)
}

func TestPluginID_StringRef(t *testing.T) {
	pluginID := MustPluginID("Test#1.0.0")

	ref := pluginID.Ref()

	strRef := ref.StringRef()

	assert.Equal(t, pluginID.String(), *strRef)
}

func TestPluginID_Equal(t *testing.T) {
	t.Parallel()
	testCases := []struct {
		name  string
		input struct {
			pluginID1 PluginID
			pluginID2 PluginID
		}
		expected bool
	}{
		{
			name: "Equal",
			input: struct {
				pluginID1 PluginID
				pluginID2 PluginID
			}{
				pluginID1: MustPluginID("Test#1.0.0"),
				pluginID2: MustPluginID("Test#1.0.0"),
			},
			expected: true,
		},
		{
			name: "Equal",
			input: struct {
				pluginID1 PluginID
				pluginID2 PluginID
			}{
				pluginID1: MustPluginID("Test#1.0.0"),
				pluginID2: MustPluginID("Test#1.0.1"),
			},
			expected: false,
		},
		{
			name: "Equal",
			input: struct {
				pluginID1 PluginID
				pluginID2 PluginID
			}{
				pluginID1: MustPluginID("Test0#1.0.0"),
				pluginID2: MustPluginID("Test1#1.0.0"),
			},
			expected: false,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.expected, tc.input.pluginID1.Equal(tc.input.pluginID2))
			assert.Equal(tt, tc.expected, tc.input.pluginID2.Equal(tc.input.pluginID1))
		})
	}

}

func TestPluginID_MarshalText(t *testing.T) {
	pluginIdRef := MustPluginID("Test#1.0.0").Ref()

	res, err := pluginIdRef.MarshalText()

	assert.Nil(t, err)
	assert.Equal(t, []byte("Test#1.0.0"), res)
}

func TestPluginID_UnmarshalText(t *testing.T) {
	text := []byte("Test#1.0.0")

	pluginId := &PluginID{}

	err := pluginId.UnmarshalText(text)

	assert.Nil(t, err)
	assert.Equal(t, "Test#1.0.0", pluginId.String())

}

func TestPluginIDToKeys(t *testing.T) {
	t.Parallel()
	testCases := []struct {
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
			input:    []PluginID{MustPluginID("Test#1.0.0")},
			expected: []string{"Test#1.0.0"},
		},
		{
			name: "multiple elements",
			input: []PluginID{
				MustPluginID("Test#1.0.0"),
				MustPluginID("Test#1.0.1"),
				MustPluginID("Test#1.0.2"),
			},
			expected: []string{
				"Test#1.0.0",
				"Test#1.0.1",
				"Test#1.0.2",
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.expected, PluginIDToKeys(tc.input))
		})
	}

}

func TestPluginIDsFrom(t *testing.T) {
	t.Parallel()
	testCases := []struct {
		name     string
		input    []string
		expected struct {
			res []PluginID
			err error
		}
	}{
		{
			name:  "Empty slice",
			input: make([]string, 0),
			expected: struct {
				res []PluginID
				err error
			}{
				res: make([]PluginID, 0),
				err: nil,
			},
		},
		{
			name:  "1 element",
			input: []string{"Test#1.0.0"},
			expected: struct {
				res []PluginID
				err error
			}{
				res: []PluginID{MustPluginID("Test#1.0.0")},
				err: nil,
			},
		},
		{
			name: "multiple elements",
			input: []string{
				"Test#1.0.0",
				"Test#1.0.1",
				"Test#1.0.2",
			},
			expected: struct {
				res []PluginID
				err error
			}{
				res: []PluginID{
					MustPluginID("Test#1.0.0"),
					MustPluginID("Test#1.0.1"),
					MustPluginID("Test#1.0.2"),
				},
				err: nil,
			},
		},
		{
			name: "multiple elements",
			input: []string{
				"Test#1.0.0",
				"Test#1.0.1",
				"Test#1.0.2",
			},
			expected: struct {
				res []PluginID
				err error
			}{
				res: nil,
				err: ErrInvalidID,
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()

			if tc.expected.err != nil {
				_, err := PluginIDsFrom(tc.input)
				assert.True(tt, errors.As(ErrInvalidID, &err))
			} else {
				res, err := PluginIDsFrom(tc.input)
				assert.Equal(tt, tc.expected.res, res)
				assert.Nil(tt, err)
			}

		})
	}
}
