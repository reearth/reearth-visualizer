package id

import (
	"encoding"
	"testing"

	"github.com/stretchr/testify/assert"
)

var _ encoding.TextMarshaler = (*PropertySchemaID)(nil)
var _ encoding.TextUnmarshaler = (*PropertySchemaID)(nil)

func TestNewPropertySchemaID(t *testing.T) {
	pluginID := MustPluginID("test~2.0.0")
	pluginExtensionID := "test2"
	propertySchemaID := NewPropertySchemaID(pluginID, pluginExtensionID)

	assert.NotNil(t, propertySchemaID)
	assert.Equal(t, PropertySchemaID{
		plugin: MustPluginID("test~2.0.0"),
		id:     "test2",
	}, propertySchemaID)

	assert.Equal(t, PropertySchemaID{}, NewPropertySchemaID(PluginID{}, "a"))
	assert.Equal(t, PropertySchemaID{}, NewPropertySchemaID(pluginID, ""))
}

func TestPropertySchemaIDFrom(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected struct {
			result PropertySchemaID
			err    error
		}
	}{
		{
			name:  "success",
			input: "test~1.0.0/Test_Test-01",
			expected: struct {
				result PropertySchemaID
				err    error
			}{
				result: PropertySchemaID{
					plugin: MustPluginID("test~1.0.0"),
					id:     "Test_Test-01",
				},
				err: nil,
			},
		},
		{
			name:  "success: @",
			input: "test~1.0.0/@",
			expected: struct {
				result PropertySchemaID
				err    error
			}{
				result: PropertySchemaID{
					plugin: MustPluginID("test~1.0.0"),
					id:     "@",
				},
				err: nil,
			},
		},
		{
			name:  "fail 1",
			input: "Test",
			expected: struct {
				result PropertySchemaID
				err    error
			}{result: PropertySchemaID{}, err: ErrInvalidID},
		},
		{
			name:  "fail 2",
			input: "Test/+dsad",
			expected: struct {
				result PropertySchemaID
				err    error
			}{result: PropertySchemaID{}, err: ErrInvalidID},
		},
		{
			name:  "fail 3",
			input: "Test/-",
			expected: struct {
				result PropertySchemaID
				err    error
			}{result: PropertySchemaID{}, err: ErrInvalidID},
		},
		{
			name:  "fail 4",
			input: "Test/__",
			expected: struct {
				result PropertySchemaID
				err    error
			}{result: PropertySchemaID{}, err: ErrInvalidID},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result, err := PropertySchemaIDFrom(tt.input)
			if tt.expected.err != nil {
				assert.Equal(t, tt.expected.result, result)
				assert.Equal(t, tt.expected.err, err)
			} else {
				assert.Equal(t, tt.expected.result, result)
				assert.Nil(t, err)
			}
		})
	}
}

func TestMustPropertySchemaID(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected struct {
			result PropertySchemaID
			err    error
		}
	}{
		{
			name:  "success:valid name",
			input: "test~1.0.0/Test_Test-01",
			expected: struct {
				result PropertySchemaID
				err    error
			}{
				result: PropertySchemaID{
					plugin: MustPluginID("test~1.0.0"),
					id:     "Test_Test-01",
				},
				err: nil,
			},
		},
		{
			name:  "fail:invalid name",
			input: "Test",
			expected: struct {
				result PropertySchemaID
				err    error
			}{result: PropertySchemaID{}, err: ErrInvalidID},
		},
		{
			name:  "fail:invalid name",
			input: "Test/+dsad",
			expected: struct {
				result PropertySchemaID
				err    error
			}{result: PropertySchemaID{}, err: ErrInvalidID},
		},
		{
			name:  "fail:invalid name",
			input: "Test/dsa d",
			expected: struct {
				result PropertySchemaID
				err    error
			}{result: PropertySchemaID{}, err: ErrInvalidID},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if tt.expected.err != nil {
				assert.Panics(t, func() {
					_ = MustPropertySchemaID(tt.input)
				})
			} else {
				result := MustPropertySchemaID(tt.input)
				assert.Equal(t, tt.expected.result, result)
			}
		})
	}
}

