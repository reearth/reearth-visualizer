package id

import (
	"strings"
	"testing"

	"github.com/oklog/ulid"
	"github.com/stretchr/testify/assert"
)

func TestID_New(t *testing.T) {
	id := New()
	assert.NotNil(t, id)
	ulID, err := ulid.Parse(id.String())
	assert.NotNil(t, ulID)
	assert.Nil(t, err)
}

func TestID_NewAllID(t *testing.T) {
	tests := []struct {
		name     string
		input    int
		expected int
	}{
		{
			name:     "success: Zero ID",
			input:    0,
			expected: 0,
		},
		{
			name:     "success: One ID",
			input:    1,
			expected: 1,
		},
		{
			name:     "success: Multiple IDs",
			input:    5,
			expected: 5,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := NewAllID(tt.input)
			assert.Equal(t, tt.expected, len(result))

			for _, id := range result {
				assert.NotNil(t, id)
				ulID, err := ulid.Parse(id.String())
				assert.NotNil(t, ulID)
				assert.Nil(t, err)
			}
		})
	}
}

func TestID_NewIDWith(t *testing.T) {
	tests := []struct {
		name  string
		input string
	}{
		{
			name:  "Fail:Not valid string",
			input: "testMustFail",
		},
		{
			name:  "Fail:Not valid string",
			input: "",
		},
		{
			name:  "success:valid string",
			input: "01f2r7kg1fvvffp0gmexgy5hxy",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result, err := NewIDWith(tt.input)
			exResult, exErr := FromID(tt.input)
			assert.Equal(t, exResult, result)
			assert.Equal(t, exErr, err)
		})
	}
}

func TestID_FromID(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected struct {
			result ID
			err    error
		}
	}{
		{
			name:  "Fail:Not valid string",
			input: "testMustFail",
			expected: struct {
				result ID
				err    error
			}{
				ID{},
				ErrInvalidID,
			},
		},
		{
			name:  "Fail:Not valid string",
			input: "",
			expected: struct {
				result ID
				err    error
			}{
				ID{},
				ErrInvalidID,
			},
		},
		{
			name:  "success:valid string",
			input: "01f2r7kg1fvvffp0gmexgy5hxy",
			expected: struct {
				result ID
				err    error
			}{
				ID{ulid.MustParse("01f2r7kg1fvvffp0gmexgy5hxy")},
				nil,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result, err := FromID(tt.input)
			assert.Equal(t, tt.expected.result, result)
			if tt.expected.err != nil {
				assert.Equal(t, tt.expected.err, err)
			}
		})
	}
}

func TestID_FromIDRef(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected *ID
	}{
		{
			name:     "Fail:Not valid string",
			input:    "testMustFail",
			expected: nil,
		},
		{
			name:     "Fail:Not valid string",
			input:    "",
			expected: nil,
		},
		{
			name:     "success:valid string",
			input:    "01f2r7kg1fvvffp0gmexgy5hxy",
			expected: &ID{ulid.MustParse("01f2r7kg1fvvffp0gmexgy5hxy")},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := FromIDRef(&tt.input)
			assert.Equal(t, tt.expected, result)
			if tt.expected != nil {
				assert.Equal(t, tt.expected, result)
			}
		})
	}
}

func TestID_MustBeID(t *testing.T) {
	tests := []struct {
		name        string
		input       string
		shouldPanic bool
		expected    ID
	}{
		{
			name:        "Fail:Not valid string",
			input:       "testMustFail",
			shouldPanic: true,
		},
		{
			name:        "Fail:Not valid string",
			input:       "",
			shouldPanic: true,
		},
		{
			name:        "success:valid string",
			input:       "01f2r7kg1fvvffp0gmexgy5hxy",
			shouldPanic: false,
			expected:    ID{ulid.MustParse("01f2r7kg1fvvffp0gmexgy5hxy")},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if tt.shouldPanic {
				assert.Panics(t, func() { MustBeID(tt.input) })
				return
			}
			result := MustBeID(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestID_Copy(t *testing.T) {
	id := New()
	id2 := id.Copy()
	assert.Equal(t, id.id, id2.id)
	assert.NotSame(t, id.id, id2.id)
}

func TestID_Timestamp(t *testing.T) {
	id := New()
	assert.Equal(t, ulid.Time(id.id.Time()), id.Timestamp())
}

func TestID_String(t *testing.T) {
	id := MustBeID("01f2r7kg1fvvffp0gmexgy5hxy")
	assert.Equal(t, id.String(), "01f2r7kg1fvvffp0gmexgy5hxy")
}

func TestID_GoString(t *testing.T) {
	id := MustBeID("01f2r7kg1fvvffp0gmexgy5hxy")
	assert.Equal(t, id.GoString(), "id.ID(01f2r7kg1fvvffp0gmexgy5hxy)")
}

func TestID_IsNil(t *testing.T) {
	id := ID{}
	assert.True(t, id.IsNil())
	id = New()
	assert.False(t, id.IsNil())
}

func TestID_Compare(t *testing.T) {
	id1 := New()
	id2 := New()
	assert.Less(t, id1.Compare(id2), 0)
	assert.Greater(t, id2.Compare(id1), 0)
	assert.Equal(t, id1.Compare(id1), 0)
	assert.Equal(t, id2.Compare(id2), 0)
}

func TestID_Equal(t *testing.T) {
	id1 := New()
	id2 := id1.Copy()
	assert.True(t, id1.Equal(id2))
	assert.False(t, id1.Equal(New()))
}

func TestID_IsEmpty(t *testing.T) {
	id := ID{}
	assert.True(t, id.IsEmpty())
	id = New()
	assert.False(t, id.IsEmpty())
}

func TestID_generateID(t *testing.T) {
	id := generateID()
	assert.NotNil(t, id)
}

func TestID_generateAllID(t *testing.T) {
	tests := []struct {
		name     string
		input    int
		expected int
	}{
		{
			name:     "success: Zero ID",
			input:    0,
			expected: 0,
		},
		{
			name:     "success: One ID",
			input:    1,
			expected: 1,
		},
		{
			name:     "success: Multiple IDs",
			input:    5,
			expected: 5,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := generateAllID(tt.input)
			assert.Equal(t, tt.expected, len(result))
			for _, id := range result {
				assert.NotNil(t, id)
				ulID, err := ulid.Parse(id.String())
				assert.NotNil(t, ulID)
				assert.Nil(t, err)
			}
		})
	}
}

func TestID_parseID(t *testing.T) {
	_, err := parseID("")
	assert.Error(t, err)

	id, err := parseID("01f2r7kg1fvvffp0gmexgy5hxy")
	assert.Nil(t, err)
	assert.Equal(t, strings.ToLower(id.String()), "01f2r7kg1fvvffp0gmexgy5hxy")
}

func TestID_includeUpperCase(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected bool
	}{
		{
			name:     "All small letters",
			input:    "abcd",
			expected: false,
		},
		{
			name:     "Contains Upper case",
			input:    "Abcd",
			expected: true,
		},
		{
			name:     "Contains Upper case",
			input:    "abcD",
			expected: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := includeUpperCase(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}
