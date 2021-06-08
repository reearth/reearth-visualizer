package id

import (
	"encoding"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

var _ encoding.TextMarshaler = (*PropertySchemaID)(nil)
var _ encoding.TextUnmarshaler = (*PropertySchemaID)(nil)

func TestPropertySchemaIDFrom(t *testing.T) {
	t.Parallel()
	testCases := []struct {
		name     string
		input    string
		expected struct {
			result PropertySchemaID
			err    error
		}
	}{
		{
			name:  "success:valid name",
			input: "test/Test_Test-01",
			expected: struct {
				result PropertySchemaID
				err    error
			}{
				result: PropertySchemaID{
					plugin: "test",
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			result, err := PropertySchemaIDFrom(tc.input)
			if tc.expected.err != nil {
				assert.Equal(tt, tc.expected.result, result)
				assert.True(tt, errors.As(tc.expected.err, &err))
			} else {
				assert.Equal(tt, tc.expected.result, result)
				assert.Nil(tt, err)
			}

		})
	}
}

func TestPropertySchemaIDFromExtension(t *testing.T) {
	pluginID := MustPluginID("test#2.0.0")
	pluginExtensionID := PluginExtensionID("test2")

	propertySchemaID, err := PropertySchemaIDFromExtension(pluginID, pluginExtensionID)

	assert.NotNil(t, propertySchemaID)
	assert.Equal(t, PropertySchemaID{
		plugin: "test#2.0.0",
		id:     "test2",
	}, propertySchemaID)
	assert.Nil(t, err)
}

func TestMustPropertySchemaID(t *testing.T) {
	t.Parallel()
	testCases := []struct {
		name     string
		input    string
		expected struct {
			result PropertySchemaID
			err    error
		}
	}{
		{
			name:  "success:valid name",
			input: "test/Test_Test-01",
			expected: struct {
				result PropertySchemaID
				err    error
			}{
				result: PropertySchemaID{
					plugin: "test",
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
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()

			if tc.expected.err != nil {
				assert.Panics(tt, func() {
					_ = MustPropertySchemaID(tc.input)
				})
			} else {
				result := MustPropertySchemaID(tc.input)
				assert.Equal(tt, tc.expected.result, result)
			}

		})
	}
}

func TestMustPropertySchemaIDFromExtension(t *testing.T) {
	pluginID := MustPluginID("test#2.0.0")
	pluginExtensionID := PluginExtensionID("test2")

	propertySchemaID := MustPropertySchemaIDFromExtension(pluginID, pluginExtensionID)

	assert.NotNil(t, propertySchemaID)
	assert.Equal(t, PropertySchemaID{
		plugin: "test#2.0.0",
		id:     "test2",
	}, propertySchemaID)
}

func TestPropertySchemaIDFromRef(t *testing.T) {
	t.Parallel()
	input1 := "test/Test_Test-01"
	input2 := "Test"
	input3 := "Test/+dsad"
	input4 := "Test/dsa d"
	testCases := []struct {
		name     string
		input    *string
		expected *PropertySchemaID
	}{
		{
			name:  "success:valid name",
			input: &input1,
			expected: &PropertySchemaID{
				plugin: "test",
				id:     "Test_Test-01",
			},
		},
		{
			name:     "fail:invalid name",
			input:    &input2,
			expected: nil,
		},
		{
			name:     "fail:invalid name",
			input:    &input3,
			expected: nil,
		},
		{
			name:     "fail:invalid name",
			input:    &input4,
			expected: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()

			result := PropertySchemaIDFromRef(tc.input)
			assert.Equal(tt, tc.expected, result)
		})
	}
}

func TestPropertySchemaID_ID(t *testing.T) {
	propertySchemaID := MustPropertySchemaID("Test#2.0.0/test")

	assert.Equal(t, propertySchemaID.ID(), "test")
}

func TestPropertySchemaID_Plugin(t *testing.T) {
	propertySchemaID := MustPropertySchemaID("Test#2.0.0/test")

	assert.Equal(t, propertySchemaID.Plugin(), "Test#2.0.0")
}

func TestPropertySchemaID_System(t *testing.T) {
	propertySchemaID := MustPropertySchemaID("Test#2.0.0/test")

	assert.False(t, propertySchemaID.System())

	extinctionName := schemaSystemIDPrefix
	propertySchemaID = MustPropertySchemaIDFromExtension(MustPluginID("test#2.0.0"), *PluginExtensionIDFromRef(&extinctionName))

	assert.True(t, propertySchemaID.System())

	propertySchemaID = MustPropertySchemaID("Test#2.0.0/" + schemaSystemIDPrefix)

	assert.True(t, propertySchemaID.System())
}

func TestPropertySchemaID_String(t *testing.T) {
	propertySchemaID := MustPropertySchemaID("Test#2.0.0/test")

	assert.Equal(t, propertySchemaID.String(), "Test#2.0.0/test")
}

func TestPropertySchemaID_Ref(t *testing.T) {
	propertySchemaID, _ := PropertySchemaIDFrom("test#2.0.0/test")

	assert.Equal(t, &propertySchemaID, propertySchemaID.Ref())
}

func TestPropertySchemaID_CopyRef(t *testing.T) {
	propertySchemaID, _ := PropertySchemaIDFrom("test#2.0.0/test")

	assert.Equal(t, propertySchemaID, *propertySchemaID.CopyRef())

	assert.False(t, propertySchemaID.Ref() == propertySchemaID.CopyRef())
}

func TestPropertySchemaID_IsNil(t *testing.T) {
	propertySchemaID, _ := PropertySchemaIDFrom("test#2.0.0/test")

	assert.False(t, propertySchemaID.IsNil())

	propertySchemaID = PropertySchemaID{}

	assert.True(t, propertySchemaID.IsNil())
}

func TestPropertySchemaID_StringRef(t *testing.T) {
	propertySchemaID, _ := PropertySchemaIDFrom("test#2.0.0/test")

	ref := &propertySchemaID

	assert.Equal(t, *ref.StringRef(), ref.String())
}

func TestPropertySchemaID_MarshalText(t *testing.T) {
	propertySchemaID, _ := PropertySchemaIDFrom("test#2.0.0/test")

	res, err := propertySchemaID.MarshalText()

	assert.Nil(t, err)
	assert.Equal(t, []byte("test#2.0.0/test"), res)
}

func TestPropertySchemaID_UnmarshalText(t *testing.T) {
	text := []byte("test#2.0.0/test")

	propertySchemaID := &PropertySchemaID{}

	err := propertySchemaID.UnmarshalText(text)

	assert.Nil(t, err)
	assert.Equal(t, "test#2.0.0/test", propertySchemaID.String())
}

func TestPropertySchemaIDToKeys(t *testing.T) {
	t.Parallel()
	testCases := []struct {
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
			input:    []PropertySchemaID{MustPropertySchemaID("test#2.0.0/test")},
			expected: []string{"test#2.0.0/test"},
		},
		{
			name: "multiple elements",
			input: []PropertySchemaID{
				MustPropertySchemaID("Test#1.0.0/test"),
				MustPropertySchemaID("Test#1.0.1/test"),
				MustPropertySchemaID("Test#1.0.2/test"),
			},
			expected: []string{
				"Test#1.0.0/test",
				"Test#1.0.1/test",
				"Test#1.0.2/test",
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			assert.Equal(tt, tc.expected, PropertySchemaIDToKeys(tc.input))
		})
	}

}

func TestPropertySchemaIDsFrom(t *testing.T) {
	t.Parallel()
	testCases := []struct {
		name     string
		input    []string
		expected struct {
			res []PropertySchemaID
			err error
		}
	}{
		{
			name:  "Empty slice",
			input: make([]string, 0),
			expected: struct {
				res []PropertySchemaID
				err error
			}{
				res: make([]PropertySchemaID, 0),
				err: nil,
			},
		},
		{
			name:  "1 element",
			input: []string{"Test#1.0.0/test"},
			expected: struct {
				res []PropertySchemaID
				err error
			}{
				res: []PropertySchemaID{MustPropertySchemaID("Test#1.0.0/test")},
				err: nil,
			},
		},
		{
			name: "multiple elements",
			input: []string{
				"Test#1.0.0/test",
				"Test#1.0.1/test",
				"Test#1.0.2/test",
			},
			expected: struct {
				res []PropertySchemaID
				err error
			}{
				res: []PropertySchemaID{
					MustPropertySchemaID("Test#1.0.0/test"),
					MustPropertySchemaID("Test#1.0.1/test"),
					MustPropertySchemaID("Test#1.0.2/test"),
				},
				err: nil,
			},
		},
		{
			name: "multiple elements",
			input: []string{
				"Test#1.0.0/test",
				"Test#1.0.1/test",
				"Test#1.0.2/test",
			},
			expected: struct {
				res []PropertySchemaID
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
				_, err := PropertySchemaIDsFrom(tc.input)
				assert.True(tt, errors.As(ErrInvalidID, &err))
			} else {
				res, err := PropertySchemaIDsFrom(tc.input)
				assert.Equal(tt, tc.expected.res, res)
				assert.Nil(tt, err)
			}

		})
	}
}
