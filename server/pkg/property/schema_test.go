package property

import (
	"testing"

	"github.com/reearth/reearth/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

var (
	testSchema1 = NewSchema().ID(id.MustPropertySchemaID("xx~1.0.0/aa")).Groups(
		NewSchemaGroupList([]*SchemaGroup{testSchemaGroup1, testSchemaGroup2}),
	).MustBuild()
)

func TestLinkableField_Validate(t *testing.T) {
	sid := id.MustPropertySchemaID("xx~1.0.0/aa")
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aaa").Fields([]*SchemaField{sf}).MustBuild()

	tests := []struct {
		Name     string
		S        *Schema
		LF       LinkableFields
		Expected bool
	}{
		{
			Name:     "nil schema",
			S:        nil,
			LF:       LinkableFields{},
			Expected: false,
		},
		{
			Name: "invalid: URL",
			S:    NewSchema().ID(sid).Groups(NewSchemaGroupList([]*SchemaGroup{sg})).MustBuild(),
			LF: LinkableFields{
				URL: &SchemaFieldPointer{
					Field: FieldID("xx"),
				},
			},
			Expected: false,
		},
		{
			Name: "invalid: Lng",
			S:    NewSchema().ID(sid).Groups(NewSchemaGroupList([]*SchemaGroup{sg})).MustBuild(),
			LF: LinkableFields{
				LatLng: &SchemaFieldPointer{
					Field: FieldID("xx"),
				},
			},
			Expected: false,
		},
		{
			Name:     "empty",
			S:        NewSchema().ID(sid).Groups(NewSchemaGroupList([]*SchemaGroup{sg})).MustBuild(),
			LF:       LinkableFields{},
			Expected: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res := tt.LF.Validate(tt.S)
			assert.Equal(t, tt.Expected, res)
		})
	}
}
