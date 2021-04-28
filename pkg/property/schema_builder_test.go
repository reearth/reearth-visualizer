package property

import (
	"errors"
	"fmt"
	"testing"

	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestSchemaBuilder_Build(t *testing.T) {
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aaa").Schema(id.MustPropertySchemaID("xx/aa")).Fields([]*SchemaField{sf}).MustBuild()
	sg2 := NewSchemaGroup().ID("daa").Schema(id.MustPropertySchemaID("xx/aa")).Fields([]*SchemaField{sf}).MustBuild()
	testCases := []struct {
		Name     string
		Id       id.PropertySchemaID
		Version  int
		Groups   []*SchemaGroup
		Linkable LinkableFields
		Expected struct {
			Id       id.PropertySchemaID
			Version  int
			Groups   []*SchemaGroup
			Linkable LinkableFields
		}
		Err error
	}{
		{
			Name: "fail: invalid id",
			Err:  id.ErrInvalidID,
		},
		{
			Name:     "fail: invalid linkable field",
			Id:       id.MustPropertySchemaID("xx/aa"),
			Linkable: LinkableFields{LatLng: NewPointer(nil, nil, id.PropertySchemaFieldID("xx").Ref())},
			Err:      ErrInvalidPropertyLinkableField,
		},
		{
			Name:   "fail: duplicated field",
			Id:     id.MustPropertySchemaID("xx/aa"),
			Groups: []*SchemaGroup{sg, sg2},
			Err:    fmt.Errorf("%s: %s %s", ErrDuplicatedField, id.MustPropertySchemaID("xx/aa"), []id.PropertySchemaFieldID{"aa"}),
		},
		{
			Name:    "success",
			Id:      id.MustPropertySchemaID("xx/aa"),
			Groups:  []*SchemaGroup{sg},
			Version: 1,
			Expected: struct {
				Id       id.PropertySchemaID
				Version  int
				Groups   []*SchemaGroup
				Linkable LinkableFields
			}{Id: id.MustPropertySchemaID("xx/aa"), Version: 1, Groups: []*SchemaGroup{sg}},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, err := NewSchema().
				ID(tc.Id).
				Groups(tc.Groups).
				Version(tc.Version).
				LinkableFields(tc.Linkable).
				Build()
			if err == nil {
				assert.Equal(tt, tc.Expected.Linkable, res.LinkableFields())
				assert.Equal(tt, tc.Expected.Groups, res.Groups())
				assert.Equal(tt, tc.Expected.Id, res.ID())
				assert.Equal(tt, tc.Expected.Version, res.Version())
			} else {
				assert.True(tt, errors.As(tc.Err, &err))
			}
		})
	}
}

func TestSchemaBuilder_MustBuild(t *testing.T) {
	sf := NewSchemaField().ID("aa").Type(ValueTypeString).MustBuild()
	sg := NewSchemaGroup().ID("aaa").Schema(id.MustPropertySchemaID("xx/aa")).Fields([]*SchemaField{sf}).MustBuild()
	sg2 := NewSchemaGroup().ID("daa").Schema(id.MustPropertySchemaID("xx/aa")).Fields([]*SchemaField{sf}).MustBuild()
	testCases := []struct {
		Name     string
		Fails    bool
		Id       id.PropertySchemaID
		Version  int
		Groups   []*SchemaGroup
		Linkable LinkableFields
		Expected struct {
			Id       id.PropertySchemaID
			Version  int
			Groups   []*SchemaGroup
			Linkable LinkableFields
		}
	}{
		{
			Name:  "fail: invalid id",
			Fails: true,
		},
		{
			Name:     "fail: invalid linkable field",
			Id:       id.MustPropertySchemaID("xx/aa"),
			Linkable: LinkableFields{LatLng: NewPointer(nil, nil, id.PropertySchemaFieldID("xx").Ref())},
			Fails:    true,
		},
		{
			Name:   "fail: duplicated field",
			Id:     id.MustPropertySchemaID("xx/aa"),
			Groups: []*SchemaGroup{sg, sg2},
			Fails:  true,
		},
		{
			Name:    "success",
			Id:      id.MustPropertySchemaID("xx/aa"),
			Groups:  []*SchemaGroup{sg},
			Version: 1,
			Expected: struct {
				Id       id.PropertySchemaID
				Version  int
				Groups   []*SchemaGroup
				Linkable LinkableFields
			}{Id: id.MustPropertySchemaID("xx/aa"), Version: 1, Groups: []*SchemaGroup{sg}},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			var res *Schema
			if tc.Fails {
				defer func() {
					if r := recover(); r != nil {
						assert.Nil(tt, res)
					}
				}()
				res = NewSchema().
					ID(tc.Id).
					Groups(tc.Groups).
					Version(tc.Version).
					LinkableFields(tc.Linkable).
					MustBuild()
			} else {
				res = NewSchema().
					ID(tc.Id).
					Groups(tc.Groups).
					Version(tc.Version).
					LinkableFields(tc.Linkable).
					MustBuild()
				assert.Equal(tt, tc.Expected.Linkable, res.LinkableFields())
				assert.Equal(tt, tc.Expected.Groups, res.Groups())
				assert.Equal(tt, tc.Expected.Id, res.ID())
				assert.Equal(tt, tc.Expected.Version, res.Version())
			}
		})
	}
}
