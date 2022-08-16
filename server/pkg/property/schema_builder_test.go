package property

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSchemaBuilder_Build(t *testing.T) {
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aaa").Fields([]*SchemaField{sf}).MustBuild()

	type args struct {
		ID       SchemaID
		Version  int
		Groups   *SchemaGroupList
		Linkable LinkableFields
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Schema
		Err      error
	}{
		{
			Name: "fail: invalid id",
			Err:  ErrInvalidID,
		},
		{
			Name: "fail: invalid linkable field",
			Args: args{
				ID:       MustSchemaID("xx~1.0.0/aa"),
				Linkable: LinkableFields{LatLng: &SchemaFieldPointer{Field: FieldID("xx")}},
			},
			Err: ErrInvalidPropertyLinkableField,
		},
		{
			Name: "success",
			Args: args{
				ID:      MustSchemaID("xx~1.0.0/aa"),
				Groups:  NewSchemaGroupList([]*SchemaGroup{sg}),
				Version: 1,
			},
			Expected: &Schema{
				id:      MustSchemaID("xx~1.0.0/aa"),
				version: 1,
				groups:  NewSchemaGroupList([]*SchemaGroup{sg}),
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.Name, func(t *testing.T) {
			t.Parallel()
			res, err := NewSchema().
				ID(tt.Args.ID).
				Groups(tt.Args.Groups).
				Version(tt.Args.Version).
				LinkableFields(tt.Args.Linkable).
				Build()

			if tt.Err == nil {
				assert.Equal(t, tt.Expected, res)
			} else {
				assert.Equal(t, tt.Err, err)
			}
		})
	}
}

func TestSchemaBuilder_MustBuild(t *testing.T) {
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aaa").Fields([]*SchemaField{sf}).MustBuild()

	type args struct {
		ID       SchemaID
		Version  int
		Groups   *SchemaGroupList
		Linkable LinkableFields
	}

	tests := []struct {
		Name     string
		Args     args
		Expected *Schema
		Err      string
	}{
		{
			Name: "fail: invalid id",
			Err:  ErrInvalidID.Error(),
		},
		{
			Name: "fail: invalid linkable field",
			Args: args{
				ID:       MustSchemaID("xx~1.0.0/aa"),
				Linkable: LinkableFields{LatLng: &SchemaFieldPointer{Field: FieldID("xx")}},
			},
			Err: ErrInvalidPropertyLinkableField.Error(),
		},
		{
			Name: "success",
			Args: args{
				ID:      MustSchemaID("xx~1.0.0/aa"),
				Groups:  NewSchemaGroupList([]*SchemaGroup{sg}),
				Version: 1,
			},
			Expected: &Schema{
				id:      MustSchemaID("xx~1.0.0/aa"),
				version: 1,
				groups:  NewSchemaGroupList([]*SchemaGroup{sg}),
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()

			build := func() *Schema {
				t.Helper()
				return NewSchema().
					ID(tc.Args.ID).
					Groups(tc.Args.Groups).
					Version(tc.Args.Version).
					LinkableFields(tc.Args.Linkable).
					MustBuild()
			}

			if tc.Err != "" {
				assert.PanicsWithError(t, tc.Err, func() { _ = build() })
			} else {
				assert.Equal(t, tc.Expected, build())
			}
		})
	}
}
