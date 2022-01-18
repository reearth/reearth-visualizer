package property

import (
	"testing"

	"github.com/reearth/reearth-backend/pkg/i18n"
	"github.com/stretchr/testify/assert"
)

func TestSchemaGroupBuilder_Build(t *testing.T) {
	sid := MustSchemaID("xx~1.0.0/aa")
	gid := SchemaGroupID("xx")
	sf := NewSchemaField().ID("ff").Type(ValueTypeString).MustBuild()

	type expected struct {
		ID            SchemaGroupID
		Sid           SchemaID
		Fields        []*SchemaField
		List          bool
		IsAvailableIf *Condition
		Title         i18n.String
	}

	tests := []struct {
		Name          string
		ID            SchemaGroupID
		Sid           SchemaID
		Fields        []*SchemaField
		List          bool
		IsAvailableIf *Condition
		Title         i18n.String
		Expected      expected
		Err           error
	}{
		{
			Name: "fail: invalid id",
			Err:  ErrInvalidID,
		},
		{
			Name:   "success",
			ID:     gid,
			Sid:    sid,
			Fields: []*SchemaField{sf, nil, sf},
			List:   true,
			IsAvailableIf: &Condition{
				Field: "ff",
				Value: ValueTypeString.ValueFrom("abc"),
			},
			Title: i18n.StringFrom("tt"),
			Expected: expected{
				ID:     gid,
				Sid:    sid,
				Fields: []*SchemaField{sf},
				List:   true,
				IsAvailableIf: &Condition{
					Field: "ff",
					Value: ValueTypeString.ValueFrom("abc"),
				},
				Title: i18n.StringFrom("tt"),
			},
		},
		{
			Name:   "success: nil name",
			ID:     gid,
			Sid:    sid,
			Fields: []*SchemaField{sf},
			List:   true,
			IsAvailableIf: &Condition{
				Field: "ff",
				Value: ValueTypeString.ValueFrom("abc"),
			},
			Title: i18n.StringFrom("tt"),
			Expected: expected{
				ID:     gid,
				Sid:    sid,
				Fields: []*SchemaField{sf},
				List:   true,
				IsAvailableIf: &Condition{
					Field: "ff",
					Value: ValueTypeString.ValueFrom("abc"),
				},
				Title: i18n.StringFrom("tt"),
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			t.Parallel()
			res, err := NewSchemaGroup().
				ID(tc.ID).
				Schema(tc.Sid).
				Fields(tc.Fields).
				IsList(tc.List).
				Title(tc.Title).
				IsAvailableIf(tc.IsAvailableIf).
				Build()
			if tc.Err == nil {
				assert.Equal(t, tc.Expected.IsAvailableIf, res.IsAvailableIf())
				assert.Equal(t, tc.Expected.Sid, res.Schema())
				assert.Equal(t, tc.Expected.ID, res.ID())
				assert.Equal(t, tc.Expected.Title, res.Title())
				assert.Equal(t, tc.Expected.List, res.IsList())
				assert.Equal(t, tc.Expected.Fields, res.Fields())
			} else {
				assert.Equal(t, tc.Err, err)
			}
		})
	}
}
