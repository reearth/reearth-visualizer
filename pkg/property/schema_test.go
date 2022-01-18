package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSchema_Nil(t *testing.T) {
	var s *Schema
	assert.Nil(t, s.IDRef())
	assert.Nil(t, nil, s.Fields())
	assert.Nil(t, nil, s.Groups())
	assert.Equal(t, LinkableFields{}, s.LinkableFields())
}

func TestSchema_Field(t *testing.T) {
	sid := MustSchemaID("xx~1.0.0/aa")
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aaa").Schema(sid).Fields([]*SchemaField{sf}).MustBuild()

	tests := []struct {
		Name     string
		S        *Schema
		PTR      *Pointer
		Input    FieldID
		Expected *SchemaField
	}{
		{
			Name: "nil schema",
		},
		{
			Name:     "found",
			S:        NewSchema().ID(sid).Groups([]*SchemaGroup{sg}).MustBuild(),
			PTR:      NewPointer(nil, nil, sf.ID().Ref()),
			Input:    sf.ID(),
			Expected: sf,
		},
		{
			Name:  "not found",
			S:     NewSchema().ID(sid).Groups([]*SchemaGroup{sg}).MustBuild(),
			PTR:   NewPointer(nil, nil, FieldID("zz").Ref()),
			Input: FieldID("zz"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.S.Field(tc.Input))
			assert.Equal(t, tc.Expected, tc.S.FieldByPointer(tc.PTR))
		})
	}
}

func TestSchema_Group(t *testing.T) {
	sid := MustSchemaID("xx~1.0.0/aa")
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aaa").Schema(sid).Fields([]*SchemaField{sf}).MustBuild()

	tests := []struct {
		Name       string
		S          *Schema
		PTR        *Pointer
		Input      SchemaGroupID
		InputField FieldID
		Expected   *SchemaGroup
	}{
		{
			Name: "nil schema",
		},
		{
			Name:       "found",
			S:          NewSchema().ID(sid).Groups([]*SchemaGroup{sg}).MustBuild(),
			PTR:        NewPointer(sg.IDRef(), nil, sf.ID().Ref()),
			InputField: sf.ID(),
			Input:      sg.ID(),
			Expected:   sg,
		},
		{
			Name:  "not found",
			S:     NewSchema().ID(sid).Groups([]*SchemaGroup{sg}).MustBuild(),
			PTR:   NewPointer(nil, nil, FieldID("zz").Ref()),
			Input: SchemaGroupID("zz"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tc.Expected, tc.S.Group(tc.Input))
			assert.Equal(t, tc.Expected, tc.S.GroupByPointer(tc.PTR))
			assert.Equal(t, tc.Expected, tc.S.GroupByField(tc.InputField))
		})
	}
}

func TestSchema_DetectDuplicatedFields(t *testing.T) {
	sid := MustSchemaID("xx~1.0.0/aa")
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aaa").Schema(sid).Fields([]*SchemaField{sf}).MustBuild()

	tests := []struct {
		Name     string
		S        *Schema
		LF       LinkableFields
		Expected bool
	}{
		{
			Name: "nil schema",
		},
		{
			Name:     "invalid: URL",
			S:        NewSchema().ID(sid).Groups([]*SchemaGroup{sg}).MustBuild(),
			LF:       LinkableFields{URL: NewPointer(nil, nil, FieldID("xx").Ref())},
			Expected: false,
		},
		{
			Name:     "invalid: Lng",
			S:        NewSchema().ID(sid).Groups([]*SchemaGroup{sg}).MustBuild(),
			LF:       LinkableFields{LatLng: NewPointer(nil, nil, FieldID("xx").Ref())},
			Expected: false,
		},
		{
			Name:     "success",
			S:        NewSchema().ID(sid).Groups([]*SchemaGroup{sg}).MustBuild(),
			LF:       LinkableFields{},
			Expected: true,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res := tc.LF.Validate(tc.S)
			assert.Equal(t, tc.Expected, res)
		})
	}
}
