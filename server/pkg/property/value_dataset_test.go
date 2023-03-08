package property

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/dataset"
	"github.com/stretchr/testify/assert"
)

func TestNewValueAndDatasetValue(t *testing.T) {
	type args struct {
		ty ValueType
		d  *dataset.Value
		p  *Value
	}

	tests := []struct {
		name string
		args args
		want *ValueAndDatasetValue
	}{
		{
			name: "ok",
			args: args{
				ty: ValueTypeBool,
				d:  dataset.ValueTypeBool.MustBeValue(false),
				p:  ValueTypeBool.MustBeValue(true),
			},
			want: &ValueAndDatasetValue{
				t: ValueTypeBool,
				d: dataset.ValueTypeBool.ValueFrom(false),
				p: ValueTypeBool.MustBeValue(true),
			},
		},
		{
			name: "different types 1",
			args: args{
				ty: ValueTypeURL,
				d:  dataset.ValueTypeString.MustBeValue("https://reearth.io"),
				p:  nil,
			},
			want: &ValueAndDatasetValue{
				t: ValueTypeURL,
				d: dataset.ValueTypeURL.MustBeValue("https://reearth.io"),
				p: nil,
			},
		},
		{
			name: "different types 3",
			args: args{
				ty: ValueTypeBool,
				d:  dataset.ValueTypeBool.MustBeValue(false),
				p:  ValueTypeString.MustBeValue("true"),
			},
			want: &ValueAndDatasetValue{
				t: ValueTypeBool,
				d: dataset.ValueTypeBool.ValueFrom(false),
				p: ValueTypeBool.MustBeValue(true),
			},
		},
		{
			name: "different types 2",
			args: args{
				ty: ValueTypeBool,
				d:  dataset.ValueTypeString.ValueFrom("false"),
				p:  ValueTypeBool.MustBeValue(true),
			},
			want: &ValueAndDatasetValue{
				t: ValueTypeBool,
				d: dataset.ValueTypeBool.ValueFrom(false),
				p: ValueTypeBool.MustBeValue(true),
			},
		},
		{
			name: "invalid type",
			args: args{
				ty: ValueType("foobar"),
				d:  dataset.ValueTypeBool.ValueFrom(false),
				p:  ValueTypeBool.MustBeValue(true),
			},
			want: nil,
		},
		{
			name: "nil dataset value",
			args: args{
				ty: ValueTypeBool,
				d:  nil,
				p:  ValueTypeBool.MustBeValue(false),
			},
			want: &ValueAndDatasetValue{
				t: ValueTypeBool,
				d: nil,
				p: ValueTypeBool.MustBeValue(false),
			},
		},
		{
			name: "nil property value",
			args: args{
				ty: ValueTypeBool,
				d:  dataset.ValueTypeBool.MustBeValue(false),
				p:  nil,
			},
			want: &ValueAndDatasetValue{
				t: ValueTypeBool,
				d: dataset.ValueTypeBool.MustBeValue(false),
				p: nil,
			},
		},
		{
			name: "nil value",
			args: args{
				ty: ValueTypeBool,
				d:  nil,
				p:  nil,
			},
			want: &ValueAndDatasetValue{
				t: ValueTypeBool,
				d: nil,
				p: nil,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, NewValueAndDatasetValue(tt.args.ty, tt.args.d, tt.args.p))
		})
	}
}

func TestValueAndDatasetValue_Type(t *testing.T) {
	tests := []struct {
		name   string
		target *ValueAndDatasetValue
		want   ValueType
	}{
		{
			name:   "ok",
			target: &ValueAndDatasetValue{t: ValueTypeString},
			want:   ValueTypeString,
		},
		{
			name:   "empty",
			target: &ValueAndDatasetValue{},
			want:   ValueTypeUnknown,
		},
		{
			name:   "nil",
			target: nil,
			want:   ValueTypeUnknown,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Type())
		})
	}
}

func TestValueAndDatasetValue_DatasetValuee(t *testing.T) {
	tests := []struct {
		name   string
		target *ValueAndDatasetValue
		want   *dataset.Value
	}{
		{
			name: "dataset only",
			target: &ValueAndDatasetValue{
				t: ValueTypeString,
				d: dataset.ValueTypeString.ValueFrom("foo"),
			},
			want: dataset.ValueTypeString.ValueFrom("foo"),
		},
		{
			name: "property only",
			target: &ValueAndDatasetValue{
				t: ValueTypeString,
				p: ValueTypeString.ValueFrom("bar"),
			},
			want: nil,
		},
		{
			name: "dataset and property",
			target: &ValueAndDatasetValue{
				t: ValueTypeString,
				d: dataset.ValueTypeString.ValueFrom("foo"),
				p: ValueTypeString.ValueFrom("bar"),
			},
			want: dataset.ValueTypeString.ValueFrom("foo"),
		},
		{
			name:   "empty",
			target: &ValueAndDatasetValue{},
			want:   nil,
		},
		{
			name:   "nil",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.DatasetValue())
		})
	}
}

func TestValueAndDatasetValue_PropertyValue(t *testing.T) {
	tests := []struct {
		name   string
		target *ValueAndDatasetValue
		want   *Value
	}{
		{
			name: "dataset only",
			target: &ValueAndDatasetValue{
				t: ValueTypeString,
				d: dataset.ValueTypeString.ValueFrom("foo"),
			},
			want: nil,
		},
		{
			name: "property only",
			target: &ValueAndDatasetValue{
				t: ValueTypeString,
				p: ValueTypeString.ValueFrom("bar"),
			},
			want: ValueTypeString.ValueFrom("bar"),
		},
		{
			name: "dataset and property",
			target: &ValueAndDatasetValue{
				t: ValueTypeString,
				d: dataset.ValueTypeString.ValueFrom("foo"),
				p: ValueTypeString.ValueFrom("bar"),
			},
			want: ValueTypeString.ValueFrom("bar"),
		},
		{
			name:   "empty",
			target: &ValueAndDatasetValue{},
			want:   nil,
		},
		{
			name:   "nil",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.PropertyValue())
		})
	}
}

func TestValueAndDatasetValue_Value(t *testing.T) {
	tests := []struct {
		name   string
		target *ValueAndDatasetValue
		want   *Value
	}{
		{
			name: "dataset only",
			target: &ValueAndDatasetValue{
				t: ValueTypeString,
				d: dataset.ValueTypeString.MustBeValue("foo"),
			},
			want: ValueTypeString.MustBeValue("foo"),
		},
		{
			name: "property only",
			target: &ValueAndDatasetValue{
				t: ValueTypeString,
				p: ValueTypeString.MustBeValue("bar"),
			},
			want: ValueTypeString.MustBeValue("bar"),
		},
		{
			name: "dataset and property",
			target: &ValueAndDatasetValue{
				t: ValueTypeString,
				d: dataset.ValueTypeString.MustBeValue("foo"),
				p: ValueTypeString.MustBeValue("bar"),
			},
			want: ValueTypeString.MustBeValue("bar"),
		},
		{
			name:   "empty",
			target: &ValueAndDatasetValue{},
			want:   nil,
		},
		{
			name:   "nil",
			target: nil,
			want:   nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.target.Value())
		})
	}
}
