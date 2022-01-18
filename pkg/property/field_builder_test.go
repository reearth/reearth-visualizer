package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFieldBuilder_Value(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	b := NewField(p).Value(OptionalValueFrom(v)).MustBuild()
	assert.Equal(t, v, b.Value())
}

func TestFieldBuilder_Link(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	l := NewLink(NewDatasetID(), NewDatasetSchemaID(), NewDatasetFieldID())
	ls := NewLinks([]*Link{l})
	b := NewField(p).Link(ls).MustBuild()
	assert.Equal(t, ls, b.Links())
}

func TestFieldBuilder_Build(t *testing.T) {
	l := NewLink(NewDatasetID(), NewDatasetSchemaID(), NewDatasetFieldID())

	type args struct {
		Links *Links
		Value *Value
		Field *SchemaField
		Type  ValueType
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Field
		Err      error
	}{
		{
			Name: "fail invalid property id",
			Err:  ErrInvalidID,
		},
		{
			Name: "fail invalid property value",
			Args: args{
				Field: NewSchemaField().ID("A").Type(ValueTypeBool).MustBuild(),
				Type:  ValueTypeString,
				Value: ValueTypeString.ValueFrom("vvv"),
			},
			Err: ErrInvalidPropertyValue,
		},
		{
			Name: "success",
			Args: args{
				Field: NewSchemaField().ID("A").Type(ValueTypeString).MustBuild(),
				Links: NewLinks([]*Link{l}),
				Type:  ValueTypeString,
				Value: ValueTypeString.ValueFrom("vvv"),
			},
			Expected: &Field{
				field: "A",
				links: NewLinks([]*Link{l}),
				v:     OptionalValueFrom(ValueTypeString.ValueFrom("vvv")),
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res, err := NewField(tt.Args.Field).
				Value(NewOptionalValue(tt.Args.Type, tt.Args.Value)).
				Link(tt.Args.Links).Build()
			if tt.Err == nil {
				assert.Equal(t, tt.Expected, res)
			} else {
				assert.Equal(t, tt.Err, err)
			}
		})
	}
}

func TestFieldBuilder_MustBuild(t *testing.T) {
	l := NewLink(NewDatasetID(), NewDatasetSchemaID(), NewDatasetFieldID())

	type args struct {
		Links *Links
		Value *Value
		Field *SchemaField
		Type  ValueType
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Field
		Err      string
	}{
		{
			Name: "fail invalid property id",
			Err:  ErrInvalidID.Error(),
		},
		{
			Name: "fail invalid property value",
			Args: args{
				Field: NewSchemaField().ID("A").Type(ValueTypeBool).MustBuild(),
				Type:  ValueTypeString,
				Value: ValueTypeString.ValueFrom("vvv"),
			},
			Err: ErrInvalidPropertyValue.Error(),
		},
		{
			Name: "success",
			Args: args{
				Field: NewSchemaField().ID("A").Type(ValueTypeString).MustBuild(),
				Links: NewLinks([]*Link{l}),
				Type:  ValueTypeString,
				Value: ValueTypeString.ValueFrom("vvv"),
			},
			Expected: &Field{
				field: "A",
				links: NewLinks([]*Link{l}),
				v:     OptionalValueFrom(ValueTypeString.ValueFrom("vvv")),
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()

			build := func() *Field {
				t.Helper()
				return NewField(tt.Args.Field).
					Value(NewOptionalValue(tt.Args.Type, tt.Args.Value)).
					Link(tt.Args.Links).
					MustBuild()
			}

			if tt.Err != "" {
				assert.PanicsWithError(t, tt.Err, func() { _ = build() })
			} else {
				assert.Equal(t, tt.Expected, build())
			}
		})
	}
}

func TestNewFieldUnsafe(t *testing.T) {
	p := NewFieldUnsafe().Build()
	assert.NotNil(t, p)
}

func TestFieldUnsafeBuilder_Build(t *testing.T) {
	l := NewLink(NewDatasetID(), NewDatasetSchemaID(), NewDatasetFieldID())

	type args struct {
		Links *Links
		Value *Value
		Field FieldID
		Type  ValueType
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Field
	}{
		{
			Name: "success",
			Args: args{
				Links: NewLinks([]*Link{l}),
				Value: ValueTypeString.ValueFrom("vvv"),
				Type:  ValueTypeString,
				Field: "a",
			},
			Expected: &Field{
				field: "a",
				links: NewLinks([]*Link{l}),
				v:     OptionalValueFrom(ValueTypeString.ValueFrom("vvv")),
			},
		},
		{
			Name: "nil value",
			Args: args{
				Links: NewLinks([]*Link{l}),
				Value: nil,
				Type:  ValueTypeString,
				Field: "a",
			},
			Expected: &Field{
				field: "a",
				links: NewLinks([]*Link{l}),
				v:     NewOptionalValue(ValueTypeString, nil),
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := NewFieldUnsafe().
				ValueUnsafe(NewOptionalValue(tt.Args.Type, tt.Args.Value)).
				LinksUnsafe(tt.Args.Links).
				FieldUnsafe(tt.Args.Field).
				Build()
			assert.Equal(t, tt.Expected, res)
		})
	}
}
