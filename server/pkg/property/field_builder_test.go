package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFieldBuilder_Value(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	v := ValueTypeString.ValueFrom("vvv")
	b := FieldFrom(p).Value(OptionalValueFrom(v)).Build()
	assert.Equal(t, v, b.Value())
}

func TestFieldBuilder_Link(t *testing.T) {
	p := NewSchemaField().ID("A").Type(ValueTypeString).MustBuild()
	l := NewLink(NewDatasetID(), NewDatasetSchemaID(), NewDatasetFieldID())
	ls := NewLinks([]*Link{l})
	b := FieldFrom(p).Links(ls).Build()
	assert.Equal(t, ls, b.Links())
}

func TestFieldBuilder_Build(t *testing.T) {
	l := NewLink(NewDatasetID(), NewDatasetSchemaID(), NewDatasetFieldID())

	type args struct {
		Links *Links
		Field FieldID
		Value *OptionalValue
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Field
	}{
		{
			Name: "fail invalid property id",
		},
		{
			Name: "success",
			Args: args{
				Field: "A",
				Links: NewLinks([]*Link{l}),
				Value: OptionalValueFrom(ValueTypeString.ValueFrom("vvv")),
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
			res := NewField(tt.Args.Field).
				Value(tt.Args.Value).
				Links(tt.Args.Links).
				Build()
			assert.Equal(t, tt.Expected, res)
		})
	}
}

func TestFieldBuilder_MustBuild(t *testing.T) {
	l := NewLink(NewDatasetID(), NewDatasetSchemaID(), NewDatasetFieldID())

	type args struct {
		Links *Links
		Field FieldID
		Value *OptionalValue
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Field
	}{
		{
			Name: "fail invalid property id",
		},
		{
			Name: "success",
			Args: args{
				Field: "A",
				Links: NewLinks([]*Link{l}),
				Value: OptionalValueFrom(ValueTypeString.ValueFrom("vvv")),
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
				return NewField(tt.Args.Field).
					Value(tt.Args.Value).
					Links(tt.Args.Links).
					MustBuild()
			}

			if tt.Expected == nil {
				assert.Panics(t, func() { _ = build() })
			} else {
				assert.Equal(t, tt.Expected, build())
			}
		})
	}
}
