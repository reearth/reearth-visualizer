package property

import (
	"errors"
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
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
	l := NewLink(id.NewDatasetID(), id.NewDatasetSchemaID(), id.NewDatasetSchemaFieldID())
	ls := NewLinks([]*Link{l})
	b := NewField(p).Link(ls).MustBuild()
	assert.Equal(t, ls, b.Links())
}

func TestFieldBuilder_Build(t *testing.T) {
	l := NewLink(id.NewDatasetID(), id.NewDatasetSchemaID(), id.NewDatasetSchemaFieldID())
	testCases := []struct {
		Name     string
		Links    *Links
		Value    *Value
		SF       *SchemaField
		Expected struct {
			PType ValueType
			Links *Links
			Value *Value
		}
		Err error
	}{
		{
			Name: "fail invalid property id",
			Expected: struct {
				PType ValueType
				Links *Links
				Value *Value
			}{},
			Err: id.ErrInvalidID,
		},
		{
			Name:  "fail invalid property type",
			SF:    NewSchemaField().ID("A").Type(ValueTypeBool).MustBuild(),
			Value: ValueTypeString.ValueFrom("vvv"),
			Expected: struct {
				PType ValueType
				Links *Links
				Value *Value
			}{},
			Err: ErrInvalidPropertyType,
		},
		{
			Name:  "success",
			SF:    NewSchemaField().ID("A").Type(ValueTypeString).MustBuild(),
			Links: NewLinks([]*Link{l}),
			Value: ValueTypeString.ValueFrom("vvv"),
			Expected: struct {
				PType ValueType
				Links *Links
				Value *Value
			}{
				PType: ValueTypeString,
				Links: NewLinks([]*Link{l}),
				Value: ValueTypeString.ValueFrom("vvv"),
			},
			Err: nil,
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, err := NewField(tc.SF).Value(OptionalValueFrom(tc.Value)).Link(tc.Links).Build()
			if err == nil {
				assert.Equal(tt, tc.Expected.Links, res.Links())
				assert.Equal(tt, tc.Expected.PType, res.Type())
				assert.Equal(tt, tc.Expected.Value, res.Value())
			} else {
				assert.True(tt, errors.As(tc.Err, &err))
			}
		})
	}
}

func TestFieldBuilder_MustBuild(t *testing.T) {
	l := NewLink(id.NewDatasetID(), id.NewDatasetSchemaID(), id.NewDatasetSchemaFieldID())
	testCases := []struct {
		Name     string
		Fails    bool
		Links    *Links
		Value    *Value
		SF       *SchemaField
		Expected struct {
			PType ValueType
			Links *Links
			Value *Value
		}
	}{
		{
			Name:  "fail invalid property id",
			Fails: true,
			Expected: struct {
				PType ValueType
				Links *Links
				Value *Value
			}{},
		},
		{
			Name:  "fail invalid property type",
			SF:    NewSchemaField().ID("A").Type(ValueTypeBool).MustBuild(),
			Value: ValueTypeString.ValueFrom("vvv"),
			Fails: true,
			Expected: struct {
				PType ValueType
				Links *Links
				Value *Value
			}{},
		},
		{
			Name:  "success",
			SF:    NewSchemaField().ID("A").Type(ValueTypeString).MustBuild(),
			Links: NewLinks([]*Link{l}),
			Value: ValueTypeString.ValueFrom("vvv"),
			Expected: struct {
				PType ValueType
				Links *Links
				Value *Value
			}{
				PType: ValueTypeString,
				Links: NewLinks([]*Link{l}),
				Value: ValueTypeString.ValueFrom("vvv"),
			},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			var res *Field
			if tc.Fails {
				defer func() {
					if r := recover(); r != nil {
						assert.Nil(tt, res)
					}
				}()
				res = NewField(tc.SF).Value(OptionalValueFrom(tc.Value)).Link(tc.Links).MustBuild()
			} else {
				res = NewField(tc.SF).Value(OptionalValueFrom(tc.Value)).Link(tc.Links).MustBuild()
				assert.Equal(tt, tc.Expected.Links, res.Links())
				assert.Equal(tt, tc.Expected.PType, res.Type())
				assert.Equal(tt, tc.Expected.Value, res.Value())
			}
		})
	}
}

func TestNewFieldUnsafe(t *testing.T) {
	p := NewFieldUnsafe().Build()
	assert.NotNil(t, p)
}

func TestFieldUnsafeBuilder_Build(t *testing.T) {
	l := NewLink(id.NewDatasetID(), id.NewDatasetSchemaID(), id.NewDatasetSchemaFieldID())
	testCases := []struct {
		Name     string
		Links    *Links
		Value    *Value
		Type     ValueType
		Field    id.PropertySchemaFieldID
		Expected struct {
			PType ValueType
			Field id.PropertySchemaFieldID
			Links *Links
			Value *Value
		}
	}{
		{
			Name:  "success",
			Links: NewLinks([]*Link{l}),
			Value: ValueTypeString.ValueFrom("vvv"),
			Type:  ValueTypeString,
			Field: "a",
			Expected: struct {
				PType ValueType
				Field id.PropertySchemaFieldID
				Links *Links
				Value *Value
			}{
				PType: ValueTypeString,
				Field: "a",
				Links: NewLinks([]*Link{l}),
				Value: ValueTypeString.ValueFrom("vvv"),
			},
		},
		{
			Name:  "nil value",
			Links: NewLinks([]*Link{l}),
			Value: nil,
			Type:  ValueTypeString,
			Field: "a",
			Expected: struct {
				PType ValueType
				Field id.PropertySchemaFieldID
				Links *Links
				Value *Value
			}{
				PType: ValueTypeString,
				Field: "a",
				Links: NewLinks([]*Link{l}),
				Value: nil,
			},
		},
	}
	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res := NewFieldUnsafe().ValueUnsafe(NewOptionalValue(tc.Type, tc.Value)).LinksUnsafe(tc.Links).FieldUnsafe(tc.Field).Build()
			assert.Equal(tt, tc.Expected.Links, res.Links())
			assert.Equal(tt, tc.Expected.PType, res.Type())
			assert.Equal(tt, tc.Expected.Value, res.Value())
		})
	}
}