func TestPropertySchemaIDFromRef(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected *PropertySchemaID
	}{
		{
			name:  "success:valid name",
			input: "test~1.0.0/Test_Test-01",
			expected: &PropertySchemaID{
				plugin: MustPluginID("test~1.0.0"),
				id:     "Test_Test-01",
			},
		},
		{
			name:     "fail:invalid name 1",
			input:    "Test~1.0.0",
			expected: nil,
		},
		{
			name:     "fail:invalid name 2",
			input:    "Test~1.0.0/+dsad",
			expected: nil,
		},
		{
			name:     "fail:invalid name 3",
			input:    "Test~1.0.0/dsa d",
			expected: nil,
		},
		{
			name:     "fail:invalid name 4",
			input:    "Test/dsa",
			expected: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := PropertySchemaIDFromRef(&tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestPropertySchemaID_Clone(t *testing.T) {
	p := PropertySchemaID{
		id: "xxx",
		plugin: PluginID{
			name:    "aaa",
			version: "1.0.0",
			sys:     false,
			scene:   NewSceneID().Ref(),
		},
	}
	c := p.Clone()

	assert.Equal(t, p, c)
	assert.NotSame(t, p, c)
}

func TestPropertySchemaID_WithPlugin(t *testing.T) {
	c := PropertySchemaID{
		id: "xxx",
		plugin: PluginID{
			name:    "aaa",
			version: "1.0.0",
		},
	}.WithPlugin(PluginID{
		name:    "aaa",
		version: "1.1.0",
	})

	assert.Equal(t, PropertySchemaID{
		id: "xxx",
		plugin: PluginID{
			name:    "aaa",
			version: "1.1.0",
		},
	}, c)
}

func TestPropertySchemaID_ID(t *testing.T) {
	propertySchemaID := MustPropertySchemaID("Test~2.0.0/test")
	assert.Equal(t, propertySchemaID.ID(), "test")
}

func TestPropertySchemaID_Plugin(t *testing.T) {
	propertySchemaID := MustPropertySchemaID("Test~2.0.0/test")
	assert.Equal(t, MustPluginID("Test~2.0.0"), propertySchemaID.Plugin())
}

func TestPropertySchemaID_String(t *testing.T) {
	propertySchemaID := MustPropertySchemaID("Test~2.0.0/test")
	assert.Equal(t, propertySchemaID.String(), "Test~2.0.0/test")
}

func TestPropertySchemaID_Ref(t *testing.T) {
	propertySchemaID, _ := PropertySchemaIDFrom("test~2.0.0/test")
	assert.Equal(t, &propertySchemaID, propertySchemaID.Ref())
}

func TestPropertySchemaID_CopyRef(t *testing.T) {
	propertySchemaID, _ := PropertySchemaIDFrom("test~2.0.0/test")
	assert.Equal(t, propertySchemaID, *propertySchemaID.CopyRef())
	assert.NotSame(t, propertySchemaID.Ref(), propertySchemaID.CopyRef())
}

func TestPropertySchemaID_IsNil(t *testing.T) {
	propertySchemaID, _ := PropertySchemaIDFrom("test~2.0.0/test")
	assert.False(t, propertySchemaID.IsNil())
	propertySchemaID = PropertySchemaID{}
	assert.True(t, propertySchemaID.IsNil())
}

func TestPropertySchemaID_Equal(t *testing.T) {
	propertySchemaID, _ := PropertySchemaIDFrom("test~2.0.0/test")
	propertySchemaID2, _ := PropertySchemaIDFrom("test~2.0.0/test")
	propertySchemaID3, _ := PropertySchemaIDFrom("test~2.0.1/test")
	assert.True(t, propertySchemaID.Equal(propertySchemaID2))
	assert.False(t, propertySchemaID.Equal(propertySchemaID3))
}

func TestPropertySchemaID_StringRef(t *testing.T) {
	propertySchemaID, _ := PropertySchemaIDFrom("test~2.0.0/test")
	ref := &propertySchemaID
	assert.Equal(t, *ref.StringRef(), ref.String())
}

func TestPropertySchemaID_MarshalText(t *testing.T) {
	propertySchemaID, _ := PropertySchemaIDFrom("test~2.0.0/test")
	res, err := propertySchemaID.MarshalText()
	assert.Nil(t, err)
	assert.Equal(t, []byte("test~2.0.0/test"), res)
}

func TestPropertySchemaID_UnmarshalText(t *testing.T) {
	text := []byte("test~2.0.0/test")
	propertySchemaID := &PropertySchemaID{}
	err := propertySchemaID.UnmarshalText(text)
	assert.Nil(t, err)
	assert.Equal(t, "test~2.0.0/test", propertySchemaID.String())
}

func TestPropertySchemaIDsToStrings(t *testing.T) {
	tests := []struct {
		name     string
		input    []PropertySchemaID
		expected []string
	}{
		{
			name:     "Empty slice",
			input:    make([]PropertySchemaID, 0),
			expected: make([]string, 0),
		},
		{
			name:     "1 element",
			input:    []PropertySchemaID{MustPropertySchemaID("test~2.0.0/test")},
			expected: []string{"test~2.0.0/test"},
		},
		{
			name: "multiple elements",
			input: []PropertySchemaID{
				MustPropertySchemaID("Test~1.0.0/test"),
				MustPropertySchemaID("Test~1.0.1/test"),
				MustPropertySchemaID("Test~1.0.2/test"),
			},
			expected: []string{
				"Test~1.0.0/test",
				"Test~1.0.1/test",
				"Test~1.0.2/test",
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expected, PropertySchemaIDsToStrings(tt.input))
		})
	}

}

func TestPropertySchemaIDsFrom(t *testing.T) {
	tests := []struct {
		name     string
		input    []string
		expected []PropertySchemaID
		err      error
	}{
		{
			name:     "Empty slice",
			input:    make([]string, 0),
			expected: []PropertySchemaID{},
		},
		{
			name:     "1 element",
			input:    []string{"Test~1.0.0/test"},
			expected: []PropertySchemaID{MustPropertySchemaID("Test~1.0.0/test")},
		},
		{
			name: "multiple elements",
			input: []string{
				"Test~1.0.0/test",
				"Test~1.0.1/test",
				"Test~1.0.2/test",
			},
			expected: []PropertySchemaID{
				MustPropertySchemaID("Test~1.0.0/test"),
				MustPropertySchemaID("Test~1.0.1/test"),
				MustPropertySchemaID("Test~1.0.2/test"),
			},
		},
		{
			name: "invalid elements",
			input: []string{
				"Test~1.0.0/test",
				"Test~1.0.1/test",
				"Test~1.0.2",
			},
			err: ErrInvalidID,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			res, err := PropertySchemaIDsFrom(tt.input)
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
