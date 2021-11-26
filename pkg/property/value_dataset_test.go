package property

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/dataset"
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
				d:  dataset.ValueTypeBool.ValueFrom(false),
				p:  ValueTypeBool.ValueFrom(true),
			},
			want: &ValueAndDatasetValue{
				t: ValueTypeBool,
				d: dataset.ValueTypeBool.ValueFrom(false),
				p: ValueTypeBool.ValueFrom(true),
			},
		},
		{
			name: "invalid type",
			args: args{
				ty: ValueType("foobar"),
				d:  dataset.ValueTypeBool.ValueFrom(false),
				p:  ValueTypeBool.ValueFrom(true),
			},
			want: nil,
		},
		{
			name: "invalid dataset value",
			args: args{
				ty: ValueTypeBool,
				d:  dataset.ValueTypeString.ValueFrom("false"),
				p:  ValueTypeBool.ValueFrom(true),
			},
			want: &ValueAndDatasetValue{
				t: ValueTypeBool,
				d: nil,
				p: ValueTypeBool.ValueFrom(true),
			},
		},
		{
			name: "invalid property value",
			args: args{
				ty: ValueTypeBool,
				d:  dataset.ValueTypeBool.ValueFrom(false),
				p:  ValueTypeString.ValueFrom("true"),
			},
			want: &ValueAndDatasetValue{
				t: ValueTypeBool,
				d: dataset.ValueTypeBool.ValueFrom(false),
				p: nil,
			},
		},
		{
			name: "nil dataset value",
			args: args{
				ty: ValueTypeBool,
				d:  nil,
				p:  ValueTypeBool.ValueFrom(false),
			},
			want: &ValueAndDatasetValue{
				t: ValueTypeBool,
				d: nil,
				p: ValueTypeBool.ValueFrom(false),
			},
		},
		{
			name: "nil property value",
			args: args{
				ty: ValueTypeBool,
				d:  dataset.ValueTypeBool.ValueFrom(false),
				p:  nil,
			},
			want: &ValueAndDatasetValue{
				t: ValueTypeBool,
				d: dataset.ValueTypeBool.ValueFrom(false),
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
		t.Run(tt.name, func(t *testing.T) {
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
		t.Run(tt.name, func(t *testing.T) {
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
		t.Run(tt.name, func(t *testing.T) {
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
		t.Run(tt.name, func(t *testing.T) {
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
				d: dataset.ValueTypeString.ValueFrom("foo"),
			},
			want: ValueTypeString.ValueFrom("foo"),
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
			want: ValueTypeString.ValueFrom("foo"),
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
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.target.Value())
		})
	}
}
