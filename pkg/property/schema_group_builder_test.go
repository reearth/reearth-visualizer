package property

import (
	"errors"
	"testing"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/reearth/reearth-backend/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestSchemaGroupBuilder_Build(t *testing.T) {
	sid := id.MustPropertySchemaID("xx~1.0.0/aa")
	gid := id.PropertySchemaFieldID("xx")
	sf := NewSchemaField().ID("ff").Type(ValueTypeString).MustBuild()
	testCases := []struct {
		Name          string
		Id            id.PropertySchemaFieldID
		Sid           id.PropertySchemaID
		Fields        []*SchemaField
		List          bool
		IsAvailableIf *Condition
		Title         i18n.String
		Expected      struct {
			Id            id.PropertySchemaFieldID
			Sid           id.PropertySchemaID
			Fields        []*SchemaField
			List          bool
			IsAvailableIf *Condition
			Title         i18n.String
		}
		Err error
	}{
		{
			Name: "fail: invalid id",
			Err:  id.ErrInvalidID,
		},
		{
			Name:   "success",
			Id:     gid,
			Sid:    sid,
			Fields: []*SchemaField{sf, nil, sf},
			List:   true,
			IsAvailableIf: &Condition{
				Field: "ff",
				Value: ValueTypeString.ValueFromUnsafe("abc"),
			},
			Title: i18n.StringFrom("tt"),
			Expected: struct {
				Id            id.PropertySchemaFieldID
				Sid           id.PropertySchemaID
				Fields        []*SchemaField
				List          bool
				IsAvailableIf *Condition
				Title         i18n.String
			}{
				Id:     gid,
				Sid:    sid,
				Fields: []*SchemaField{sf},
				List:   true,
				IsAvailableIf: &Condition{
					Field: "ff",
					Value: ValueTypeString.ValueFromUnsafe("abc"),
				},
				Title: i18n.StringFrom("tt"),
			},
		},
		{
			Name:   "success: nil name",
			Id:     gid,
			Sid:    sid,
			Fields: []*SchemaField{sf},
			List:   true,
			IsAvailableIf: &Condition{
				Field: "ff",
				Value: ValueTypeString.ValueFromUnsafe("abc"),
			},
			Title: i18n.StringFrom("tt"),
			Expected: struct {
				Id            id.PropertySchemaFieldID
				Sid           id.PropertySchemaID
				Fields        []*SchemaField
				List          bool
				IsAvailableIf *Condition
				Title         i18n.String
			}{
				Id:     gid,
				Sid:    sid,
				Fields: []*SchemaField{sf},
				List:   true,
				IsAvailableIf: &Condition{
					Field: "ff",
					Value: ValueTypeString.ValueFromUnsafe("abc"),
				},
				Title: i18n.StringFrom("tt"),
			},
		},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.Name, func(tt *testing.T) {
			tt.Parallel()
			res, err := NewSchemaGroup().
				ID(tc.Id).
				Schema(tc.Sid).
				Fields(tc.Fields).
				IsList(tc.List).
				Title(tc.Title).
				IsAvailableIf(tc.IsAvailableIf).
				Build()
			if err == nil {
				assert.Equal(tt, tc.Expected.IsAvailableIf, res.IsAvailableIf())
				assert.Equal(tt, tc.Expected.Sid, res.Schema())
				assert.Equal(tt, tc.Expected.Id, res.ID())
				assert.Equal(tt, tc.Expected.Title, res.Title())
				assert.Equal(tt, tc.Expected.List, res.IsList())
				assert.Equal(tt, tc.Expected.Fields, res.Fields())
			} else {
				assert.True(tt, errors.As(tc.Err, &err))
			}
		})
	}
}
